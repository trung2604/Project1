package com.project1.MusicManagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("api/admin")
public class ViewAdminController {

    @GetMapping()
    public String showHomePage() {
        return "admin";
    }
}
