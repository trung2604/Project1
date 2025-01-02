package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.entity.Favourite;
import com.project1.MusicManagement.entity.Song;
import com.project1.MusicManagement.entity.User;
import com.project1.MusicManagement.repository.SongRespository;
import com.project1.MusicManagement.repository.UserRepository;
import com.project1.MusicManagement.service.FavouriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
public class FavouriteController {

    @Autowired
    private FavouriteService favouriteService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SongRespository songRespository;

    // Thêm bài hát vào danh sách yêu thích
    @PostMapping("/add")
    public void addSongToFavourites(@RequestBody Favourite favourite) {
        favouriteService.addSongToFavourites(favourite.getUser(), favourite.getSong());
    }

    // Xóa bài hát khỏi danh sách yêu thích
    @DeleteMapping("/remove")
    public void removeSongFromFavourites(@RequestBody Favourite favourite) {
        favouriteService.removeSongFromFavourites(favourite.getUser(), favourite.getSong());
    }

    // Lấy danh sách yêu thích của người dùng
    @GetMapping("/user/{userId}")
    public List<Favourite> getUserFavourites(@PathVariable Long userId) {
        return favouriteService.getUserFavourites(userId);
    }
}
