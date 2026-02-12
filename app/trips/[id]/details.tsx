import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTripById, setCurrentTrip, deleteTrip } from '../../../services/tripsService';
import {
  getTripPlacesWithDetails,
  removePlaceFromTrip,
  updatePlaceOrder,
  markPlaceAsVisited,
} from '../../../services/tripPlacesService';
import type { TripPlaceWithDetails } from '../../../types';
import type { Trip } from '../../../types';
import { TripMapView } from '../../../components/TripMapView';
import { ScreenBackground } from '../../../components/ScreenBackground';

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Даты не указаны';
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} — ${end}`;
}

export default function TripDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<TripPlaceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id || id === 'new') return;

    try {
      const [tripData, placesData] = await Promise.all([
        getTripById(parseInt(id)),
        getTripPlacesWithDetails(parseInt(id)),
      ]);
      setTrip(tripData || null);
      setPlaces(placesData);
    } catch (error) {
      console.error('Ошибка загрузки поездки:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить поездку');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSetCurrent = async () => {
    if (!trip) return;
    try {
      await setCurrentTrip(trip.id);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось установить текущую поездку');
    }
  };

  const handleDelete = () => {
    if (!trip) return;
    Alert.alert(
      'Удаление поездки',
      'Удалить эту поездку? Места в маршруте не удалятся.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(trip.id);
              router.replace('/trips' as any);
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить поездку');
            }
          },
        },
      ]
    );
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const item = places[index];
    const prev = places[index - 1];
    try {
      await updatePlaceOrder(parseInt(id!), item.id, index - 1);
      await updatePlaceOrder(parseInt(id!), prev.id, index);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить порядок');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= places.length - 1) return;
    const item = places[index];
    const next = places[index + 1];
    try {
      await updatePlaceOrder(parseInt(id!), item.id, index + 1);
      await updatePlaceOrder(parseInt(id!), next.id, index);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить порядок');
    }
  };

  const handleToggleVisited = async (tp: TripPlaceWithDetails) => {
    try {
      await markPlaceAsVisited(tp.id, !tp.visited);
      await loadData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    }
  };

  const handleRemovePlace = (tp: TripPlaceWithDetails) => {
    Alert.alert(
      'Удалить из маршрута',
      `Убрать "${tp.place.name}" из поездки?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Убрать',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePlaceFromTrip(parseInt(id!), tp.id);
              await loadData();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось убрать место');
            }
          },
        },
      ]
    );
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

  if (!trip || !id) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
          <View style={styles.emptyContainer}>
            <Paragraph>Поездка не найдена</Paragraph>
            <Button onPress={() => router.back()}>Назад</Button>
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
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Title style={styles.title}>{trip.title}</Title>
                <View style={styles.headerButtons}>
                  <IconButton
                    icon="pencil"
                    size={24}
                    onPress={() => router.push(`/trips/${id}/edit` as any)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor="#d32f2f"
                    size={24}
                    onPress={handleDelete}
                  />
                </View>
              </View>

              {!trip.current && (
                <Button
                  mode="outlined"
                  onPress={handleSetCurrent}
                  icon="map-marker"
                  style={styles.currentButton}
                >
                  Сделать текущей поездкой
                </Button>
              )}
              {trip.current && (
                <Chip icon="map-marker" style={styles.chipCurrent}>
                  Текущая поездка
                </Chip>
              )}

              {trip.description ? (
                <Paragraph style={styles.description}>{trip.description}</Paragraph>
              ) : null}
              <Paragraph style={styles.dates}>
                {formatDateRange(trip.startDate, trip.endDate)}
              </Paragraph>
            </Card.Content>
          </Card>

          {places.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.mapTitle}>Карта маршрута</Title>
                <TripMapView places={places} height={220} />
              </Card.Content>
            </Card>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title>Маршрут</Title>
                <Button
                  mode="contained-tonal"
                  icon="plus"
                  onPress={() => router.push(`/trips/${id}/add-place` as any)}
                >
                  Добавить место
                </Button>
              </View>

              {places.length === 0 ? (
                <Paragraph style={styles.emptyText}>
                  В маршруте пока нет мест. Добавьте места из списка или создайте новое.
                </Paragraph>
              ) : (
                places.map((tp, index) => (
                  <Card key={tp.id} style={styles.placeCard}>
                    <Card.Content>
                      <View style={styles.placeRow}>
                        <View style={styles.orderButtons}>
                          <IconButton
                            icon="chevron-up"
                            size={20}
                            disabled={index === 0}
                            onPress={() => handleMoveUp(index)}
                          />
                          <IconButton
                            icon="chevron-down"
                            size={20}
                            disabled={index === places.length - 1}
                            onPress={() => handleMoveDown(index)}
                          />
                        </View>
                        <View style={styles.placeInfo}>
                          <Paragraph style={styles.placeOrder}>
                            {index + 1}.
                          </Paragraph>
                          <View style={styles.placeTitleRow}>
                            <Paragraph
                              style={styles.placeName}
                              onPress={() =>
                                router.push(
                                  `/trips/${id}/place/${tp.id}` as any
                                )
                              }
                            >
                              {tp.place.name}
                            </Paragraph>
                            {tp.visited && (
                              <Chip compact style={styles.visitedChip}>
                                Посещено
                              </Chip>
                            )}
                          </View>
                          {tp.notes ? (
                            <Paragraph numberOfLines={2} style={styles.notes}>
                              {tp.notes}
                            </Paragraph>
                          ) : null}
                        </View>
                        <View style={styles.placeActions}>
                          <IconButton
                            icon={tp.visited ? 'check-circle' : 'circle-outline'}
                            iconColor={tp.visited ? '#4caf50' : undefined}
                            size={22}
                            onPress={() => handleToggleVisited(tp)}
                          />
                          <IconButton
                            icon="close"
                            size={20}
                            onPress={() => handleRemovePlace(tp)}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <FAB
          icon="pencil"
          style={styles.fab}
          onPress={() => router.push(`/trips/${id}/edit` as any)}
          label="Редактировать"
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
    paddingBottom: 100,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  currentButton: {
    marginBottom: 10,
  },
  chipCurrent: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  description: {
    marginBottom: 8,
  },
  dates: {
    fontSize: 14,
    color: '#666',
  },
  mapTitle: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  placeCard: {
    marginBottom: 8,
    elevation: 1,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orderButtons: {
    marginRight: 4,
  },
  placeInfo: {
    flex: 1,
  },
  placeOrder: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  placeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitedChip: {
    height: 24,
  },
  notes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  placeActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
