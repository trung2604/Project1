package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.dto.RecentlyPlayedRequest;
import com.project1.MusicManagement.dto.RecentlyPlayedResponse;
import com.project1.MusicManagement.service.RecentlyPlayedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @DeleteMapping("/delete-all/{userId}")
    public ResponseEntity<String> deleteAllRecently(@PathVariable long userId) {
        try {
            recentlyPlayedService.deleteAllRecently(userId);
            return ResponseEntity.ok("All recently played records for user ID " + userId + " have been deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete recently played records: " + e.getMessage());
        }
    }
}
