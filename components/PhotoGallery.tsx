import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { PhotoDisplay } from './PhotoDisplay';
import { PhotoPicker } from './PhotoPicker';
import { PhotoViewer } from './PhotoViewer';
import type { Photo } from '../types';

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoSelected?: (uri: string) => void;
  onDeletePhoto?: (photoId: number) => void;
  onError?: (message: string) => void;
  /** Размер миниатюры */
  thumbnailSize?: number;
  /** Показывать ли кнопку удаления */
  allowDelete?: boolean;
  /** Показывать ли кнопку добавления */
  showAddButton?: boolean;
}

/**
 * Компонент галереи фотографий: сетка миниатюр с возможностью добавления и удаления.
 * Тап по миниатюре открывает полноэкранный просмотр.
 */
export function PhotoGallery({
  photos,
  onPhotoSelected,
  onDeletePhoto,
  onError,
  thumbnailSize = 100,
  allowDelete = true,
  showAddButton = true,
}: PhotoGalleryProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const openViewer = (index: number) => {
    setViewerInitialIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <View key={photo.id} style={styles.photoWrapper}>
            <Pressable onPress={() => openViewer(index)}>
              <PhotoDisplay uri={photo.filePath} size={thumbnailSize} />
            </Pressable>
            {allowDelete && onDeletePhoto && (
              <IconButton
                icon="delete"
                iconColor="#d32f2f"
                size={20}
                style={styles.deleteButton}
                onPress={() => onDeletePhoto(photo.id)}
              />
            )}
          </View>
        ))}
        {showAddButton && onPhotoSelected && (
          <View style={[styles.addButtonWrapper, { width: thumbnailSize, height: thumbnailSize }]}>
            <PhotoPicker
              mode="icon"
              onPhotoSelected={onPhotoSelected}
              onError={onError}
            />
          </View>
        )}
      </View>
      <PhotoViewer
        visible={viewerVisible}
        photos={photos}
        initialIndex={viewerInitialIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
  },
  addButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
});