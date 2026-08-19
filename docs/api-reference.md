# API reference

Base URL: `http://localhost:3000` during local development. Authenticated endpoints require `Authorization: Bearer <token>`.

## Authentication

| Method | Path | Access | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `name`, `email`, `password` (minimum 8 characters) |
| POST | `/auth/login` | Public | `email`, `password` |
| POST | `/auth/logout` | Authenticated user | Revokes the current bearer token |

Both successful endpoints return `{ "success": true, "token": "<jwt>" }`.

```json
{ "name": "Ada", "email": "ada@example.com", "password": "secure-password" }
```

## Events

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/events` | Admin | Creates an event and initialises available seats to total seats |
| GET | `/events` | Public | Lists events ordered by start time |

Create-event body:

```json
{ "title": "Node Conference", "venue": "Bengaluru", "startsAt": "2026-09-15T09:00:00.000Z", "totalSeats": 300 }
```

## Bookings

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/bookings` | Authenticated user | Creates a pending, ten-minute seat hold |
| GET | `/bookings/me` | Authenticated user | Lists the caller’s bookings |
| POST | `/bookings/:bookingId/confirm` | Booking owner | Confirms a pending, unexpired booking |

Create-booking body:

```json
{ "eventId": "<MongoDB ObjectId>", "quantity": 2 }
```

If availability is insufficient, creation returns `409 Not enough seats available`. A user cannot confirm an expired hold.

## Operational endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness-style JSON response with status, process ID, uptime, and timestamp |
| GET | `/metrics` | Prometheus registry output |

## Error handling

Validation is performed with Zod. Authentication and validation middleware should maintain a consistent JSON error format as the API grows; formalise that contract before public client integration.
