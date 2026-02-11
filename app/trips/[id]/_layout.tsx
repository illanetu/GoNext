import { Stack } from 'expo-router';

export default function TripIdLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="details"
        options={{ title: 'Поездка', headerShown: true }}
      />
      <Stack.Screen name="edit" options={{ title: 'Редактирование поездки', headerShown: true }} />
      <Stack.Screen name="add-place" options={{ title: 'Добавить место', headerShown: true }} />
      <Stack.Screen
        name="place/[tripPlaceId]"
        options={{ title: 'Место в поездке', headerShown: true }}
      />
    </Stack>
  );
}
