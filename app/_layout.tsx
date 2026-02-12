import { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../database/db';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { getOnPrimary } from '../utils/themeColors';

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

export default function RootLayout() {
  useEffect(() => {
    // Инициализируем базу данных при запуске приложения
    initDatabase().catch((error) => {
      console.error('Ошибка инициализации базы данных:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperThemeWrapper>
          <StatusBarTheme />
          <Stack
          screenOptions={{
            headerBackVisible: true,
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen 
            name="places/index" 
            options={{ title: 'Места', headerShown: true }} 
          />
          <Stack.Screen 
            name="places/[id]" 
            options={{ title: 'Место', headerShown: true }} 
          />
          <Stack.Screen 
            name="places/new" 
            options={{ title: 'Новое место', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/index" 
            options={{ title: 'Поездки', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/new" 
            options={{ title: 'Новая поездка', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/[id]" 
            options={{ title: 'Поездка', headerShown: false }} 
          />
          <Stack.Screen 
            name="next-place/index" 
            options={{ title: 'Следующее место', headerShown: true }} 
          />
          <Stack.Screen 
            name="settings/index" 
            options={{ title: 'Настройки', headerShown: true }} 
          />
        </Stack>
        </PaperThemeWrapper>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
