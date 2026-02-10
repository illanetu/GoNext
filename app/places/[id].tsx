import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPlaceWithPhotos, deletePlace, PlaceWithPhotos } from '../../services/placesService';
import * as ImagePicker from 'expo-image-picker';
import { addPhotoToPlace, removePhotoFromPlace } from '../../services/placesService';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [place, setPlace] = useState<PlaceWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlace = async () => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }

    try {
      const placeData = await getPlaceWithPhotos(parseInt(id));
      setPlace(placeData);
    } catch (error) {
      console.error('Ошибка загрузки места:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить место');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlace();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Удаление места',
      'Вы уверены, что хотите удалить это место?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlace(parseInt(id!));
              router.back();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить место');
            }
          },
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (!place || !place.latitude || !place.longitude) {
      Alert.alert('Ошибка', 'Координаты места не указаны');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch((err) => {
      console.error('Ошибка открытия карты:', err);
      Alert.alert('Ошибка', 'Не удалось открыть карту');
    });
  };

  const handleOpenNavigator = () => {
    if (!place || !place.latitude || !place.longitude) {
      Alert.alert('Ошибка', 'Координаты места не указаны');
      return;
    }

    const url = `google.navigation:q=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch(() => {
      // Fallback на Google Maps
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
      Linking.openURL(mapsUrl).catch((err) => {
        console.error('Ошибка открытия навигатора:', err);
        Alert.alert('Ошибка', 'Не удалось открыть навигатор');
      });
    });
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужно разрешение на доступ к фотографиям');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && id && id !== 'new') {
      try {
        await addPhotoToPlace(parseInt(id), result.assets[0].uri);
        await loadPlace();
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось добавить фотографию');
      }
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await removePhotoFromPlace(photoId);
      await loadPlace();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить фотографию');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.emptyContainer}>
          <Paragraph>Место не найдено</Paragraph>
          <Button onPress={() => router.back()}>Назад</Button>
        </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Title style={styles.title}>{place.name}</Title>
              <IconButton
                icon="delete"
                iconColor="#d32f2f"
                size={24}
                onPress={handleDelete}
              />
            </View>

            <View style={styles.chipsContainer}>
              {place.visitlater && (
                <Chip icon="clock-outline" style={styles.chip}>
                  Посетить позже
                </Chip>
              )}
              {place.liked && (
                <Chip icon="heart" style={styles.chip}>
                  Понравилось
                </Chip>
              )}
            </View>

            {place.description && (
              <Paragraph style={styles.description}>{place.description}</Paragraph>
            )}

            {place.latitude && place.longitude && (
              <View style={styles.coordinatesContainer}>
                <Paragraph style={styles.coordinates}>
                  📍 Координаты: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                </Paragraph>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              {place.latitude && place.longitude && (
                <>
                  <Button
                    mode="contained"
                    onPress={handleOpenMap}
                    icon="map"
                    style={styles.button}
                  >
                    Открыть на карте
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleOpenNavigator}
                    icon="navigation"
                    style={styles.button}
                  >
                    Открыть в навигаторе
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.photosHeader}>
              <Title>Фотографии</Title>
              <Button mode="text" onPress={handleAddPhoto} icon="plus">
                Добавить
              </Button>
            </View>

            {place.photos.length === 0 ? (
              <Paragraph style={styles.emptyText}>Нет фотографий</Paragraph>
            ) : (
              <View style={styles.photosContainer}>
                {place.photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Paragraph numberOfLines={1} style={styles.photoPath}>
                      {photo.filePath}
                    </Paragraph>
                    <IconButton
                      icon="delete"
                      iconColor="#d32f2f"
                      size={20}
                      onPress={() => handleDeletePhoto(photo.id)}
                    />
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    height: 32,
  },
  description: {
    marginTop: 10,
    fontSize: 16,
  },
  coordinatesContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    marginVertical: 4,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  photosContainer: {
    marginTop: 10,
  },
  photoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 8,
  },
  photoPath: {
    flex: 1,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});
