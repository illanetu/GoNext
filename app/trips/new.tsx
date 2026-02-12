import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  TextInput,
  Button,
  Switch,
  Paragraph,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createTrip, setCurrentTrip } from '../../services/tripsService';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function NewTripScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('errors.tripTitleRequired'));
      return;
    }

    try {
      setLoading(true);
      const id = await createTrip({
        title: title.trim(),
        description: description.trim() || '',
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        current,
      });

      if (current) {
        await setCurrentTrip(id);
      }

      router.replace(`/trips/${id}/details` as any);
    } catch (error) {
      console.error('Ошибка сохранения поездки:', error);
      Alert.alert(t('common.error'), t('errors.saveTrip'));
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
                label={t('trips.startDateLabel')}
                value={startDate}
                onChangeText={setStartDate}
                style={styles.input}
                mode="outlined"
                placeholder={t('trips.startDatePlaceholder')}
              />

              <TextInput
                label={t('trips.endDateLabel')}
                value={endDate}
                onChangeText={setEndDate}
                style={styles.input}
                mode="outlined"
                placeholder={t('trips.endDatePlaceholder')}
              />

              <View style={styles.switchContainer}>
                <Paragraph>{t('trips.currentTrip')}</Paragraph>
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
                  {t('common.create')}
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
