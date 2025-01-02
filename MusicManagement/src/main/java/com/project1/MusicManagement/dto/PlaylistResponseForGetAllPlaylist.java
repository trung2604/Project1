package com.project1.MusicManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponseForGetAllPlaylist {
    private Long playlistId;
    private String playlistName;
    private LocalDateTime createAt;
}
