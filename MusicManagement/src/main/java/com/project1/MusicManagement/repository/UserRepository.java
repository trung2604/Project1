package com.project1.MusicManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project1.MusicManagement.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByRole(String role); // Kiểm tra xem role ADMIN đã tồn tại hay chưa
    @Query("SELECT u.role FROM User u WHERE u.id = :userId")
    String findRoleByUserId(Long userId);}
