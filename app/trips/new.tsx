import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  TextInput,
  Button,
  Switch,
  Paragraph,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createTrip, setCurrentTrip } from '../../services/tripsService';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

export default function NewTripScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Название поездки обязательно');
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
      Alert.alert('Ошибка', 'Не удалось сохранить поездку');
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
                label="Название поездки *"
                value={title}
                onChangeText={setTitle}
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

              <TextInput
                label="Дата начала (ГГГГ-ММ-ДД)"
                value={startDate}
                onChangeText={setStartDate}
                style={styles.input}
                mode="outlined"
                placeholder="2025-06-01"
              />

              <TextInput
                label="Дата окончания (ГГГГ-ММ-ДД)"
                value={endDate}
                onChangeText={setEndDate}
                style={styles.input}
                mode="outlined"
                placeholder="2025-06-15"
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
                  Создать
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
