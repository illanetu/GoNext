import { getCurrentTrip } from './tripsService';
import { getTripPlacesWithDetails } from './tripPlacesService';
import { TripPlaceWithDetails } from '../types';

/**
 * Получение следующего места в текущей поездке.
 * Логика: найти текущую поездку, вернуть первое место с visited = false (по порядку order).
 */
export const getNextPlace = async (): Promise<TripPlaceWithDetails | null> => {
  const currentTrip = await getCurrentTrip();
  if (!currentTrip) {
    return null;
  }

  const tripPlaces = await getTripPlacesWithDetails(currentTrip.id);
  const next = tripPlaces.find((tp) => !tp.visited) ?? null;
  return next;
};
