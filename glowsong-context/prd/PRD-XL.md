# Glowsong — PRD XL: Especificación Completa del Sistema MVP 1
**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Audiencia:** Ingeniería (Claude Code / Claude como asistente de desarrollo)
**Stack:** Agnóstico — este documento describe QUÉ construir, no CÓMO. Las decisiones de implementación son del desarrollador.

---

## ⚠️ Instrucciones para Claude Code

Este documento es el contexto maestro del sistema Glowsong MVP 1. Antes de escribir cualquier código:

1. **Lee el Glosario completo** (Sección 1) — todos los términos del dominio están definidos ahí. No inferas significados, úsalos exactamente como están definidos.
2. **Lee los Anti-patrones del Sistema** (Sección 9) — son restricciones explícitas de lo que NO se debe construir.
3. **Para cada feature específica**, lee el PRD S correspondiente en `/features/F[N]-[nombre].md` antes de implementar.
4. **Si un requerimiento es ambiguo**, detente y solicita aclaración en lugar de asumir. La ambigüedad no resuelta es la causa principal de retrabajo.
5. **El scope del MVP 1 es fijo** — no agregues features que no estén en este documento aunque parezcan obvias o útiles.

---

## Tabla de Contenidos

1. Glosario del Dominio
2. Contexto del Producto y Alineación Estratégica
3. Actores del Sistema y Permisos
4. Arquitectura del Sistema
5. Modelo de Datos
6. Integración con Spotify Connect API
7. Inventario de Features MVP 1
8. Requisitos No Funcionales
9. Anti-patrones del Sistema
10. Decisiones Técnicas Abiertas

---

## 1. Glosario del Dominio

> **Crítico:** Estos términos tienen significado preciso en Glowsong. Usarlos de forma inconsistente generará bugs conceptuales en el código.

| Término | Definición |
|---|---|
| **Local** | Establecimiento físico (bar, pub, coctelería, etc.) registrado en Glowsong. Entidad central del sistema. |
| **Owner** | Usuario con rol de dueño o encargado de un Local. Es el único usuario del MVP 1. |
| **Perfil Musical** | Conjunto de configuraciones que definen qué tipo de música puede sonar en un Local: géneros permitidos, artistas semilla (favoritos), géneros bloqueados, artistas bloqueados, canciones bloqueadas. |
| **Franja Horaria** | Bloque de tiempo definido por hora de inicio y hora de fin dentro de un día. Ej: 20:00–23:00. |
| **Slot** | Combinación de un día de la semana + una Franja Horaria. El Scheduler está compuesto de Slots. |
| **Scheduler** | Configuración semanal de un Local que define qué Perfil Musical está activo en cada Slot. |
| **Sesión Activa** | Estado en que un Local tiene Glowsong reproduciendo música activamente. Una Sesión Activa tiene un dispositivo Spotify Connect asociado. |
| **Cola** | Lista ordenada de canciones que están en espera de reproducirse, gestionada por Glowsong sobre la queue de Spotify. |
| **Algoritmo** | Motor interno de Glowsong que selecciona canciones para la Cola en función del Perfil Musical activo y la Franja Horaria actual. |
| **Dispositivo Spotify** | Dispositivo físico o virtual con Spotify activo, controlable via Spotify Connect API. Puede ser un teléfono, tablet, computador o parlante compatible. |
| **Spotify Connect** | Protocolo de Spotify que permite controlar la reproducción en un Dispositivo Spotify desde una aplicación externa via API. |
| **Track** | Una canción individual en el catálogo de Spotify, identificada por su `spotify_track_id` (URI). |
| **Género** | Categoría musical de clasificación. Glowsong usa una lista curada de géneros (ver Sección 5). No se infieren géneros arbitrarios. |
| **QR del Local** | Código QR único por Local que apunta a la Now Playing Page de ese Local. |
| **Now Playing Page** | Página web pública y de solo lectura que muestra qué Track está sonando en un Local ahora mismo. |
| **Evento de Sesión** | Log de lo que ocurrió durante una Sesión Activa: qué canciones sonaron, a qué hora, en qué Franja Horaria. |
| **Reporte Semanal** | Resumen automático de los Eventos de Sesión de los últimos 7 días para un Local. |
| **Bloqueo** | Restricción explícita sobre un Género, Artista o Track específico para que nunca suene en un Local (o durante una Franja Horaria específica). |
| **Bloqueo Permanente** | Bloqueo que persiste indefinidamente hasta que el Owner lo elimina. |
| **Bloqueo Temporal** | Bloqueo que expira al finalizar la Sesión Activa actual o en una fecha/hora específica. |

---

## 2. Contexto del Producto y Alineación Estratégica

### Qué es Glowsong MVP 1

Glowsong MVP 1 es una plataforma web B2B que gestiona la música de locales de entretenimiento nocturno (bares, pubs, coctelerías) de forma inteligente. El MVP 1 resuelve un problema único: **la música del local no está gestionada con intención**. Los dueños usan Spotify con playlists genéricas que no cambian con la hora ni reflejan la identidad del local.

El MVP 1 proporciona:
- Un algoritmo que selecciona música apropiada para cada momento del día
- Control total del dueño sobre qué suena y cuándo
- Una interfaz simple de administración (web app)

### Lo Que el MVP 1 NO Incluye (Scope Negativo)

Los siguientes elementos son del MVP 2 o posteriores. **No deben aparecer en el código del MVP 1:**

- Interacción del consumidor del bar (votación, pago por canciones, requests)
- Sistema de pagos o revenue share
- App nativa (iOS / Android)
- Multi-zona de audio
- Gestión de múltiples locales desde una cuenta
- Integraciones con sistemas de POS o reservas
- Gamificación o perfiles de consumidores

### Alineación con Estrategia de Producto

| Elemento Estratégico | Cómo se Implementa en MVP 1 |
|---|---|
| Pilar 1 — Experiencia Social | Semilla plantada con QR Now Playing Page (solo lectura) |
| Pilar 2 — Control del Local | Dashboard con control en tiempo real, bloqueos, scheduler |
| Pilar 3 — Sin Fricción | Onboarding < 15 min, web app sin instalación |
| Pilar 4 — Algoritmo Invisible | Motor de selección automática por franja horaria |
| Pilar 5 — Confianza | Sin transacciones de dinero en MVP 1 — confianza en disponibilidad del servicio |
| Pilar 6 — Sin Hardware | Funciona sobre infraestructura de audio existente del local vía Spotify Connect |
| Pilar 8 — Data Como Ventaja | Eventos de Sesión registrados desde el primer día |

---

## 3. Actores del Sistema y Permisos

### MVP 1: Un Solo Actor

El MVP 1 tiene **un único tipo de usuario**: el **Owner** (dueño o encargado del Local).

No existe sistema de roles múltiples en el MVP 1. Un Owner tiene acceso completo a su Local y solo a su Local.

### Tabla de Permisos del Owner

| Acción | Permitido |
|---|---|
| Crear y configurar su Local | ✅ |
| Conectar cuenta Spotify | ✅ |
| Ver dashboard en tiempo real | ✅ |
| Controlar reproducción (play, pause, skip) | ✅ |
| Configurar Perfil Musical (géneros, bloqueos) | ✅ |
| Crear y editar Scheduler | ✅ |
| Ver Analytics de su Local | ✅ |
| Descargar su QR | ✅ |
| Ver datos de otros Locales | ❌ |
| Modificar configuración de otros Locales | ❌ |
| Acceder a panel de administración de Glowsong | ❌ |

### Sistema (Actor Interno)

El sistema Glowsong actúa como actor interno en los siguientes procesos:
- Ejecutar el Algoritmo para seleccionar canciones
- Encolar canciones en Spotify vía API
- Registrar Eventos de Sesión
- Generar y enviar Reportes Semanales
- Detectar fin de canción y encolar la siguiente

---

## 4. Arquitectura del Sistema

> **Nota para ingeniería:** Esta sección describe los componentes lógicos del sistema, no la implementación. La elección de tecnologías específicas queda a criterio del desarrollador.

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│  Web App del Owner (Dashboard, Onboarding, Config)      │
│  Now Playing Page (pública, QR, solo lectura)           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                    BACKEND GLOWSONG                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Service│  │ Local Service│  │Music Engine   │  │
│  │  (Sessions,  │  │ (CRUD Local, │  │(Algoritmo,    │  │
│  │   OAuth)     │  │  Config)     │  │ Queue Mgmt)   │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │Scheduler Svc │  │Analytics Svc │  │Notification   │  │
│  │(Slots, Perfi-│  │(Eventos,     │  │Svc (Email     │  │
│  │ les, Franjas)│  │ Reportes)    │  │ Reportes)     │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│                  SPOTIFY WEB API                         │
│  Spotify Connect (control de reproducción remota)       │
│  Search API (búsqueda de canciones para el algoritmo)   │
│  User API (perfil, dispositivos)                        │
└─────────────────────────────────────────────────────────┘
```

### Flujo Principal de Reproducción

```
1. Owner abre Dashboard → Web App consulta estado actual al Backend
2. Backend consulta Spotify API → qué está sonando, dispositivos activos
3. Music Engine verifica Cola → ¿hay canciones encoladas?
4. Si Cola < 3 canciones → Algoritmo genera nuevas canciones y las encola vía Spotify API
5. Evento de Sesión registrado → qué Track, qué hora, qué Franja Horaria
6. Dashboard actualiza en tiempo real (polling o WebSocket)
7. Al terminar un Track → volver a paso 4
```

### Diagrama de Estados de un Local

```
[Sin registrar] → [Registrado / Sin Spotify] → [Configurado / Sin sesión]
                                                         ↓
                                              [Sesión Activa] ←→ [Pausado]
                                                         ↓
                                               [Sesión Finalizada]
```

---

## 5. Modelo de Datos

> **Nota:** Los tipos de datos son lógicos, no de implementación. `String`, `UUID`, `DateTime`, `Boolean`, `Integer`, `Enum`, `Array` se mapean al tipo equivalente en el ORM/DB elegida.

---

### Entidad: `Local`

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único del Local | PK, auto-generado |
| `owner_id` | UUID | FK → User.id | NOT NULL |
| `name` | String | Nombre del local | NOT NULL, max 100 chars |
| `type` | Enum | Tipo: `bar`, `pub, `cocteleria`, `cerveceria`, `restaurante`, `discoteca`, `otro` | NOT NULL |
| `neighborhood` | String | Barrio / comuna | NOT NULL, max 100 chars |
| `city` | String | Ciudad | NOT NULL, default `"Santiago"` |
| `operating_hours` | JSON | `{ mon: {open: "18:00", close: "02:00"}, ... }` formato 24h | NOT NULL |
| `spotify_account_id` | String | ID de la cuenta Spotify conectada | NULLABLE hasta conectar |
| `spotify_refresh_token` | String (encrypted) | Token de refresh de OAuth Spotify | NULLABLE, ENCRYPTED en DB |
| `active_device_id` | String | ID del Dispositivo Spotify activo actualmente | NULLABLE |
| `status` | Enum | `pending_spotify`, `configured`, `active`, `inactive` | NOT NULL, default `pending_spotify` |
| `qr_token` | String | Token único para la Now Playing Page (no autenticado) | NOT NULL, UUID, auto-generado |
| `created_at` | DateTime | Fecha de creación | NOT NULL, auto |
| `updated_at` | DateTime | Última modificación | NOT NULL, auto |

---

### Entidad: `User`

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único | PK, auto-generado |
| `email` | String | Email del Owner | NOT NULL, UNIQUE, validado |
| `password_hash` | String | Hash de contraseña | NULLABLE (si usa OAuth) |
| `google_id` | String | ID de Google OAuth | NULLABLE |
| `name` | String | Nombre del Owner | NOT NULL, max 100 chars |
| `email_verified` | Boolean | Confirmación de email | NOT NULL, default false |
| `onboarding_completed` | Boolean | Onboarding finalizado | NOT NULL, default false |
| `weekly_report_enabled` | Boolean | Recibir reporte semanal | NOT NULL, default true |
| `created_at` | DateTime | Fecha de creación | NOT NULL, auto |

---

### Entidad: `MusicProfile`

Un Local puede tener múltiples MusicProfiles (para diferentes momentos del día).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único | PK, auto-generado |
| `local_id` | UUID | FK → Local.id | NOT NULL |
| `name` | String | Nombre del perfil (ej: "Noche de viernes") | NOT NULL, max 60 chars |
| `allowed_genres` | Array[String] | Lista de géneros permitidos de `GENRES_CATALOG` | NOT NULL, min 1 item |
| `seed_artists` | Array[String] | Lista de IDs de Spotify de artistas base favoritos del Owner | NULLABLE, max 5 items |
| `energy_level` | Enum | `low`, `medium`, `high`, `auto` | NOT NULL, default `auto` |
| `is_default` | Boolean | Perfil usado cuando no hay Slot configurado | NOT NULL, default false |
| `created_at` | DateTime | Fecha de creación | NOT NULL, auto |

**Restricción:** Cada Local tiene exactamente UN `MusicProfile` con `is_default = true`.

---

### Entidad: `Block`

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único | PK, auto-generado |
| `local_id` | UUID | FK → Local.id | NOT NULL |
| `block_type` | Enum | `genre`, `artist`, `track` | NOT NULL |
| `value` | String | El valor bloqueado: nombre de género / artist_id de Spotify / track_id de Spotify | NOT NULL |
| `display_name` | String | Nombre legible (para mostrar en UI) | NOT NULL |
| `scope` | Enum | `permanent`, `session` | NOT NULL, default `permanent` |
| `expires_at` | DateTime | Solo para `scope = session`: cuándo expira | NULLABLE |
| `created_at` | DateTime | Fecha de creación | NOT NULL, auto |

---

### Entidad: `SchedulerSlot`

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único | PK, auto-generado |
| `local_id` | UUID | FK → Local.id | NOT NULL |
| `music_profile_id` | UUID | FK → MusicProfile.id | NOT NULL |
| `day_of_week` | Enum | `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` | NOT NULL |
| `start_time` | String | Hora de inicio en formato `HH:MM` (24h) | NOT NULL, validado |
| `end_time` | String | Hora de fin en formato `HH:MM` (24h) | NOT NULL, validado |
| `created_at` | DateTime | Fecha de creación | NOT NULL, auto |

**Restricción:** No pueden existir dos SchedulerSlots del mismo `local_id` con `day_of_week` igual que se solapen en tiempo.

---

### Entidad: `SessionEvent`

Registro inmutable de cada Track reproducido.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | UUID | Identificador único | PK, auto-generado |
| `local_id` | UUID | FK → Local.id | NOT NULL |
| `spotify_track_id` | String | URI del Track en Spotify | NOT NULL |
| `track_name` | String | Nombre del Track (snapshot) | NOT NULL |
| `artist_name` | String | Nombre del artista principal (snapshot) | NOT NULL |
| `genre` | String | Género asignado por el Algoritmo | NOT NULL |
| `energy_level` | Enum | `low`, `medium`, `high` | NOT NULL |
| `played_at` | DateTime | Timestamp exacto de reproducción | NOT NULL |
| `time_slot` | Enum | `opening`, `afternoon`, `early_night`, `peak_night`, `closing` | NOT NULL |
| `day_of_week` | Enum | Día de la semana en que sonó | NOT NULL |
| `source` | Enum | `algorithm` (MVP 1), `consumer_vote`, `consumer_paid` (futuros) | NOT NULL, default `algorithm` |

**Restricción:** `SessionEvent` es append-only. No se actualiza ni elimina.

---

### Catálogo de Géneros (`GENRES_CATALOG`)

Lista fija y curada de géneros soportados en MVP 1. No se crean géneros arbitrarios.

```
ROCK, POP, ELECTRONICA, REGGAETON, CUMBIA, SALSA, JAZZ, BLUES,
FUNK, SOUL, HIP_HOP, R_AND_B, LATIN_POP, INDIE, ALTERNATIVO,
CLASICA, BOSSA_NOVA, FLAMENCO, FOLK, COUNTRY, MUSICA_CHILENA,
BOLERO, TANGO, BACHATA, MERENGUE
```

---

## 6. Integración con Spotify Connect API

> Esta es la integración más crítica del sistema. Leer con atención.

### Modelo Mental de Spotify Connect

Spotify Connect permite que una aplicación externa (Glowsong) controle la reproducción en un dispositivo que tiene Spotify instalado y activo. El audio **siempre sale del dispositivo del local** — Glowsong solo envía comandos de control, nunca procesa audio.

```
[Glowsong Backend] →(comandos via API)→ [Spotify Cloud] →(streaming)→ [Dispositivo del Local]
```

El dispositivo del local puede ser:
- Un teléfono/tablet con la app de Spotify abierta
- Un computador con Spotify Desktop abierto
- Un parlante con Spotify Connect integrado (ej: Sonos, JBL, etc.)
- Un Raspberry Pi con Spotify Connect (para instalaciones más estables)

### Requisitos de la Cuenta Spotify

- **Spotify Premium es obligatorio** para usar la Playback API. Sin Premium, la API retorna `403 PREMIUM_REQUIRED`.
- El MVP 1 usa la cuenta Spotify del propio Local (no una cuenta de Glowsong compartida).

### Flujo de Autenticación OAuth 2.0

```
1. Owner hace clic en "Conectar Spotify" en el onboarding
2. Backend genera URL de autorización de Spotify con los scopes requeridos
3. Owner es redirigido a Spotify → autoriza a Glowsong
4. Spotify redirige a callback URL de Glowsong con `code`
5. Backend intercambia `code` por `access_token` + `refresh_token`
6. `refresh_token` se almacena ENCRIPTADO en Local.spotify_refresh_token
7. `access_token` se cachea en memoria (expira en 1 hora, renovar automáticamente)
```

**Scopes OAuth requeridos:**
```
user-read-playback-state
user-modify-playback-state
user-read-currently-playing
user-read-private
```

### Endpoints de Spotify API Utilizados

| Endpoint | Método | Uso en Glowsong |
|---|---|---|
| `/v1/me/player/devices` | GET | Obtener lista de Dispositivos activos del Local |
| `/v1/me/player` | GET | Estado actual de reproducción (track, posición, dispositivo) |
| `/v1/me/player/currently-playing` | GET | Track que está sonando ahora |
| `/v1/me/player/play` | PUT | Iniciar/reanudar reproducción |
| `/v1/me/player/pause` | PUT | Pausar reproducción |
| `/v1/me/player/next` | POST | Saltar al siguiente track en la cola |
| `/v1/me/player/queue` | POST | Agregar un Track a la cola de reproducción |
| `/v1/search` | GET | Buscar tracks para el Algoritmo y artistas para la configuración de Artistas Semilla |
| `/v1/tracks/{id}` | GET | Obtener metadata de un Track |
| `/v1/audio-features/{id}` | GET | Obtener features de audio (tempo, energía, bailabilidad) |
| `/v1/recommendations` | GET | Obtener recomendaciones basadas en seeds de géneros/tracks |

### Gestión de Errores de Spotify API

Todos los errores de Spotify API deben manejarse explícitamente:

| Código HTTP | Causa | Acción de Glowsong |
|---|---|---|
| `401 Unauthorized` | Access token expirado | Renovar automáticamente con refresh_token y reintentar |
| `403 Forbidden` | Sin Spotify Premium | Notificar al Owner, suspender sesión activa |
| `404 Not Found` | No hay dispositivo activo | Notificar al Owner que abra Spotify en algún dispositivo |
| `429 Too Many Requests` | Rate limit excedido | Respetar `Retry-After` header, cola de reintento con backoff |
| `502/503` | Spotify no disponible | Reintentar con exponential backoff (max 3 intentos), luego pausar gracefully |

### Gestión de la Cola de Reproducción

**Principio:** Glowsong mantiene siempre al menos 3 canciones encoladas en Spotify. El Algoritmo se ejecuta proactivamente antes de que la cola se vacíe.

```
Estado deseable de la Cola:
[Track sonando ahora] + [Next 1] + [Next 2] + [Next 3]

Si Cola < 3 tracks → Algoritmo genera y encola inmediatamente
Si track termina → re-evaluar cola
```

**Limitación importante de Spotify API:** La queue de Spotify no permite reordenar ni eliminar canciones ya encoladas. Solo se puede agregar al final. Por esto:
- No encolar más de 5 canciones en adelanto
- Si el Owner bloquea un artista/género, el cambio aplica desde la siguiente canción que se encole, no las ya encoladas

---

## 7. Inventario de Features MVP 1

| ID | Feature | PRD S | Prioridad | Dependencias |
|---|---|---|---|---|
| F1 | Onboarding del Local | `features/F1-onboarding.md` | P0 — Crítica | Ninguna |
| F2 | Algoritmo de Playlist Inteligente | `features/F2-algoritmo.md` | P0 — Crítica | F1, Spotify API |
| F3 | Dashboard de Control en Tiempo Real | `features/F3-dashboard.md` | P0 — Crítica | F1, F2 |
| F4 | Scheduler Semanal | `features/F4-scheduler.md` | P1 — Alta | F1, F2 |
| F5 | Analytics Básico y Reporte Semanal | `features/F5-analytics.md` | P1 — Alta | F2 (SessionEvents) |
| F6 | QR "Now Playing" | `features/F6-qr.md` | P2 — Media | F2, F3 |

**Orden de implementación recomendado:** F1 → F2 → F3 → F4 → F5 → F6

---

## 8. Requisitos No Funcionales

### Performance

| Métrica | Objetivo | Crítico |
|---|---|---|
| Tiempo de carga del Dashboard (primera vista) | < 2s en conexión 4G | Sí |
| Latencia de acción Owner (skip, pause) → ejecución en Spotify | < 1.5s | Sí |
| Tiempo de actualización del Dashboard (polling) | Cada 5 segundos | Sí |
| Tiempo de carga de Now Playing Page (QR) | < 3s | Sí |
| Tiempo de onboarding completo | < 15 minutos usuario estándar | Sí |

### Disponibilidad

| Requisito | Objetivo |
|---|---|
| Uptime del servicio | ≥ 99.5% mensual |
| Si Spotify API no está disponible | El sistema informa al Owner, no se cuelga |
| Si el algoritmo falla | Reproducción continúa con el último estado conocido |
| Máximo downtime planificado por mantenimiento | < 2 horas por semana, fuera de horario nocturno (00:00–06:00) |

### Seguridad

| Requisito | Implementación |
|---|---|
| Autenticación | JWT con refresh tokens, expiración de access token en 1 hora |
| Spotify refresh tokens | Almacenados cifrados (AES-256 o equivalente) |
| Contraseñas | Hasheadas con bcrypt (cost factor ≥ 12) |
| HTTPS | Obligatorio en todos los endpoints |
| Rate limiting | Máximo 100 requests/minuto por usuario autenticado |
| Datos del Local | Un Owner no puede acceder a datos de otro Local bajo ninguna circunstancia |

### Escalabilidad (MVP 1)

El MVP 1 debe soportar cómodamente **50 locales activos simultáneos** con las siguientes características:
- Cada local hace polling al backend cada 5 segundos → 50 × 12/min = 600 requests/min
- Cada local genera ~50 SessionEvents por noche → 2,500 eventos/noche total

No se requiere arquitectura distribuida para MVP 1. Un único servidor bien configurado es suficiente.

### Usabilidad

| Requisito | Objetivo |
|---|---|
| Mobile-first | El Dashboard debe ser completamente operable en smartphone |
| Accesibilidad | Controles principales accesibles con una mano, sin scroll |
| Idioma | Español en 100% de la interfaz. No hay soporte multiidioma en MVP 1. |
| Compatibilidad de browsers | Chrome, Safari, Firefox — últimas 2 versiones |

---

## 9. Anti-patrones del Sistema

> **Para Claude Code:** Estos son comportamientos explícitamente prohibidos. Si alguna parte del código que estás generando reproduce estos patrones, detente y busca una alternativa.

### Anti-patrón 1: Nunca construir funcionalidad del consumidor final
El MVP 1 no tiene consumidores (clientes del bar) como usuarios. No crear endpoints, vistas ni lógica que permita interacción del consumidor con la música. El único usuario es el Owner.

**Síntomas a evitar:** endpoints `/vote`, `/request-song`, `/pay-song`, modelos `Consumer`, `Vote`, `SongRequest`.

### Anti-patrón 2: Nunca procesar audio en el backend de Glowsong
Glowsong no descarga, procesa, almacena ni retransmite audio. Todo el audio sale de Spotify directamente al dispositivo del local. El backend solo envía comandos de control via Spotify API.

**Síntomas a evitar:** librerías de procesamiento de audio, endpoints de streaming, almacenamiento de archivos de audio.

### Anti-patrón 3: Nunca asumir que un Dispositivo Spotify está activo
Antes de cualquier llamada a la Playback API, verificar que existe un dispositivo activo. Si no hay dispositivo activo (`GET /v1/me/player/devices` retorna lista vacía), no intentar controlar nada — notificar al Owner.

**Síntomas a evitar:** llamadas a `PUT /v1/me/player/play` sin verificar dispositivo previo.

### Anti-patrón 4: Nunca modificar SessionEvents
Los `SessionEvent` son un log de auditoría inmutable. No crear endpoints ni lógica que los actualice o elimine. Solo INSERT, nunca UPDATE ni DELETE.

### Anti-patrón 5: Nunca exponer el spotify_refresh_token
El `spotify_refresh_token` es una credencial. No incluirlo en ninguna respuesta de API, log, ni error message. Solo existe en la base de datos cifrada y en el proceso interno de renovación de tokens.

### Anti-patrón 6: Nunca crear géneros arbitrarios
Los géneros en Glowsong provienen exclusivamente de `GENRES_CATALOG` (Sección 5). No inferir géneros de los metadatos de Spotify ni crear géneros ad-hoc. Si un track no tiene género en el catálogo, asignar el género más cercano del catálogo o usar el default del Perfil Musical.

### Anti-patrón 7: Nunca bloquear el hilo principal por operaciones de Spotify
Las llamadas a Spotify API son I/O asíncrono. Implementar siempre con async/await o equivalente. Nunca bloquear con llamadas síncronas que puedan tardar.

### Anti-patrón 8: Nunca mostrar datos de un Local a otro Owner
Isolación estricta de datos por Local. Cada query que retorna datos de un Local debe incluir el `local_id` del Owner autenticado como filtro. No confiar en parámetros de URL o body para determinar el Local — siempre validar contra la sesión autenticada.

### Anti-patrón 9: Nunca encolar más de 5 tracks adelantados
La queue de Spotify no permite modificar items ya encolados. Encolar demasiado adelantado significa que los cambios de configuración del Owner (bloqueos, cambio de perfil) no se aplican hasta que esos tracks terminen. Máximo 5 tracks encolados en adelanto.

### Anti-patrón 10: Nunca fallar silenciosamente
Toda operación que falle debe comunicar el error de forma explícita al Owner si impacta la experiencia (música detenida, Spotify desconectado) o registrarlo en logs si es interno. No swallowing errors.

---

## 10. Decisiones Técnicas Abiertas

Las siguientes decisiones no están tomadas en este PRD y deben ser resueltas por ingeniería antes o durante el desarrollo:

| Decisión | Opciones | Impacto |
|---|---|---|
| Método de actualización del Dashboard | Polling (5s) vs WebSockets vs Server-Sent Events | Performance y complejidad |
| Estrategia de caché de access tokens Spotify | Redis / memoria in-process / DB | Escalabilidad |
| ORM / Query builder | Depende del lenguaje elegido | DX y performance |
| Servicio de email para Reportes | SendGrid / Resend / SES | Confiabilidad de entrega |
| Hosting y deployment | Railway / Render / AWS / GCP | Costo y DevOps |
| Encriptación de refresh tokens | AES-256-GCM / libsodium / KMS | Seguridad |

---

*PRD XL Glowsong MVP 1 — v1.0*
*Los PRDs S de cada feature están en `/features/`. Leer el PRD S correspondiente antes de implementar cada feature.*
