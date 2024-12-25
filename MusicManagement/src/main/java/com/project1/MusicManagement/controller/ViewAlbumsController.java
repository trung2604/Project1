package com.project1.MusicManagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("api/albums")
public class ViewAlbumsController {

    @GetMapping("/artist")
    public String showPlayPage() {
        return "AlbumArtist";
    }
    @GetMapping("/genre")
    public String showAlbumGenrePage() {
        return "AlbumArtist";
    }
}
