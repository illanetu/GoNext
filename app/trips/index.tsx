import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAllTripsWithPlacesCount, TripWithPlacesCount } from '../../services/tripsService';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Даты не указаны';
  if (start && !end) return `${start}`;
  if (!start && end) return `${end}`;
  return `${start} — ${end}`;
}

export default function TripsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripWithPlacesCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    try {
      const data = await getAllTripsWithPlacesCount();
      setTrips(data);
    } catch (error) {
      console.error('Ошибка загрузки поездок:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {trips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                Нет поездок. Создайте первую поездку.
              </Paragraph>
            </View>
          ) : (
            trips.map((trip) => (
              <Card
                key={trip.id}
                style={[styles.card, trip.current && styles.cardCurrent]}
                onPress={() => router.push(`/trips/${trip.id}/details` as any)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.cardTitle}>{trip.title}</Title>
                    {trip.current && (
                      <Chip icon="map-marker" style={styles.chipCurrent}>
                        Текущая
                      </Chip>
                    )}
                  </View>
                  {trip.description ? (
                    <Paragraph numberOfLines={2} style={styles.description}>
                      {trip.description}
                    </Paragraph>
                  ) : null}
                  <Paragraph style={styles.dates}>
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </Paragraph>
                  <Paragraph style={styles.placesCount}>
                    Мест в маршруте: {trip.placesCount}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/trips/new' as any)}
        />
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
  cardCurrent: {
    borderWidth: 2,
    borderColor: '#6200ee',
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
  chipCurrent: {
    height: 28,
  },
  description: {
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placesCount: {
    fontSize: 12,
    color: '#999',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
