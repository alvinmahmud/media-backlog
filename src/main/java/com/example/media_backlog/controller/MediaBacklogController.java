package com.example.media_backlog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MediaBacklogController {

    @GetMapping("/test")
    public String testEndpoint() {
        return "Backend is working!";
    }
}
