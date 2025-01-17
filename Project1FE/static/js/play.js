const audioPlayer = new Audio();
const progress = document.getElementById("progress");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songAlbum = document.getElementById("songAlbum");
const songGenre = document.getElementById("songGenre");
const songImage = document.getElementById("songImage");
const songDetails = document.getElementById("songDetails");
const playPauseButton = document.getElementById("playPauseButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const playbackRateSelector = document.getElementById("playbackRate");
const playlistItems = document.getElementById("playlistItems");
const loadingIndicator = document.getElementById("loadingIndicator");
const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");
const volumeControl = document.getElementById("volumeControl");
const volumeIcon = document.querySelector(".volume-icon");

let isPlaying = false;
let currentSongIndex = -1;
let playlist = [];
let currentPlaylists = [];
let isShuffle = false;
let isRepeat = false;
let currentAudioSource = null;

const backendBaseUrl = "http://localhost:8000";
const songIdFromURL = Number(new URLSearchParams(window.location.search).get("songId"));
const user = JSON.parse(localStorage.getItem("user") || "{}");
const userId = user.id || null;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

async function fetchPlaylists() {
    try {
        const response = await fetch(`${backendBaseUrl}/api/playlists/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch playlists');
        currentPlaylists = await response.json();
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
}

async function toggleFavorite(songId) {
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (!userId) {
        alert('You need to log in to use this feature.');
        return;
    }

    try {
        const isFavorite = await checkIfFavorite(songId);
        const url = `${backendBaseUrl}/api/favourites/${isFavorite ? 'remove' : 'add'}`;
        const method = isFavorite ? 'DELETE' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: { id: userId }, song: { id: songId } }),
        });

        if (!response.ok) throw new Error('Failed to update favorite status');

        const favoriteButton = document.querySelector('.favorite-btn');
        if (favoriteButton) {
            favoriteButton.classList.toggle('liked', !isFavorite);
            favoriteButton.innerHTML = !isFavorite ?
                '<span class="button-icon">❤️</span><span class="button-text">Liked</span>' :
                '<span class="button-icon">🤍</span><span class="button-text">Like</span>';
        }
    } catch (error) {
        console.error('Error updating favorite status:', error);
        alert('Failed to update favorite status.');
    }
}

async function checkIfFavorite(songId) {
    try {
        const response = await fetch(`${backendBaseUrl}/api/favourites/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favorites = await response.json();
        return favorites.some(fav => fav.song.id === songId);
    } catch (error) {
        console.error("Error checking favorite status:", error);
        return false;
    }
}

function showAddToPlaylistModal(songId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add to Playlist</h3>
            <select id="playlistSelect">
                ${currentPlaylists
        .map(p => `<option value="${p.playlistId}">${p.playlistName}</option>`)
        .join('')}
            </select>
            <div class="modal-actions">
                <button class="add-btn" onclick="addSongToPlaylist(${songId})">Add</button>
                <button class="cancel-btn" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function addSongToPlaylist(songId) {
    const playlistSelect = document.getElementById('playlistSelect');
    const playlistId = playlistSelect.value;

    try {
        const response = await fetch(`${backendBaseUrl}/api/playlists/${playlistId}/songs/${songId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to add song to playlist');

        closeModal();
        alert('Song added to playlist successfully.');
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        alert('Failed to add song to playlist.');
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

async function fetchPlaylist() {
    try {
        loadingIndicator.style.display = "block";
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get("source") || "songs";

        let apiUrl;
        switch (source) {
            case "favorites":
                apiUrl = `${backendBaseUrl}/api/favourites/user/${userId}`;
                break;
            case "playlist":
                const playlistId = urlParams.get("playlistId");
                apiUrl = `${backendBaseUrl}/api/playlists/${playlistId}/songs`;
                break;
            case "recently":
                apiUrl = `${backendBaseUrl}/api/recently-played/${userId}`;
                break;
            default:
                apiUrl = `${backendBaseUrl}/api/songs/all`;
                break;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        playlist = source === "favorites" ? data.map(item => item.song) : data;

        if (!Array.isArray(playlist) || playlist.length === 0) {
            playlistItems.innerHTML = "<li>No songs available</li>";
            return;
        }

        playlistItems.innerHTML = playlist
            .map((song, index) => `<li onclick="playSong(${index})">${song.title}</li>`)
            .join("");

        if (songIdFromURL) {
            const songIndex = playlist.findIndex(song => song.id === songIdFromURL);
            if (songIndex !== -1) playSong(songIndex);
        } else {
            playSong(0);
        }
    } catch (error) {
        console.error("Error fetching playlist:", error);
        playlistItems.innerHTML = "<li>Error loading playlist. Please try again later.</li>";
    } finally {
        loadingIndicator.style.display = "none";
    }
}

async function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentSongIndex = index;
    const song = playlist[index];

    if (!song?.id || !userId) {
        console.error("Invalid song ID or user ID", { song, userId });
        alert("Cannot play this song due to missing information.");
        return;
    }

    // Update song details
    songTitle.innerText = song.title || "Unknown Title";
    songArtist.innerText = `Artist: ${song.artist || "Unknown Artist"}`;
    songAlbum.innerText = `Album: ${song.album || "Unknown Album"}`;
    songGenre.innerText = `Genre: ${song.genre || "Unknown Genre"}`;
    songImage.src = `${backendBaseUrl}${song.imgPath || "/images/default.jpg"}`;
    songImage.onerror = () => (songImage.src = "https://via.placeholder.com/150");

    // Remove existing action buttons if any
    const existingButtons = document.querySelector('.song-action-buttons');
    if (existingButtons) {
        existingButtons.remove();
    }

    // Add new action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'song-action-buttons';
    actionButtons.innerHTML = `
        <button class="song-action-button favorite-btn" onclick="toggleFavorite(${song.id})">
            <span class="button-icon">🤍</span>
            <span class="button-text">Like</span>
        </button>
        <button class="song-action-button add-to-playlist-btn" onclick="showAddToPlaylistModal(${song.id})">
            <span class="button-icon">➕</span>
            <span class="button-text">Add to Playlist</span>
        </button>
    `;
    songDetails.appendChild(actionButtons);

    // Update favorite button state
    await updateFavoriteButton();

    // Get and play audio
    const audioUrl = `${backendBaseUrl}/api/songs/play/${song.id}?userId=${userId}`;
    if (currentAudioSource) {
        URL.revokeObjectURL(currentAudioSource);
    }

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to load audio');

        const blob = await response.blob();
        currentAudioSource = URL.createObjectURL(blob);
        audioPlayer.src = currentAudioSource;

        await audioPlayer.load();
        await audioPlayer.play();

        isPlaying = true;
        playPauseButton.innerText = "⏸";
    } catch (error) {
        console.error("Error loading/playing song:", error);
        alert("Failed to load or play the song.");
    }

    // Update song progress
    audioPlayer.ontimeupdate = () => {
        progress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
        currentTimeDisplay.innerText = formatTime(audioPlayer.currentTime || 0);
        totalTimeDisplay.innerText = formatTime(audioPlayer.duration || 0);
    };

    updatePlaylistUI();
}

async function updateFavoriteButton() {
    const currentSong = playlist[currentSongIndex];
    const favoriteBtn = document.querySelector('.favorite-btn');
    if (favoriteBtn && currentSong) {
        const isFavorite = await checkIfFavorite(currentSong.id);
        favoriteBtn.innerHTML = isFavorite ?
            '<span class="button-icon">❤️</span><span class="button-text">Liked</span>' :
            '<span class="button-icon">🤍</span><span class="button-text">Like</span>';
        favoriteBtn.classList.toggle("liked", isFavorite);
    }
}

function updatePlaylistUI() {
    Array.from(playlistItems.children).forEach((item, index) => {
        item.classList.toggle("active", index === currentSongIndex);
    });
}

// Event Listeners
progress.addEventListener("input", () => {
    if (audioPlayer && !isNaN(audioPlayer.duration)) {
        const seekTime = (progress.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
        currentTimeDisplay.innerText = formatTime(seekTime);

        if (!isPlaying) {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    playPauseButton.innerText = "⏸";
                })
                .catch(error => console.error("Error resuming playback:", error));
        }
    }
});

shuffleButton?.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleButton.classList.toggle("active", isShuffle);
    shuffleButton.textContent = isShuffle ? "➡️" : "🔀";
});

repeatButton?.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatButton.classList.toggle("active", isRepeat);
    repeatButton.textContent = isRepeat ? "⏹️" : "🔁";
});

audioPlayer.addEventListener("ended", () => {
    if (isRepeat) {
        playSong(currentSongIndex);
    } else if (isShuffle) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentSongIndex);
        playSong(nextIndex);
    } else {
        playSong((currentSongIndex + 1) % playlist.length);
    }
});

playbackRateSelector.addEventListener("change", event => {
    audioPlayer.playbackRate = parseFloat(event.target.value);
});

playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseButton.innerText = "▶️";
    } else {
        audioPlayer.play();
        playPauseButton.innerText = "⏸";
    }
    isPlaying = !isPlaying;
});

volumeControl.addEventListener("input", () => {
    const volumeValue = volumeControl.value / 100;
    audioPlayer.volume = volumeValue;
    volumeIcon.textContent = volumeValue === 0 ? "🔇" : volumeValue < 0.5 ? "🔉" : "🔊";
});

prevButton.addEventListener("click", () => playSong((currentSongIndex - 1 + playlist.length) % playlist.length));
nextButton.addEventListener("click", () => playSong((currentSongIndex + 1) % playlist.length));

window.addEventListener("beforeunload", () => {
    if (currentAudioSource) {
        URL.revokeObjectURL(currentAudioSource);
    }
});

// Initialize
window.addEventListener('load', async () => {
    await fetchPlaylists();
    await fetchPlaylist();
});