package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.Playlist;
import com.project1.MusicManagement.entity.PlaylistSong;
import com.project1.MusicManagement.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    PlaylistSong findByPlaylistAndSong(Playlist playlist, Song song);
    void deleteByPlaylist(Playlist playlist);
    @Query("SELECT ps.song FROM PlaylistSong ps WHERE ps.playlist.id = :playlistId")
    Page<Song> findSongsByPlaylistId(@Param("playlistId") Long playlistId, Pageable pageable);}

