# API сервисов GoNext

Сервисы находятся в папке `services/`. Все функции асинхронные, работают с локальной SQLite и файловой системой.

---

## placesService.ts

| Функция | Описание |
|---------|----------|
| `createPlace(place)` | Создаёт место. Принимает объект без `id` и `createdAt`. Возвращает `id` нового места. |
| `getAllPlaces()` | Возвращает все места, отсортированные по дате создания (новые первые). |
| `getPlacesByIds(ids)` | Возвращает `Map<id, Place>` для переданных id (пакетная загрузка). |
| `getPlaceById(id)` | Возвращает место по id или `null`. |
| `updatePlace(id, place)` | Обновляет поля места (частичное обновление по переданным полям). |
| `deletePlace(id)` | Удаляет место, все его фото (файлы и записи в БД). |
| `getPlacePhotos(placeId)` | Возвращает массив фотографий места. |
| `getPlaceWithPhotos(id)` | Возвращает место с массивом `photos` или `null`. |

Добавление/удаление фото у места: см. **photosService** — `addPhotoToPlace`, `removePhotoFromPlace`.

---

## tripsService.ts

| Функция | Описание |
|---------|----------|
| `createTrip(trip)` | Создаёт поездку. Принимает объект без `id` и `createdAt`. Возвращает `id`. |
| `getAllTrips()` | Возвращает все поездки по дате создания. |
| `getAllTripsWithPlacesCount()` | Все поездки с полем `placesCount`. |
| `getTripById(id)` | Поездка по id или `null`. |
| `updateTrip(id, trip)` | Частичное обновление поездки. |
| `deleteTrip(id)` | Удаляет поездку, все trip_places и связанные фото. |
| `setCurrentTrip(tripId)` | Делает поездку текущей (у остальных сбрасывает `current`). |
| `getCurrentTrip()` | Возвращает поездку с `current = true` или `null`. |

---

## tripPlacesService.ts

| Функция | Описание |
|---------|----------|
| `addPlaceToTrip(tripId, placeId, order?)` | Добавляет место в поездку. Если `order` не передан — в конец. Возвращает id записи trip_place. |
| `removePlaceFromTrip(tripId, tripPlaceId)` | Удаляет место из поездки (и фото этого посещения). |
| `updatePlaceOrder(tripId, tripPlaceId, newOrder)` | Меняет порядок места в маршруте. |
| `markPlaceAsVisited(tripPlaceId, visited?)` | Отмечает место как посещённое/не посещённое (по умолчанию `true`), выставляет `visitDate`. |
| `addNotesToTripPlace(tripPlaceId, notes)` | Обновляет заметки у места в поездке. |
| `getTripPlacePhotos(tripPlaceId)` | Фотографии, привязанные к этому посещению (trip_place). |
| `getTripPlacesCount(tripId)` | Количество мест в поездке. |
| `getTripPlaces(tripId)` | Упорядоченный по `order_index` список TripPlace. |
| `getTripPlacesWithDetails(tripId)` | Места поездки с подставленными Place и фото (без N+1). |
| `getTripPlaceWithDetails(tripPlaceId)` | Одна запись trip_place с place и объединёнными фото (место + посещение). |

Добавление/удаление фото у места в поездке: **photosService** — `addPhotoToTripPlace`, `removePhotoFromTripPlace`.

---

## nextPlaceService.ts

| Функция | Описание |
|---------|----------|
| `getNextPlace()` | Возвращает следующее место в текущей поездке: первое с `visited = false` по порядку. Тип: `TripPlaceWithDetails \| null`. Если текущей поездки нет или все места посещены — `null`. |

---

## photosService.ts

| Функция | Описание |
|---------|----------|
| `savePhotoToFilesystem(sourceUri)` | Копирует файл по URI в хранилище приложения. Возвращает путь для сохранения в БД. |
| `getPhotoUri(filePath)` | Возвращает URI для отображения в `Image` (здесь совпадает с `filePath`). |
| `deletePhotoFromFilesystem(filePath)` | Удаляет файл фотографии с диска. |
| `addPhotoToPlace(placeId, sourceUri)` | Сохраняет фото в ФС и создаёт запись в БД для места. Возвращает id фото. |
| `removePhotoFromPlace(photoId)` | Удаляет фото у места (файл и запись). |
| `addPhotoToTripPlace(tripPlaceId, sourceUri)` | Сохраняет фото и привязывает к месту в поездке. Возвращает id фото. |
| `removePhotoFromTripPlace(photoId)` | Удаляет фото у места в поездке. |
| `getPhotosForTripPlaceIds(tripPlaceIds)` | Возвращает `Map<tripPlaceId, Photo[]>` для пакетной загрузки. |
| `deletePhotosForEntity(entityType, entityId)` | Удаляет все фото сущности (место или trip_place): файлы и записи. Вызывается при удалении места/записи в поездке. |

---

## Типы (types/index.ts)

- **Place**, **Trip**, **TripPlace**, **Photo** — основные сущности.
- **Coordinates** — `{ latitude, longitude }`.
- **PlaceWithPhotos** — Place + массив photos.
- **TripPlaceWithDetails** — TripPlace + place + массив photos.

Используются в сервисах и экранах; описание полей см. в `types/index.ts` и в [DATABASE.md](DATABASE.md).
