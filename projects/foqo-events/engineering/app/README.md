# Riff — Conciertos Chile 🎵

App de discovery de conciertos y música en vivo. Nunca más te pierdas un concierto.

## Estructura

```
riff/
├── apps/
│   ├── api/          ← Backend API (Fastify + TypeScript + PostgreSQL)
│   ├── web/          ← Admin Dashboard (Vite + React)
│   └── mobile/       ← App Móvil (Expo + React Native)
├── packages/
│   └── shared/       ← Tipos compartidos
└── package.json      ← Monorepo root
```

## Requisitos

- Node.js v20+
- PostgreSQL 15+ (local o cloud)

## Setup

```bash
# 1. Instalar dependencias (desde raíz)
npm install

# 2. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tu DATABASE_URL

# 3. Crear la base de datos
createdb riff_dev

# 4. Ejecutar migraciones
npm run db:migrate --workspace=apps/api

# 5. Poblar con datos de ejemplo
npm run db:seed --workspace=apps/api
```

## Desarrollo

```bash
# API (puerto 3001)
npm run dev:api

# Web Admin (puerto 5173)
npm run dev:web

# Mobile (Expo)
npm run dev:mobile
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/events` | Listar eventos (filtros: city, status, dateFrom, dateTo) |
| GET | `/api/events/:id` | Detalle de evento |
| POST | `/api/events` | Crear evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |
| GET | `/api/artists` | Listar artistas (filtro: q) |
| GET | `/api/artists/:id` | Detalle de artista |
| POST | `/api/artists` | Crear artista |
| PUT | `/api/artists/:id` | Actualizar artista |
| DELETE | `/api/artists/:id` | Eliminar artista |
| GET | `/api/venues` | Listar venues (filtros: q, city) |
| POST | `/api/venues` | Crear venue |
| PUT | `/api/venues/:id` | Actualizar venue |
| DELETE | `/api/venues/:id` | Eliminar venue |
| GET | `/api/genres` | Listar géneros |
| POST | `/api/genres` | Crear género |
| DELETE | `/api/genres/:id` | Eliminar género |

## Stack

- **API:** Fastify + TypeScript + Drizzle ORM
- **DB:** PostgreSQL + pgvector (futuro)
- **Web:** Vite + React + TypeScript
- **Mobile:** Expo + React Native + TypeScript
- **Tipos:** Paquete compartido @riff/shared

## Parte de Foqo Events
Riff es un producto de Foqo, junto con Glowsong.
