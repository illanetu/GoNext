import { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Paragraph } from 'react-native-paper';
import type { TripPlaceWithDetails } from '../types';

const DEFAULT_DELTA = 0.2;

interface TripMapViewProps {
  places: TripPlaceWithDetails[];
  height?: number;
}

function getRegionForPlaces(places: TripPlaceWithDetails[]) {
  const withCoords = places.filter(
    (p) => p.place.latitude != null && p.place.longitude != null
  );
  if (withCoords.length === 0) {
    return {
      latitude: 55.7558,
      longitude: 37.6173,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    };
  }
  if (withCoords.length === 1) {
    return {
      latitude: withCoords[0].place.latitude!,
      longitude: withCoords[0].place.longitude!,
      latitudeDelta: DEFAULT_DELTA * 0.5,
      longitudeDelta: DEFAULT_DELTA * 0.5,
    };
  }
  const lats = withCoords.map((p) => p.place.latitude!);
  const lngs = withCoords.map((p) => p.place.longitude!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padding = 0.01;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding, DEFAULT_DELTA * 0.5),
    longitudeDelta: Math.max(maxLng - minLng + padding, DEFAULT_DELTA * 0.5),
  };
}

export function TripMapView({ places, height = 220 }: TripMapViewProps) {
  const markers = useMemo(
    () =>
      places.filter(
        (p) => p.place.latitude != null && p.place.longitude != null
      ),
    [places]
  );
  const region = useMemo(() => getRegionForPlaces(places), [places]);

  if (markers.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Paragraph style={styles.placeholderText}>
          Нет мест с координатами для отображения на карте
        </Paragraph>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, { height }]}>
        <Paragraph style={styles.webText}>
          Карта маршрута доступна в приложении на iOS и Android.
        </Paragraph>
        <Paragraph style={styles.webSubtext}>
          Мест на карте: {markers.length}
        </Paragraph>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        scrollEnabled
        zoomEnabled
      >
        {markers.map((tp, index) => (
          <Marker
            key={tp.id}
            coordinate={{
              latitude: tp.place.latitude!,
              longitude: tp.place.longitude!,
            }}
            title={`${index + 1}. ${tp.place.name}`}
            description={tp.place.description || undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 16,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  webSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
