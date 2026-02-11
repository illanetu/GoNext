import { getDatabase } from '../database/db';
import { Trip } from '../types';

type TripRow = {
  id: number;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  current: number;
  createdAt: string;
};

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current === 1,
    createdAt: row.createdAt,
  };
}

// Создание новой поездки
export const createTrip = async (
  trip: Omit<Trip, 'id' | 'createdAt'>
): Promise<number> => {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, current, createdAt)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      trip.title,
      trip.description || '',
      trip.startDate || null,
      trip.endDate || null,
      trip.current ? 1 : 0,
      createdAt,
    ]
  );

  return result.lastInsertRowId;
};

// Получение всех поездок
export const getAllTrips = async (): Promise<Trip[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<TripRow>(
    `SELECT * FROM trips ORDER BY createdAt DESC;`
  );

  return result.map(rowToTrip);
};

// Получение поездки по ID
export const getTripById = async (id: number): Promise<Trip | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<TripRow>(
    `SELECT * FROM trips WHERE id = ?;`,
    [id]
  );

  if (!result) {
    return null;
  }

  return rowToTrip(result);
};

// Обновление поездки
export const updateTrip = async (
  id: number,
  trip: Partial<Omit<Trip, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = await getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (trip.title !== undefined) {
    updates.push('title = ?');
    values.push(trip.title);
  }
  if (trip.description !== undefined) {
    updates.push('description = ?');
    values.push(trip.description);
  }
  if (trip.startDate !== undefined) {
    updates.push('startDate = ?');
    values.push(trip.startDate);
  }
  if (trip.endDate !== undefined) {
    updates.push('endDate = ?');
    values.push(trip.endDate);
  }
  if (trip.current !== undefined) {
    updates.push('current = ?');
    values.push(trip.current ? 1 : 0);
  }

  if (updates.length === 0) {
    return;
  }

  values.push(id);

  await db.runAsync(
    `UPDATE trips SET ${updates.join(', ')} WHERE id = ?;`,
    values
  );
};

// Удаление поездки
export const deleteTrip = async (id: number): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(`DELETE FROM trip_places WHERE tripId = ?;`, [id]);
  await db.runAsync(`DELETE FROM trips WHERE id = ?;`, [id]);
};

// Установка текущей поездки (сбрасывает current у остальных)
export const setCurrentTrip = async (tripId: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`UPDATE trips SET current = 0;`);
  await db.runAsync(`UPDATE trips SET current = 1 WHERE id = ?;`, [tripId]);
};

// Получение текущей поездки
export const getCurrentTrip = async (): Promise<Trip | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<TripRow>(
    `SELECT * FROM trips WHERE current = 1 LIMIT 1;`
  );

  if (!result) {
    return null;
  }

  return rowToTrip(result);
};

// Поездка с количеством мест (для списка)
export interface TripWithPlacesCount extends Trip {
  placesCount: number;
}

// Получение всех поездок с количеством мест
export const getAllTripsWithPlacesCount = async (): Promise<
  TripWithPlacesCount[]
> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<
    TripRow & { placesCount: number }
  >(
    `SELECT t.*, COUNT(tp.id) as placesCount
     FROM trips t
     LEFT JOIN trip_places tp ON t.id = tp.tripId
     GROUP BY t.id
     ORDER BY t.createdAt DESC;`
  );

  return result.map((row) => ({
    ...rowToTrip(row),
    placesCount: Number(row.placesCount ?? 0),
  }));
};
