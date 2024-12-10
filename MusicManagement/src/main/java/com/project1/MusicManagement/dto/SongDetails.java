package com.project1.MusicManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongDetails {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Long duration;
    private String imgPath;
}
