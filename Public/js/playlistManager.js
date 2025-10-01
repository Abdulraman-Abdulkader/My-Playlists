class PlaylistManager {
    constructor() {
        this.currentPlaylistId = null;
        this.playlists = [];
        this.initializeEventListeners();
        this.loadPlaylists();
    }

    initializeEventListeners() {
        document.getElementById('create-playlist-button').addEventListener('click', () => this.createPlaylist());
    }

    async loadPlaylists() {
        try {
            const response = await fetch('/api/playlists');
            if (!response.ok) throw new Error('Failed to load playlists');
            
            this.playlists = await response.json();
            this.renderPlaylists();
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    }

    async createPlaylist() {
        const nameInput = document.getElementById('new-playlist-name');
        const name = nameInput.value.trim();
        
        if (!name) return;

        try {
            const response = await fetch('/api/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) throw new Error('Failed to create playlist');

            const playlist = await response.json();
            this.playlists.push(playlist);
            this.renderPlaylists();
            nameInput.value = '';
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    async deletePlaylist(playlistId) {
        try {
            const response = await fetch(`/api/playlists/${playlistId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete playlist');

            this.playlists = this.playlists.filter(p => p.id !== playlistId);
            this.renderPlaylists();
            if (this.currentPlaylistId === playlistId) {
                this.currentPlaylistId = null;
                this.renderCurrentPlaylist();
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    }

    async loadPlaylistSongs(playlistId) {
        try {
            const response = await fetch(`/api/playlists/${playlistId}/songs`);
            if (!response.ok) throw new Error('Failed to load playlist songs');
            
            const songs = await response.json();
            this.currentPlaylistId = playlistId;
            this.renderPlaylists();
            this.renderCurrentPlaylist(songs);
        } catch (error) {
            console.error('Error loading playlist songs:', error);
        }
    }

    async deleteSong(playlistId, songId) {
        try {
            const response = await fetch(`/api/playlists/${playlistId}/songs/${songId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete song');

            this.loadPlaylistSongs(playlistId);
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    }

    renderPlaylists() {
        const playlistsList = document.getElementById('playlists-list');
        playlistsList.innerHTML = this.playlists.map(playlist => `
            <div class="playlist-card ${playlist.id === this.currentPlaylistId ? 'active' : ''}" 
                 onclick="playlistManager.loadPlaylistSongs(${playlist.id})">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${playlist.name}</span>
                    <span class="delete-playlist" onclick="event.stopPropagation(); playlistManager.deletePlaylist(${playlist.id})">×</span>
                </div>
            </div>
        `).join('');
    }

    renderCurrentPlaylist(songs = []) {
        const currentPlaylist = document.getElementById('current-playlist');
        if (!this.currentPlaylistId) {
            currentPlaylist.innerHTML = '<p>Select a playlist to view songs</p>';
            return;
        }

        currentPlaylist.innerHTML = songs.map(song => `
            <div class="playlist-song">
                <img src="${song.artwork_url}" alt="${song.track_name}">
                <div class="playlist-song-info">
                    <div>${song.track_name}</div>
                    <div>${song.artist_name}</div>
                    <div>${song.album_name}</div>
                </div>
                <div class="playlist-song-actions">
                    ${song.preview_url ? `<audio controls src="${song.preview_url}"></audio>` : ''}
                    <span class="delete-song" onclick="playlistManager.deleteSong(${this.currentPlaylistId}, ${song.id})">×</span>
                </div>
            </div>
        `).join('');
    }

    async addSongToPlaylist(song) {
        if (!this.currentPlaylistId) {
            alert('Please select a playlist first');
            return;
        }

        try {
            const response = await fetch(`/api/playlists/${this.currentPlaylistId}/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: song.trackId,
                    trackName: song.trackName,
                    artistName: song.artistName,
                    albumName: song.albumName,
                    artworkUrl: song.artworkUrl,
                    previewUrl: song.previewUrl
                }),
            });

            if (!response.ok) throw new Error('Failed to add song to playlist');

            this.loadPlaylistSongs(this.currentPlaylistId);
        } catch (error) {
            console.error('Error adding song to playlist:', error);
        }
    }
}

const playlistManager = new PlaylistManager(); 