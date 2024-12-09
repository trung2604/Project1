const audioPlayer = document.getElementById("audioPlayer");
const progress = document.getElementById("progress");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songAlbum = document.getElementById("songAlbum");
const songGenre = document.getElementById("songGenre");
const songImage = document.getElementById("songImage");

let manualSeek = false;

// Lấy songId từ URL
const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get("songId");

// Lấy thông tin bài hát từ API và cập nhật giao diện
async function fetchSongDetails(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch song details.");
        }
        const song = await response.json();

        // Cập nhật giao diện với thông tin bài hát
        songTitle.innerHTML = song.title || "Unknown Title";
        songArtist.innerHTML = "Artist: " + (song.artist || "Unknown Artist");
        songAlbum.innerHTML = "Album: " + (song.album || "Unknown Album");
        songGenre.innerHTML = "Genre: " + (song.genre || "Unknown Genre");
        songImage.src = song.imageUrl || "/default-image.jpg"; // Ảnh bìa mặc định nếu không có

        // Bắt đầu phát nhạc
        audioPlayer.src = `/api/songs/play/${songId}`;
        audioPlayer.play();
    } catch (error) {
        console.error("Error fetching song details:", error);
        alert("Cannot load song details. Please try again later.");
    }
}

// Nếu songId tồn tại trong URL, lấy thông tin bài hát
if (songId) {
    fetchSongDetails(songId);
} else {
    alert("No song ID provided.");
}

// Cập nhật thanh tiến trình khi nhạc đang phát
audioPlayer.addEventListener("timeupdate", function () {
    if (!manualSeek && audioPlayer.duration) {
        progress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
});

// Điều chỉnh vị trí phát nhạc khi người dùng kéo thanh tiến trình
progress.addEventListener("input", function () {
    if (audioPlayer.duration) {
        const time = (progress.value * audioPlayer.duration) / 100;
        audioPlayer.currentTime = time;
    }
});
