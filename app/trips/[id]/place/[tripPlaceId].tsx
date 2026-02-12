import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getTripPlaceWithDetails,
  addNotesToTripPlace,
  markPlaceAsVisited,
} from '../../../../services/tripPlacesService';
import type { TripPlaceWithDetails } from '../../../../types';
import {
  addPhotoToTripPlace,
  removePhotoFromTripPlace,
  removePhotoFromPlace,
} from '../../../../services/photosService';
import { openInMaps, openInNavigator } from '../../../../utils/maps';
import { PlaceMapView } from '../../../../components/PlaceMapView';
import { PhotoGallery } from '../../../../components/PhotoGallery';
import { ScreenBackground } from '../../../../components/ScreenBackground';

export default function TripPlaceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id: tripIdParam, tripPlaceId } = useLocalSearchParams<{
    id: string;
    tripPlaceId: string;
  }>();
  const [item, setItem] = useState<TripPlaceWithDetails | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!tripPlaceId) return;
    try {
      const data = await getTripPlaceWithDetails(parseInt(tripPlaceId));
      setItem(data);
      if (data) setNotes(data.notes);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      Alert.alert(t('common.error'), t('errors.loadPlace'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripPlaceId]);

  const handleSaveNotes = async () => {
    if (!tripPlaceId || notesSaving) return;
    try {
      setNotesSaving(true);
      await addNotesToTripPlace(parseInt(tripPlaceId), notes);
      await loadData();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.saveNotes'));
    } finally {
      setNotesSaving(false);
    }
  };

  const handleToggleVisited = async () => {
    if (!item) return;
    try {
      await markPlaceAsVisited(item.id, !item.visited);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    }
  };

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

  const handleAddPhoto = async (uri: string) => {
    if (!tripPlaceId) return;
    try {
      await addPhotoToTripPlace(parseInt(tripPlaceId), uri);
      await loadData();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.addPhoto'));
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    const photo = item?.photos.find((p) => p.id === photoId);
    if (!photo) return;
    try {
      if (photo.entityType === 'place') {
        await removePhotoFromPlace(photoId);
      } else {
        await removePhotoFromTripPlace(photoId);
      }
      await loadData();
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

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
          <View style={styles.emptyContainer}>
            <Paragraph>{t('tripPlace.placeNotFound')}</Paragraph>
            <Button onPress={() => router.back()}>{t('common.back')}</Button>
          </View>
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  const { place } = item;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>{place.name}</Title>

              {item.visited && (
                <Chip icon="check-circle" style={styles.visitedChip}>
                  {t('trips.visited')}
                  {item.visitDate ? ` ${item.visitDate}` : ''}
                </Chip>
              )}

              <Button
                mode={item.visited ? 'outlined' : 'contained'}
                onPress={handleToggleVisited}
                icon={item.visited ? 'circle-outline' : 'check-circle'}
                style={styles.visitedButton}
              >
                {item.visited ? t('tripPlace.unmarkVisited') : t('tripPlace.markVisited')}
              </Button>

              {place.description ? (
                <Paragraph style={styles.description}>{place.description}</Paragraph>
              ) : null}

              {place.latitude != null && place.longitude != null && (
                <>
                  <View style={styles.mapContainer}>
                    <PlaceMapView
                      latitude={place.latitude}
                      longitude={place.longitude}
                      title={place.name}
                      height={200}
                    />
                  </View>
                  <View style={styles.buttonsRow}>
                    <Button mode="contained" onPress={handleOpenMap} icon="map" style={styles.btn}>
                      {t('places.openOnMap')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={handleOpenNavigator}
                      icon="navigation"
                      style={styles.btn}
                    >
                      {t('places.openInNavigator')}
                    </Button>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>{t('tripPlace.visitNotes')}</Title>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                placeholder={t('tripPlace.notesPlaceholder')}
              />
              <Button
                mode="contained-tonal"
                onPress={handleSaveNotes}
                loading={notesSaving}
                style={styles.saveNotesBtn}
              >
                {t('tripPlace.saveNotes')}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.photosHeader}>
                <Title>{t('places.photos')}</Title>
              </View>
              {item.photos.length === 0 && (
                <Paragraph style={styles.emptyText}>{t('places.noPhotos')}</Paragraph>
              )}
              <PhotoGallery
                photos={item.photos}
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
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  visitedChip: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  visitedButton: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 12,
  },
  mapContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
  },
  notesInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  saveNotesBtn: {
    marginTop: 4,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
  },
});
