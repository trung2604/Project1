package com.project1.MusicManagement.Security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Chỉ định Spring Boot phục vụ ảnh từ thư mục images/
        registry.addResourceHandler("/upload/images/**")
                .addResourceLocations("file:images/");
    }
}