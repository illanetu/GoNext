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
      Alert.alert('Ошибка', 'Не удалось загрузить место');
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
      Alert.alert('Ошибка', 'Не удалось сохранить заметки');
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

  const handleAddPhoto = async (uri: string) => {
    if (!tripPlaceId) return;
    try {
      await addPhotoToTripPlace(parseInt(tripPlaceId), uri);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить фотографию');
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
      Alert.alert('Ошибка', 'Не удалось удалить фотографию');
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
            <Paragraph>Место не найдено</Paragraph>
            <Button onPress={() => router.back()}>Назад</Button>
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
                  Посещено
                  {item.visitDate ? ` ${item.visitDate}` : ''}
                </Chip>
              )}

              <Button
                mode={item.visited ? 'outlined' : 'contained'}
                onPress={handleToggleVisited}
                icon={item.visited ? 'circle-outline' : 'check-circle'}
                style={styles.visitedButton}
              >
                {item.visited ? 'Снять отметку о посещении' : 'Отметить как посещенное'}
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
                      На карте
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={handleOpenNavigator}
                      icon="navigation"
                      style={styles.btn}
                    >
                      Навигатор
                    </Button>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Заметки о посещении</Title>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                placeholder="Заметки о поездке..."
              />
              <Button
                mode="contained-tonal"
                onPress={handleSaveNotes}
                loading={notesSaving}
                style={styles.saveNotesBtn}
              >
                Сохранить заметки
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.photosHeader}>
                <Title>Фотографии</Title>
              </View>
              {item.photos.length === 0 && (
                <Paragraph style={styles.emptyText}>Нет фотографий</Paragraph>
              )}
              <PhotoGallery
                photos={item.photos}
                onPhotoSelected={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
                onError={(msg) => Alert.alert('Ошибка', msg)}
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
