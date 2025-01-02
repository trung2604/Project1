package com.project1.MusicManagement.service;

import com.project1.MusicManagement.entity.Favourite;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.entity.User;
import com.project1.MusicManagement.repository.FavouriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavouriteService {

    @Autowired
    private FavouriteRepository favouriteRepository;

    public void addSongToFavourites(User user, Song song) {
        if (!favouriteRepository.existsByUserIdAndSongId(user.getId(), song.getId())) {
            Favourite favourite = new Favourite(user, song, true);
            favouriteRepository.save(favourite);
        }
    }

    public void removeSongFromFavourites(User user, Song song) {
        // Kiểm tra nếu không tìm thấy Favourite, sẽ báo lỗi hoặc xử lý theo cách của bạn
        Favourite favourite = favouriteRepository.findByUserIdAndSongId(user.getId(), song.getId());
        if (favourite != null) {
            favouriteRepository.delete(favourite);
        } else {
            throw new RuntimeException("Favourite not found");
        }
    }

    public List<Favourite> getUserFavourites(Long userId) {
        return favouriteRepository.findByUserId(userId);
    }

    public boolean isSongFavorited(User user, Song song) {
        return favouriteRepository.existsByUserIdAndSongId(user.getId(), song.getId());
    }
}
