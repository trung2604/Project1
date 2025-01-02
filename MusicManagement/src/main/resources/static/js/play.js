const audioPlayer = new Audio();
const progress = document.getElementById("progress");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songAlbum = document.getElementById("songAlbum");
const songGenre = document.getElementById("songGenre");
const songImage = document.getElementById("songImage");
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

    if (!song.id || !userId) {
        console.error("Invalid song ID or user ID", { song, userId });
        alert("Cannot play this song due to missing information.");
        return;
    }

    songTitle.innerText = song.title || "Unknown Title";
    songArtist.innerText = `Artist: ${song.artist || "Unknown Artist"}`;
    songAlbum.innerText = `Album: ${song.album || "Unknown Album"}`;
    songGenre.innerText = `Genre: ${song.genre || "Unknown Genre"}`;
    songImage.src = `${backendBaseUrl}${song.imgPath}`;
    songImage.onerror = () => (songImage.src = "https://via.placeholder.com/150");

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
        return;
    }

    audioPlayer.ontimeupdate = () => {
        progress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        currentTimeDisplay.innerText = formatTime(audioPlayer.currentTime);
        totalTimeDisplay.innerText = formatTime(audioPlayer.duration);
    };

    updatePlaylistUI();
}

function updatePlaylistUI() {
    Array.from(playlistItems.children).forEach((item, index) => {
        item.classList.toggle("active", index === currentSongIndex);
    });
}

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

// Event listeners setup
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

fetchPlaylist();