package com.project1.MusicManagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("api/auth")
public class AuthController {

    @GetMapping("/login")
    public String showLoginPage() { return "login"; }
    @GetMapping("/register")
    public String showRegisterPage() { return "register"; }
}
