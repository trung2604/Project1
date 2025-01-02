package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.dto.RecentlyPlayedRequest;
import com.project1.MusicManagement.dto.RecentlyPlayedResponse;
import com.project1.MusicManagement.service.RecentlyPlayedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recently-played")
public class RecentlyPlayedController {
    @Autowired
    private RecentlyPlayedService recentlyPlayedService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<RecentlyPlayedResponse>> getRecentlyPlayed(@PathVariable Long userId) {
        List<RecentlyPlayedResponse> response = recentlyPlayedService.getRecentlyPlayed(userId);
        return ResponseEntity.ok(response);
    }

}
