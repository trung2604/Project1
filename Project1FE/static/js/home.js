// Global variables
let currentSongs = [];
let currentPlaylists = [];
let currentPlaylistId = null;

// Helper function to format duration
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Get userId from localStorage
function getUserId() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id;
}

// Fetch all songs
async function fetchSongs() {
  try {
    const response = await fetch("http://localhost:8000/api/songs/all");
    if (!response.ok) throw new Error("Failed to fetch songs");
    currentSongs = await response.json();
    renderSongs(currentSongs);
  } catch (error) {
    handleError(error, "fetch songs");
  }
}

// Fetch all playlists
async function fetchPlaylists() {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/playlists/user/${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch playlists");
    currentPlaylists = await response.json();
    renderPlaylists(currentPlaylists);
  } catch (error) {
    handleError(error, "fetch playlists");
  }
}

// Fetch recently played songs
async function fetchRecentlyPlayed() {
  const userId = getUserId();
  if (!userId) {
    console.error("User ID is not available.");
    return;
  }

  // Show loading message while fetching
  const songList = document.getElementById("songList");
  songList.innerHTML = "<li>Loading recently played songs...</li>";

  try {
    const response = await fetch(
      `http://localhost:8000/api/recently-played/${userId}`
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch recently played songs: ${response.statusText}`
      );
    }

    const recentlyPlayedSongs = await response.json();

    // Render the list of recently played songs
    renderRecentlyPlayed(recentlyPlayedSongs);
  } catch (error) {
    // Handle any errors that occur
    console.error("Error fetching recently played songs:", error);
    handleError(error, "fetch recently played songs");
  }
}

// Create a new playlist
async function createPlaylist() {
  const userId = getUserId();
  if (!userId) return;

  const name = prompt("Enter playlist name:");
  if (!name) return;

  try {
    const response = await fetch("http://localhost:8000/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistName: name, userId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create playlist");
    }
    await fetchPlaylists();
  } catch (error) {
    handleError(error, "create playlist");
  }
}

// Add a song to a playlist
async function addSongToPlaylist(playlistId, songId) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/playlists/${playlistId}/songs/${songId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add song to playlist");
    }

    closeModal();
    await fetchPlaylists();

    if (currentPlaylistId === playlistId) {
      await fetchPlaylistSongs(playlistId);
    }
  } catch (error) {
    handleError(error, "add song to playlist");
  }
}

// Update playlist name
async function updatePlaylistName(playlistId) {
  if (!playlistId) {
    alert("Invalid playlist ID");
    return;
  }

  const newName = prompt("Enter new playlist name:");
  if (!newName) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/playlists/${playlistId}?newName=${encodeURIComponent(
        newName
      )}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update playlist name");
    }

    await fetchPlaylists();
  } catch (error) {
    handleError(error, "update playlist name");
  }
}

// Delete playlist
async function deletePlaylist(playlistId) {
  if (!playlistId) {
    alert("Invalid playlist ID");
    return;
  }

  if (!confirm("Are you sure you want to delete this playlist?")) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/playlists/delete/${playlistId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete playlist");
    }

    if (currentPlaylistId === playlistId) {
      currentPlaylistId = null;
      document.getElementById("currentView").textContent = "All Songs";
      await fetchSongs();
    }

    await fetchPlaylists();
  } catch (error) {
    handleError(error, "delete playlist");
  }
}

// // Play song function
// function playSong(songId) {
//     window.location.href = `/api/songs/play?songId=${songId}`;
// }
function playSongFromSource(songId, source, playlistId = null) {
    // Build query parameters
    const params = new URLSearchParams();
    params.set('songId', songId);
    params.set('source', source);
    if (playlistId) {
        params.set('playlistId', playlistId);
    }
    
    // Construct play.html URL with the same parameters
    const url = `play.html?${params.toString()}`;
    window.location.href = url;
}

// Search songs function
async function searchSongs(query, filter = "all") {
  // Fetch songs if currentSongs is empty
  if (!currentSongs || !currentSongs.length) {
    try {
      const response = await fetch("http://localhost:8000/api/songs/all");
      if (!response.ok) throw new Error("Failed to fetch songs");
      currentSongs = await response.json();
    } catch (error) {
      handleError(error, "fetch songs for search");
      return;
    }
  }

  const searchTerm = query?.toLowerCase().trim() || "";
  const searchFilter = document.getElementById("searchFilter")?.value || "all";

  // Show all songs if search is empty
  if (!searchTerm) {
    renderSongs(currentSongs);
    return;
  }

  // Filter songs based on selected criteria
  const results = currentSongs
    .filter((song) => {
      if (!song) return false;

      switch (searchFilter) {
        case "title":
          return song.title?.toLowerCase().includes(searchTerm);
        case "artist":
          return song.artist?.toLowerCase().includes(searchTerm);
        case "genre":
          return song.genre?.toLowerCase().includes(searchTerm);
        default:
          return (
            song.title?.toLowerCase().includes(searchTerm) ||
            song.artist?.toLowerCase().includes(searchTerm) ||
            song.genre?.toLowerCase().includes(searchTerm)
          );
      }
    })
    .map((song) => {
      let score = 0;

      // Calculate relevance score
      const titleMatch = song.title?.toLowerCase().includes(searchTerm);
      const artistMatch = song.artist?.toLowerCase().includes(searchTerm);
      const genreMatch = song.genre?.toLowerCase().includes(searchTerm);

      // Exact matches
      if (song.title?.toLowerCase() === searchTerm) score += 100;
      if (song.artist?.toLowerCase() === searchTerm) score += 80;
      if (song.genre?.toLowerCase() === searchTerm) score += 60;

      // Partial matches
      if (titleMatch) score += 50;
      if (artistMatch) score += 40;
      if (genreMatch) score += 30;

      // Word matching
      const words = searchTerm.split(" ").filter((word) => word.length > 1);
      words.forEach((word) => {
        if (song.title?.toLowerCase().includes(word)) score += 20;
        if (song.artist?.toLowerCase().includes(word)) score += 15;
        if (song.genre?.toLowerCase().includes(word)) score += 10;
      });

      return { song, score };
    });

  const sortedResults = results
    .sort((a, b) => b.score - a.score)
    .filter((result) => result.score > 0)
    .map((result) => result.song);

  renderSongs(sortedResults);
}

// Initialize search with debouncing
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchFilter = document.getElementById("searchFilter");

  let debounceTimer;

  const performSearch = () => {
    const query = searchInput.value;
    const filter = searchFilter.value;
    searchSongs(query, filter);
  };

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 300);
    });
  }

  if (searchFilter) {
    searchFilter.addEventListener("change", performSearch);
  }
}
// Show add to playlist modal
function showAddToPlaylistModal(songId) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <h3>Add to Playlist</h3>
            <select id="playlistSelect">
                ${currentPlaylists
                  .map(
                    (p) =>
                      `<option value="${p.playlistId}">${p.playlistName}</option>`
                  )
                  .join("")}
            </select>
            <div class="modal-actions">
                <button onclick="addSongToPlaylist(document.getElementById('playlistSelect').value, ${songId})">Add</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

// Close modal
function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
}

// View playlist songs
async function playPlaylist(playlistId) {
  try {
    currentPlaylistId = playlistId;
    const response = await fetch(
      `http://localhost:8000/api/playlists/${playlistId}/songs`
    );
    if (!response.ok) throw new Error("Failed to fetch playlist songs");
    const songs = await response.json();

    const playlistList = document.getElementById("playlistList");
    const selectedPlaylist = currentPlaylists.find(
      (p) => p.playlistId === playlistId
    );

    const playlistView = document.createElement("div");
    playlistView.id = "selectedPlaylistView";
    playlistView.className = "selected-playlist-view";

    playlistView.innerHTML = `
            <div class="playlist-header">
                <button onclick="showAllPlaylists()" class="back-btn">
                    <i class="fas fa-arrow-left"></i> Back to Playlists
                </button>
                <h2>${selectedPlaylist.playlistName}</h2>
            </div>
        `;

    const songList = document.createElement("ul");
    songList.className = "song-list";

    if (songs.length === 0) {
      songList.innerHTML =
        '<li class="empty-message">No songs in this playlist.</li>';
    } else {
      for (const song of songs) {
        const isFavorite = await checkIfFavorite(song.id); // Kiểm tra trạng thái yêu thích
        const listItem = document.createElement("li");
        listItem.className = "song-item";
        listItem.innerHTML = `
                    <div class="song-container">
                        <div class="image-wrapper">
                            <img src="http://localhost:8000${
                              song.imgPath || "/images/default.jpg"
                            }" alt="${song.title}" class="song-image">
                        </div>
                        <div class="song-details">
                            <div class="song-info">
                                <span class="song-title" title="${
                                  song.title
                                }">${song.title}</span>
                                <span class="song-artist">by ${
                                  song.artist
                                }</span>
                                <span class="song-genre">Genre: ${
                                  song.genre
                                }</span>
                                <span class="song-duration">Duration: ${formatDuration(
                                  song.duration
                                )}</span>
                            </div>
                            <div class="song-actions">
                                <button onclick="playSongFromSource(${
                                  song.id
                                }, 'playlist', ${playlistId})" class="play-btn">Play</button>
                                <button onclick="removeSongFromPlaylist(${playlistId}, ${
          song.id
        })" class="remove-btn">Remove</button>
                                <button class="favorite-btn ${
                                  isFavorite ? "liked" : ""
                                }" data-song-id="${
          song.id
        }" onclick="toggleFavorite(${song.id})">
                                    ${isFavorite ? "❤️" : "🤍"}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
        songList.appendChild(listItem);
      }
    }

    playlistView.appendChild(songList);

    playlistList.innerHTML = "";
    playlistList.appendChild(playlistView);
  } catch (error) {
    handleError(error, "view playlist songs");
    currentPlaylistId = null;
  }
}

// Function to show all playlists
function showAllPlaylists() {
  currentPlaylistId = null;
  // Remove the selected playlist view
  const selectedView = document.getElementById("selectedPlaylistView");
  if (selectedView) {
    selectedView.remove();
  }
  // Re-render all playlists
  renderPlaylists(currentPlaylists);
}

// Update removeSongFromPlaylist to refresh the current playlist view
async function removeSongFromPlaylist(playlistId, songId) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/playlists/${playlistId}/delete/songs/${songId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove song from playlist");
    }

    // Refresh the current playlist view
    if (currentPlaylistId === playlistId) {
      playPlaylist(playlistId);
    }
    await fetchPlaylists();
  } catch (error) {
    handleError(error, "remove song from playlist");
  }
}

// Toggle song in favorites
async function toggleFavorite(songId) {
  const userId = getUserId();
  if (!userId) {
    alert("You need to log in to use this feature.");
    return;
  }

  try {
    const isFavorite = await checkIfFavorite(songId);
    const url = isFavorite
      ? "http://localhost:8000/api/favourites/remove"
      : "http://localhost:8000/api/favourites/add";
    const method = isFavorite ? "DELETE" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { id: userId }, song: { id: songId } }),
    });

    if (!response.ok) throw new Error("Failed to update favorite status");

    // Update UI
    const allFavoriteButtons = document.querySelectorAll(
      `.favorite-btn[data-song-id="${songId}"]`
    );
    allFavoriteButtons.forEach((button) => {
      button.classList.toggle("liked", !isFavorite);
      button.innerHTML = !isFavorite ? "❤️" : "🤍";
    });

    // Refresh favorites if needed
    if (document.getElementById("favorites")) {
      await fetchFavorites();
    }
  } catch (error) {
    console.error("Error updating favorite status:", error);
    alert("Failed to update favorite status.");
  }
}

// Check if song is in favorites
async function checkIfFavorite(songId) {
  const userId = getUserId();
  try {
    const response = await fetch(
      `http://localhost:8000/api/favourites/user/${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch favorites");
    const favorites = await response.json();
    return favorites.some((fav) => fav.song.id === songId);
  } catch (error) {
    handleError(error, "check favorite status");
    return false;
  }
}

async function removeFromFavorites(songId) {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      "http://localhost:8000/api/favourites/remove",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { id: userId }, song: { id: songId } }),
      }
    );

    if (!response.ok) throw new Error("Failed to remove song from favorites");

    // Update favorite buttons in all sections
    const allFavoriteButtons = document.querySelectorAll(
      `.favorite-btn[data-song-id="${songId}"]`
    );
    allFavoriteButtons.forEach((button) => {
      button.classList.remove("liked");
      button.innerHTML = "🤍";
    });

    // Refresh favorites list
    await fetchFavorites();
  } catch (error) {
    handleError(error, "remove from favorites");
  }
}

async function deleteAllRecentlyPlayed() {
  const userId = getUserId();
  if (!userId) {
    alert("User ID is not available.");
    return;
  }

  if (!confirm("Are you sure you want to delete all recently played songs?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/recently-played/delete-all/${userId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Failed to delete all recently played songs."
      );
    }

    alert("All recently played songs have been deleted.");
    fetchRecentlyPlayed(); // Refresh the recently played list
  } catch (error) {
    handleError(error, "delete all recently played songs");
  }
}

// Fetch user's favorite songs
async function fetchFavorites() {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/favourites/user/${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch favorites");
    const favoriteSongs = await response.json();
    renderFavorites(favoriteSongs);
  } catch (error) {
    handleError(error, "fetch favorites");
  }
}

// Render favorite songs
function renderFavorites(favoriteSongs) {
  const favoritesSection = document.getElementById("favorites");
  const favoriteList = document.createElement("ul");
  favoriteList.className = "song-list";
  favoriteList.id = "favoriteList";

  if (favoriteSongs.length === 0) {
    favoriteList.innerHTML = "<li>No favorite songs yet.</li>";
  } else {
    favoriteSongs.forEach((favorite) => {
      const song = favorite.song;
      const listItem = document.createElement("li");
      listItem.className = "song-item";
      listItem.innerHTML = `
                <div class="song-container">
                    <div class="image-wrapper">
                        <img src="http://localhost:8000${
                          song.imgPath || "/images/default.jpg"
                        }" alt="${song.title}" class="song-image">
                    </div>
                    <div class="song-details">
                        <div class="song-info">
                            <span class="song-title" title="${song.title}">${
        song.title
      }</span>
                            <span class="song-artist">by ${song.artist}</span>
                        </div>
                        <div class="song-actions">
                            <button onclick="playSongFromSource(${
                              song.id
                            }, 'favorites')" class="play-btn">Play</button>
                            <button onclick="showAddToPlaylistModal(${
                              song.id
                            })" class="add-to-playlist-btn">Add to Playlist</button>
                            <button onclick="removeFromFavorites(${
                              song.id
                            })" class="remove-btn">Remove</button>
                        </div>
                    </div>
                </div>
            `;
      favoriteList.appendChild(listItem);
    });
  }

  favoritesSection.innerHTML = "";
  favoritesSection.appendChild(favoriteList);
}

async function renderSongs(songs) {
  const songList = document.getElementById("songList");
  songList.innerHTML = "";

  for (const song of songs) {
    const isFavorite = await checkIfFavorite(song.id);

    const listItem = document.createElement("li");
    listItem.className = "song-item";
    listItem.innerHTML = `
            <div class="song-container">
                <div class="image-wrapper">
                        <img src="http://localhost:8000${
                          song.imgPath || "/images/default.jpg"
                        }" alt="${song.title}" class="song-image">
                </div>
                <div class="song-details">
                    <div class="song-info">
                        <span class="song-title" title="${song.title}">${
      song.title
    }</span>
                        <span class="song-artist">by ${song.artist}</span>
                        <span class="song-genre">Genre: ${song.genre}</span>
                    </div>
                    <div class="song-actions">
                        <button onclick="playSongFromSource(${
                          song.id
                        }, 'songs')" class="play-btn">Play</button>
                        <button class="add-to-playlist-btn" onclick="showAddToPlaylistModal(${
                          song.id
                        })">Add to Playlist</button>
                        <button class="favorite-btn ${
                          isFavorite ? "liked" : ""
                        }" data-song-id="${song.id}" onclick="toggleFavorite(${
      song.id
    })">
                            ${isFavorite ? "❤️" : "🤍"}
                        </button>
                    </div>
                </div>
            </div>
        `;
    songList.appendChild(listItem);
  }
}

function renderPlaylists(playlists) {
  const playlistList = document.getElementById("playlistList");
  if (!playlistList) return;
  playlistList.innerHTML = "";

  playlists.forEach((playlist) => {
    const listItem = document.createElement("li");
    listItem.className = "playlist-item";
    listItem.innerHTML = `
            <div class="playlist-container">
                <div class="playlist-info">
                    <span class="playlist-title">${playlist.playlistName}</span>
                    <span class="playlist-date">Created: ${new Date(
                      playlist.createAt
                    ).toLocaleDateString()}</span>
                </div>
                <div class="playlist-actions">
                    <button onclick="playPlaylist(${
                      playlist.playlistId
                    })" class="play-btn">View Songs</button>
                    <button onclick="updatePlaylistName(${
                      playlist.playlistId
                    })" class="edit-btn">Edit</button>
                    <button onclick="deletePlaylist(${
                      playlist.playlistId
                    })" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    playlistList.appendChild(listItem);
  });
}

async function renderRecentlyPlayed(songs) {
  const recentlyPlayedList = document.getElementById("recentList");
  recentlyPlayedList.innerHTML = "";

  for (const song of songs) {
    const songData = song.song || song;
    const isFavorite = await checkIfFavorite(songData.id);

    const listItem = document.createElement("li");
    listItem.className = "song-item";
    listItem.innerHTML = `
            <div class="song-container">
                <div class="image-wrapper">
                        <img src="http://localhost:8000${
                          song.imgPath || "/images/default.jpg"
                        }" alt="${song.title}" class="song-image">
                </div>
                <div class="song-details">
                    <div class="song-info">
                        <span class="song-title" title="${songData.title}">${
      songData.title
    }</span>
                        <span class="song-artist">by ${songData.artist}</span>
                        <span class="song-genre">Genre: ${songData.genre}</span>
                    </div>
                    <div class="song-actions">
                        <button onclick="playSongFromSource(${
                          songData.id
                        }, 'recently')" class="play-btn">Play</button>
                        <button onclick="showAddToPlaylistModal(${
                          songData.id
                        })" class="add-to-playlist-btn">Add to Playlist</button>
                        <button class="favorite-btn ${
                          isFavorite ? "liked" : ""
                        }" data-song-id="${song.id}" onclick="toggleFavorite(${
      song.id
    })">
                            ${isFavorite ? "❤️" : "🤍"}
                        </button>
                    </div>
                </div>
            </div>
        `;
    recentlyPlayedList.appendChild(listItem);
  }
}

// Generic error handler
function handleError(error, operation) {
  console.error(`Error during ${operation}:`, error);

  if (!navigator.onLine) {
    alert("No internet connection. Please check your network and try again.");
    return;
  }

  if (error.response?.status === 401) {
    alert("Session expired. Please login again.");
    logout();
    return;
  }

  alert(`Unable to ${operation}. Please try again later.`);
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// // Initialize search
// function initializeSearch() {
//     const searchInput = document.getElementById('searchInput');
//     if (searchInput) {
//         searchInput.addEventListener('input', (e) => {
//             searchSongs(e.target.value);
//         });
//     }
// }

// Initialize page
window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id || user.role !== "User") {
    window.location.href = "login.html";
    return;
  }

  // Update username display
  document.querySelector(".user-name").innerText = user.username;

  // Initialize features
  initializeSearch();

  // Fetch initial data
  fetchSongs();
  fetchPlaylists();
  fetchRecentlyPlayed();
  fetchFavorites();
};
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-item");
  const contentSections = document.querySelectorAll(".content-section");
  const sectionTitle = document.getElementById("section-title");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all menu items
      menuItems.forEach((menu) => menu.classList.remove("active"));
      // Add active class to the clicked menu item
      item.classList.add("active");

      // Hide all content sections
      contentSections.forEach((section) => section.classList.add("hidden"));
      // Show the target section
      const targetSection = document.getElementById(item.dataset.section);
      if (targetSection) {
        targetSection.classList.remove("hidden");
        // Update the section title
        sectionTitle.textContent = item.querySelector("span").textContent;

        // Fetch new data for the active section
        if (item.dataset.section === "songs") {
          fetchSongs();
        } else if (item.dataset.section === "favorites") {
          fetchFavorites();
        } else if (item.dataset.section === "recent") {
          fetchRecentlyPlayed();
        }
      }
    });
  });
});
