import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase } from '../database/db';
import type { Photo } from '../types';

const PHOTOS_DIR = 'gonext_photos';

/**
 * Сохраняет фотографию из временного URI (например, из ImagePicker) в постоянное хранилище приложения.
 * @param sourceUri URI исходного файла (file:// или content://)
 * @returns Путь к сохранённому файлу для хранения в БД
 */
export const savePhotoToFilesystem = async (sourceUri: string): Promise<string> => {
  const photosDir = FileSystem.documentDirectory + PHOTOS_DIR + '/';
  const dirInfo = await FileSystem.getInfoAsync(photosDir);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
  }

  // content:// URI на Android не содержат расширения — используем .jpg
  const ext = sourceUri.includes('.') ? (sourceUri.split('.').pop()?.toLowerCase() || 'jpg') : 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
  const destUri = photosDir + fileName;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });

  return destUri;
};

/**
 * Возвращает URI для отображения фотографии (для компонента Image).
 * @param filePath Путь из БД (file://...)
 * @returns URI, подходящий для Image source
 */
export const getPhotoUri = (filePath: string): string => {
  return filePath;
};

/**
 * Удаляет файл фотографии из файловой системы.
 * @param filePath Путь к файлу (из БД)
 */
export const deletePhotoFromFilesystem = async (filePath: string): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(filePath);
    if (info.exists) {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }
  } catch (error) {
    console.warn('Не удалось удалить файл фотографии:', filePath, error);
  }
};

/**
 * Добавляет фотографию к месту: сохраняет в ФС и создаёт запись в БД.
 * @param placeId ID места
 * @param sourceUri URI исходного файла (из ImagePicker)
 * @returns ID созданной записи фотографии
 */
export const addPhotoToPlace = async (
  placeId: number,
  sourceUri: string
): Promise<number> => {
  const filePath = await savePhotoToFilesystem(sourceUri);

  const db = await getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO photos (entityType, entityId, filePath, createdAt)
     VALUES ('place', ?, ?, ?);`,
    [placeId, filePath, createdAt]
  );

  return result.lastInsertRowId;
};

/**
 * Удаляет фотографию у места: удаляет файл и запись из БД.
 */
export const removePhotoFromPlace = async (photoId: number): Promise<void> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ filePath: string }>(
    `SELECT filePath FROM photos WHERE id = ? AND entityType = 'place';`,
    [photoId]
  );

  if (row) {
    await deletePhotoFromFilesystem(row.filePath);
  }

  await db.runAsync(`DELETE FROM photos WHERE id = ?;`, [photoId]);
};

/**
 * Добавляет фотографию к месту в поездке (trip_place).
 */
export const addPhotoToTripPlace = async (
  tripPlaceId: number,
  sourceUri: string
): Promise<number> => {
  const filePath = await savePhotoToFilesystem(sourceUri);

  const db = await getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO photos (entityType, entityId, filePath, createdAt)
     VALUES ('trip_place', ?, ?, ?);`,
    [tripPlaceId, filePath, createdAt]
  );

  return result.lastInsertRowId;
};

/**
 * Удаляет фотографию у места в поездке.
 */
export const removePhotoFromTripPlace = async (photoId: number): Promise<void> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ filePath: string }>(
    `SELECT filePath FROM photos WHERE id = ? AND entityType = 'trip_place';`,
    [photoId]
  );

  if (row) {
    await deletePhotoFromFilesystem(row.filePath);
  }

  await db.runAsync(`DELETE FROM photos WHERE id = ?;`, [photoId]);
};

/**
 * Возвращает фотографии для нескольких trip_place (по entityId).
 * Результат: Map<entityId, Photo[]> для оптимизации пакетной загрузки.
 */
export const getPhotosForTripPlaceIds = async (
  tripPlaceIds: number[]
): Promise<Map<number, Photo[]>> => {
  if (tripPlaceIds.length === 0) {
    return new Map();
  }
  const db = await getDatabase();
  const placeholders = tripPlaceIds.map(() => '?').join(',');
  const rows = await db.getAllAsync<{
    id: number;
    entityType: string;
    entityId: number;
    filePath: string;
    createdAt: string;
  }>(
    `SELECT * FROM photos WHERE entityType = 'trip_place' AND entityId IN (${placeholders}) ORDER BY createdAt DESC;`,
    tripPlaceIds
  );

  const map = new Map<number, Photo[]>();
  for (const row of rows) {
    const photo: Photo = {
      id: row.id,
      entityType: 'trip_place',
      entityId: row.entityId,
      filePath: row.filePath,
      createdAt: row.createdAt,
    };
    const list = map.get(row.entityId) ?? [];
    list.push(photo);
    map.set(row.entityId, list);
  }
  return map;
};

/**
 * Удаляет все фотографии сущности (места или trip_place) — файлы и записи в БД.
 * Вызывается при удалении места или места из поездки.
 */
export const deletePhotosForEntity = async (
  entityType: 'place' | 'trip_place',
  entityId: number
): Promise<void> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ filePath: string }>(
    `SELECT filePath FROM photos WHERE entityType = ? AND entityId = ?;`,
    [entityType, entityId]
  );

  for (const row of rows) {
    await deletePhotoFromFilesystem(row.filePath);
  }

  await db.runAsync(
    `DELETE FROM photos WHERE entityType = ? AND entityId = ?;`,
    [entityType, entityId]
  );
};
