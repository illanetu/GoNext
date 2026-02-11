/**
 * Модуль инициализации локальной SQLite-базы данных GoNext.
 * Все данные приложения хранятся в одной БД (places, trips, trip_places, photos).
 * Подробная структура таблиц — в docs/DATABASE.md
 */
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'gonext.db';

let db: SQLite.SQLiteDatabase | null = null;

/** Получение экземпляра базы данных (singleton). */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

/** Инициализация БД: создание таблиц и индексов при первом запуске. */
export const initDatabase = async (): Promise<void> => {
  try {
    const database = await getDatabase();
    
    // Таблица places
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        visitlater INTEGER DEFAULT 0,
        liked INTEGER DEFAULT 0,
        latitude REAL,
        longitude REAL,
        createdAt TEXT NOT NULL
      );
    `);

    // Таблица trips
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        startDate TEXT,
        endDate TEXT,
        current INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `);

    // Таблица trip_places
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS trip_places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tripId INTEGER NOT NULL,
        placeId INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        visited INTEGER DEFAULT 0,
        visitDate TEXT,
        notes TEXT,
        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE
      );
    `);

    // Таблица photos
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId INTEGER NOT NULL,
        filePath TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    // Индексы для оптимизации
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
    `);
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
    `);
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_photos_entity ON photos(entityType, entityId);
    `);
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);
    `);

    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
};
