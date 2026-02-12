import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { getPlaceWithPhotos, deletePlace } from '../../services/placesService';
import type { PlaceWithPhotos } from '../../types';
import { addPhotoToPlace, removePhotoFromPlace } from '../../services/photosService';
import { openInMaps, openInNavigator } from '../../utils/maps';
import { PlaceMapView } from '../../components/PlaceMapView';
import { PhotoGallery } from '../../components/PhotoGallery';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('errors.loadPlace'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlace();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      t('places.deletePlaceTitle'),
      t('places.deletePlaceMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlace(parseInt(id!));
              router.back();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.deletePlace'));
            }
          },
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (!place || !place.latitude || !place.longitude) {
      Alert.alert(t('common.error'), t('common.coordinatesNotSet'));
      return;
    }
    openInMaps(place.latitude, place.longitude);
  };

  const handleOpenNavigator = () => {
    if (!place || !place.latitude || !place.longitude) {
      Alert.alert(t('common.error'), t('common.coordinatesNotSet'));
      return;
    }
    openInNavigator(place.latitude, place.longitude);
  };

  const handleAddPhoto = async (uri: string) => {
    if (!id || id === 'new') return;
    try {
      await addPhotoToPlace(parseInt(id), uri);
      await loadPlace();
    } catch (error) {
      console.error('Ошибка добавления фото:', error);
      Alert.alert(t('common.error'), t('errors.addPhoto'));
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await removePhotoFromPlace(photoId);
      await loadPlace();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.deletePhoto'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
        <View style={styles.emptyContainer}>
          <Paragraph>{t('places.placeNotFound')}</Paragraph>
          <Button onPress={() => router.back()}>{t('common.back')}</Button>
        </View>
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
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
                  {t('places.visitLater')}
                </Chip>
              )}
              {place.liked && (
                <Chip icon="heart" style={styles.chip}>
                  {t('places.liked')}
                </Chip>
              )}
            </View>

            {place.description && (
              <Paragraph style={styles.description}>{place.description}</Paragraph>
            )}

            {place.latitude && place.longitude && (
              <>
                <View style={styles.coordinatesContainer}>
                  <Paragraph style={styles.coordinates}>
                    📍 {t('places.coordinatesLabel')}: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                  </Paragraph>
                </View>
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
              {place.latitude && place.longitude && (
                <>
                  <Button
                    mode="contained"
                    onPress={handleOpenMap}
                    icon="map"
                    style={styles.button}
                  >
                    {t('places.openOnMap')}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleOpenNavigator}
                    icon="navigation"
                    style={styles.button}
                  >
                    {t('places.openInNavigator')}
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.photosHeader}>
              <Title>{t('places.photos')}</Title>
            </View>
            {place.photos.length === 0 && (
              <Paragraph style={styles.emptyHint}>{t('places.noPhotos')}</Paragraph>
            )}
            <PhotoGallery
              photos={place.photos}
              onPhotoSelected={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onError={(msg) => Alert.alert(t('common.error'), msg)}
            />
          </Card.Content>
        </Card>
      </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyHint: {
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
  },
});
