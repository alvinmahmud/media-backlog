package com.example.media_backlog.service;

import com.example.media_backlog.model.MediaItem;
import com.example.media_backlog.repository.MediaItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MediaItemService {
    private final MediaItemRepository mediaItemRepository;

    public MediaItemService(MediaItemRepository mediaItemRepository) {
        this.mediaItemRepository = mediaItemRepository;
    }

    public List<MediaItem> getAllMediaItems() {
        return mediaItemRepository.findAll();
    }

    public Optional<MediaItem> getMediaItemById(String id) {
        return mediaItemRepository.findById(id);
    }

    public MediaItem addMediaItem(MediaItem mediaItem) {
        return mediaItemRepository.save(mediaItem);
    }

    public void deleteMediaItem(String id) {
        mediaItemRepository.deleteById(id);
    }
}
