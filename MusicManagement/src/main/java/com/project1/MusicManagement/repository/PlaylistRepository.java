package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.Playlist;
import com.project1.MusicManagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    Playlist findPlaylistById(long id);
    Playlist findPlaylistByNameAndUserId(String name, long userId);
    List<Playlist> findPlaylistByUserId(long userId);
}

