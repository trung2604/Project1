package com.project1.MusicManagement.dto;

import com.project1.MusicManagement.entity.Song;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentlyPlayedResponse {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Long duration;
    private String imgPath;
    private LocalDateTime playedAt;
}
