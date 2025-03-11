package com.example.media_backlog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "media_items")
public class MediaItem {
    @Id
    private String id; // Unique ID for db
    private String title; // Title of movie or game
    private int year; // Release year
    private String type; // Movie or game
    private String status; // In progress, Completed, Backlog

    public MediaItem() {}

    public MediaItem(String title, int year, String type, String status) {
        this.title = title;
        this.year = year;
        this.type = type;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
