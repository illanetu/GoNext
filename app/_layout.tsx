import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../database/db';

export default function RootLayout() {
  useEffect(() => {
    // Инициализируем базу данных при запуске приложения
    initDatabase().catch((error) => {
      console.error('Ошибка инициализации базы данных:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
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
            name="trips/[id]/details" 
            options={{ title: 'Поездка', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/[id]/edit" 
            options={{ title: 'Редактирование поездки', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/[id]/add-place" 
            options={{ title: 'Добавить место', headerShown: true }} 
          />
          <Stack.Screen 
            name="trips/[id]/place/[tripPlaceId]" 
            options={{ title: 'Место в поездке', headerShown: true }} 
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
      </PaperProvider>
    </SafeAreaProvider>
  );
}
