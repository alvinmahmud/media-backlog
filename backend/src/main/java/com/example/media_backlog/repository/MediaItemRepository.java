package com.example.media_backlog.repository;

import com.example.media_backlog.model.MediaItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaItemRepository extends MongoRepository<MediaItem, String> {
    List<MediaItem> findByType(String type);
}
