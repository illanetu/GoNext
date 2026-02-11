import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllPlaces } from '../../../services/placesService';
import type { Place } from '../../../types';
import { getTripPlaces, addPlaceToTrip } from '../../../services/tripPlacesService';

const bgImage = require('../../../assets/backgrounds/gonext-bg.png');

export default function AddPlaceToTripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [inTripPlaceIds, setInTripPlaceIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  const tripId = id ? parseInt(id) : 0;

  const availablePlaces = places.filter((p) => !inTripPlaceIds.includes(p.id));
  const filteredPlaces =
    searchQuery.trim() === ''
      ? availablePlaces
      : availablePlaces.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tripId) return;
      try {
        const [allPlaces, tripPlacesList] = await Promise.all([
          getAllPlaces(),
          getTripPlaces(tripId),
        ]);
        if (!cancelled) {
          setPlaces(allPlaces);
          setInTripPlaceIds(tripPlacesList.map((t) => t.placeId));
        }
      } catch (error) {
        console.error('Ошибка загрузки мест:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить список мест');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const handleAddPlace = async (placeId: number) => {
    if (!tripId) return;
    try {
      setAddingId(placeId);
      await addPlaceToTrip(tripId, placeId);
      setInTripPlaceIds((prev) => [...prev, placeId]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить место в поездку');
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateNewPlace = () => {
    router.push({
      pathname: '/places/new',
      params: { tripId: id },
    } as any);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Поиск мест..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Button
            mode="outlined"
            icon="plus"
            onPress={handleCreateNewPlace}
            style={styles.newPlaceButton}
          >
            Создать новое место
          </Button>

          {filteredPlaces.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'Места не найдены'
                  : 'Все ваши места уже добавлены в поездку или список мест пуст'}
              </Paragraph>
            </View>
          ) : (
            filteredPlaces.map((place) => (
              <Card key={place.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.cardRow}>
                    <View style={styles.cardText}>
                      <Title style={styles.placeName}>{place.name}</Title>
                      {place.description ? (
                        <Paragraph numberOfLines={2}>
                          {place.description}
                        </Paragraph>
                      ) : null}
                    </View>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleAddPlace(place.id)}
                      loading={addingId === place.id}
                      disabled={addingId !== null}
                    >
                      Добавить
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
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
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchbar: {
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  newPlaceButton: {
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 18,
    marginBottom: 4,
  },
});
