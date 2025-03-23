package com.example.media_backlog.controller;

import com.example.media_backlog.model.MediaItem;
import com.example.media_backlog.service.MediaItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/media")
public class MediaItemController {
    private final MediaItemService mediaItemService;

    public MediaItemController(MediaItemService mediaItemService) {
        this.mediaItemService = mediaItemService;
    }

    @GetMapping
    public List<MediaItem> getAllMediaItems() {
        return mediaItemService.getAllMediaItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaItem> getMediaItemById(@PathVariable String id) {
        Optional<MediaItem> mediaItem = mediaItemService.getMediaItemById(id);
        return mediaItem.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public MediaItem addMediaItem(@RequestBody MediaItem mediaItem) {
        return mediaItemService.addMediaItem(mediaItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMediaItem(@PathVariable String id) {
        mediaItemService.deleteMediaItem(id);
        return ResponseEntity.noContent().build();
    }
}
