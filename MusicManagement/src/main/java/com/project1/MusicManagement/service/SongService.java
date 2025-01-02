package com.project1.MusicManagement.service;

import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import com.project1.MusicManagement.dto.SongDetails;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.FavouriteRepository;
import com.project1.MusicManagement.repository.SongRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class SongService {

    @Autowired
    private SongRespository songRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private FavouriteRepository favouriteRepository;

    @Value("${song.upload.dir}")
    private String uploadDir; // Đảm bảo sử dụng một biến uploadDir duy nhất

    public String extractAlbumArt(Mp3File mp3File, String title) throws IOException {
        if (mp3File.hasId3v2Tag()) {
            ID3v2 id3v2Tag = mp3File.getId3v2Tag();
            byte[] albumArtData = id3v2Tag.getAlbumImage();
            if (albumArtData != null) {
                // Sinh tên file ảnh duy nhất
                String uniqueSuffix = UUID.randomUUID().toString();
                String coverFileName = title.replaceAll("[^a-zA-Z0-9]", "_") + "_" + uniqueSuffix + "_image.jpg";
                String coverFilePath = uploadDir + File.separator + "images" + File.separator + coverFileName;

                // Tạo thư mục nếu chưa tồn tại
                File coverDir = new File(uploadDir + File.separator + "images");
                if (!coverDir.exists()) {
                    coverDir.mkdirs();
                }

                // Lưu ảnh
                File coverFile = new File(coverFilePath);
                try (FileOutputStream fos = new FileOutputStream(coverFile)) {
                    fos.write(albumArtData);
                }

                // Trả về URL ảnh
                return "/uploads/images/" + coverFileName;
            }
        }
        return null;
    }

    public Song uploadSong(MultipartFile file, Long userId) throws IOException, UnsupportedTagException, InvalidDataException {
        // Kiểm tra định dạng file
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".mp3")) {
            throw new RuntimeException("Invalid file type! Only MP3 files are allowed.");
        }

        // Kiểm tra quyền người dùng
        if (!authService.isAdmin(userId)) {
            throw new RuntimeException("You do not have permission to upload file.");
        }

        // Lưu file MP3 vào thư mục uploads
        String filePath = uploadDir + File.separator + fileName;
        File targetFile = new File(filePath);

        // Kiểm tra nếu file đã tồn tại và tạo tên file mới nếu cần thiết
        int count = 1;
        if(targetFile.exists()){
            throw new RuntimeException("File already exists!");
        }
        file.transferTo(targetFile);

        // Đọc metadata từ file MP3
        Mp3File mp3File = new Mp3File(filePath);

        // Trích xuất thông tin metadata
        String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown";
        String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown";
        String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown";
        String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : "Unknown";
        long duration = mp3File.getLengthInSeconds();

        // Gọi hàm extractAlbumArt để lấy URL ảnh bìa
        String albumArtUrl = extractAlbumArt(mp3File, title);

        // Tạo bài hát mới và lưu vào cơ sở dữ liệu
        Song song = new Song(duration, title, artist, album, genre, filePath, false);
        song.setImgPath(albumArtUrl);
        return songRepository.save(song);
    }

    // Xóa bài hát
    public void deleteSong(Long id, Long userId) {
        Song song = songRepository.findSongById(id);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }
        if (!authService.isAdmin(userId)) {
            throw new RuntimeException("You do not have permission to delete this song!");
        }
        File file = new File(song.getFilePath());
        if (file.exists() && !file.delete()) {
            throw new RuntimeException("Failed to delete the file: " + file.getName());
        }
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

    //Cập nhật bài hát
    public Song updateSong(Long songId, MultipartFile file, Long userId) throws IOException, UnsupportedTagException, InvalidDataException {
        // Kiểm tra quyền người dùng
        if (!authService.isAdmin(userId)) {
            throw new RuntimeException("You do not have permission to update song.");
        }

        // Tìm bài hát theo ID
        Song song = songRepository.findSongById(songId);
        if (song == null) {
            throw new RuntimeException("Song not found!");
        }

        // Kiểm tra và lưu file mới nếu có
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".mp3")) {
            throw new RuntimeException("Invalid file type! Only MP3 files are allowed.");
        }

        // Lưu file MP3 mới
        String newFilePath = uploadDir + File.separator + fileName;
        File newFile = new File(newFilePath);

        // Kiểm tra nếu file đã tồn tại và tạo tên file mới nếu cần thiết
        int count = 1;
        while (newFile.exists()) {
            String newFileName = fileName.substring(0, fileName.lastIndexOf(".")) + "_" + count + ".mp3";
            newFile = new File(uploadDir + File.separator + newFileName);
            count++;
        }
        file.transferTo(newFile);

        // Đọc metadata từ file MP3 mới
        Mp3File mp3File = new Mp3File(newFilePath);

        // Cập nhật metadata
        String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : song.getTitle();
        String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : song.getArtist();
        String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : song.getAlbum();
        String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : song.getGenre();
        long duration = mp3File.getLengthInSeconds();

        // Gọi hàm extractAlbumArt để lấy URL ảnh bìa
        String albumArtUrl = extractAlbumArt(mp3File, title);

        // Cập nhật thông tin bài hát
        song.setDuration(duration);
        song.setTitle(title);
        song.setArtist(artist);
        song.setAlbum(album);
        song.setGenre(genre);
        song.setFilePath(newFilePath);
        if (albumArtUrl != null) {
            song.setImgPath(albumArtUrl);
        }
        // Lưu thay đổi vào cơ sở dữ liệu
        return songRepository.save(song);
    }



    // Lấy bài hát theo ID
    public SongDetails getSongById(Long id) {
        // Tìm bài hát theo ID
        Song song = songRepository.findSongById(id);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }
        // Lấy đường dẫn album art nếu có
        String albumArt = null;
        if (song.getImgPath() != null) {
            albumArt = song.getImgPath();
        }
        // Tạo DTO để trả về thông tin bài hát
        return new SongDetails(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getAlbum(),
                song.getGenre(),
                song.getDuration(),
                albumArt
        );
    }

    // Lấy danh sách tất cả bài hát
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

}
