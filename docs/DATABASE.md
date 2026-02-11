# Структура базы данных GoNext

Приложение использует одну локальную SQLite-базу данных `gonext.db`. Инициализация выполняется при старте приложения в `database/db.ts`.

---

## Таблицы

### `places` (Места)

Хранит места, которые пользователь хочет посетить или уже посетил (не привязаны к конкретной поездке).

| Поле        | Тип    | Описание |
|-------------|--------|----------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name        | TEXT   | Название места |
| description | TEXT  | Описание |
| visitlater  | INTEGER | 0/1 — «посетить позже» |
| liked       | INTEGER | 0/1 — «понравилось» |
| latitude    | REAL   | Широта (Decimal Degrees), может быть NULL |
| longitude   | REAL   | Долгота (Decimal Degrees), может быть NULL |
| createdAt   | TEXT   | ISO-дата создания |

---

### `trips` (Поездки)

Поездка — маршрут с датами и упорядоченным списком мест.

| Поле      | Тип    | Описание |
|-----------|--------|----------|
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title     | TEXT   | Название поездки |
| description | TEXT | Описание |
| startDate | TEXT   | Дата начала (YYYY-MM-DD), может быть NULL |
| endDate   | TEXT   | Дата окончания (YYYY-MM-DD), может быть NULL |
| current   | INTEGER | 0/1 — признак текущей поездки (только одна может быть current) |
| createdAt | TEXT   | ISO-дата создания |

---

### `trip_places` (Места в поездке)

Связь поездки с местами: порядок в маршруте и факт посещения.

| Поле       | Тип    | Описание |
|------------|--------|----------|
| id         | INTEGER | PRIMARY KEY AUTOINCREMENT |
| tripId     | INTEGER | FK → trips(id) ON DELETE CASCADE |
| placeId    | INTEGER | FK → places(id) ON DELETE CASCADE |
| order_index| INTEGER | Порядок в маршруте (0, 1, 2, …) |
| visited    | INTEGER | 0/1 — посещено |
| visitDate  | TEXT   | Дата посещения (YYYY-MM-DD), может быть NULL |
| notes      | TEXT   | Заметки о посещении |

---

### `photos` (Фотографии)

Связь фотографий с сущностями: место или место в поездке. Файлы хранятся в файловой системе, в БД — только путь и привязка.

| Поле      | Тип    | Описание |
|-----------|--------|----------|
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT |
| entityType| TEXT   | `'place'` или `'trip_place'` |
| entityId  | INTEGER | id места (places.id) или id записи в поездке (trip_places.id) |
| filePath  | TEXT   | Полный путь к файлу в хранилище приложения |
| createdAt | TEXT   | ISO-дата создания записи |

---

## Индексы

- `idx_trip_places_tripId` — по `trip_places(tripId)`
- `idx_trip_places_placeId` — по `trip_places(placeId)`
- `idx_photos_entity` — по `photos(entityType, entityId)`
- `idx_trips_current` — по `trips(current)`

---

## Связи

- **Trip → TripPlaces → Place:** поездка содержит упорядоченный список мест через `trip_places`; каждое `trip_places` ссылается на `places`.
- Фотографии привязаны либо к месту (`entityType = 'place'`, `entityId = places.id`), либо к месту в поездке (`entityType = 'trip_place'`, `entityId = trip_places.id`).

При удалении поездки удаляются все её `trip_places` (CASCADE). При удалении места удаляются связанные `trip_places` и записи в `photos` обрабатываются в коде сервисов (удаление файлов и записей).
