/* admin.js */
// Check if user is admin
window.onload = function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'Admin') {
        window.location.href = '/api/auth/login';
    }
    document.querySelector(".user-name").innerText = user.username;

};

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/api/auth/login';
}

let currentSongs = [];
let selectedSongId = null;

// Fetch all songs
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs/all');
        if (!response.ok) throw new Error('Failed to fetch songs');
        currentSongs = await response.json();
        renderSongs(currentSongs);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load songs');
    }
}

// Song search functionality
document.getElementById('searchInput').addEventListener('input', function(event) {
    const query = event.target.value.toLowerCase();
    const filteredSongs = currentSongs.filter(song => {
        return (song.title && song.title.toLowerCase().includes(query)) ||
            (song.artist && song.artist.toLowerCase().includes(query)) ||
            (song.genre && song.genre.toLowerCase().includes(query));
    });
    renderSongs(filteredSongs);
});


// Select song function
function selectSong(songId) {
    selectedSongId = songId;

    // Highlight selected song
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach(item => {
        if (item.dataset.id == songId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    // Update management content
    const selectedSong = currentSongs.find(song => song.id === songId);
    const songManagementContent = document.getElementById('songManagementContent');
    if (selectedSong) {
        songManagementContent.innerHTML = `
            <div>
                <h3>Selected Song</h3>
                <p><strong>Title:</strong> ${selectedSong.title}</p>
                <p><strong>Artist:</strong> ${selectedSong.artist}</p>
                <p><strong>Genre:</strong> ${selectedSong.genre}</p>
            </div>
        `;
    }
}

// Update renderSongs to include dataset ID for each song
function renderSongs(songs) {
    const songList = document.getElementById('songList');
    songList.innerHTML = '';

    songs.forEach(song => {
        const listItem = document.createElement('li');
        listItem.className = 'song-item';
        listItem.dataset.id = song.id; // Add song ID to dataset
        listItem.innerHTML = `
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>Artist: ${song.artist}</p>
                <p>Genre: ${song.genre}</p>
            </div>
            <button onclick="selectSong(${song.id})" class="btn btn-primary">
                Select
            </button>
        `;
        songList.appendChild(listItem);
    });
}
// Song Management Functions
function setupSongManagement() {
    const uploadBtn = document.getElementById('uploadSong');
    const updateBtn = document.getElementById('updateSong');
    const deleteBtn = document.getElementById('deleteSong');
    const songManagementContent = document.getElementById('songManagementContent');

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
        <form id="updateSongForm" enctype="multipart/form-data" style="margin-bottom: 20px;">
            <h3>Updating Song ID: ${selectedSongId}</h3>
            <label for="songFile">Upload new MP3 file:</label>
            <input type="file" id="songFile" accept=".mp3" required>
            <button type="submit">Update Song</button>
        </form>
    `;

        const updateForm = document.getElementById('updateSongForm');
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fileInput = document.getElementById('songFile');
            const file = fileInput.files[0];
            if (!file || !file.name.endsWith('.mp3')) {
                alert('Please select a valid MP3 file.');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) {
                    window.location.href = '/api/auth/login';
                    return;
                }

                // Gửi yêu cầu cập nhật bài hát
                const response = await fetch(`/api/songs/update/${selectedSongId}/${user.id}`, {
                    method: 'PUT',
                    body: formData,
                });

                if (response.ok) {
                    const updatedSong = await response.json();
                    alert(`Song updated successfully! Title: ${updatedSong.title}`);
                    fetchSongs(); // Cập nhật danh sách bài hát
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

        // Scroll to the update form
        songManagementContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

            const response = await fetch(`/api/songs/delete/${selectedSongId}/${user.id}`, {
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
}

// Initialize functions
document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();
    setupSongManagement();
});
