# Glowsong — PRD S: F3 — Dashboard de Control en Tiempo Real

**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Prioridad:** P0 — Crítica (interfaz principal del Owner)
**Dependencias:** F1 (Local con `status = active`), F2 (Algoritmo generando cola)

---

## ⚠️ Instrucciones para Claude Code

Este documento describe el Dashboard, la interfaz principal que el Owner usa para monitorear y controlar la música de su local. Antes de implementar:

1. **Mobile-first es obligatorio**. Todas las acciones primarias deben ser alcanzables sin scroll en un viewport de 375px de ancho. El Owner usa el Dashboard desde su teléfono, parado detrás de la barra.
2. **El Dashboard nunca muestra datos de otro Local**. Toda query al backend debe filtrarse estrictamente por el `local_id` del Owner autenticado.
3. **Latencia de acciones críticas: < 1.5 segundos**. Skip y Pause deben ejecutarse en Spotify en menos de 1.5 segundos desde el tap del Owner. No hay tolerancia para respuestas lentas en estas acciones.
4. **El Dashboard se actualiza cada 5 segundos** (polling). Decisión de ingeniería si usar polling, WebSockets o SSE — lo que importa es que el intervalo efectivo no supere 5 segundos.
5. **El Dashboard NO muestra credenciales de Spotify**. Nunca el email, nombre de usuario ni token de Spotify aparecen en la UI.
6. **Leer PRD-XL Sección 9 completa** — Anti-patrones del Sistema antes de diseñar los endpoints del Dashboard.

---

## 1. Resumen de la Feature

El Dashboard es la pantalla principal de Glowsong. Es donde el Owner pasa la mayor parte del tiempo cuando tiene el sistema activo. Tiene dos vistas accesibles desde el mismo panel:

### Vista 1: Control en Vivo (Vista Principal)
La pantalla que el Owner ve al abrir Glowsong durante su turno. Muestra:
- **Tarjeta "Sonando Ahora"**: nombre del track, artista, imagen del álbum, barra de progreso, tiempo restante.
- **Cola próxima**: los 5 siguientes tracks en cola (nombre + artista + imagen de álbum).
- **Controles principales**: botón Skip, botón Pause/Play.
- **Acción de Bloqueo Rápido**: desde la tarjeta "Sonando Ahora", el Owner puede bloquear el track actual o el artista con un tap.

### Vista 2: Configuración
Accesible desde el Dashboard con un botón secundario (ej: ícono de configuración). Incluye:
- **Editor de Perfil Musical**: modificar géneros permitidos del `MusicProfile` default.
- **Gestor de Bloqueos**: ver lista de `Blocks` activos, eliminar bloqueos permanentes o temporales.

**El Owner trabaja principalmente en la Vista 1**. La Vista 2 es para ajustes ocasionales.

---

## 2. Alineación Estratégica

| Pilar Estratégico | Cómo F3 lo Implementa |
|---|---|
| Pilar 2 — Control del Local | El Owner tiene control total: skip, pause, bloquear, cambiar perfil — todo desde una pantalla. |
| Pilar 3 — Sin Fricción | Mobile-first, sin scroll para acciones primarias. Mínimo de taps para las acciones más comunes. |
| Pilar 4 — Algoritmo Invisible | El Dashboard muestra el resultado del algoritmo sin exponer su complejidad. |

**Métricas clave:**
- Latencia skip/pause: < 1.5 segundos (p95)
- Tiempo hasta primer render del Dashboard desde login: < 2 segundos en 4G
- Tasa de actualizaciones perdidas: < 5% de los ciclos de polling (en condiciones normales)

---

## 3. Jobs To Be Done (JTBD)

### Job 1: Saber en Todo Momento Qué Está Sonando en mi Local
**Quién:** Owner que quiere estar al tanto de la música sin estar pegado a la pantalla.
**Motivación:** Quiero poder mirar rápidamente mi teléfono y saber exactamente qué canción está sonando, cuánto falta, y qué sigue.
**Resultado esperado:** Una pantalla clara, legible de un vistazo, con el track actual y los próximos.
**Contexto:** El Owner está circulando por el local, atiende clientes. El dashboard debe ser legible en 2 segundos.

### Job 2: Controlar la Música en Tiempo Real
**Quién:** Owner que necesita pausar o cambiar la canción inmediatamente.
**Motivación:** El ambiente del local puede cambiar rápido. Si una canción no está funcionando, necesito poder cambiarla ahora, no en 10 segundos.
**Resultado esperado:** Skip y Pause se ejecutan en menos de 1.5 segundos desde que toca el botón.
**Contexto:** Puede ser urgente. Una boda espontánea en el bar, un momento de silencio necesario, una canción que ofende a alguien. El control debe ser inmediato.

### Job 3: Bloquear Algo que No Quiero que Vuelva a Sonar
**Quién:** Owner que escucha una canción o artista que no va con su local.
**Motivación:** No quiero que eso vuelva a sonar. Quiero bloquearlo ahora, rápido, desde el mismo lugar donde veo qué está sonando.
**Resultado esperado:** En máximo 2 taps desde la tarjeta "Sonando Ahora", el track o artista queda bloqueado permanentemente.
**Contexto:** El Owner está en el momento, en el local. No tiene tiempo de ir a "Configuración > Bloqueos > Agregar". Debe poder hacerlo desde la vista principal.

---

## 4. User Stories (Framework INVEST)

### US-F3-01: Ver el Track Actual en la Tarjeta "Sonando Ahora"
**Como** Owner con el Dashboard abierto,
**quiero** ver el nombre del track, artista, imagen del álbum, barra de progreso y tiempo restante de la canción actual,
**para** saber exactamente qué está sonando en mi local en este momento.

**Criterios de Aceptación:**
- La tarjeta "Sonando Ahora" muestra: imagen del álbum (mínimo 64×64px), nombre del track (max 2 líneas, truncado con ellipsis), nombre del artista, barra de progreso animada, tiempo restante en formato `m:ss`.
- Si Spotify no está reproduciendo nada (`is_playing = false`), la tarjeta muestra estado "Pausado" con el último track conocido en gris.
- Si no hay ningún track (sesión no iniciada o dispositivo desconectado), se muestra el estado vacío con CTA: *"Inicia la reproducción para comenzar."* (No requiere abrir Spotify externamente).
- La tarjeta se actualiza en cada ciclo de polling (≤ 5 segundos de delay).
- **Estimación:** 1-2 días.

---

### US-F3-02: Ver la Cola de las Próximas 5 Canciones
**Como** Owner en el Dashboard,
**quiero** ver las 5 canciones que vienen después de la actual,
**para** saber qué va a sonar antes de que suene y anticipar el ambiente.

**Criterios de Aceptación:**
- Se muestran los próximos 5 tracks en orden: imagen del álbum, nombre del track, nombre del artista.
- Si hay menos de 5 tracks en cola, se muestran los disponibles sin elementos vacíos.
- Si la cola está vacía (estado anormal), se muestra: *"El sistema está preparando las siguientes canciones..."*
- La lista se actualiza en cada ciclo de polling.
- **Estimación:** 1 día.

---

### US-F3-03: Acción de Skip
**Como** Owner viendo el Dashboard,
**quiero** hacer tap en el botón Skip para pasar a la siguiente canción,
**para** cambiar rápidamente una canción que no me convence en este momento.

**Criterios de Aceptación:**
- El botón Skip es visible y alcanzable sin scroll en 375px de ancho.
- Desde el tap hasta que Spotify ejecuta el skip: ≤ 1.5 segundos.
- Durante el proceso de skip, el botón muestra un estado de carga (spinner o feedback visual) para evitar doble-tap accidental.
- Después del skip, la tarjeta "Sonando Ahora" se actualiza con el nuevo track en el siguiente ciclo de polling (máx 5s).
- Si el skip falla (Spotify timeout), se muestra un toast: *"No pudimos saltar la canción. Inténtalo de nuevo."* y el botón vuelve a su estado normal.
- El Owner no puede hacer skip si no hay dispositivo activo.
- **Estimación:** 1 día.

---

### US-F3-04: Acción de Pause y Play
**Como** Owner viendo el Dashboard,
**quiero** pausar o reanudar la reproducción con un solo tap,
**para** controlar cuándo hay música y cuándo no en mi local.

**Criterios de Aceptación:**
- El botón Pause/Play alterna entre los dos estados según el estado actual de Spotify.
- Al pausar: se ejecuta `PUT /v1/me/player/pause` — latencia ≤ 1.5 segundos.
- Al reanudar: se ejecuta `PUT /v1/me/player/play` — latencia ≤ 1.5 segundos.
- Si Spotify fue pausado externamente (ej: alguien pausó desde el teléfono del local), el Dashboard detecta el nuevo estado en el próximo ciclo de polling y actualiza el botón al estado "Play".
- Estado "Pausado" muestra un indicador visual claro en la tarjeta "Sonando Ahora" (ej: ícono de pausa superpuesto en la imagen del álbum).
- **Estimación:** 1 día.

---

### US-F3-05: Bloqueo Rápido desde la Tarjeta "Sonando Ahora"
**Como** Owner escuchando una canción que no quiero que vuelva a sonar,
**quiero** bloquear el track actual o su artista directamente desde la tarjeta "Sonando Ahora",
**para** no tener que ir a la sección de configuración para hacer un bloqueo de emergencia.

**Criterios de Aceptación:**
- La tarjeta "Sonando Ahora" tiene un botón/menú de acción (ej: tres puntos "...") que muestra opciones: *"Bloquear esta canción"* y *"Bloquear este artista"*.
- Al seleccionar "Bloquear esta canción", se crea un `Block` con `block_type = track`, `scope = permanent`, con el `spotify_track_id` y `display_name` del track actual.
- Al seleccionar "Bloquear este artista", se crea un `Block` con `block_type = artist`, `scope = permanent`, con el `artist_id` de Spotify y el nombre del artista.
- Después de bloquear, el sistema hace skip automático al siguiente track (porque el actual ya está bloqueado).
- Se muestra un toast de confirmación: *"[Nombre] bloqueado. La canción fue saltada."*
- El Block se aplica inmediatamente para los próximos tracks que el algoritmo encole.
- **Estimación:** 1-2 días.

---

### US-F3-06: Editor de Perfil Musical (Vista Configuración)
**Como** Owner en la vista de Configuración,
**quiero** editar los géneros y artistas base permitidos de mi Perfil Musical default,
**para** ajustar la selección de música de mi local cuando mi criterio musical cambia.

**Criterios de Aceptación:**
- Se muestran todos los géneros del `GENRES_CATALOG` como chips/badges, así como un buscador visual para artistas base.
- Los géneros actualmente en `MusicProfile.allowed_genres` y los artistas en `MusicProfile.seed_artists` aparecen seleccionados (highlighted).
- El Owner puede agregar o quitar géneros, y buscar/agregar/quitar hasta 5 artistas base. Mínimo 1 género o artista debe permanecer seleccionado.
- Al guardar, se hace `PATCH` al `MusicProfile` con los géneros y artistas actualizados.
- Los cambios se aplican en el próximo ciclo de encolado del algoritmo (no de forma retroactiva en los tracks ya encolados).
- Confirmación visual al guardar: *"Perfil musical actualizado."*
- **Estimación:** 2 días.

---

### US-F3-07: Gestor de Bloqueos (Vista Configuración)
**Como** Owner en la vista de Configuración,
**quiero** ver la lista de todos mis bloqueos activos y poder eliminar los que ya no quiero,
**para** tener control total sobre las restricciones de música de mi local.

**Criterios de Aceptación:**
- Se muestra la lista de `Blocks` activos del Local, organizados por tipo (Géneros, Artistas, Canciones).
- Para cada Block se muestra: `display_name`, tipo de bloqueo, scope (permanente o sesión), y botón de eliminar.
- Al eliminar, se muestra confirmación: *"¿Eliminar el bloqueo de [nombre]?"* — el Owner confirma.
- Después de eliminar, el Block desaparece de la lista en tiempo real.
- Los Blocks de `scope = session` muestran una etiqueta "Solo esta sesión" para diferenciarse visualmente.
- **Estimación:** 1 día.

---

## 5. Escenarios

### Happy Path

```
Escenario: Owner abre el Dashboard un viernes a las 23:30

1. Owner hace login → redirigido al Dashboard (< 2s de carga)
2. Vista 1 (Control en Vivo) muestra:
   - Tarjeta "Sonando Ahora": 
     🎵 "Uptown Funk" — Bruno Mars [imagen álbum] [barra progreso: 2:15 / 3:40]
   - Cola: 
     → "Happy" — Pharrell Williams
     → "Can't Stop the Feeling" — Justin Timberlake  
     → "Shake It Off" — Taylor Swift
   - Botones: [⏭ Skip] [⏸ Pause]
3. Owner escucha "Uptown Funk" → le parece bien para el momento → no hace nada
4. La canción termina → Dashboard actualiza automáticamente en ≤ 5s
5. Ahora suena "Happy" — el Owner recibe un cliente y no mira el teléfono
6. El algoritmo detecta que la cola bajó a 2 → encola 3 canciones más en background
7. Owner mira el teléfono → "Happy" sonando, cola con 4 siguientes
8. Owner piensa que "Shake It Off" no correspond con su bar → tap "..." → "Bloquear esta canción"
9. Toast: "Shake It Off bloqueado" — el track ya no aparece en la cola ni sonará nunca más
10. 23 minutos después, el Owner necesita silencio → tap [⏸ Pause]
11. Spotify pausa en ≤ 1.5s → tarjeta muestra estado "Pausado"
12. 2 minutos después → tap [▶ Play] → música reanuda
```

### Edge Cases

#### EC-F3-01: No Hay Dispositivo Spotify Activo
- **Detección:** Backend consulta `GET /v1/me/player/devices` → lista vacía o falta de dispositivo activo.
- **Dashboard muestra:** Dependiendo de la integración, si se usa Web Playback SDK, el dispositivo se auto-registra. Si no, se indica *"Inicializando reproductor integrado..."*
- Los botones Skip y Pause están deshabilitados.
- El sistema monitorea cada 30s y actualiza el Dashboard cuando detecta un dispositivo.

#### EC-F3-02: Spotify fue Pausado Externamente
- **Detección:** Polling detecta `is_playing = false` sin que el Owner haya tocado Pause desde Glowsong.
- **Dashboard muestra:** Estado "Pausado" en la tarjeta. El botón Play está disponible para reanudar.
- El Owner puede reanudar desde Glowsong con el botón Play.
- No hay mensaje de error — esto es un estado válido del sistema.

#### EC-F3-03: Timeout de Spotify en Acción Skip
- **Causa:** La llamada a `POST /v1/me/player/next` tarda más de 1.5 segundos o retorna error.
- **Acción:** Toast de error: *"No pudimos saltar la canción. Inténtalo de nuevo."*
- El botón Skip vuelve a su estado normal.
- El sistema loguea el timeout internamente.
- Si el error persiste (3 intentos fallidos), mostrar: *"Spotify no está respondiendo. Verifica tu conexión."*

#### EC-F3-04: Pérdida de Conexión a Internet del Owner
- **Detección:** Las solicitudes de polling al backend fallan.
- **Dashboard muestra:** Banner sutil en la parte superior: *"Sin conexión — los datos pueden estar desactualizados."*
- El último estado conocido se mantiene en pantalla (no se borra).
- Cuando la conexión se restaura, el polling se reanuda y el Dashboard se actualiza.

#### EC-F3-05: El Owner Bloquea el Track Actual y No Hay Siguiente en Cola
- Al bloquear + skip automático → el sistema intenta reproducir el siguiente track.
- Si la cola está vacía, el algoritmo tiene 10 segundos para encolar un nuevo track.
- Si en 10 segundos no hay track disponible, el Dashboard muestra: *"Preparando siguiente canción..."* con un spinner.

### Estados de Error

| Estado | Causa | Mensaje en Dashboard | Acción del Sistema |
|---|---|---|---|
| Sin dispositivo Spotify | Spotify desconectado | "Abre Spotify en tu dispositivo." | Monitorear cada 30s, actualizar cuando reaparezca |
| Pausado externamente | Alguien pausó Spotify fuera de Glowsong | Estado "Pausado" visible | Ofrecer botón Play |
| Skip fallido | Spotify API timeout | Toast: "No pudimos saltar." | Log interno, botón vuelve a estado normal |
| Sin cola | Algoritmo sin tracks disponibles | "Preparando siguiente canción..." | Algoritmo ejecuta fallback |
| Sin conexión | Internet del Owner cortado | Banner: "Sin conexión." | Mantener último estado conocido |
| Sesión Spotify expirada | access_token inválido | Ninguno (transparente) | Backend renueva token automáticamente |

---

## 6. Criterios de Aceptación

### Criterios de UI y Rendimiento
- [ ] El Dashboard carga completamente en < 2 segundos en una conexión 4G.
- [ ] Todas las acciones primarias (Skip, Pause/Play, Bloqueo Rápido) son accesibles sin scroll en un viewport de 375px de ancho.
- [ ] La latencia de Skip y Pause es < 1.5 segundos (del tap a la ejecución en Spotify) en el P95.
- [ ] El Dashboard se actualiza con el estado actual de Spotify en un máximo de 5 segundos.
- [ ] El Dashboard funciona correctamente en Chrome, Safari y Firefox (últimas 2 versiones).

### Criterios Funcionales
- [ ] Si Spotify está pausado (externamente o por el Owner), el Dashboard muestra el estado "Pausado" de forma clara.
- [ ] Si no hay dispositivo Spotify activo, el Dashboard muestra el estado vacío con CTA. Los botones de control están deshabilitados.
- [ ] El bloqueo rápido desde la tarjeta "Sonando Ahora" crea el Block en BD y hace skip automático en el mismo flujo.
- [ ] El editor de Perfil Musical no permite guardar con 0 géneros seleccionados.
- [ ] El gestor de bloqueos muestra todos los Blocks activos (genre, artist, track) e incluye una confirmación antes de eliminar.

### Criterios de Seguridad y Aislamiento
- [ ] El Dashboard solo muestra datos del Local del Owner autenticado. Ningún dato de otro Local aparece bajo ninguna circunstancia.
- [ ] Las credenciales de Spotify (email, username, token) no aparecen en ningún lugar de la UI del Dashboard.
- [ ] Los endpoints del Dashboard validan que el `local_id` solicitado pertenece al `user_id` autenticado antes de retornar datos.

---

## 7. Anti-patrones de esta Feature

### ❌ No mostrar features de consumidor
El Dashboard es exclusivo del Owner (B2B). No incluir votaciones, requests de canciones, perfiles de clientes ni ningún elemento que sugiera interacción del consumidor final.

### ❌ No requerir refresh manual de página para ver el track actual
El Dashboard se actualiza automáticamente vía polling. Si el Owner tiene que hacer refresh manual para ver qué está sonando, es un bug de UX crítico.

### ❌ No permitir controlar la reproducción de otro Local
Toda acción (skip, pause, block, edit profile) debe ejecutarse siempre en el contexto del Local del Owner autenticado. Los IDs de Local en las URLs o payloads deben ser ignorados si no coinciden con el Local del Owner autenticado.

### ❌ No mostrar credenciales de Spotify en la UI
El email de Spotify, username, refresh_token o access_token no tienen lugar en ningún elemento visible del Dashboard. Solo puede mostrarse el nombre de la cuenta Spotify conectada (ej: en el estado de configuración de Spotify).

### ❌ No hacer múltiples llamadas a Spotify por clic del Owner
Cada acción del Owner (skip, pause) debe traducirse en exactamente 1 llamada a Spotify. Implementar debouncing en los botones para evitar doble-tap y múltiples llamadas.

### ❌ No ocultar el estado "Sin dispositivo Spotify" con un spinner infinito
Si no hay dispositivo activo, mostrar el estado de error con CTA claro inmediatamente. Un spinner infinito sin feedback es inaceptable.

---

## 8. Dependencias

### Features
| Feature | Tipo | Descripción |
|---|---|---|
| F1 (Onboarding) | Bloqueante | El Dashboard solo es accesible si `User.onboarding_completed = true` y `Local.status = active` |
| F2 (Algoritmo) | Bloqueante para Vista 1 | El estado de la cola y del track actual es generado por F2 |

### Endpoints Backend Requeridos
| Endpoint | Método | Propósito |
|---|---|---|
| `GET /api/dashboard/now-playing` | GET | Estado actual: track, cola, is_playing, device_status |
| `POST /api/dashboard/skip` | POST | Saltar al siguiente track |
| `POST /api/dashboard/pause` | POST | Pausar/reanudar reproducción |
| `POST /api/dashboard/block` | POST | Crear un Block desde acción rápida |
| `GET /api/config/music-profile` | GET | Leer MusicProfile actual |
| `PATCH /api/config/music-profile` | PATCH | Actualizar géneros del MusicProfile |
| `GET /api/config/blocks` | GET | Listar Blocks activos |
| `DELETE /api/config/blocks/{id}` | DELETE | Eliminar un Block |

### Endpoints de Spotify API (vía Backend)
| Endpoint | Propósito |
|---|---|
| `GET /v1/me/player/currently-playing` | Track actual (usado por el polling del backend) |
| `GET /v1/me/player/devices` | Verificar dispositivo activo |
| `POST /v1/me/player/next` | Skip |
| `PUT /v1/me/player/pause` | Pause |
| `PUT /v1/me/player/play` | Play/Resume |

---

## 9. Notas de Implementación

### Estrategia de Polling vs WebSocket vs SSE
La decisión de arquitectura de actualización en tiempo real está abierta (ver PRD-XL Sección 10). Las tres opciones y sus trade-offs:

| Opción | Pros | Contras |
|---|---|---|
| **Polling (5s)** | Simple, sin estado en servidor, fácil de debuggear | 50 locales × 12 req/min = 600 req/min al backend |
| **WebSockets** | Actualización instantánea, eficiente en conexiones estables | Complejidad de manejo de estado, reconexión |
| **Server-Sent Events** | Simple unidireccional, funciona bien con proxies HTTP/2 | Solo servidor → cliente, el cliente sigue haciendo requests para acciones |

**Recomendación para MVP 1:** Iniciar con polling (5s). Es el más simple de implementar y depurar. La carga de 600 req/min es manejable en un servidor único. Migrar a SSE/WebSocket si el polling genera problemas medibles en producción.

### Estructura de Respuesta del Endpoint `GET /api/dashboard/now-playing`
```json
{
  "current_track": {
    "spotify_track_id": "spotify:track:xxx",
    "name": "Uptown Funk",
    "artist": "Bruno Mars",
    "album": "Mark Ronson - Uptown Special",
    "album_art_url": "https://i.scdn.co/...",
    "duration_ms": 269000,
    "progress_ms": 134000,
    "is_playing": true
  },
  "queue": [
    {
      "spotify_track_id": "spotify:track:yyy",
      "name": "Happy",
      "artist": "Pharrell Williams",
      "album_art_url": "https://i.scdn.co/..."
    }
    // ... hasta 5 items
  ],
  "device": {
    "is_active": true,
    "name": "MacBook de El Bar"
  },
  "session_status": "active" // "active" | "paused" | "no_device" | "no_session"
}
```

### Comportamiento del Polling en el Frontend
```javascript
// Pseudocódigo del loop de polling
const POLL_INTERVAL = 5000; // 5 segundos

async function startPolling(localId) {
  while (dashboardIsOpen) {
    try {
      const state = await fetch(`/api/dashboard/now-playing`);
      updateDashboardUI(state);
      setConnectionStatus('online');
    } catch (error) {
      setConnectionStatus('offline');
      // Mantener último estado conocido
    }
    await sleep(POLL_INTERVAL);
  }
}
```

### Diseño Mobile-First — Prioridades de Layout (375px)

```
┌─────────────────────────┐  ← Header: Logo + icono Config
│    [Logo] [Gear Icon]   │
├─────────────────────────┤
│                         │
│   [Imagen Álbum 96×96]  │  ← Tarjeta "Sonando Ahora"
│   Track Name            │
│   Artist Name      [...] │  ← Icono de acciones (bloqueo rápido)
│   [====Barra====>]  2:15│
│                         │
├─────────────────────────┤
│   [⏭ Skip]   [⏸ Pause]  │  ← Botones primarios, full-width o 50/50
├─────────────────────────┤
│   Siguientes:           │
│   🎵 Track B - Artista  │  ← Cola 5 items
│   🎵 Track C - Artista  │
│   🎵 Track D - Artista  │
│   🎵 Track E - Artista  │
│   🎵 Track F - Artista  │
└─────────────────────────┘
```
Todo lo anterior debe caber en una pantalla de 375×667px sin scroll. Los botones Skip y Pause deben ser suficientemente grandes para tap con el pulgar (mínimo 48×48px de área táctil).

### Implementación del Bloqueo Rápido
El flujo de bloqueo desde la tarjeta es:
1. Owner toca el ícono "..." en la tarjeta "Sonando Ahora".
2. Se muestra un bottom sheet o popup con opciones: "Bloquear esta canción" / "Bloquear este artista".
3. Al seleccionar, el frontend llama `POST /api/dashboard/block` con `{ type: 'track' | 'artist', spotify_id, display_name, scope: 'permanent' }`.
4. El backend crea el `Block` y — si el track bloqueado es el que está sonando ahora — también ejecuta Skip automático.
5. Frontend actualiza UI: muestra toast de confirmación + refresca la tarjeta "Sonando Ahora" con el nuevo track.

### Seguridad: Aislamiento de Datos por Local
Todos los endpoints del Dashboard deben implementar el siguiente pattern de validación:

```javascript
// Pseudocódigo del middleware de aislamiento
async function validateLocalOwnership(req, res, next) {
  const authenticatedUserId = req.user.id; // Del JWT
  const local = await Local.findOne({ owner_id: authenticatedUserId, status: 'active' });
  
  if (!local) {
    return res.status(403).json({ error: 'No tienes un local activo.' });
  }
  
  req.local = local; // Inyectar en el request, no confiar en parámetros del cliente
  next();
}
```

**Nunca** usar el `local_id` del body o URL sin validar que pertenece al `user_id` autenticado.

---

*F3 Dashboard — Glowsong MVP 1 v1.0*
*Ver F4-scheduler.md para la feature de programación semanal de perfiles musicales.*
