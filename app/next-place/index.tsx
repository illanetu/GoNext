import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { getNextPlace } from '../../services/nextPlaceService';
import { markPlaceAsVisited } from '../../services/tripPlacesService';
import type { TripPlaceWithDetails } from '../../types';
import { openInMaps, openInNavigator } from '../../utils/maps';
import { PlaceMapView } from '../../components/PlaceMapView';
import { PhotoGallery } from '../../components/PhotoGallery';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function NextPlaceScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('common.coordinatesNotSet'));
      return;
    }
    openInMaps(item.place.latitude, item.place.longitude);
  };

  const handleOpenNavigator = () => {
    if (!item?.place?.latitude || !item?.place?.longitude) {
      Alert.alert(t('common.error'), t('common.coordinatesNotSet'));
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
      Alert.alert(t('common.error'), t('errors.markVisited'));
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

  if (item === null) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
          <View style={styles.emptyContainer}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.emptyTitle}>{t('nextPlace.title')}</Title>
                <Paragraph style={styles.emptyText}>
                  {t('nextPlace.empty')}
                </Paragraph>
                <Paragraph style={styles.hint}>
                  {t('nextPlace.hint')}
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  if (!item) return null;
  const { place, photos } = item;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
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
                    {t('places.visitLater')}
                  </Chip>
                )}
                {place.liked && (
                  <Chip icon="heart" style={styles.chip}>
                    {t('places.liked')}
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
                <Button
                  mode="contained-tonal"
                  onPress={handleMarkVisited}
                  icon="check-circle"
                  style={styles.button}
                >
                  {t('nextPlace.markVisited')}
                </Button>
              </View>
            </Card.Content>
          </Card>

          {photos.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.sectionTitle}>{t('places.photos')}</Title>
                <PhotoGallery
                  photos={photos}
                  allowDelete={false}
                  showAddButton={false}
                />
              </Card.Content>
            </Card>
          )}
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
