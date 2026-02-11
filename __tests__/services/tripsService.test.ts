import {
  createTrip,
  getCurrentTrip,
  getAllTrips,
  deleteTrip,
  setCurrentTrip,
} from '../../services/tripsService';
import { getDatabase } from '../../database/db';
import { deletePhotosForEntity } from '../../services/photosService';

jest.mock('../../database/db');
jest.mock('../../services/photosService');

const mockDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('tripsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('createTrip', () => {
    it('вставляет поездку и возвращает id', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 10 });
      const id = await createTrip({
        title: 'Отпуск',
        description: '',
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        current: false,
      });
      expect(id).toBe(10);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO trips'),
        expect.arrayContaining(['Отпуск', 0])
      );
    });
  });

  describe('getCurrentTrip', () => {
    it('возвращает null при отсутствии текущей поездки', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      const trip = await getCurrentTrip();
      expect(trip).toBeNull();
    });

    it('возвращает поездку с current=true', async () => {
      mockDb.getFirstAsync.mockResolvedValue({
        id: 1,
        title: 'Текущая',
        description: '',
        startDate: null,
        endDate: null,
        current: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      const trip = await getCurrentTrip();
      expect(trip).not.toBeNull();
      expect(trip!.current).toBe(true);
    });
  });

  describe('getAllTrips', () => {
    it('возвращает список поездок', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: 1,
          title: 'Поездка 1',
          description: '',
          startDate: null,
          endDate: null,
          current: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      const trips = await getAllTrips();
      expect(trips).toHaveLength(1);
      expect(trips[0].title).toBe('Поездка 1');
      expect(trips[0].current).toBe(true);
    });
  });

  describe('deleteTrip', () => {
    it('удаляет фото всех мест поездки, затем trip_places и поездку', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ id: 100 }, { id: 101 }]);
      mockDb.runAsync.mockResolvedValue(undefined);

      await deleteTrip(1);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM trip_places'),
        [1]
      );
      expect(deletePhotosForEntity).toHaveBeenCalledWith('trip_place', 100);
      expect(deletePhotosForEntity).toHaveBeenCalledWith('trip_place', 101);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM trip_places'),
        [1]
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM trips'),
        [1]
      );
    });
  });

  describe('setCurrentTrip', () => {
    it('сбрасывает current у всех и выставляет у указанной поездки', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      await setCurrentTrip(5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE trips SET current = 0')
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('current = 1 WHERE id = ?'),
        [5]
      );
    });
  });
});
