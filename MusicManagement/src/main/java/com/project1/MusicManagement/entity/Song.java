package com.project1.MusicManagement.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String artist;
    private String album;
    private String genre;
    private String filePath;
    private String imgPath;
    private long duration;
    @Column(name = "is_favorited", nullable = false)
    private boolean isFavorited = false;
    public Song(long duration, String title, String artist, String album, String genre, String filePath, boolean isFavorited) {
        this.duration = duration;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.genre = genre;
        this.filePath = filePath;
        this.isFavorited = isFavorited;
    }
}
