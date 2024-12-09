package com.project1.MusicManagement.controller;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.UnsupportedTagException;
import com.project1.MusicManagement.dto.SongDetails;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
    public ResponseEntity<?> updateSong(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            Song updatedSong = songService.updateSong(id, file, userId);
            return ResponseEntity.ok(updatedSong);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while saving the file: " + e.getMessage());
        } catch (UnsupportedTagException | InvalidDataException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while processing metadata: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }


    // Lấy thông tin bài hát theo ID
    @GetMapping("/{id}")
    public ResponseEntity<SongDetails> getSongById(@PathVariable Long id) {
        try {
            // Lấy thông tin bài hát từ service
            SongDetails songDetails = songService.getSongById(id);

            // Trả về SongDetails dưới dạng JSON
            return ResponseEntity.ok(songDetails);
        } catch (RuntimeException e) {
            // Trả về lỗi 404 nếu bài hát không tìm thấy
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null); // Trả về null hoặc bạn có thể tạo một đối tượng lỗi riêng
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
            // Lấy file bài hát từ dịch vụ
            File file = songService.getSongFile(id);

            // Mã hóa tên file để tránh lỗi với ký tự Unicode
            String encodedFileName = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8.toString());
            encodedFileName = encodedFileName.replaceAll("\\+", "%20"); // Đảm bảo thay thế dấu cộng thành %20

            // Đọc file và tạo InputStreamResource
            FileInputStream fileInputStream = new FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(fileInputStream);

            // Trả về file âm thanh với header Content-Disposition đã mã hóa tên file
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            // Nếu không tìm thấy bài hát
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            // Nếu có lỗi đọc file
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
