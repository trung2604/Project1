package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.RecentlyPlayed;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecentlyPlayedRepository extends JpaRepository<RecentlyPlayed, Long> {
    List<RecentlyPlayed> findByUserIdOrderByPlayedAtDesc(Long userId);
    @Query("SELECT rp FROM RecentlyPlayed rp WHERE rp.user.id = :userId ORDER BY rp.playedAt DESC")
    List<RecentlyPlayed> findRecentlyPlayedByUserIdWithLimit(@Param("userId") Long userId, Pageable pageable);}
