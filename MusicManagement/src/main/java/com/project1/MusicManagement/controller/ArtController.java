package com.project1.MusicManagement.controller;

import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads/images")
public class ArtController {

    @GetMapping("/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getImage(@PathVariable String filename) {
        try {
            // Sử dụng java.nio.file.Path
            java.nio.file.Path filePath = Paths.get("uploads/images").resolve(filename).normalize();

            // Tạo UrlResource từ đường dẫn
            UrlResource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Xác định loại MIME phù hợp
                String contentType = filename.endsWith(".png") ? MediaType.IMAGE_PNG_VALUE : MediaType.IMAGE_JPEG_VALUE;
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

}
