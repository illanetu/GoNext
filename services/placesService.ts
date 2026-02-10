import { db } from '../database/db';
import { Place, Photo, PlaceWithPhotos } from '../types';

// Создание нового места
export const createPlace = (place: Omit<Place, 'id' | 'createdAt'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    
    db.transaction(
      (tx) => {
        tx.executeSql(
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
          ],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Получение всех мест
export const getAllPlaces = (): Promise<Place[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM places ORDER BY createdAt DESC;`,
          [],
          (_, { rows }) => {
            const places: Place[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              places.push({
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
            resolve(places);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Получение места по ID
export const getPlaceById = (id: number): Promise<Place | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM places WHERE id = ?;`,
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              resolve({
                id: row.id,
                name: row.name,
                description: row.description,
                visitlater: row.visitlater === 1,
                liked: row.liked === 1,
                latitude: row.latitude,
                longitude: row.longitude,
                createdAt: row.createdAt,
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Обновление места
export const updatePlace = (id: number, place: Partial<Omit<Place, 'id' | 'createdAt'>>): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      resolve();
      return;
    }

    values.push(id);

    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE places SET ${updates.join(', ')} WHERE id = ?;`,
          values,
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Удаление места
export const deletePlace = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Сначала удаляем фотографии
        tx.executeSql(
          `DELETE FROM photos WHERE entityType = 'place' AND entityId = ?;`,
          [id],
          () => {},
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Затем удаляем само место
        tx.executeSql(
          `DELETE FROM places WHERE id = ?;`,
          [id],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Получение фотографий места
export const getPlacePhotos = (placeId: number): Promise<Photo[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM photos WHERE entityType = 'place' AND entityId = ? ORDER BY createdAt DESC;`,
          [placeId],
          (_, { rows }) => {
            const photos: Photo[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              photos.push({
                id: row.id,
                entityType: row.entityType,
                entityId: row.entityId,
                filePath: row.filePath,
                createdAt: row.createdAt,
              });
            }
            resolve(photos);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Добавление фотографии к месту
export const addPhotoToPlace = (placeId: number, filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO photos (entityType, entityId, filePath, createdAt)
           VALUES ('place', ?, ?, ?);`,
          [placeId, filePath, createdAt],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Удаление фотографии
export const removePhotoFromPlace = (photoId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM photos WHERE id = ?;`,
          [photoId],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

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
