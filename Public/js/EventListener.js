document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    errorMessage.textContent = data.error || 'Login failed';
                }
            } catch (error) {
                errorMessage.textContent = 'An error occurred during login';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = '/login.html';
                } else {
                    errorMessage.textContent = data.error || 'Registration failed';
                }
            } catch (error) {
                errorMessage.textContent = 'An error occurred during registration';
            }
        });
    }

    // Main app event listeners
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', searchSongs);
        
        // Add enter key support for search
        document.getElementById('song-title').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchSongs();
            }
        });

        // Initialize tables
        createTable('Playlist');
        createTable('Search Results');

        // Create playlist functionality
        document.getElementById('new-playlist-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                playlistManager.createPlaylist();
            }
        });
    }
}); 