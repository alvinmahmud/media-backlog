package com.example.media_backlog.service;

import com.example.media_backlog.model.MediaItem;
import com.example.media_backlog.repository.MediaItemRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import com.example.media_backlog.service.MediaItemService;

class MediaItemServiceTest {

    @Test
    void testGetAllMediaItems() {
        MediaItemRepository mockRepo = mock(MediaItemRepository.class);
        MediaItemService service = new MediaItemService(mockRepo);

        List<MediaItem> mockItems = Arrays.asList(
                new MediaItem("The Matrix", 1999, "Movie", "Watched"),
                new MediaItem("Breaking Bad", 2008, "TV", "Plan to Watch")
        );

        when(mockRepo.findAll()).thenReturn(mockItems);

        List<MediaItem> result = service.getAllMediaItems();

        assertEquals(2, result.size());
        assertEquals("The Matrix", result.getFirst().getTitle());
        verify(mockRepo, times(1)).findAll();
    }
}
