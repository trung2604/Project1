package com.project1.MusicManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SongInPlaylistResponse {
    private Long playlistId;
    private Long songId;
    private String songTitle;
    private String artist;
    private String errorMessage;
}
