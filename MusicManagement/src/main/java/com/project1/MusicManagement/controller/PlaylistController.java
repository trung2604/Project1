package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.dto.PlaylistRequest;
import com.project1.MusicManagement.dto.PlaylistResponse;
import com.project1.MusicManagement.dto.PlaylistResponseForGetAllPlaylist;
import com.project1.MusicManagement.dto.SongInPlaylistResponse;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.SongRespository;
import com.project1.MusicManagement.service.PlaylistService;
import com.project1.MusicManagement.entity.Playlist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;
    @Autowired
    private SongRespository songRespository;

    // Lấy tất cả playlist của người dùng
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlaylistResponseForGetAllPlaylist>> getAllPlaylists(@PathVariable Long userId) {
        List<PlaylistResponseForGetAllPlaylist> playlists = playlistService.getAllPlaylists(userId);
        return ResponseEntity.ok(playlists);
    }

    // Lấy tất cả bài hát trong một playlist
    @GetMapping("/{playlistId}/songs")
    public ResponseEntity<List<Song>> getAllSongsInPlaylist(@PathVariable Long playlistId) {
        try {
            List<Song> songs = playlistService.getAllSongsInPlaylist(playlistId);
            return ResponseEntity.ok(songs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
    }


    // Create playlist
    @PostMapping
    public ResponseEntity<PlaylistResponse> createPlaylist(@RequestBody PlaylistRequest playlistRequest) {
        // Kiểm tra nếu name là null hoặc rỗng
        if (playlistRequest.getPlaylistName() == null || playlistRequest.getPlaylistName().isEmpty()) {
            PlaylistResponse response = new PlaylistResponse();
            response.setErrorMessage("Playlist name cannot be null or empty");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            Playlist playlist = playlistService.createPlaylist(playlistRequest.getPlaylistName(), playlistRequest.getUserId());
            PlaylistResponse response = new PlaylistResponse();
            response.setId(playlist.getId());
            response.setPlaylistName(playlist.getName());
            response.setUserId(playlist.getUser().getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            PlaylistResponse response = new PlaylistResponse();
            response.setErrorMessage("Error creating playlist: " + e.getMessage()); // Trả về thông điệp lỗi
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Add song to playlist
    @PostMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<SongInPlaylistResponse> addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        try {
            playlistService.addSongToPlaylist(playlistId, songId);
            Song song = songRespository.findSongById(songId);
            SongInPlaylistResponse response = new SongInPlaylistResponse();
            response.setPlaylistId(playlistId);
            response.setSongId(songId);
            response.setSongTitle(song.getTitle());
            response.setArtist(song.getArtist());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            SongInPlaylistResponse response = new SongInPlaylistResponse();
            response.setErrorMessage("Error adding song to playlist: " + e.getMessage()); // Trả về thông điệp lỗi
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Update playlist name
    @PutMapping("/{playlistId}")
    public ResponseEntity<PlaylistResponse> updatePlaylist(@PathVariable Long playlistId, @RequestParam String newName) {
        try {
            Playlist playlist = playlistService.updatePlaylist(playlistId, newName);
            PlaylistResponse response = new PlaylistResponse();
            response.setId(playlist.getId());
            response.setPlaylistName(playlist.getName());
            response.setUserId(playlist.getUser().getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            PlaylistResponse response = new PlaylistResponse();
            response.setErrorMessage("Error updating playlist: " + e.getMessage()); // Trả về thông điệp lỗi
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Delete playlist
    @DeleteMapping("/delete/{playlistId}")
    public ResponseEntity<PlaylistResponse> deletePlaylist(@PathVariable Long playlistId) {
        try {
            playlistService.deletePlaylist(playlistId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            PlaylistResponse response = new PlaylistResponse();
            response.setErrorMessage("Error deleting playlist: " + e.getMessage()); // Trả về thông điệp lỗi
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Remove song from playlist
    @DeleteMapping("/{playlistId}/delete/songs/{songId}")
    public ResponseEntity<SongInPlaylistResponse> removeSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        try {
            playlistService.removeSongFromPlaylist(playlistId, songId);
            SongInPlaylistResponse response = new SongInPlaylistResponse();
            response.setPlaylistId(playlistId);
            response.setSongId(songId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            SongInPlaylistResponse response = new SongInPlaylistResponse();
            response.setErrorMessage("Error removing song from playlist: " + e.getMessage()); // Trả về thông điệp lỗi
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
