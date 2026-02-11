import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  TextInput,
  Button,
  Switch,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createPlace } from '../../services/placesService';
import { addPlaceToTrip } from '../../services/tripPlacesService';
import * as Location from 'expo-location';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

export default function NewPlaceScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(false);
  const [liked, setLiked] = useState(false);
  const [coordinates, setCoordinates] = useState('');
  const [loading, setLoading] = useState(false);

  const parseCoordinates = (value: string): { lat: number | null; lng: number | null } => {
    const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return { lat: null, lng: null };
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return { lat: null, lng: null };
    return { lat, lng };
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нужно разрешение на доступ к геолокации');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      setCoordinates(
        `${location.coords.latitude}, ${location.coords.longitude}`
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить текущее местоположение');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Название места обязательно');
      return;
    }

    const { lat, lng } = parseCoordinates(coordinates);

    try {
      setLoading(true);
      const placeId = await createPlace({
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: lat,
        longitude: lng,
      });
      if (tripId) {
        await addPlaceToTrip(parseInt(tripId), placeId);
        router.replace(`/trips/${tripId}/details` as any);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Ошибка сохранения места:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить место');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Название места *"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Описание"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <View style={styles.switchContainer}>
              <Paragraph>Посетить позже</Paragraph>
              <Switch value={visitlater} onValueChange={setVisitlater} />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>Понравилось</Paragraph>
              <Switch value={liked} onValueChange={setLiked} />
            </View>

            <View style={styles.coordinatesSection}>
              <Paragraph style={styles.sectionTitle}>Координаты (необязательно)</Paragraph>
              
              <Button
                mode="outlined"
                onPress={handleGetCurrentLocation}
                icon="crosshairs-gps"
                style={styles.locationButton}
                loading={loading}
              >
                Использовать текущее местоположение
              </Button>

              <TextInput
                label="Широта, долгота"
                value={coordinates}
                onChangeText={setCoordinates}
                style={styles.input}
                mode="outlined"
                placeholder="42.855194, 131.419915"
              />
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                loading={loading}
                disabled={loading || !name.trim()}
              >
                Сохранить
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={loading}
              >
                Отмена
              </Button>
            </View>
          </Card.Content>
        </Card>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  card: {
    elevation: 2,
  },
  input: {
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 8,
  },
  coordinatesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationButton: {
    marginBottom: 15,
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    marginVertical: 4,
  },
  cancelButton: {
    marginVertical: 4,
  },
});
