import React from 'react';
import { Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface PhotoPickerProps {
  onPhotoSelected: (uri: string) => void;
  onError?: (message: string) => void;
  /** Режим кнопки: 'button' | 'icon' */
  mode?: 'button' | 'icon';
  /** Текст кнопки (для mode='button') */
  label?: string;
}

/**
 * Компонент для выбора фотографии из галереи.
 * Запрашивает разрешения и вызывает onPhotoSelected с URI выбранного изображения.
 */
export function PhotoPicker({
  onPhotoSelected,
  onError,
  mode = 'button',
  label = 'Добавить фото',
}: PhotoPickerProps) {
  const handlePress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      onError?.('Нужно разрешение на доступ к фотографиям');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onPhotoSelected(result.assets[0].uri);
    }
  };

  if (mode === 'icon') {
    return (
      <IconButton
        icon="image-plus"
        size={24}
        onPress={handlePress}
        mode="contained-tonal"
      />
    );
  }

  return (
    <Button mode="text" onPress={handlePress} icon="plus">
      {label}
    </Button>
  );
}
