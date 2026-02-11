import { Linking, Platform, Alert } from 'react-native';

/**
 * Открывает точку на карте в нативном приложении:
 * - iOS: Apple Maps
 * - Android: Google Maps (или приложение по умолчанию для geo:)
 */
export function openInMaps(latitude: number, longitude: number): Promise<void> {
  let url: string;
  if (Platform.OS === 'ios') {
    url = `maps://?q=${latitude},${longitude}`;
  } else if (Platform.OS === 'android') {
    url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
  } else {
    url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  return Linking.openURL(url).catch((err) => {
    if (Platform.OS === 'ios') {
      const fallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      return Linking.openURL(fallback).catch((e) => {
        console.error('Ошибка открытия карты:', e);
        Alert.alert('Ошибка', 'Не удалось открыть карту');
      });
    }
    console.error('Ошибка открытия карты:', err);
    Alert.alert('Ошибка', 'Не удалось открыть карту');
  });
}

/**
 * Открывает маршрут до точки в навигаторе:
 * - iOS: Apple Maps (навигация)
 * - Android: Google Maps / приложение навигации
 */
export function openInNavigator(latitude: number, longitude: number): Promise<void> {
  let url: string;
  if (Platform.OS === 'ios') {
    url = `maps://?daddr=${latitude},${longitude}&dirflg=d`;
  } else if (Platform.OS === 'android') {
    url = `google.navigation:q=${latitude},${longitude}`;
  } else {
    url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  return Linking.openURL(url).catch(() => {
    const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    return Linking.openURL(fallback).catch((err) => {
      console.error('Ошибка открытия навигатора:', err);
      Alert.alert('Ошибка', 'Не удалось открыть навигатор');
    });
  });
}
