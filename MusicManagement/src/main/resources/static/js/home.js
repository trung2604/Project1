// home.js

// Check if user is logged in
window.onload = function () {
    const isLoggedIn = localStorage.getItem('user'); // Assuming user info is stored in localStorage

    if (!isLoggedIn || !JSON.parse(isLoggedIn).id) {
        // Redirect to login page
        window.location.href = '/api/auth/login';
    }
};

let currentSongs = []; // Global variable to store all songs

// Fetch all songs and render them on the playlist
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs/all');
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        currentSongs = await response.json(); // Store songs globally
        renderSongs(currentSongs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        alert('Unable to fetch songs. Please try again later.');
    }
}

function renderSongs(songs) {
    const songList = document.getElementById('songList');
    songList.innerHTML = ''; // Clear any existing items

    songs.forEach(song => {
        const imgSrc = song.imgPath ? `${window.location.origin}${song.imgPath}` : '/images/default.jpg';

        const listItem = document.createElement('li');
        listItem.className = 'song-item';
        listItem.innerHTML = `
            <div class="song-container">
                <div class="image-wrapper">
                    <img src="${imgSrc}" alt="${song.title}" class="song-image">
                </div>
                <div class="song-details">
                    <div class="song-info">
                        <span class="song-title" title="${song.title}">${song.title}</span>
                        <span class="song-artist">by <a href="/albums/artist/${song.artist}" class="artist-link">${song.artist}</a></span>
                        <span class="song-genre">Genre: <a href="/albums/genre/${song.genre}" class="genre-link">${song.genre}</a></span>
                    </div>
                    <div class="song-actions">
                        <button onclick="playSong(${song.id})" class="play-btn">Play</button>
                    </div>
                </div>
            </div>
        `;
        songList.appendChild(listItem);
    });
}

// Play song function
function playSong(songId) {
    window.location.href = `/api/songs/play?songId=${songId}`;
}

// Song Management Functions
function setupSongManagement() {
    const uploadBtn = document.getElementById('uploadSong');
    const updateBtn = document.getElementById('updateSong');
    const deleteBtn = document.getElementById('deleteSong');
    const songManagementContent = document.getElementById('songManagementContent');

    let selectedSongId = null;

    // Upload Song
    uploadBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.mp3';
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const user = JSON.parse(localStorage.getItem('user'));
                    if (!user || !user.id) {
                        window.location.href = '/api/auth/login';
                        return;
                    }

                    const response = await fetch(`/api/songs/upload/${user.id}`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        alert('Song uploaded successfully!');
                        fetchSongs(); // Update the song list after upload
                    } else {
                        const errorText = await response.text();
                        alert(`Upload failed: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Error uploading song:', error);
                    alert('An error occurred while uploading the song.');
                }
            }
        };
        fileInput.click();
    });

    // Update Song
    updateBtn.addEventListener('click', () => {
        if (!selectedSongId) {
            alert('Please select a song to update.');
            return;
        }

        const song = currentSongs.find(s => s.id === selectedSongId);
        if (!song) {
            alert('Selected song not found.');
            return;
        }

        // Create form for updating song details
        songManagementContent.innerHTML = `
            <form id="updateSongForm">
                <input type="text" id="songTitle" value="${song.title}" placeholder="Song Title" required>
                <input type="text" id="songArtist" value="${song.artist}" placeholder="Artist" required>
                <input type="text" id="songGenre" value="${song.genre}" placeholder="Genre" required>
                <button type="submit">Save Changes</button>
            </form>
        `;

        const updateForm = document.getElementById('updateSongForm');
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                id: selectedSongId,
                title: document.getElementById('songTitle').value,
                artist: document.getElementById('songArtist').value,
                genre: document.getElementById('songGenre').value
            };

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) {
                    window.location.href = '/api/auth/login';
                    return;
                }

                const response = await fetch(`/api/songs/update/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    alert('Song updated successfully!');
                    fetchSongs(); // Refresh the song list after update
                    songManagementContent.innerHTML = '<p>Select a song to manage its details.</p>';
                } else {
                    const errorText = await response.text();
                    alert(`Update failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Error updating song:', error);
                alert('An error occurred while updating the song.');
            }
        });
    });

    // Delete Song
    deleteBtn.addEventListener('click', async () => {
        if (!selectedSongId) {
            alert('Please select a song to delete.');
            return;
        }

        const confirmDelete = confirm('Are you sure you want to delete this song?');
        if (!confirmDelete) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                window.location.href = '/api/auth/login';
                return;
            }

            const response = await fetch(`/api/songs/delete/${selectedSongId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Song deleted successfully!');
                fetchSongs(); // Refresh the song list after deletion
                songManagementContent.innerHTML = '<p>Select a song to manage its details.</p>';
            } else {
                const errorText = await response.text();
                alert(`Delete failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Error deleting song:', error);
            alert('An error occurred while deleting the song.');
        }
    });

    // Select song for management
    function setupSongSelection() {
        const songItems = document.querySelectorAll('.song-item');
        songItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove previous selection highlight
                songItems.forEach(si => si.classList.remove('selected'));

                // Highlight selected song
                item.classList.add('selected');

                // Extract song ID from the song details
                const songTitle = item.querySelector('.song-title').textContent;
                const selectedSong = currentSongs.find(song => song.title === songTitle);

                if (selectedSong) {
                    selectedSongId = selectedSong.id;

                    // Update management content with song details
                    songManagementContent.innerHTML = `
                        <div>
                            <h3>Selected Song</h3>
                            <p><strong>Title:</strong> ${selectedSong.title}</p>
                            <p><strong>Artist:</strong> ${selectedSong.artist}</p>
                            <p><strong>Genre:</strong> ${selectedSong.genre}</p>
                        </div>
                    `;
                }
            });
        });
    }

    // Create New Playlist
    const newPlaylistBtn = document.querySelector('.btn-primary');
    newPlaylistBtn.addEventListener('click', () => {
        let playlist = loadPlaylistFromLocalStorage();

        // Prompt user for playlist name
        const playlistName = prompt('Enter a name for your new playlist:');

        if (playlistName) {
            // Create a new playlist object
            const newPlaylist = {
                id: Date.now(), // Unique ID
                name: playlistName,
                songs: []
            };

            // Add playlist to stored playlists
            const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
            playlists.push(newPlaylist);
            localStorage.setItem('playlists', JSON.stringify(playlists));

            alert(`Playlist "${playlistName}" created successfully!`);
        }
    });
}

// Save playlist to localStorage
function savePlaylistToLocalStorage(playlist) {
    try {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    } catch (error) {
        console.error('Error saving playlist:', error);
    }
}

// Load playlist from localStorage
function loadPlaylistFromLocalStorage() {
    try {
        const playlist = JSON.parse(localStorage.getItem('playlist'));
        return playlist ? playlist : [];
    } catch (error) {
        console.error('Error loading playlist:', error);
        return [];
    }
}

// Handle navigation between sections
function handleNavigation() {
    const menuLinks = document.querySelectorAll('.menu-item a');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');

    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Remove active class from all menu items
            menuLinks.forEach(ml => ml.closest('.menu-item').classList.remove('active'));
            // Add active class to clicked menu item
            link.closest('.menu-item').classList.add('active');

            // Hide all sections
            sections.forEach(section => {
                section.classList.add('hidden');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden');

            // Update section title
            sectionTitle.textContent = link.querySelector('span').textContent;

            // If song management section is shown, set up song management
            if (targetId === 'song-management') {
                setupSongManagement();
            }
        });
    });

    // Handle view mode toggle
    const viewButtons = document.querySelectorAll('.btn-view');
    const songList = document.querySelector('.song-list');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all view buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Toggle grid/list view
            const viewMode = button.dataset.view;
            songList.className = `song-list ${viewMode === 'list' ? 'list-view' : ''}`;
        });
    });
}

// Initialize page functions
document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();  // Fetch all songs on page load
    handleNavigation(); // Handle navigation between sections
});