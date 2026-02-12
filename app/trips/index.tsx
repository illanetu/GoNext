import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { getAllTripsWithPlacesCount, TripWithPlacesCount } from '../../services/tripsService';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function TripsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trips, setTrips] = useState<TripWithPlacesCount[]>([]);

  function formatDateRange(start: string | null, end: string | null): string {
    if (!start && !end) return t('trips.datesNotSet');
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} — ${end}`;
  }
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
                {t('trips.empty')}
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
                    {t('trips.placesCount', { count: trip.placesCount })}
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
