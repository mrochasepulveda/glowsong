# Glowsong — PRD S: F2 — Algoritmo de Playlist Inteligente

**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Prioridad:** P0 — Crítica (corazón del producto)
**Dependencias:** F1 (Local con `status = active`, `MusicProfile` configurado, Spotify conectado)

---

## ⚠️ Instrucciones para Claude Code

Este documento describe el motor central de Glowsong. Antes de implementar:

1. **El algoritmo es 100% basado en reglas (rule-based)**. No hay ML, no hay IA. Solo lógica determinista con parámetros configurados.
2. **Leer Sección 6 del PRD-XL** (Integración Spotify) — especialmente gestión de errores y gestión de cola.
3. **Límite de cola: 7 tracks encolados en adelanto**. Nunca superar este número.
4. **Ventana de no-repetición: 2 horas (120 minutos)**. Un track no puede sonar si ya sonó en los últimos 120 minutos.
5. **Los `SessionEvent` son inmutables**. Solo INSERT, nunca UPDATE ni DELETE.
6. **Nunca bloquear el hilo principal**. Todas las llamadas a Spotify API son async.
7. **El algoritmo se ejecuta proactivamente** — cuando hay menos de 5 tracks encolados, no espera.

---

## 1. Resumen de la Feature

El Algoritmo de Playlist Inteligente es el motor interno de Glowsong que selecciona automáticamente canciones desde el catálogo de Spotify y las encola en el dispositivo del Local en tiempo real.

**Lo que el algoritmo hace:**
- Determina la franja horaria actual del Local
- Consulta el `MusicProfile` activo y los `Blocks` vigentes
- Busca tracks en Spotify que cumplan criterios de género y energía
- Filtra tracks ya reproducidos en las últimas 2 horas
- Encola los tracks seleccionados en Spotify
- Registra cada track reproducido como `SessionEvent`
- Mantiene siempre 5–7 tracks encolados en adelanto

**Lo que el algoritmo NO hace:**
- No usa machine learning ni modelos predictivos
- No aprende de preferencias del Owner (eso es MVP 2)
- No procesa audio
- No gestiona la cola más allá de agregar tracks al final

---

## 2. Alineación Estratégica

| Pilar Estratégico | Cómo F2 lo Implementa |
|---|---|
| Pilar 4 — Algoritmo Invisible | El Owner no necesita pensar en qué sigue. El algoritmo opera en background. |
| Pilar 8 — Data Como Ventaja | Cada track genera un `SessionEvent` con metadatos ricos para analytics futuros. |
| Pilar 2 — Control del Local | El algoritmo respeta los `Blocks` y el `MusicProfile` activo. |

**Métricas clave:**
- Tasa de "cola vacía" (objetivo: < 1% de las sesiones)
- Tasa de tracks bloqueados post-encolado (observable, no evitable por limitación de Spotify API)

---

## 3. Jobs To Be Done (JTBD)

### Job 1: Que el Sistema Maneje la Música Sin mi Intervención
**Quién:** Owner que está atendiendo clientes, sin tiempo para pensar en la música.
**Motivación:** No quiero preocuparme por qué canción sigue. Quiero que sea automático.
**Resultado esperado:** La música fluye sin interrupciones. Nunca hay silencio.
**Contexto:** El Owner está ocupado. El algoritmo debe ser completamente invisible cuando funciona bien.

### Job 2: Que la Música Encaje con el Momento del Día
**Quién:** Owner que sabe que a las 15:00 se necesita música diferente que a la 01:00.
**Motivación:** No quiero que a las 22:00 suene la misma música chill del mediodía.
**Resultado esperado:** El algoritmo ajusta energía y selección automáticamente por franja horaria.
**Contexto:** Los bares tienen ritmos claros: apertura tranquila, tarde media, noche alta energía, cierre suave.

---

## 4. User Stories (Framework INVEST)

### US-F2-01: Cola Siempre Mantenida con 5–7 Tracks
**Como** sistema de Glowsong en background,
**quiero** detectar cuando la cola tiene menos de 5 tracks y encolar más,
**para** garantizar que nunca haya silencio por cola vacía y siempre visualizar 5 próximos tracks.

**Criterios de Aceptación:**
- El sistema monitorea la cola cada vez que un track termina de reproducirse.
- Si `cola.length < 5`, el algoritmo genera y encola tracks hasta llegar a 7.
- Si `cola.length >= 5`, el algoritmo no actúa hasta el siguiente evento de fin de track.
- Nunca se encolan más de 7 tracks en adelanto (track actual + siguientes).
- El proceso es completamente asíncrono y no bloquea el hilo principal.
- **Estimación:** 2 días.

---

### US-F2-02: Selección de Tracks por Franja Horaria y Energía
**Como** algoritmo de Glowsong,
**quiero** determinar la franja horaria actual y seleccionar tracks con energía apropiada,
**para** que la música se adapte automáticamente al momento del día.

**Criterios de Aceptación:**
- La franja horaria se determina por la hora actual en zona horaria de Chile (UTC-3).
- Definición de franjas y energía:
  - `opening` (12:00–17:00) → `energy: low` (Spotify: `energy < 0.4`, `tempo < 110`)
  - `afternoon` (17:00–20:00) → `energy: medium` (Spotify: `0.4 ≤ energy < 0.7`, `tempo 100-130`)
  - `early_night` (20:00–23:00) → `energy: high` (Spotify: `energy ≥ 0.7`, `tempo ≥ 120`)
  - `peak_night` (23:00–02:00) → `energy: high` (Spotify: `energy ≥ 0.7`, `tempo ≥ 120`)
  - `closing` (02:00–06:00) → `energy: medium-low` (Spotify: `energy < 0.5`, `tempo < 115`)
- Si `MusicProfile.energy_level != auto`, usar ese nivel fijo en lugar del calculado por franja.
- **Estimación:** 1-2 días.

---

### US-F2-03: Filtro de Tracks Bloqueados
**Como** algoritmo de Glowsong,
**quiero** excluir de la selección todo track, artista o género en `Blocks` del Local,
**para** que nunca suene algo que el Owner haya bloqueado.

**Criterios de Aceptación:**
- Antes de encolar un track, el algoritmo verifica que no esté en `Blocks` por `track`, `artist` o `genre`.
- Los `Blocks` con `scope = session` expiran al finalizar la sesión activa.
- Si todos los géneros del `MusicProfile` están bloqueados, el sistema notifica al Owner: *"Todos los géneros de tu perfil están bloqueados. Revisa tus bloqueos."*
- Los tracks ya encolados en Spotify NO pueden removerse al agregar un nuevo Block (limitación de Spotify API). El Block aplica desde el siguiente track que el algoritmo encole.
- **Estimación:** 1 día.

---

### US-F2-04: Ventana de No-Repetición de 2 Horas
**Como** algoritmo de Glowsong,
**quiero** evitar repetir un track que ya sonó en los últimos 120 minutos,
**para** que el repertorio del local se sienta variado.

**Criterios de Aceptación:**
- El algoritmo consulta `SessionEvents` del Local de los últimos 120 minutos antes de encolar.
- Si `spotify_track_id` aparece en esos `SessionEvents`, el track se excluye.
- En caso de catálogo reducido donde todos los tracks del género sonaron en 2h, el algoritmo amplía a géneros relacionados del `MusicProfile` antes de fallar.
- **Estimación:** 1 día.

---

### US-F2-05: Registro de SessionEvents
**Como** sistema de Glowsong,
**quiero** registrar un `SessionEvent` cada vez que inicia la reproducción de un track,
**para** tener un log completo e inmutable de qué sonó, cuándo y en qué contexto.

**Criterios de Aceptación:**
- Se crea un `SessionEvent` en el momento en que el track comienza a reproducirse (detectado por cambio de `currently-playing` vía polling).
- Campos según modelo en PRD-XL Sección 5: `local_id`, `spotify_track_id`, `track_name`, `artist_name`, `genre`, `energy_level`, `played_at`, `time_slot`, `day_of_week`, `source = 'algorithm'`.
- Un `SessionEvent` nunca se actualiza ni elimina. Solo INSERT.
- Si el INSERT falla, el sistema reintenta 3 veces con backoff. Si sigue fallando, loguea el error y continúa sin detener la reproducción.
- **Estimación:** 1 día.

---

## 5. Escenarios

### Happy Path

```
Estado inicial:
- Local activo, MusicProfile: géneros [JAZZ, SOUL, FUNK], energy=auto
- Hora actual: 22:30 → franja: early_night → energía target: high
- Cola actual: 4 tracks encolados

Trigger: cola < 5 tracks → algoritmo activa

1. Determina franja: early_night → energía: high
2. Lee MusicProfile: géneros [JAZZ, SOUL, FUNK], seed_artists: ["Arctic Monkeys"], sin Blocks activos
3. Llama GET /v1/recommendations:
   seed_genres: "jazz,soul", seed_artists: "arctic_monkeys_id", target_energy: 0.75, limit: 10
4. Filtra candidatos:
   - Excluye bloqueados → ninguno
   - Excluye played_at últimos 120min → excluye 1
   - Quedan 9 candidatos
5. Selecciona 3 tracks aleatoriamente de los 9
6. POST /v1/me/player/queue × 3
7. Cola: 7 tracks encolados ✅
8. Crea SessionEvent para el track que acaba de iniciar

✅ Sin interrupciones. Owner no hizo nada.
```

### Edge Cases

#### EC-F2-01: Spotify /recommendations Retorna Vacío
1. Retroceder a seeds limitados: solo el primer `seed_artist` (si existe) o el primer género del `MusicProfile`.
2. Relajar filtro de energy ±0.2.
3. Si aún vacío, usar `/v1/search` con query `genre:{nombre}`.
4. Si después de 3 intentos aún vacío, mantener tracks actuales en cola y loguear.
5. Si cola llega a 0: mostrar en Dashboard *"No encontramos canciones. Revisa tu perfil musical."*

#### EC-F2-02: Block Nuevo Cubre Todos los Tracks de la Cola
- Los tracks ya encolados en Spotify no se pueden remover (limitación API).
- El algoritmo usa géneros no bloqueados para los próximos encolados.
- Si no quedan géneros no bloqueados, muestra warning en Dashboard.

#### EC-F2-03: Dispositivo Spotify Desconectado Durante Sesión
- Detección: `GET /v1/me/player` retorna `404` o dispositivo no reconocido.
- El algoritmo pausa el encolado.
- Dashboard muestra: *"Spotify desconectado. Abre Spotify en tu dispositivo para continuar."*
- El sistema reintenta detección cada 30 segundos.
- No se registran `SessionEvents` durante el período de desconexión.

#### EC-F2-04: Rate Limit de Spotify (429)
- Leer header `Retry-After`.
- Pausar todas las llamadas por ese número de segundos + 5s de buffer.
- Si la cola tiene tracks suficientes para cubrir la espera, no urgir.
- Si la cola llega a 0 durante el wait: mostrar *"Cargando siguiente canción..."*

### Estados de Error

| Error | Código Spotify | Acción del Sistema | Mensaje al Owner |
|---|---|---|---|
| Token expirado | 401 | Renovar con refresh_token, reintentar | Ninguno (transparente) |
| Sin Premium | 403 | Suspender sesión | "Tu cuenta Spotify requiere Premium." |
| Sin dispositivo | 404 | Detener encolado, esperar | "Abre Spotify en tu dispositivo." |
| Rate limit | 429 | Respetar Retry-After | Solo si cola vacía: "Cargando..." |
| Spotify caído | 502/503 | Exponential backoff x3, luego pausa | "Spotify no disponible. Reintentando..." |
| Error BD SessionEvent | N/A | Log + reintentos, no detener reproducción | Ninguno |

---

## 6. Criterios de Aceptación

- [ ] El algoritmo mantiene entre 5 y 7 tracks encolados en condiciones normales.
- [ ] Ningún track se repite dentro de una ventana de 120 minutos.
- [ ] Solo se seleccionan tracks de géneros o artistas que definen el `MusicProfile` (`allowed_genres` y `seed_artists`).
- [ ] Solo se seleccionan tracks NO bloqueados (genre, artist, track).
- [ ] La energía de los tracks es coherente con la franja horaria.
- [ ] No se encolan más de 7 tracks en adelanto bajo ninguna circunstancia.
- [ ] Cada track que comienza a reproducirse genera un `SessionEvent`.
- [ ] Los `SessionEvents` son inmutables — no existen endpoints PUT ni DELETE sobre esta entidad.
- [ ] Todas las llamadas a Spotify API son asíncronas.
- [ ] Si Spotify retorna 401, el sistema renueva el token automáticamente.
- [ ] Si Spotify retorna 429, el sistema respeta el `Retry-After`.
- [ ] Si el dispositivo se desconecta, el sistema lo detecta y notifica al Owner.
- [ ] Si `/v1/recommendations` retorna vacío, hay al menos 2 estrategias de fallback.

---

## 7. Anti-patrones de esta Feature

### ❌ No usar ML ni modelos de recomendación propios
El MVP 1 usa exclusivamente la API de Spotify con parámetros basados en reglas. Cero embeddings, cero clustering, cero entrenamiento.

### ❌ No encolar más de 7 tracks adelantados
La queue de Spotify no permite reordenar ni eliminar. Más de 7 tracks encolados = cambios del Owner ignorados por demasiado tiempo.

### ❌ No repetir un track dentro de 2 horas
La repetición de tracks es la queja número uno en radio automática. Es verificación obligatoria, no opcional.

### ❌ No seleccionar tracks en un Block activo
Los `Blocks` son restricciones explícitas del Owner. Ignorarlos es un bug crítico de funcionalidad.

### ❌ No fallar silenciosamente cuando la cola se vacía
El Owner debe ser notificado si no hay tracks disponibles. Silencio sin feedback es inaceptable.

### ❌ No modificar SessionEvents
Append-only. No hay endpoint PUT ni DELETE sobre `SessionEvent`.

---

## 8. Dependencias

### Features
| Feature | Tipo | Descripción |
|---|---|---|
| F1 (Onboarding) | Bloqueante | Requiere `Local.status = active`, `MusicProfile` y `spotify_refresh_token` válidos |

### Endpoints de Spotify API
| Endpoint | Método | Propósito |
|---|---|---|
| `GET /v1/me/player/currently-playing` | GET | Detectar track actual |
| `GET /v1/me/player` | GET | Estado completo del player |
| `GET /v1/me/player/devices` | GET | Verificar dispositivo activo |
| `POST /v1/me/player/queue` | POST | Encolar track |
| `GET /v1/recommendations` | GET | Obtener candidatos por género/energía |
| `GET /v1/audio-features/{id}` | GET | Validar energía/tempo |
| `GET /v1/search` | GET | Fallback si recommendations vacío |

### Entidades del Modelo
| Entidad | Uso |
|---|---|
| `Local` | `spotify_refresh_token`, `active_device_id`, `status` |
| `MusicProfile` | `allowed_genres`, `energy_level`, `is_default` |
| `Block` | `block_type`, `value`, `scope`, `expires_at` |
| `SessionEvent` | Lectura: ventana de 2h. Escritura: INSERT por track |

### Features que Dependen de F2
- **F3 (Dashboard):** Consume estado de cola y track actual de F2.
- **F4 (Scheduler):** Determina qué `MusicProfile` usa F2 en cada momento.
- **F5 (Analytics):** Lee `SessionEvents` generados por F2.

---

## 9. Notas de Implementación

### Ciclo de Vida del Algoritmo

```
[Inicio de Sesión]
├── Verificar dispositivo activo (GET /v1/me/player/devices)
│   └── Si no hay dispositivo → CTA al Owner, no continuar
├── Leer MusicProfile activo
├── Calcular franja horaria actual → energía target
└── [LOOP — ejecutar en cada evento de "track terminado"]
    ├── Detectar fin de track (polling cada 5s)
    ├── Si track cambió → crear SessionEvent para el nuevo track
    ├── Contar tracks en cola
    │   └── Si cola < 5 → ejecutar ciclo de encolado
    └── [Ciclo de encolado]
        ├── Leer Blocks activos
        ├── Leer SessionEvents últimas 2h (track_ids a excluir)
        ├── GET /v1/recommendations (seeds combinados de géneros y artistas + params energía)
        ├── Filtrar candidatos (Blocks + ventana 2h)
        ├── Seleccionar N tracks (N = 7 - tracks_en_cola_actual)
        ├── POST /v1/me/player/queue por cada track
        └── Actualizar estado interno de cola
```

### Cálculo de Seeds (Géneros y Artistas)
La API de `recommendations` acepta máximo 5 seeds en total combinando `seed_genres`, `seed_artists` y `seed_tracks`. 
Si el MusicProfile tiene artistas y géneros, se deben priorizar los artistas garantizando al menos 1 género si existe espacio:

```
total_seeds = min(5, seed_artists.length + allowed_genres.length)
artists_to_use = sample(seed_artists, min(4, seed_artists.length)) // Dejar espacio para al menos 1 género
genres_to_use = sample(allowed_genres, total_seeds - artists_to_use.length)

seeds_param = { 
  seed_artists: artists_to_use.join(','), 
  seed_genres: genres_to_use.join(',') 
}
```

### Mapeo GENRES_CATALOG → Spotify genre seeds
Los nombres de géneros de Glowsong no coinciden 1:1 con Spotify. Implementar una tabla de mapeo estática:

```
JAZZ       → "jazz"
SOUL       → "soul"
FUNK       → "funk"
HIP_HOP    → "hip-hop"
R_AND_B    → "r-n-b"
LATIN_POP  → "latin"
INDIE      → "indie"
ALTERNATIVO → "alternative"
CLASICA    → "classical"
BOSSA_NOVA → "bossa nova"
ELECTRONICA → "electronic", "edm"
REGGAETON  → "reggaeton"
(completar para todos los géneros del catálogo)
```

### Detección de Fin de Track
Spotify no ofrece webhooks en tiempo real. Implementar polling cada 5 segundos sobre `GET /v1/me/player/currently-playing`. Detectar cambio de `item.id` entre intervalos → evento de "track terminado, nuevo iniciado".

Con 50 locales activos simultáneos: 50 × 12 req/min = 600 req/min. Monitorear en producción.

### Gestión del access_token
El `access_token` expira en 3600 segundos. Implementar renovación proactiva:

```
- Cachear access_token con TTL de 50 minutos (margen de 10 min antes de expirar)
- Antes de cada llamada: verificar si el token es válido
- Si no válido: renovar con refresh_token (descifrar → usar → NO loguear)
- Si renovación falla: notificar al Owner que reconecte Spotify
```

### Franjas Horarias con Traspaso de Medianoche
Las franjas `peak_night` (23:00–02:00) y `closing` (02:00–06:00) cruzan la medianoche. Usar siempre hora de Chile (UTC-3, ajustar por DST). Las 01:30 del día siguiente aún es `peak_night`.

---

*F2 Algoritmo — Glowsong MVP 1 v1.0*
*Leer F3-dashboard.md para entender cómo el Dashboard consume el estado que F2 genera.*
