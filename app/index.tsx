import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Card, Title, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '../components/ScreenBackground';

const navItems = [
  { href: '/places', label: 'Места', icon: 'map-marker' },
  { href: '/trips', label: 'Поездки', icon: 'map' },
  { href: '/next-place', label: 'Следующее место', icon: 'compass-outline' },
  { href: '/settings', label: 'Настройки', icon: 'cog-outline' },
] as const;

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
        <Appbar.Header style={styles.header} elevated>
          <Appbar.Content title="GoNext" titleStyle={styles.headerTitle} />
        </Appbar.Header>

        <View style={styles.content}>
          <Card style={styles.heroCard} mode="elevated">
            <Card.Content>
              <Title style={styles.appTitle}>GoNext</Title>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Дневник туриста
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.menuCard} mode="elevated">
            <Card.Content style={styles.menuContent}>
              {navItems.map((item, index) => (
                <Button
                  key={item.href}
                  mode="contained"
                  onPress={() => router.push(item.href)}
                  icon={item.icon}
                  style={[
                    styles.menuButton,
                    index < navItems.length - 1 && styles.menuButtonBorder,
                  ]}
                  contentStyle={styles.menuButtonContent}
                  labelStyle={styles.menuButtonLabel}
                >
                  {item.label}
                </Button>
              ))}
            </Card.Content>
          </Card>
        </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  heroCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  appTitle: {
    textAlign: 'center',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuContent: {
    paddingVertical: 8,
    gap: 0,
  },
  menuButton: {
    marginVertical: 6,
  },
  menuButtonBorder: {
    marginBottom: 0,
  },
  menuButtonContent: {
    justifyContent: 'flex-start',
  },
  menuButtonLabel: {
    fontSize: 16,
  },
});
