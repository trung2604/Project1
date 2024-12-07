package com.project1.MusicManagement.controller;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.UnsupportedTagException;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired
    private SongService songService;

    // Upload bài hát
    @PostMapping("/upload/{userId}")
    public ResponseEntity<String> uploadSong(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            songService.uploadSong(file, userId);
            return ResponseEntity.ok("Song uploaded successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while uploading the song.");
        }
    }

    // Xóa bài hát
    @DeleteMapping("/delete/{id}/{userId}")
    public ResponseEntity<String> deleteSong(
            @PathVariable Long id,
            @PathVariable Long userId) {
        try {
            songService.deleteSong(id, userId);
            return ResponseEntity.ok("Song deleted successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting the song.");
        }
    }
    // Cập nhật bài hát
    @PutMapping("/update/{id}/{userId}")
    public ResponseEntity<Song> updateSong(
            @PathVariable Long id,           // Lấy ID bài hát từ URL
            @PathVariable Long userId,       // Lấy ID người dùng từ URL
            @RequestParam("file") MultipartFile file) {  // Lấy file bài hát từ request body
        try {
            // Gọi service để cập nhật bài hát
            Song updatedSong = songService.updateSong(id, file, userId);
            return ResponseEntity.ok(updatedSong);  // Trả về bài hát đã cập nhật
        } catch (RuntimeException e) {
            // Trả về lỗi nếu không có quyền hoặc bài hát không tìm thấy
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (IOException | UnsupportedTagException | InvalidDataException e) {
            // Trả về lỗi trong trường hợp có lỗi khi xử lý file hoặc metadata
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (Exception e) {
            e.printStackTrace();
            // Trả về lỗi chung trong trường hợp không xác định
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lấy thông tin bài hát theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(@PathVariable Long id) {
        try {
            Song song = songService.getSongById(id);
            return ResponseEntity.ok(song);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Lấy danh sách tất cả bài hát
    @GetMapping("/all")
    public ResponseEntity<List<Song>> getAllSongs() {
        try {
            List<Song> songs = songService.getAllSongs();
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Phát nhạc
    @GetMapping("/play/{id}")
    public ResponseEntity<InputStreamResource> playSong(@PathVariable Long id) {
        try {
            File file = songService.getSongFile(id);
            FileInputStream fileInputStream = new FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(fileInputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + file.getName())
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
