package com.project1.MusicManagement.service;

import com.project1.MusicManagement.dto.PlaylistResponseForGetAllPlaylist;
import com.project1.MusicManagement.entity.Playlist;
import com.project1.MusicManagement.entity.PlaylistSong;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.entity.User;
import com.project1.MusicManagement.repository.PlaylistRepository;
import com.project1.MusicManagement.repository.PlaylistSongRepository;
import com.project1.MusicManagement.repository.SongRespository;
import com.project1.MusicManagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlaylistService {
    @Autowired
    private PlaylistRepository playlistRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SongRespository songRespository;
    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    // Create playlist
    public Playlist createPlaylist(String name, Long userId) {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Playlist existingPlaylist = playlistRepository.findPlaylistByNameAndUserId(name, userId);
        if (existingPlaylist != null) {
            throw new RuntimeException("Playlist with the same name already exists for this user");
        }

        Playlist playlist = new Playlist();
        playlist.setName(name);
        playlist.setUser(user);
        return playlistRepository.save(playlist);
    }

    // Lấy tất cả playlist của người dùng
    public List<PlaylistResponseForGetAllPlaylist> getAllPlaylists(Long userId) {
        // Kiểm tra sự tồn tại của user
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Lấy tất cả playlist của người dùng
        List<Playlist> playlists = playlistRepository.findPlaylistByUserId(userId);

        // Chuyển đổi các Playlist thành PlaylistResponseForGetAllPlaylist DTO
        List<PlaylistResponseForGetAllPlaylist> response = new ArrayList<>();
        for (Playlist playlist : playlists) {
            PlaylistResponseForGetAllPlaylist playlistResponse = new PlaylistResponseForGetAllPlaylist(
                    playlist.getId(),
                    playlist.getName(),
                    playlist.getCreatedAt()
            );
            response.add(playlistResponse);
        }
        return response;
    }

    // Get all songs in a playlist
    public List<Song> getAllSongsInPlaylist(Long playlistId) {
        Playlist playlist = playlistRepository.findPlaylistById(playlistId);
        if (playlist == null) {
            throw new RuntimeException("Playlist not found");
        }
        return songRespository.findSongsByPlaylistId(playlistId); // Giả sử bạn đã định nghĩa phương thức này trong SongRepository
    }


    // Add song to playlist
    public void addSongToPlaylist(Long playlistId, Long songId) {
        // Kiểm tra playlist có tồn tại không
        Playlist playlist = playlistRepository.findPlaylistById(playlistId);
        if (playlist == null) {
            throw new RuntimeException("Playlist not found");
        }

        // Kiểm tra bài hát có tồn tại không
        Song song = songRespository.findSongById(songId);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }

        // Kiểm tra bài hát đã có trong playlist chưa
        PlaylistSong existingPlaylistSong = playlistSongRepository.findByPlaylistAndSong(playlist, song);
        if (existingPlaylistSong != null) {
            throw new RuntimeException("Song already exists in this playlist");
        }

        // Nếu bài hát chưa có trong playlist, tạo một PlaylistSong mới
        PlaylistSong playlistSong = new PlaylistSong();
        playlistSong.setPlaylist(playlist);
        playlistSong.setSong(song);
        playlistSongRepository.save(playlistSong);
    }

    // Update playlist name
    public Playlist updatePlaylist(Long playlistId, String newName) {
        Playlist playlist = playlistRepository.findPlaylistById(playlistId);
        if (playlist == null) {
            throw new RuntimeException("Playlist not found");
        }

        playlist.setName(newName);
        return playlistRepository.save(playlist);
    }

    // Delete playlist
    @Transactional
    public void deletePlaylist(Long playlistId) {
        Playlist playlist = playlistRepository.findPlaylistById(playlistId);
        if (playlist == null) {
            throw new RuntimeException("Playlist not found");
        }

        // Remove all songs associated with the playlist
        playlistSongRepository.deleteByPlaylist(playlist);

        // Delete the playlist itself
        playlistRepository.delete(playlist);
    }

    // Remove song from playlist
    public void removeSongFromPlaylist(Long playlistId, Long songId) {
        Playlist playlist = playlistRepository.findPlaylistById(playlistId);
        if (playlist == null) {
            throw new RuntimeException("Playlist not found");
        }

        Song song = songRespository.findSongById(songId);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }

        // Find the PlaylistSong entry and delete it
        PlaylistSong playlistSong = playlistSongRepository.findByPlaylistAndSong(playlist, song);
        if (playlistSong != null) {
            playlistSongRepository.delete(playlistSong);
        } else {
            throw new RuntimeException("Song is not in this playlist");
        }
    }
}
