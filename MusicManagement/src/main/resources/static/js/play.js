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
        const response = await fetch("/api/songs/all");
        playlist = await response.json();

        // Hiển thị danh sách phát
        playlistItems.innerHTML = playlist
            .map((song, index) => `<li onclick="playSong(${index})">${song.title}</li>`)
            .join("");

        // Phát bài hát từ URL hoặc bài đầu tiên
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
    }
}

// Phát bài hát theo chỉ mục
function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentSongIndex = index;
    const song = playlist[index];

    // Cập nhật thông tin bài hát
    songTitle.innerHTML = song.title || "Unknown Title";
    songArtist.innerHTML = "Artist: " + (song.artist || "Unknown Artist");
    songAlbum.innerHTML = "Album: " + (song.album || "Unknown Album");
    songGenre.innerHTML = "Genre: " + (song.genre || "Unknown Genre");
    songImage.src = `${backendBaseUrl}${song.imgPath}`;
    songImage.onerror = () => (songImage.src = "https://via.placeholder.com/150");

    // Thiết lập nguồn phát nhạc
    audioPlayer.src = `${backendBaseUrl}/api/songs/play/${song.id}`;
    audioPlayer.load();

    // Bắt đầu phát
    audioPlayer.play();
    isPlaying = true;
    playPauseButton.innerText = "⏸";

    // Cập nhật thời gian bài hát
    audioPlayer.ontimeupdate = function () {
        const currentTime = audioPlayer.currentTime;
        progress.value = (currentTime / audioPlayer.duration) * 100;
        currentTimeDisplay.innerText = formatTime(currentTime);
        totalTimeDisplay.innerText = formatTime(audioPlayer.duration);
    };
}

// Tạm dừng hoặc phát lại bài hát
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

// Quay lại bài trước
prevButton.addEventListener("click", () => {
    playSong((currentSongIndex - 1 + playlist.length) % playlist.length);
});

// Tiến tới bài tiếp theo
nextButton.addEventListener("click", () => {
    playSong((currentSongIndex + 1) % playlist.length);
});

// Điều chỉnh tốc độ phát
playbackRateSelector.addEventListener("change", () => {
    audioPlayer.playbackRate = parseFloat(playbackRateSelector.value);
});

// Chạy hàm để tải danh sách bài hát
fetchPlaylist();
