import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TripIdLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="details"
        options={{ title: t('nav.trip'), headerShown: true }}
      />
      <Stack.Screen name="edit" options={{ title: t('nav.tripEdit'), headerShown: true }} />
      <Stack.Screen name="add-place" options={{ title: t('nav.addPlace'), headerShown: true }} />
      <Stack.Screen
        name="place/[tripPlaceId]"
        options={{ title: t('nav.placeInTrip'), headerShown: true }}
      />
    </Stack>
  );
}
