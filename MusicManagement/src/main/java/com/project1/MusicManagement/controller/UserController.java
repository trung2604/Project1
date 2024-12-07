package com.project1.MusicManagement.controller;

import com.project1.MusicManagement.dto.LoginRequest;
import com.project1.MusicManagement.dto.LoginResponse;
import com.project1.MusicManagement.dto.RegisterRequest;
import com.project1.MusicManagement.dto.RegisterResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project1.MusicManagement.service.AuthService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest) {
        RegisterResponse response = authService.register(registerRequest);
        if(!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            LoginResponse response = authService.login(loginRequest);
            session.setAttribute("userId", response.getId()); // Lưu userId vào session
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new LoginResponse(null, null, null, e.getMessage()));
        }
    }



    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate(); // Hủy session
        return ResponseEntity.ok("Logged out successfully!");
    }
}
