import { useState, useEffect } from 'react';
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
import { getTripById, updateTrip, setCurrentTrip } from '../../../services/tripsService';
import { ScreenBackground } from '../../../components/ScreenBackground';

export default function EditTripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'new') {
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    getTripById(parseInt(id))
      .then((trip) => {
        if (!cancelled && trip) {
          setTitle(trip.title);
          setDescription(trip.description || '');
          setStartDate(trip.startDate || '');
          setEndDate(trip.endDate || '');
          setCurrent(trip.current);
        }
      })
      .catch((err) => console.error('Ошибка загрузки поездки:', err))
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    if (!id || id === 'new') return;
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('errors.tripTitleRequired'));
      return;
    }

    try {
      setLoading(true);
      const tripId = parseInt(id);
      await updateTrip(tripId, {
        title: title.trim(),
        description: description.trim() || '',
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        current,
      });

      if (current) {
        await setCurrentTrip(tripId);
      }

      router.back();
    } catch (error) {
      console.error('Ошибка сохранения поездки:', error);
      Alert.alert(t('common.error'), t('errors.saveTrip'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  if (!id || id === 'new') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenBackground>
          <View style={styles.emptyContainer}>
            <Paragraph>{t('trips.tripNotFound')}</Paragraph>
            <Button onPress={() => router.back()}>{t('common.back')}</Button>
          </View>
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label={t('trips.titleLabel')}
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label={t('trips.descriptionLabel')}
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
              />

              <TextInput
                label="Дата начала (ГГГГ-ММ-ДД)"
                value={startDate}
                onChangeText={setStartDate}
                style={styles.input}
                mode="outlined"
                placeholder={t('trips.startDatePlaceholder')}
              />

              <TextInput
                label="Дата окончания (ГГГГ-ММ-ДД)"
                value={endDate}
                onChangeText={setEndDate}
                style={styles.input}
                mode="outlined"
                placeholder={t('trips.endDatePlaceholder')}
              />

              <View style={styles.switchContainer}>
                <Paragraph>Текущая поездка</Paragraph>
                <Switch value={current} onValueChange={setCurrent} />
              </View>

              <View style={styles.buttonsContainer}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  loading={loading}
                  disabled={loading || !title.trim()}
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
