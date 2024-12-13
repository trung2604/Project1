package com.project1.MusicManagement.service;

import ch.qos.logback.core.util.StringUtil;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.repository.SongRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumService {
    @Autowired
    private SongRespository songRespository;

    public List<Song> getAlbumArtist(String artist) {
        return songRespository.findSongByArtist(artist);
    }
    public List<Song> getAlbumGenre(String genre) {
        return songRespository.findSongByGenre(genre);
    }
}
