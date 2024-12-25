function fetchAlbumsByArtist() {
    // Lấy query string từ URL
    const queryString = window.location.search;

    // Tạo đối tượng URLSearchParams
    const urlParams = new URLSearchParams(queryString);

    // Lấy giá trị của tham số `songArtist`
    const artist = urlParams.get('songArtist');
    if (!artist) {
        alert('Artist name is missing in the URL.');
        return;
    }

    // Hiển thị tên nghệ sĩ
    document.getElementById('artistName').innerText = artist;

    // Mã hóa tên nghệ sĩ để đảm bảo URL hợp lệ
    const encodedArtist = encodeURIComponent(artist);

    // Gọi API lấy danh sách album
    fetch(`/api/albums/artist/${encodedArtist}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch albums for artist: ${artist}`);
            }
            return response.json();
        })
        .then(albums => {
            // Xử lý kết quả
            const albumList = document.getElementById('albumList');
            albumList.innerHTML = ''; // Xóa nội dung cũ

            if (albums.length === 0) {
                albumList.innerHTML = '<p>No albums found for this artist.</p>';
            } else {
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
            }
        })
        .catch(error => {
            console.error('Error fetching albums:', error);
            alert('Unable to fetch albums. Please try again later.');
        });
}

// Thực thi khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', fetchAlbumsByArtist);
