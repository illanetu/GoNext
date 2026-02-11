/**
 * Сервис работы с местами (режим «Места»).
 * CRUD, получение места с фотографиями. Фото добавляются через photosService.
 * @see docs/SERVICES.md
 */
import { getDatabase } from '../database/db';
import { Place, Photo, PlaceWithPhotos } from '../types';
import { deletePhotosForEntity } from './photosService';

/** Создание нового места. Возвращает id созданной записи. */
export const createPlace = async (place: Omit<Place, 'id' | 'createdAt'>): Promise<number> => {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();
  
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      place.name,
      place.description || '',
      place.visitlater ? 1 : 0,
      place.liked ? 1 : 0,
      place.latitude || null,
      place.longitude || null,
      createdAt,
    ]
  );
  
  return result.lastInsertRowId;
};

// Получение всех мест
export const getAllPlaces = async (): Promise<Place[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<{
    id: number;
    name: string;
    description: string;
    visitlater: number;
    liked: number;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
  }>(`SELECT * FROM places ORDER BY createdAt DESC;`);
  
  return result.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    visitlater: row.visitlater === 1,
    liked: row.liked === 1,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.createdAt,
  }));
};

// Получение нескольких мест по ID (для оптимизации запросов)
export const getPlacesByIds = async (ids: number[]): Promise<Map<number, Place>> => {
  if (ids.length === 0) {
    return new Map();
  }
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const result = await db.getAllAsync<{
    id: number;
    name: string;
    description: string;
    visitlater: number;
    liked: number;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
  }>(`SELECT * FROM places WHERE id IN (${placeholders});`, ids);

  const map = new Map<number, Place>();
  for (const row of result) {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      description: row.description,
      visitlater: row.visitlater === 1,
      liked: row.liked === 1,
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.createdAt,
    });
  }
  return map;
};

// Получение места по ID
export const getPlaceById = async (id: number): Promise<Place | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{
    id: number;
    name: string;
    description: string;
    visitlater: number;
    liked: number;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
  }>(`SELECT * FROM places WHERE id = ?;`, [id]);
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    name: result.name,
    description: result.description,
    visitlater: result.visitlater === 1,
    liked: result.liked === 1,
    latitude: result.latitude,
    longitude: result.longitude,
    createdAt: result.createdAt,
  };
};

// Обновление места
export const updatePlace = async (id: number, place: Partial<Omit<Place, 'id' | 'createdAt'>>): Promise<void> => {
  const db = await getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (place.name !== undefined) {
    updates.push('name = ?');
    values.push(place.name);
  }
  if (place.description !== undefined) {
    updates.push('description = ?');
    values.push(place.description);
  }
  if (place.visitlater !== undefined) {
    updates.push('visitlater = ?');
    values.push(place.visitlater ? 1 : 0);
  }
  if (place.liked !== undefined) {
    updates.push('liked = ?');
    values.push(place.liked ? 1 : 0);
  }
  if (place.latitude !== undefined) {
    updates.push('latitude = ?');
    values.push(place.latitude);
  }
  if (place.longitude !== undefined) {
    updates.push('longitude = ?');
    values.push(place.longitude);
  }

  if (updates.length === 0) {
    return;
  }

  values.push(id);

  await db.runAsync(
    `UPDATE places SET ${updates.join(', ')} WHERE id = ?;`,
    values
  );
};

// Удаление места
export const deletePlace = async (id: number): Promise<void> => {
  await deletePhotosForEntity('place', id);

  const db = await getDatabase();
  await db.runAsync(`DELETE FROM places WHERE id = ?;`, [id]);
};

// Получение фотографий места
export const getPlacePhotos = async (placeId: number): Promise<Photo[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<{
    id: number;
    entityType: string;
    entityId: number;
    filePath: string;
    createdAt: string;
  }>(`SELECT * FROM photos WHERE entityType = 'place' AND entityId = ? ORDER BY createdAt DESC;`, [placeId]);
  
  return result.map((row) => ({
    id: row.id,
    entityType: row.entityType as 'place' | 'trip_place',
    entityId: row.entityId,
    filePath: row.filePath,
    createdAt: row.createdAt,
  }));
};

// Добавление и удаление фотографий — см. photosService (addPhotoToPlace, removePhotoFromPlace)

// Получение места с фотографиями
export const getPlaceWithPhotos = async (id: number): Promise<PlaceWithPhotos | null> => {
  const place = await getPlaceById(id);
  if (!place) {
    return null;
  }
  
  const photos = await getPlacePhotos(id);
  
  return {
    ...place,
    photos,
  };
};
