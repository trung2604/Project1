package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRespository extends JpaRepository<Song, Long> {
    boolean existsByFilePath(String filePath);
    Song findByFilePath(String filePath);
    Song findSongById(long id);
}
