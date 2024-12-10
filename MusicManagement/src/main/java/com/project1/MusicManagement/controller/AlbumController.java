package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.SongRespository;
import com.project1.MusicManagement.service.AlbumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {
    @Autowired
    private SongRespository songRespository;
    @Autowired
    private AlbumService albumService;
    @GetMapping("/artist/{artist}")
    public ResponseEntity<List<Song>> getAlbumByArtist(@PathVariable String artist) {
        List<Song> songs = albumService.getAlbumArtist(artist);
        if (songs != null && !songs.isEmpty()) {
            return ResponseEntity.ok(songs);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
