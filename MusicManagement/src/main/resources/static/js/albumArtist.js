async function fetchAlbumsByArtist() {
    // Lấy tên nghệ sĩ từ URL
    const urlParams = new URLSearchParams(window.location.pathname.split('/').pop());
    const artist = decodeURIComponent(urlParams.toString());

    document.getElementById('artistName').innerText = artist;

    try {
        const response = await fetch(`/api/albums/artist/${artist}`); // API lấy album theo nghệ sĩ
        if (!response.ok) {
            throw new Error('Failed to fetch albums');
        }
        const albums = await response.json();

        const albumList = document.getElementById('albumList');
        albumList.innerHTML = ''; // Xóa nội dung cũ
        albums.forEach(album => {
            const listItem = document.createElement('li');
            listItem.className = 'album-item';
            listItem.innerHTML = `
                <div>
                    <span><strong>Album Title:</strong> ${album.title}</span><br>
                    <span><strong>Release Date:</strong> ${album.releaseDate}</span>
                </div>
            `;
            albumList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching albums:', error);
        alert('Unable to fetch albums. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', fetchAlbumsByArtist);
