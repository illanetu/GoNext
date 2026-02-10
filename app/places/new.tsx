import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  TextInput,
  Button,
  Switch,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createPlace, updatePlace } from '../../services/placesService';
import * as Location from 'expo-location';

export default function NewPlaceScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(false);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нужно разрешение на доступ к геолокации');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
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

    try {
      setLoading(true);
      await createPlace({
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });
      router.back();
    } catch (error) {
      console.error('Ошибка сохранения места:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить место');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                label="Широта"
                value={latitude}
                onChangeText={setLatitude}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                placeholder="например: 55.7558"
              />

              <TextInput
                label="Долгота"
                value={longitude}
                onChangeText={setLongitude}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                placeholder="например: 37.6173"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
