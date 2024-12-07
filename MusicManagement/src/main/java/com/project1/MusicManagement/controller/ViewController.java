package com.project1.MusicManagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("api/songs")
public class ViewController {

    @GetMapping()
    public String showHomePage() {
        return "index";
    }
}
