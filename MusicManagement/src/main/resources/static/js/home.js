async function fetchSongs() {
    try {
        const response = await fetch('/api/songs/all'); // API để lấy tất cả bài hát
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        const songs = await response.json();

        const songList = document.getElementById('songList');
        songs.forEach(song => {
            const listItem = document.createElement('li');
            listItem.className = 'song-item';
            listItem.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <button onclick="playSong(${song.id})">Play</button>
            `;
            songList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
        alert('Unable to fetch songs. Please try again later.');
    }
}

function playSong(songId) {
    // Chuyển hướng tới URL với PathVariable
    window.location.href = `/api/songs/play/?songId=${songId}`;
}

// Gọi hàm khi trang được load
document.addEventListener('DOMContentLoaded', fetchSongs);
