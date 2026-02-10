// Типы для координат (Decimal Degrees)
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Сущность: Place (Место)
export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

// Сущность: Trip (Поездка)
export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  createdAt: string;
}

// Сущность: TripPlace (Место в поездке)
export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
}

// Сущность: Photo (Фотография)
export interface Photo {
  id: number;
  entityType: 'place' | 'trip_place';
  entityId: number;
  filePath: string;
  createdAt: string;
}

// Расширенный тип Place с фотографиями
export interface PlaceWithPhotos extends Place {
  photos: Photo[];
}

// Расширенный тип TripPlace с местом и фотографиями
export interface TripPlaceWithDetails extends TripPlace {
  place: Place;
  photos: Photo[];
}
