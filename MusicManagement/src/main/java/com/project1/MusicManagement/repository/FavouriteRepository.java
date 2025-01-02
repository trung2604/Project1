package com.project1.MusicManagement.repository;

import com.project1.MusicManagement.entity.Favourite;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    List<Favourite> findByUserId(Long userId);
    boolean existsByUserIdAndSongId(Long userId, Long songId);
    Favourite findByUserIdAndSongId(Long userId, Long songId);
    List<Favourite> findByUserId(Long userId, Pageable pageable);
}
