import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

export default function TripsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Поездки</Title>
            <Paragraph style={styles.text}>
              Функционал поездок будет реализован в следующих этапах
            </Paragraph>
            <Button mode="contained" style={styles.button} disabled>
              Создать поездку
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    elevation: 2,
  },
  text: {
    marginVertical: 20,
  },
  button: {
    marginTop: 10,
  },
});
