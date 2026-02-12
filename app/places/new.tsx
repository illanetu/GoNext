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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createPlace } from '../../services/placesService';
import { addPlaceToTrip } from '../../services/tripPlacesService';
import { MapPicker } from '../../components/MapPicker';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function NewPlaceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(false);
  const [liked, setLiked] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCoordinateSelect = (latitude: number, longitude: number) => {
    setLat(latitude);
    setLng(longitude);
    setCoordinates(`${latitude}, ${longitude}`);
  };

  const parseCoordinates = (value: string): { lat: number | null; lng: number | null } => {
    const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return { lat: null, lng: null };
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return { lat: null, lng: null };
    return { lat, lng };
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('errors.placeNameRequired'));
      return;
    }

    const coords = lat != null && lng != null ? { lat, lng } : parseCoordinates(coordinates);

    try {
      setLoading(true);
      const placeId = await createPlace({
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (tripId) {
        await addPlaceToTrip(parseInt(tripId), placeId);
        router.replace(`/trips/${tripId}/details` as any);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Ошибка сохранения места:', error);
      Alert.alert(t('common.error'), t('errors.savePlace'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label={t('places.nameLabel')}
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label={t('places.descriptionLabel')}
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <View style={styles.switchContainer}>
              <Paragraph>{t('places.visitLater')}</Paragraph>
              <Switch value={visitlater} onValueChange={setVisitlater} />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>{t('places.liked')}</Paragraph>
              <Switch value={liked} onValueChange={setLiked} />
            </View>

            <View style={styles.coordinatesSection}>
              <Paragraph style={styles.sectionTitle}>{t('places.coordinatesSection')}</Paragraph>

              <View style={styles.mapPickerWrap}>
                <MapPicker
                  latitude={lat}
                  longitude={lng}
                  onCoordinateSelect={handleCoordinateSelect}
                  height={220}
                />
              </View>

              <TextInput
                label={t('places.coordinatesPlaceholder')}
                value={coordinates}
                onChangeText={(v) => {
                  setCoordinates(v);
                  const p = parseCoordinates(v);
                  setLat(p.lat);
                  setLng(p.lng);
                }}
                style={styles.input}
                mode="outlined"
                placeholder={t('places.coordinatesExample')}
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
                {t('common.save')}
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
            </View>
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
  mapPickerWrap: {
    marginBottom: 12,
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
