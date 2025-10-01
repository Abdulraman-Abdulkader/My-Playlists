function searchSongs() {
    let songTitle = document.getElementById('song-title').value.trim();
    console.log('songTitle: ' + songTitle);
    if(songTitle === '') {
        return alert('Please enter a Song Title');
    }

    let songsDiv = document.getElementById('songs_div');
    songsDiv.innerHTML = '';

    updateTableTitle('search-results', `Songs matching: ${songTitle}`);

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            displayResults(response);
        }
    };
    xhr.open('GET', `/songs?title=${songTitle}`, true);
    xhr.send();
}

function displayResults(songs) {
    const resultsTable = document.getElementById('search-results-body');
    resultsTable.innerHTML = '';
    
    songs.forEach(song => {
        const row = resultsTable.insertRow();
        
        const actionCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.addEventListener('click', () => {
            const songData = {
                trackId: song.trackId,
                trackName: song.trackName,
                artistName: song.artistName,
                albumName: song.albumName,
                artworkUrl: song.artworkUrl100,
                previewUrl: song.previewUrl
            };
            playlistManager.addSongToPlaylist(songData);
        });
        actionCell.appendChild(addButton);
        row.appendChild(actionCell);
        
        const titleCell = document.createElement('td');
        titleCell.textContent = song.trackName;
        row.appendChild(titleCell);
        
        const artistCell = document.createElement('td');
        artistCell.textContent = song.artistName;
        row.appendChild(artistCell);

        const albumCell = document.createElement('td');
        albumCell.textContent = song.albumName;
        row.appendChild(albumCell);

        const previewCell = document.createElement('td');
        if (song.previewUrl) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = song.previewUrl;
            previewCell.appendChild(audio);
        }
        row.appendChild(previewCell);
    });
} 