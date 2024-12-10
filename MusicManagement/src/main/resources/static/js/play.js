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

// URL backend
const backendBaseUrl = "http://localhost:8000";

// Lấy songId từ URL
const songIdFromURL = Number(new URLSearchParams(window.location.search).get("songId"));

// Hiển thị trạng thái tải
function setLoading(state) {
    loadingIndicator.style.display = state ? "block" : "none";
}

// Định dạng thời gian (giây -> phút:giây)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Lấy danh sách phát từ API
async function fetchPlaylist() {
    setLoading(true);
    try {
        const response = await fetch(`${backendBaseUrl}/api/songs/all`);
        if (!response.ok) throw new Error("Failed to fetch playlist.");
        playlist = await response.json();

        // Hiển thị danh sách phát
        playlistItems.innerHTML = playlist
            .map((song, index) => `<li onclick="playSong(${index})">${song.title}</li>`)
            .join("");

        // Phát bài hát từ URL hoặc bài đầu tiên
        const initialIndex = songIdFromURL
            ? playlist.findIndex(song => song.id === songIdFromURL)
            : 0;
        if (initialIndex !== -1) playSong(initialIndex);
    } catch (error) {
        console.error("Error fetching playlist:", error);
    } finally {
        setLoading(false);
    }
}

// Phát bài hát theo chỉ mục
async function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentSongIndex = index;
    const song = playlist[index];

    // Cập nhật thông tin bài hát
    songTitle.textContent = song.title || "Unknown Title";
    songArtist.textContent = `Artist: ${song.artist || "Unknown Artist"}`;
    songAlbum.textContent = `Album: ${song.album || "Unknown Album"}`;
    songGenre.textContent = `Genre: ${song.genre || "Unknown Genre"}`;
    songImage.src = `http://localhost:8000${song.imgPath}`;
    //songImage.onerror = () => (songImage.src = "/path/to/default-image.jpg");

    // Thiết lập nguồn phát nhạc
    audioPlayer.src = `${backendBaseUrl}/api/songs/play/${song.id}`;
    audioPlayer.play().catch(err => console.error("Error playing song:", err));
    isPlaying = true;
    playPauseButton.textContent = "⏸";

    // Đặt lại thời gian
    totalTimeDisplay.textContent = "0:00";
    currentTimeDisplay.textContent = "0:00";

    // Cập nhật tổng thời gian khi tải xong
    audioPlayer.addEventListener("loadedmetadata", () => {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    // Cập nhật giao diện danh sách phát
    updatePlaylistUI();

    // Cập nhật URL
    updateURL(song.id);
}

// Cập nhật giao diện danh sách phát
function updatePlaylistUI() {
    Array.from(playlistItems.children).forEach((item, index) => {
        item.classList.toggle("active", index === currentSongIndex);
    });
}

// Cập nhật URL
function updateURL(songId) {
    const newURL = `${window.location.origin}${window.location.pathname}?songId=${songId}`;
    window.history.pushState({ path: newURL }, "", newURL);
}

// Chuyển bài
function nextSong() {
    if (playlist.length > 0) {
        const nextIndex = isShuffle
            ? Math.floor(Math.random() * playlist.length)
            : (currentSongIndex + 1) % playlist.length;
        playSong(nextIndex);
    }
}

function prevSong() {
    if (playlist.length > 0) {
        const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        playSong(prevIndex);
    }
}

// Phát hoặc tạm dừng bài hát
playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseButton.textContent = "▶️";
    } else {
        audioPlayer.play();
        playPauseButton.textContent = "⏸";
    }
    isPlaying = !isPlaying;
});

// Cập nhật tiến trình và thời gian
audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration) {
        progress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    }
});

// Tua bài hát
progress.addEventListener("input", () => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (progress.value / 100) * audioPlayer.duration;
    }
});

// Thay đổi tốc độ phát
playbackRateSelector.addEventListener("change", event => {
    audioPlayer.playbackRate = parseFloat(event.target.value);
});

// Phát ngẫu nhiên và lặp lại
shuffleButton.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleButton.textContent = isShuffle ? "🔀 ON" : "🔀 OFF";
});

repeatButton.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatButton.textContent = isRepeat ? "🔁 ON" : "🔁 OFF";
});

audioPlayer.addEventListener("ended", () => {
    if (isRepeat) {
        playSong(currentSongIndex);
    } else {
        nextSong();
    }
});

// Gán sự kiện
nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);

// Khởi chạy danh sách phát
fetchPlaylist();
