package com.project1.MusicManagement.service;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.SongRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class SongService {
    @Autowired
    private SongRespository songRepository;

    // Upload bài hát và lưu thông tin vào database
    public Song uploadSong(MultipartFile file) throws IOException, UnsupportedTagException, InvalidDataException {
        String fileName = file.getOriginalFilename();
        String filePath = "uploads/" + fileName;
        File targetFile = new File(filePath);
        file.transferTo(targetFile);

        Mp3File mp3File = null;
        try {
            mp3File = new Mp3File(filePath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (UnsupportedTagException e) {
            throw new RuntimeException(e);
        } catch (InvalidDataException e) {
            throw new RuntimeException(e);
        }
        String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown";
        String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown";
        String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown";
        String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : "Unknown";
        long duration = mp3File.getLengthInSeconds();

        Song song = new Song(duration, title, artist, album, genre, filePath, duration, false);
        return songRepository.save(song);
    }

    // Sửa bài hát (upload file mới)
    public Song updateSong(Long id, MultipartFile file) throws IOException, UnsupportedTagException {
        Optional<Song> existingSong = songRepository.findById(id);
        if (existingSong.isPresent()) {
            String fileName = file.getOriginalFilename();
            String filePath = "uploads/" + fileName;
            File targetFile = new File(filePath);
            file.transferTo(targetFile);

            Mp3File mp3File = null;
            try {
                mp3File = new Mp3File(filePath);
            } catch (InvalidDataException e) {
                throw new RuntimeException(e);
            }
            String title = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getTitle() : "Unknown";
            String artist = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getArtist() : "Unknown";
            String album = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getAlbum() : "Unknown";
            String genre = mp3File.hasId3v2Tag() ? mp3File.getId3v2Tag().getGenreDescription() : "Unknown";
            long duration = mp3File.getLengthInSeconds();

            Song song = existingSong.get();
            song.setTitle(title);
            song.setArtist(artist);
            song.setAlbum(album);
            song.setGenre(genre);
            song.setFilePath(filePath);
            song.setDuration(duration);

            return songRepository.save(song);
        } else {
            throw new RuntimeException("Song not found");
        }
    }

    // Xóa bài hát
    public void deleteSong(Long id) {
        songRepository.deleteById(id);
    }

    // Lấy thông tin bài hát theo ID
    public Song getSongById(Long id) {
        return songRepository.findById(id).orElseThrow(() -> new RuntimeException("Song not found"));
    }

    // Lấy danh sách bài hát
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
}
