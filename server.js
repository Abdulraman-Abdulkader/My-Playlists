const express = require('express');
const https = require('https');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const app = express();

const db = new sqlite3.Database('users.db', (err) => {});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// Routes
app.get(['/', '/index.html', '/mytunes', '/mytunes.html'], requireAuth, (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT id, username, password FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            req.session.userId = user.id;
            res.json({ success: true });
        });
});

// Register route
app.post('/register', (req, res) => {
    const { username, password, role = 'guest' } = req.body;
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
        [username, password, role], 
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        });
});


// Playlist routes
app.get('/api/playlists', requireAuth, (req, res) => {
    db.all('SELECT * FROM playlists WHERE user_id = ?', [req.session.userId], (err, playlists) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(playlists);
    });
});

app.post('/api/playlists', requireAuth, (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO playlists (user_id, name) VALUES (?, ?)', 
        [req.session.userId, name], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ id: this.lastID, name });
        });
});

app.get('/api/playlists/:playlistId/songs', requireAuth, (req, res) => {
    db.all('SELECT * FROM playlist_items WHERE playlist_id = ?', [req.params.playlistId], (err, songs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(songs);
    });
});

app.post('/api/playlists/:playlistId/songs', requireAuth, (req, res) => {
    const { trackId, trackName, artistName, artworkUrl, previewUrl } = req.body;
    
    db.get('SELECT * FROM playlists WHERE id = ? AND user_id = ?', 
        [req.params.playlistId, req.session.userId], 
        (err, playlist) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!playlist) {
                return res.status(403).json({ error: 'Playlist not found or access denied' });
            }
            
            db.run('INSERT INTO playlist_items (playlist_id, track_id, track_name, artist_name, artwork_url, preview_url) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.playlistId, trackId, trackName, artistName, artworkUrl, previewUrl],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ id: this.lastID });
                });
        });
});

app.delete('/api/playlists/:playlistId/songs/:songId', requireAuth, (req, res) => {
    const { playlistId, songId } = req.params;
    
    db.run('DELETE FROM playlist_items WHERE playlist_id = ? AND id = ?', 
        [playlistId, songId], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Song not found in playlist' });
            }
            res.json({ success: true });
        });
});

app.delete('/api/playlists/:playlistId', requireAuth, (req, res) => {
    const { playlistId } = req.params;
    
    db.run('DELETE FROM playlists WHERE id = ? AND user_id = ?', 
        [playlistId, req.session.userId], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Playlist not found' });
            }
            res.json({ success: true });
        });
});

// iTunes API route
app.get('/songs', (request, response) => {
    const songTitle = request.query.title;
    if (!songTitle) {
        return response.json({ message: 'Please enter a Song Title' });
    }

    const options = {
        hostname: 'itunes.apple.com',
        path: `/search?term=${encodeURIComponent(songTitle)}&entity=musicTrack&limit=20`,
        method: 'GET'
    };

    https.request(options, (apiResponse) => {
        let data = '';

        apiResponse.on('data', function (chunk) { data += chunk; });

        apiResponse.on('end', function() {
            try {
                const parsedData = JSON.parse(data);
                const limitedResults = parsedData.results.slice(0, 20);
                response.json(limitedResults);
            } catch (error) {
                console.error('Error parsing data:', error);
                response.status(500).json({ message: 'Error parsing data from iTunes API' });
            }
        });
    }).end();
});

// Start server
app.listen(PORT, err => {
    if(err) console.log(err)
    else {
        console.log(`To Test:`)
        console.log(`http://localhost:${PORT}/login.html`)
        console.log(`http://localhost:${PORT}/register.html`)
    }
});
