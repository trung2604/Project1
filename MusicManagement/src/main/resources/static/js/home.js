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
                        <span class="song-artist">by <a href="/api/albums/artist?songArtist=${encodeURIComponent(song.artist)}" class="artist-link">${song.artist}</a></span>
                        <span class="song-genre">Genre: <a href="/api/albums/genre?songGenre=${encodeURIComponent(song.genre)}" class="genre-link">${song.genre}</a></span>
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