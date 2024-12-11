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

let isPlaying = false;
let currentSongIndex = -1;
let playlist = [];
let isShuffle = false;
let isRepeat = false;

const backendBaseUrl = "http://localhost:8000";

// Lấy songId từ URL
const songIdFromURL = Number(new URLSearchParams(window.location.search).get("songId"));

// Định dạng thời gian (giây -> phút:giây)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Lấy danh sách phát từ API
async function fetchPlaylist() {
    try {
        loadingIndicator.style.display = "block";
        const response = await fetch("/api/songs/all");
        playlist = await response.json();

        playlistItems.innerHTML = playlist
            .map((song, index) => `<li onclick="playSong(${index})">${song.title}</li>`)
            .join("");

        if (songIdFromURL) {
            const songIndex = playlist.findIndex(song => song.id === songIdFromURL);
            if (songIndex !== -1) playSong(songIndex);
        } else if (playlist.length > 0) {
            playSong(0);
        } else {
            playlistItems.innerHTML = "<li>No songs available</li>";
        }
    } catch (error) {
        console.error("Error fetching playlist:", error);
        playlistItems.innerHTML = "<li>Error loading playlist. Please try again later.</li>";
    } finally {
        loadingIndicator.style.display = "none";
    }
}

// Phát bài hát
function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentSongIndex = index;
    const song = playlist[index];

    songTitle.innerText = song.title || "Unknown Title";
    songArtist.innerText = `Artist: ${song.artist || "Unknown Artist"}`;
    songAlbum.innerText = `Album: ${song.album || "Unknown Album"}`;
    songGenre.innerText = `Genre: ${song.genre || "Unknown Genre"}`;
    songImage.src = `${backendBaseUrl}${song.imgPath}`;
    songImage.onerror = () => (songImage.src = "https://via.placeholder.com/150");

    audioPlayer.src = `${backendBaseUrl}/api/songs/play/${song.id}`;
    audioPlayer.load();

    loadingIndicator.style.display = "block";
    audioPlayer.addEventListener("canplaythrough", () => {
        loadingIndicator.style.display = "none";
        audioPlayer.play();
        isPlaying = true;
        playPauseButton.innerText = "⏸";
    });

    audioPlayer.ontimeupdate = () => {
        progress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        currentTimeDisplay.innerText = formatTime(audioPlayer.currentTime);
        totalTimeDisplay.innerText = formatTime(audioPlayer.duration);
    };

    updatePlaylistUI();
}

// Cập nhật giao diện danh sách phát
function updatePlaylistUI() {
    Array.from(playlistItems.children).forEach((item, index) => {
        item.classList.toggle("active", index === currentSongIndex);
    });
}

// Điều khiển Shuffle
if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleButton.classList.toggle("active", isShuffle);
    });
}

// Điều khiển Repeat
if (repeatButton) {
    repeatButton.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatButton.classList.toggle("active", isRepeat);
    });
}

// Điều khiển khi bài hát kết thúc
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

// Tua bài hát
progress.addEventListener("input", () => {
    if (audioPlayer.duration) {
        const seekTime = (progress.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
        currentTimeDisplay.innerText = formatTime(seekTime);
    }
});

// Điều chỉnh tốc độ phát
playbackRateSelector.addEventListener("change", event => {
    audioPlayer.playbackRate = parseFloat(event.target.value);
});

// Điều khiển phát/tạm dừng
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

// Điều khiển chuyển bài
prevButton.addEventListener("click", () => playSong((currentSongIndex - 1 + playlist.length) % playlist.length));
nextButton.addEventListener("click", () => playSong((currentSongIndex + 1) % playlist.length));

// Bắt đầu tải danh sách phát
fetchPlaylist();
