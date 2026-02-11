/**
 * Сервис работы с местами в поездке (маршрут): добавление, порядок, посещения, заметки, фото.
 * @see docs/SERVICES.md
 */
import { getDatabase } from '../database/db';
import { TripPlace, Photo, TripPlaceWithDetails } from '../types';
import { getPlaceById, getPlacePhotos, getPlacesByIds } from './placesService';
import { deletePhotosForEntity, getPhotosForTripPlaceIds } from './photosService';

type TripPlaceRow = {
  id: number;
  tripId: number;
  placeId: number;
  order_index: number;
  visited: number;
  visitDate: string | null;
  notes: string;
};

function rowToTripPlace(row: TripPlaceRow): TripPlace {
  return {
    id: row.id,
    tripId: row.tripId,
    placeId: row.placeId,
    order: row.order_index,
    visited: row.visited === 1,
    visitDate: row.visitDate,
    notes: row.notes || '',
  };
}

// Добавление места в поездку
export const addPlaceToTrip = async (
  tripId: number,
  placeId: number,
  order?: number
): Promise<number> => {
  const db = await getDatabase();

  let nextOrder = order;
  if (nextOrder === undefined) {
    const maxResult = await db.getFirstAsync<{ maxOrder: number | null }>(
      `SELECT MAX(order_index) as maxOrder FROM trip_places WHERE tripId = ?;`,
      [tripId]
    );
    nextOrder = (maxResult?.maxOrder ?? -1) + 1;
  }

  const result = await db.runAsync(
    `INSERT INTO trip_places (tripId, placeId, order_index, visited, notes)
     VALUES (?, ?, ?, 0, '');`,
    [tripId, placeId, nextOrder]
  );

  return result.lastInsertRowId;
};

// Удаление места из поездки
export const removePlaceFromTrip = async (
  tripId: number,
  tripPlaceId: number
): Promise<void> => {
  await deletePhotosForEntity('trip_place', tripPlaceId);

  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM trip_places WHERE id = ? AND tripId = ?;`,
    [tripPlaceId, tripId]
  );
};

// Изменение порядка мест
export const updatePlaceOrder = async (
  tripId: number,
  tripPlaceId: number,
  newOrder: number
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE trip_places SET order_index = ? WHERE id = ? AND tripId = ?;`,
    [newOrder, tripPlaceId, tripId]
  );
};

// Отметка места как посещенного
export const markPlaceAsVisited = async (
  tripPlaceId: number,
  visited: boolean = true
): Promise<void> => {
  const db = await getDatabase();
  const visitDate = visited ? new Date().toISOString().split('T')[0] : null;
  await db.runAsync(
    `UPDATE trip_places SET visited = ?, visitDate = ? WHERE id = ?;`,
    [visited ? 1 : 0, visitDate, tripPlaceId]
  );
};

// Добавление заметок к месту в поездке
export const addNotesToTripPlace = async (
  tripPlaceId: number,
  notes: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE trip_places SET notes = ? WHERE id = ?;`,
    [notes, tripPlaceId]
  );
};

// Добавление и удаление фото — см. photosService (addPhotoToTripPlace, removePhotoFromTripPlace)

// Получение фотографий места в поездке
export const getTripPlacePhotos = async (
  tripPlaceId: number
): Promise<Photo[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<{
    id: number;
    entityType: string;
    entityId: number;
    filePath: string;
    createdAt: string;
  }>(
    `SELECT * FROM photos WHERE entityType = 'trip_place' AND entityId = ? ORDER BY createdAt DESC;`,
    [tripPlaceId]
  );

  return result.map((row) => ({
    id: row.id,
    entityType: row.entityType as 'place' | 'trip_place',
    entityId: row.entityId,
    filePath: row.filePath,
    createdAt: row.createdAt,
  }));
};

// Количество мест в поездке
export const getTripPlacesCount = async (tripId: number): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM trip_places WHERE tripId = ?;`,
    [tripId]
  );
  return result?.count ?? 0;
};

// Получение мест поездки (упорядоченных)
export const getTripPlaces = async (tripId: number): Promise<TripPlace[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<TripPlaceRow>(
    `SELECT * FROM trip_places WHERE tripId = ? ORDER BY order_index ASC;`,
    [tripId]
  );

  return result.map(rowToTripPlace);
};

// Получение мест поездки с деталями (место + фото), пакетные запросы вместо N+1
export const getTripPlacesWithDetails = async (
  tripId: number
): Promise<TripPlaceWithDetails[]> => {
  const tripPlaces = await getTripPlaces(tripId);
  if (tripPlaces.length === 0) {
    return [];
  }

  const placeIds = [...new Set(tripPlaces.map((tp) => tp.placeId))];
  const tripPlaceIds = tripPlaces.map((tp) => tp.id);
  const [placesMap, photosMap] = await Promise.all([
    getPlacesByIds(placeIds),
    getPhotosForTripPlaceIds(tripPlaceIds),
  ]);

  const result: TripPlaceWithDetails[] = [];
  for (const tp of tripPlaces) {
    const place = placesMap.get(tp.placeId);
    const photos = photosMap.get(tp.id) ?? [];
    if (place) {
      result.push({
        ...tp,
        place,
        photos,
      });
    }
  }
  return result;
};

// Получение одного места в поездке с деталями
export const getTripPlaceWithDetails = async (
  tripPlaceId: number
): Promise<TripPlaceWithDetails | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripPlaceRow>(
    `SELECT * FROM trip_places WHERE id = ?;`,
    [tripPlaceId]
  );

  if (!row) {
    return null;
  }

  const tripPlace = rowToTripPlace(row);
  const place = await getPlaceById(tripPlace.placeId);
  const [placePhotos, tripPlacePhotos] = await Promise.all([
    getPlacePhotos(tripPlace.placeId),
    getTripPlacePhotos(tripPlace.id),
  ]);
  const photos = [...placePhotos, ...tripPlacePhotos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!place) {
    return null;
  }

  return {
    ...tripPlace,
    place,
    photos,
  };
};

