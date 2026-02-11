import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getNextPlace } from '../../services/nextPlaceService';
import { markPlaceAsVisited } from '../../services/tripPlacesService';
import type { TripPlaceWithDetails, Photo } from '../../types';
import { openInMaps, openInNavigator } from '../../utils/maps';
import { PlaceMapView } from '../../components/PlaceMapView';
import { PhotoDisplay } from '../../components/PhotoDisplay';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

export default function NextPlaceScreen() {
  const [item, setItem] = useState<TripPlaceWithDetails | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const loadNextPlace = useCallback(async () => {
    try {
      setLoading(true);
      const next = await getNextPlace();
      setItem(next ?? null);
    } catch (error) {
      console.error('Ошибка загрузки следующего места:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить следующее место');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNextPlace();
    }, [loadNextPlace])
  );

  const handleOpenMap = () => {
    if (!item?.place?.latitude || !item?.place?.longitude) {
      Alert.alert('Ошибка', 'Координаты места не указаны');
      return;
    }
    openInMaps(item.place.latitude, item.place.longitude);
  };

  const handleOpenNavigator = () => {
    if (!item?.place?.latitude || !item?.place?.longitude) {
      Alert.alert('Ошибка', 'Координаты места не указаны');
      return;
    }
    openInNavigator(item.place.latitude, item.place.longitude);
  };

  const handleMarkVisited = async () => {
    if (!item) return;
    try {
      await markPlaceAsVisited(item.id, true);
      await loadNextPlace();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отметить место как посещённое');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ImageBackground
          source={bgImage}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (item === null) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ImageBackground
          source={bgImage}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.emptyContainer}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Следующее место</Title>
                <Paragraph style={styles.emptyText}>
                  Нет следующего места для посещения.
                </Paragraph>
                <Paragraph style={styles.hint}>
                  Выберите текущую поездку в разделе «Поездки» и добавьте в неё
                  места. Следующим будет первое непосещённое место в маршруте.
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (!item) return null;
  const { place, photos } = item;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>{place.name}</Title>

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

              {place.description ? (
                <Paragraph style={styles.description}>{place.description}</Paragraph>
              ) : null}

              {place.latitude != null && place.longitude != null && (
                <>
                  <Paragraph style={styles.coordinates}>
                    📍 {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                  </Paragraph>
                  <View style={styles.mapContainer}>
                    <PlaceMapView
                      latitude={place.latitude}
                      longitude={place.longitude}
                      title={place.name}
                      height={200}
                    />
                  </View>
                </>
              )}

              <View style={styles.buttonsContainer}>
                {place.latitude != null && place.longitude != null && (
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
                <Button
                  mode="contained-tonal"
                  onPress={handleMarkVisited}
                  icon="check-circle"
                  style={styles.button}
                >
                  Отметить как посещённое
                </Button>
              </View>
            </Card.Content>
          </Card>

          {photos.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Фотографии</Title>
                <View style={styles.photosContainer}>
                  {photos.map((photo: Photo) => (
                    <PhotoDisplay
                      key={photo.id}
                      uri={photo.filePath}
                      size={100}
                    />
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
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
    padding: 20,
    justifyContent: 'center',
  },
  emptyTitle: {
    marginBottom: 12,
  },
  emptyText: {
    marginVertical: 8,
  },
  hint: {
    marginTop: 12,
    fontStyle: 'italic',
    color: '#666',
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
  title: {
    fontSize: 24,
    marginBottom: 8,
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
    marginTop: 4,
    fontSize: 16,
  },
  coordinates: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    marginTop: 12,
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  photosContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
