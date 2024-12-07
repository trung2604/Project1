package com.project1.MusicManagement.service;

import com.project1.MusicManagement.dto.LoginRequest;
import com.project1.MusicManagement.dto.LoginResponse;
import com.project1.MusicManagement.dto.RegisterRequest;
import com.project1.MusicManagement.dto.RegisterResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project1.MusicManagement.entity.User;
import com.project1.MusicManagement.repository.UserRepository;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public boolean isAdmin(Long userId) {
        String role = userRepository.findRoleByUserId(userId);
        return "ADMIN".equalsIgnoreCase(role);
    }

    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new RegisterResponse(false, "Username already exists");
        }

        boolean isAdminExist = userRepository.existsByRole("Admin");
        String role = isAdminExist ? "User" : "Admin";
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(role);
        userRepository.save(user);
        return new RegisterResponse(true, "User registered successfully");
    }

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername());
        if(user == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Wrong password");
        }
        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                "Login successful"
        );
    }
}
