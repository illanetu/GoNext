/**
 * Типы сущностей и координат приложения GoNext.
 * Соответствуют таблицам БД и PROJECT.md.
 */

/** Координаты в формате Decimal Degrees (градусы с дробной частью). */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Место из списка «Места» (не привязано к поездке). Таблица places. */
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

/** Поездка — маршрут с датами и списком мест. Таблица trips. */
export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  createdAt: string;
}

/** Место в поездке: порядок, факт посещения, заметки. Таблица trip_places. */
export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
}

/** Связь фотографии с местом или с посещением (trip_place). Таблица photos. */
export interface Photo {
  id: number;
  entityType: 'place' | 'trip_place';
  entityId: number;
  filePath: string;
  createdAt: string;
}

/** Место с массивом привязанных фотографий (для экранов). */
export interface PlaceWithPhotos extends Place {
  photos: Photo[];
}

/** Место в поездке с подставленным Place и фотографиями (для маршрута и «следующего места»). */
export interface TripPlaceWithDetails extends TripPlace {
  place: Place;
  photos: Photo[];
}
