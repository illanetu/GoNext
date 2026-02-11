import { getNextPlace } from '../../services/nextPlaceService';
import { getCurrentTrip } from '../../services/tripsService';
import { getTripPlacesWithDetails } from '../../services/tripPlacesService';
import type { Trip, TripPlaceWithDetails } from '../../types';

jest.mock('../../database/db');
jest.mock('../../services/tripsService');
jest.mock('../../services/tripPlacesService');

const mockGetCurrentTrip = getCurrentTrip as jest.MockedFunction<typeof getCurrentTrip>;
const mockGetTripPlacesWithDetails = getTripPlacesWithDetails as jest.MockedFunction<
  typeof getTripPlacesWithDetails
>;

describe('nextPlaceService', () => {
  const mockTrip: Trip = {
    id: 1,
    title: 'Поездка',
    description: '',
    startDate: null,
    endDate: null,
    current: true,
    createdAt: new Date().toISOString(),
  };

  const createTripPlace = (
    id: number,
    visited: boolean,
    order: number
  ): TripPlaceWithDetails =>
    ({
      id,
      tripId: 1,
      placeId: id,
      order,
      visited,
      visitDate: visited ? '2025-01-01' : null,
      notes: '',
      place: {
        id,
        name: `Место ${id}`,
        description: '',
        visitlater: false,
        liked: false,
        latitude: null,
        longitude: null,
        createdAt: new Date().toISOString(),
      },
      photos: [],
    }) as TripPlaceWithDetails;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает null, если нет текущей поездки', async () => {
    mockGetCurrentTrip.mockResolvedValue(null);
    const result = await getNextPlace();
    expect(result).toBeNull();
    expect(mockGetTripPlacesWithDetails).not.toHaveBeenCalled();
  });

  it('возвращает первое непосещённое место по порядку', async () => {
    mockGetCurrentTrip.mockResolvedValue(mockTrip);
    const places: TripPlaceWithDetails[] = [
      createTripPlace(1, true, 0),
      createTripPlace(2, false, 1),
      createTripPlace(3, false, 2),
    ];
    mockGetTripPlacesWithDetails.mockResolvedValue(places);

    const result = await getNextPlace();
    expect(result).not.toBeNull();
    expect(result!.id).toBe(2);
    expect(result!.place.name).toBe('Место 2');
    expect(mockGetTripPlacesWithDetails).toHaveBeenCalledWith(1);
  });

  it('возвращает null, если все места посещены', async () => {
    mockGetCurrentTrip.mockResolvedValue(mockTrip);
    mockGetTripPlacesWithDetails.mockResolvedValue([
      createTripPlace(1, true, 0),
      createTripPlace(2, true, 1),
    ]);

    const result = await getNextPlace();
    expect(result).toBeNull();
  });

  it('возвращает первое место, если ни одно не посещено', async () => {
    mockGetCurrentTrip.mockResolvedValue(mockTrip);
    mockGetTripPlacesWithDetails.mockResolvedValue([
      createTripPlace(1, false, 0),
      createTripPlace(2, false, 1),
    ]);

    const result = await getNextPlace();
    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
  });
});
