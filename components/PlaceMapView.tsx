import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Paragraph, Button } from 'react-native-paper';
import { openInMaps } from '../utils/maps';

const DEFAULT_REGION_DELTA = 0.01;

interface PlaceMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
}

export function PlaceMapView({
  latitude,
  longitude,
  title,
  height = 200,
}: PlaceMapViewProps) {
  const region = {
    latitude,
    longitude,
    latitudeDelta: DEFAULT_REGION_DELTA,
    longitudeDelta: DEFAULT_REGION_DELTA,
  };

  if (Platform.OS === 'web') {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    return (
      <View style={[styles.webFallback, { height }]}>
        <Paragraph style={styles.webText}>
          Карта доступна в приложении на iOS и Android.
        </Paragraph>
        <Button mode="outlined" icon="map" onPress={() => openInMaps(latitude, longitude)}>
          Открыть на карте
        </Button>
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
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
        />
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
});
