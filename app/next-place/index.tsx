import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

export default function NextPlaceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Следующее место</Title>
            <Paragraph style={styles.text}>
              Функционал следующего места будет реализован после добавления поездок
            </Paragraph>
            <Paragraph style={styles.hint}>
              Сначала создайте поездку и добавьте в неё места
            </Paragraph>
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
  hint: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666',
  },
});
