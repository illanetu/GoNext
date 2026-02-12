import '../i18n';
import { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { initDatabase } from '../database/db';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { getOnPrimary } from '../utils/themeColors';
import { I18nReadyGate } from '../components/I18nReadyGate';

function StatusBarTheme() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'auto'} />;
}

function PaperThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDark, primaryColor } = useTheme();
  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    const onPrimary = getOnPrimary(primaryColor);
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: primaryColor,
        onPrimary,
      },
    };
  }, [isDark, primaryColor]);

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

function StackScreens() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="places/index"
        options={{ title: t('nav.places'), headerShown: true }}
      />
      <Stack.Screen
        name="places/[id]"
        options={{ title: t('nav.place'), headerShown: true }}
      />
      <Stack.Screen
        name="places/new"
        options={{ title: t('nav.newPlace'), headerShown: true }}
      />
      <Stack.Screen
        name="trips/index"
        options={{ title: t('nav.trips'), headerShown: true }}
      />
      <Stack.Screen
        name="trips/new"
        options={{ title: t('nav.newTrip'), headerShown: true }}
      />
      <Stack.Screen
        name="trips/[id]"
        options={{ title: t('nav.trip'), headerShown: false }}
      />
      <Stack.Screen
        name="next-place/index"
        options={{ title: t('nav.nextPlace'), headerShown: true }}
      />
      <Stack.Screen
        name="settings/index"
        options={{ title: t('nav.settings'), headerShown: true }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Ошибка инициализации базы данных:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <I18nReadyGate>
        <ThemeProvider>
          <PaperThemeWrapper>
            <StatusBarTheme />
            <StackScreens />
          </PaperThemeWrapper>
        </ThemeProvider>
      </I18nReadyGate>
    </SafeAreaProvider>
  );
}
