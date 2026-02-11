import { View, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, List } from 'react-native-paper';

const bgImage = require('../../assets/backgrounds/gonext-bg.png');

const APP_VERSION = '1.0.0';
const APP_NAME = 'GoNext';
const APP_DESCRIPTION =
  'Дневник туриста — планируйте поездки, сохраняйте места и ведите дневник путешествий. Все данные хранятся только на вашем устройстве.';

export default function SettingsScreen() {
  const handleExportData = () => {
    Alert.alert(
      'Экспорт данных',
      'Функция экспорта данных будет доступна в следующей версии. Вы сможете сохранить копию своих мест, поездок и фотографий.',
      [{ text: 'Понятно' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* О приложении */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title style={styles.sectionTitle}>О приложении</Title>
              <Paragraph style={styles.appName}>{APP_NAME}</Paragraph>
              <Paragraph style={styles.description}>{APP_DESCRIPTION}</Paragraph>
              <Paragraph style={styles.version}>Версия {APP_VERSION}</Paragraph>
            </Card.Content>
          </Card>

          {/* Данные */}
          <Card style={styles.card} mode="elevated">
            <List.Section>
              <List.Subheader style={styles.listSubheader}>Данные</List.Subheader>
              <List.Item
                title="Экспорт данных"
                description="Сохранение копии мест, поездок и фотографий (в разработке)"
                left={(props) => <List.Icon {...props} icon="export" />}
                onPress={handleExportData}
                style={styles.listItem}
              />
            </List.Section>
          </Card>

          {/* Базовые настройки — заглушка для будущего */}
          <Card style={styles.card} mode="elevated">
            <List.Section>
              <List.Subheader style={styles.listSubheader}>Настройки</List.Subheader>
              <List.Item
                title="Дополнительные настройки"
                description="Будут добавлены в следующих версиях"
                left={(props) => <List.Icon {...props} icon="cog-outline" />}
                disabled
                style={styles.listItem}
              />
            </List.Section>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 22,
    color: '#555',
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  listSubheader: {
    paddingHorizontal: 0,
  },
  listItem: {
    paddingRight: 8,
  },
});
