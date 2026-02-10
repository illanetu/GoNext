import { View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph } from 'react-native-paper';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Настройки</Title>
            <Paragraph style={styles.text}>
              Настройки приложения будут добавлены в будущих версиях
            </Paragraph>
            <Paragraph style={styles.version}>
              Версия: 1.0.0
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
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
  version: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
  },
});
