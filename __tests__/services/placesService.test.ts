import {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getPlacesByIds,
} from '../../services/placesService';
import { getDatabase } from '../../database/db';
import { deletePhotosForEntity } from '../../services/photosService';

jest.mock('../../database/db');
jest.mock('../../services/photosService');

const mockDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('placesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('createPlace', () => {
    it('вставляет место и возвращает id', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42 });

      const id = await createPlace({
        name: 'Кафе',
        description: 'Уютное',
        visitlater: true,
        liked: false,
        latitude: 55.75,
        longitude: 37.62,
      });

      expect(id).toBe(42);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO places'),
        expect.arrayContaining(['Кафе', 'Уютное', 1, 0, 55.75, 37.62])
      );
    });
  });

  describe('getAllPlaces', () => {
    it('возвращает список мест, преобразуя visitlater/liked в boolean', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: 1,
          name: 'А',
          description: '',
          visitlater: 1,
          liked: 0,
          latitude: null,
          longitude: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);

      const places = await getAllPlaces();
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe('А');
      expect(places[0].visitlater).toBe(true);
      expect(places[0].liked).toBe(false);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM places')
      );
    });
  });

  describe('getPlaceById', () => {
    it('возвращает null при отсутствии места', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      const place = await getPlaceById(999);
      expect(place).toBeNull();
    });

    it('возвращает место по id', async () => {
      mockDb.getFirstAsync.mockResolvedValue({
        id: 1,
        name: 'Б',
        description: 'описание',
        visitlater: 0,
        liked: 1,
        latitude: 10,
        longitude: 20,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      const place = await getPlaceById(1);
      expect(place).not.toBeNull();
      expect(place!.name).toBe('Б');
      expect(place!.liked).toBe(true);
    });
  });

  describe('updatePlace', () => {
    it('не выполняет запрос при пустом partial', async () => {
      await updatePlace(1, {});
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });

    it('обновляет переданные поля', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      await updatePlace(1, { name: 'Новое имя', liked: true });
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE places'),
        expect.arrayContaining(['Новое имя', 1, 1])
      );
    });
  });

  describe('deletePlace', () => {
    it('удаляет фото сущности и запись места', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      await deletePlace(5);
      expect(deletePhotosForEntity).toHaveBeenCalledWith('place', 5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM places'),
        [5]
      );
    });
  });

  describe('getPlacesByIds', () => {
    it('возвращает пустую Map при пустом массиве id', async () => {
      const map = await getPlacesByIds([]);
      expect(map.size).toBe(0);
      expect(mockDb.getAllAsync).not.toHaveBeenCalled();
    });

    it('возвращает Map по id', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: 1,
          name: 'П1',
          description: '',
          visitlater: 0,
          liked: 0,
          latitude: null,
          longitude: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      const map = await getPlacesByIds([1]);
      expect(map.size).toBe(1);
      expect(map.get(1)!.name).toBe('П1');
    });
  });
});
