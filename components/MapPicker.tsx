import { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { Paragraph, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { openInMaps } from '../utils/maps';

const DEFAULT_DELTA = 0.05;
const DEFAULT_LAT = 55.7558;
const DEFAULT_LNG = 37.6173;

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onCoordinateSelect: (lat: number, lng: number) => void;
  height?: number;
}

export function MapPicker({
  latitude,
  longitude,
  onCoordinateSelect,
  height = 250,
}: MapPickerProps) {
  const hasCoords = latitude != null && longitude != null;
  const initialRegion = {
    latitude: hasCoords ? latitude : DEFAULT_LAT,
    longitude: hasCoords ? longitude : DEFAULT_LNG,
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
  };

  const handlePress = useCallback(
    (e: MapPressEvent) => {
      const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
      onCoordinateSelect(lat, lng);
    },
    [onCoordinateSelect]
  );

  const handleUseCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    const { latitude: lat, longitude: lng } = location.coords;
    onCoordinateSelect(lat, lng);
  }, [onCoordinateSelect]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, { height }]}>
        <Paragraph style={styles.webText}>
          Выбор координат на карте доступен в приложении на iOS и Android.
        </Paragraph>
        {hasCoords && (
          <Button
            mode="outlined"
            icon="map"
            onPress={() => openInMaps(latitude!, longitude!)}
            style={styles.webButton}
          >
            Открыть на карте
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onPress={handlePress}
        scrollEnabled
        zoomEnabled
      >
        {hasCoords && (
          <Marker
            coordinate={{ latitude: latitude!, longitude: longitude! }}
            draggable
            onDragEnd={(e) => {
              const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
              onCoordinateSelect(lat, lng);
            }}
          />
        )}
      </MapView>
      <View style={styles.actions}>
        <Button
          mode="contained-tonal"
          icon="crosshairs-gps"
          onPress={handleUseCurrentLocation}
          compact
        >
          Моё местоположение
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actions: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  webFallback: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 16,
  },
  webText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  webButton: {
    marginTop: 8,
  },
});
