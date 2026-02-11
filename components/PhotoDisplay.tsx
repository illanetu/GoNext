import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface PhotoDisplayProps {
  /** URI фотографии (file:// или путь из БД) */
  uri: string;
  /** Размер в пикселях */
  size?: number;
  /** Стиль контейнера */
  style?: object;
}

/**
 * Компонент для отображения одной фотографии.
 */
export function PhotoDisplay({
  uri,
  size = 120,
  style,
}: PhotoDisplayProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    borderRadius: 8,
  },
});
