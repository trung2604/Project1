package com.project1.MusicManagement.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

import com.project1.MusicManagement.repository.SongRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mpatric.mp3agic.Mp3File;
import com.project1.MusicManagement.entity.Song;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    @Value("${song.upload.dir}")
    private String uploadDir;
    @Autowired
    private SongRespository songRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Tạo thư mục 'upload' nếu chưa tồn tại
            File uploadDirectory = new File(uploadDir);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            // Lưu file vào thư mục 'upload'
            String filePath = uploadDir + "/" + file.getOriginalFilename();
            File savedFile = new File(filePath);
            file.transferTo(savedFile);

            // Đọc metadata từ file MP3
            Mp3File mp3File = new Mp3File(savedFile);

            String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown Title";
            String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown Artist";
            String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown Album";
            String genre = mp3File.hasId3v2Tag() && mp3File.getId3v2Tag().getGenreDescription() != null
                    ? mp3File.getId3v2Tag().getGenreDescription()
                    : "Unknown Genre";
            long duration = mp3File.getLengthInSeconds(); // Thời lượng tính theo giây

            // Lưu thông tin vào cơ sở dữ liệu
            Song song = new Song();
            song.setTitle(title);
            song.setArtist(artist);
            song.setAlbum(album);
            song.setGenre(genre);
            song.setFilePath(filePath);
            song.setDuration(duration);
            song.setFavorited(false); // Thiết lập giá trị mặc định cho isFavorited
            songRepository.save(song);

            return ResponseEntity.ok("File uploaded and saved successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file.");
        }
    }

 // Endpoint để phát nhạc
    @GetMapping("/play/{id}")
    public ResponseEntity<InputStreamResource> playSong(@PathVariable Long id) {
        // Tìm bài hát từ cơ sở dữ liệu
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        String filePath = song.getFilePath();
        File file = new File(filePath);

        try {
            FileInputStream fileInputStream = new FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(fileInputStream);

            // Trả về ResponseEntity để stream file MP3
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + file.getName())
                    .body(resource);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Song>> getAllSongs() {
        List<Song> songs = songRepository.findAll();
        return ResponseEntity.ok(songs);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSong(@PathVariable Long id) {
        if (songRepository.existsById(id)) {
            songRepository.deleteById(id);
            return ResponseEntity.ok("Song deleted successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Song not found!");
        }
    }

}
