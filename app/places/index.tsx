import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Chip, 
  Searchbar,
  ActivityIndicator 
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getAllPlaces } from '../../services/placesService';
import type { Place } from '../../types';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function PlacesScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPlaces = async () => {
    try {
      const allPlaces = await getAllPlaces();
      setPlaces(allPlaces);
      setFilteredPlaces(allPlaces);
    } catch (error) {
      console.error('Ошибка загрузки мест:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Загрузка при открытии экрана и при возврате (например, после сохранения нового места)
  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  }, [searchQuery, places]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlaces();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              {searchQuery ? 'Места не найдены' : 'Нет сохраненных мест'}
            </Paragraph>
          </View>
        ) : (
          filteredPlaces.map((place) => (
            <Card
              key={place.id}
              style={styles.card}
              onPress={() => router.push(`/places/${place.id}` as any)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{place.name}</Title>
                  <View style={styles.chipsContainer}>
                    {place.visitlater && (
                      <Chip icon="clock-outline" style={styles.chip}>
                        Позже
                      </Chip>
                    )}
                    {place.liked && (
                      <Chip icon="heart" style={styles.chip}>
                        Понравилось
                      </Chip>
                    )}
                  </View>
                </View>
                {place.description && (
                  <Paragraph numberOfLines={2}>{place.description}</Paragraph>
                )}
                {place.latitude && place.longitude && (
                  <Paragraph style={styles.coordinates}>
                    📍 {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.fabContainer} pointerEvents="box-none">
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.navigate('/places/new')}
        />
      </View>
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
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    height: 28,
  },
  coordinates: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 16,
    zIndex: 10,
  },
  fab: {
  },
});
