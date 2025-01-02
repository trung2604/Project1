package com.project1.MusicManagement.service;

import com.project1.MusicManagement.dto.RecentlyPlayedResponse;
import com.project1.MusicManagement.entity.RecentlyPlayed;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.entity.User;
import com.project1.MusicManagement.repository.RecentlyPlayedRepository;
import com.project1.MusicManagement.repository.SongRespository;
import com.project1.MusicManagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RecentlyPlayedService {
    @Autowired
    private RecentlyPlayedRepository recentlyPlayedRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    private SongRespository songRespository;

    //Log recently played
    public void logRecentlyPlayed(Long userId, Long songId) {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Song song = songRespository.findSongById(songId);
        if (song == null) {
            throw new RuntimeException("Song not found");
        }

        RecentlyPlayed recentlyPlayed = new RecentlyPlayed();
        recentlyPlayed.setUser(user);
        recentlyPlayed.setSong(song);
        recentlyPlayedRepository.save(recentlyPlayed);
    }

    //get all list recently played
    public List<RecentlyPlayedResponse> getRecentlyPlayed(Long userId) {
        List<RecentlyPlayed> recentlyPlayedList = recentlyPlayedRepository.findByUserIdOrderByPlayedAtDesc(userId);
        List<RecentlyPlayedResponse> response = new ArrayList<>();
        Set<Long> addedSongIds = new HashSet<>(); // Dùng để kiểm tra bài hát đã được thêm

        for (RecentlyPlayed rp : recentlyPlayedList) {
            Long songId = rp.getSong().getId();
            if (!addedSongIds.contains(songId)) { // Chỉ thêm bài hát mới nếu chưa tồn tại
                RecentlyPlayedResponse res = new RecentlyPlayedResponse();
                res.setId(songId);
                res.setTitle(rp.getSong().getTitle());
                res.setArtist(rp.getSong().getArtist());
                res.setGenre(rp.getSong().getGenre());
                res.setAlbum(rp.getSong().getAlbum());
                res.setDuration(rp.getSong().getDuration());
                res.setImgPath(rp.getSong().getImgPath());
                res.setPlayedAt(rp.getPlayedAt());
                response.add(res);
                addedSongIds.add(songId); // Đánh dấu bài hát đã được thêm
            }
        }
        return response;
    }

}
