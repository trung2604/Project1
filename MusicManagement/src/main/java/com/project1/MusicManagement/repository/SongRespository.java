package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SongRespository extends JpaRepository<Song, Long> {
    boolean existsByFilePath(String filePath);
    Song findByFilePath(String filePath);
    Song findSongById(long id);
    List<Song> findSongByArtist(String artist);
    @Query("SELECT s FROM Song s WHERE LOWER(s.genre) = LOWER(:genre)")
    List<Song> findSongByGenre(String genre);
    @Query("SELECT ps.song FROM PlaylistSong ps WHERE ps.playlist.id = :playlistId")
    List<Song> findSongsByPlaylistId(@Param("playlistId") Long playlistId);}
