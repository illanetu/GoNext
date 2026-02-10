import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Card, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Дневник туриста</Title>
          </Card.Content>
        </Card>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => router.push('/places' as any)}
            style={styles.button}
            icon="map-marker"
          >
            Места
          </Button>

          <Button
            mode="contained"
            onPress={() => router.push('/trips' as any)}
            style={styles.button}
            icon="map"
          >
            Поездки
          </Button>

          <Button
            mode="contained"
            onPress={() => router.push('/next-place' as any)}
            style={styles.button}
            icon="navigation"
          >
            Следующее место
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/settings' as any)}
            style={styles.button}
            icon="cog"
          >
            Настройки
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
});
