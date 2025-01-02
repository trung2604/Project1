package com.project1.MusicManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentlyPlayedRequest {
    private long userId;
    private long songId;
}
