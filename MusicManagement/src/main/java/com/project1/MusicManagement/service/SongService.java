package com.project1.MusicManagement.service;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.SongRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class SongService {

    @Autowired
    private SongRespository songRepository;

    @Autowired
    private AuthService authService;

    @Value("${song.upload.dir}")
    private String uploadDir; // Đảm bảo sử dụng một biến uploadDir duy nhất

    // Upload bài hát và lưu thông tin vào database
    public Song uploadSong(MultipartFile file, Long userId) throws IOException, UnsupportedTagException, InvalidDataException {
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".mp3")) {
            throw new RuntimeException("Invalid file type! Only MP3 files are allowed.");
        }
        if(!authService.isAdmin(userId)) {
            throw new RuntimeException("You are not permission to upload file.");
        }

        String filePath = uploadDir + File.separator + fileName;

        // Kiểm tra nếu file đã tồn tại
        File targetFile = new File(filePath);
        if (targetFile.exists()) {
            throw new RuntimeException("File already exists!");
        }

        // Kiểm tra bài hát đã tồn tại trong database
        if (songRepository.findByFilePath(filePath) != null) {
            throw new RuntimeException("Song already exists in the database!");
        }

        // Tạo thư mục uploads nếu chưa tồn tại
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs(); // Tạo thư mục nếu chưa có
            if (!created) {
                throw new RuntimeException("Failed to create upload directory: " + uploadDir);
            }
        }

        // Lưu file và đọc metadata
        file.transferTo(targetFile);
        Mp3File mp3File = new Mp3File(filePath);

        String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown";
        String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown";
        String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown";
        String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : "Unknown";
        long duration = mp3File.getLengthInSeconds();

        // Lưu bài hát vào database
        Song song = new Song(duration, title, artist, album, genre, filePath, false);
        song.setId(userId);

        return songRepository.save(song);
    }

    // Xóa bài hát
    public void deleteSong(Long id, Long userId) {
        // Tìm bài hát
        Song song = songRepository.findSongById(id);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }

        // Kiểm tra quyền admin
        if (!authService.isAdmin(userId)) {
            throw new RuntimeException("You do not have permission to delete this song!");
        }

        // Xóa file vật lý
        File file = new File(song.getFilePath());
        if (file.exists() && !file.delete()) {
            throw new RuntimeException("Failed to delete the file: " + file.getName());
        }

        // Xóa bài hát khỏi database
        songRepository.delete(song);
    }

    // Lấy file bài hát để phát
    public File getSongFile(Long id) {
        Song song = songRepository.findSongById(id);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }

        File file = new File(song.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("File not found on server!");
        }

        return file;
    }

    // Cập nhật bài hát
    public Song updateSong(Long id, MultipartFile file, Long userId) throws IOException, UnsupportedTagException, InvalidDataException {
        // Kiểm tra quyền admin trước khi cập nhật
        if (!authService.isAdmin(userId)) {
            throw new RuntimeException("You do not have permission to update this song!");
        }

        Song existingSong = songRepository.findSongById(id);
        if (existingSong == null) {
            throw new RuntimeException("Song not found");
        }

        String fileName = file.getOriginalFilename();
        String filePath = uploadDir + File.separator + fileName;

        // Lưu file mới
        File targetFile = new File(filePath);
        file.transferTo(targetFile);
        Mp3File mp3File = new Mp3File(filePath);

        String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown";
        String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown";
        String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown";
        String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : "Unknown";
        long duration = mp3File.getLengthInSeconds();

        // Cập nhật thông tin bài hát
        existingSong.setTitle(title);
        existingSong.setArtist(artist);
        existingSong.setAlbum(album);
        existingSong.setGenre(genre);
        existingSong.setFilePath(filePath);
        existingSong.setDuration(duration);

        return songRepository.save(existingSong);
    }

    // Lấy bài hát theo ID
    public Song getSongById(Long id) {
        Song song = songRepository.findSongById(id);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }
        return song;
    }

    // Lấy danh sách tất cả bài hát
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
}
