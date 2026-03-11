# Glowsong — Deep Research: Fuentes de Inteligencia Musical para el Algoritmo

**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Objetivo:** Identificar plataformas, APIs y fuentes de datos que permitan evolucionar el algoritmo de Glowsong de rule-based a una IA contextual capaz de responder: *"¿Cuál es la mejor canción para este restaurante a las 4 de la tarde?"*

---

## La Pregunta que Queremos Responder

Hoy el algoritmo de Glowsong funciona así:

```
Input: tipo_local + franja_horaria + géneros_permitidos + blocks + historial_2h
Output: lista de tracks filtrados por energía y género
Método: reglas deterministas + API de Spotify /recommendations
```

El algoritmo funciona. Pero es **genérico** — un bar de jazz en Barrio Italia a las 16:00 y un bar de jazz en Providencia a las 16:00 reciben básicamente lo mismo.

La visión es llegar a esto:

```
Input: tipo_local + hora_exacta + día_semana + barrio + clima + tendencias_regionales +
       historial_del_local + popularidad_actual + mood_contextual + estación_del_año
Output: "la canción perfecta para este momento en este lugar"
Método: modelo entrenado con datos reales de escucha contextual
```

---

## Estado Actual del Algoritmo (Código Fuente)

El motor actual (`src/lib/algorithm/`) tiene 6 módulos:

| Módulo | Qué Hace | Limitación |
|---|---|---|
| `engine.ts` | Orquestador: ciclo de encolado, fallbacks, SessionEvents | Lógica estática, sin aprendizaje |
| `timeSlots.ts` | 5 franjas horarias con parámetros de energía fijos | Franjas iguales para todos los locales |
| `genreMapping.ts` | Mapeo GENRES_CATALOG → Spotify seeds | Mapeo estático, sin considerar tendencias |
| `moodPresets.ts` | Keywords de mood por tipo de local × franja | Presets manuales, no aprenden |
| `trackFilters.ts` | Blocks + ventana no-repetición 4h | Reactivo, no predictivo |
| `spotifyClient.ts` | Wrapper para API de Spotify | Solo usa /recommendations, no charts ni trends |

**Fortalezas actuales:** Funciona, es rápido, no depende de servicios externos más allá de Spotify.
**Debilidades:** No evoluciona, no distingue entre locales similares, no incorpora tendencias.

---

## Fuentes de Datos Identificadas

### Tier 1 — Críticas (usar desde MVP 2)

#### 1. Spotify Audio Features API
- **URL:** developer.spotify.com/documentation/web-api/reference/get-audio-features
- **Datos:** Energy (0-1), valence (0-1), danceability (0-1), tempo BPM, acousticness, instrumentalness, loudness
- **API:** Sí, gratuita
- **LATAM:** Cobertura completa Chile/LATAM
- **Relevancia:** 🔴 CRÍTICA — Ya la usamos parcialmente vía `/recommendations`. La oportunidad está en usar audio features directamente para clasificar tracks con más granularidad que solo "energía alta/media/baja". Valence (positividad emocional) es particularmente útil para diferenciar "tarde de restaurante" vs "tarde de bar".
- **Cómo integrar:** Guardar audio features de cada track en SessionEvent. Después de 3 meses de datos, patrones emergen solos.

#### 2. Spotify Charts Regionales (Chile)
- **URL:** charts.spotify.com + kworb.net/spotify/country/cl_daily.html
- **Datos:** Top 200 tracks diarios por país, con conteos de streaming
- **API:** Scraping o APIs de terceros (kworb, Chartmetric)
- **Costo:** Gratuito vía scraping
- **LATAM:** Chile, Argentina, Colombia, México, Brasil disponibles
- **Relevancia:** 🔴 CRÍTICA — Un bar que pone la canción #1 en Chile esa semana a las 23:00 tiene más probabilidad de engagement que uno que pone un track random. La popularidad regional es un signal fuerte que hoy ignoramos completamente.
- **Cómo integrar:** Pipeline diario que descarga top 200 Chile → score de "popularidad_actual" por track → el algoritmo pondera popularidad como factor adicional.

#### 3. Shazam Discovery Charts
- **URL:** shazam.com + APIs de Apify
- **Datos:** Qué canciones está "descubriendo" la gente en tiempo real, con actualizaciones por hora y región
- **API:** Apify scrapers disponibles
- **Costo:** Freemium
- **LATAM:** Cobertura Chile/LATAM
- **Relevancia:** 🔴 ALTA — Shazam captura intent diferente a Spotify: la gente usa Shazam cuando *escucha algo que le gusta y no sabe qué es*. Es un indicador de "canciones que la gente quiere descubrir" vs "canciones que ya conocen". Ideal para el mood de "noche temprana" donde el Owner quiere sorprender.
- **Cómo integrar:** Score de "descubrimiento" por track basado en Shazam trends regionales.

#### 4. Datos Propios de Glowsong (SessionEvents)
- **Datos:** Cada track reproducido con: local, hora, día, franja, género, energía, tipo de local, barrio
- **API:** Ya existe en Supabase
- **Costo:** Gratis (son nuestros datos)
- **Relevancia:** 🔴 CRÍTICA — Es el activo más valioso. Después de 50 locales × 3 meses, tendremos ~225,000 SessionEvents. Suficiente para detectar patrones como: "los bares de Barrio Italia a las 16:00 los viernes tienden a mantener jazz/soul con energía media" vs "las coctelerías de Providencia a las 16:00 prefieren bossa nova con energía baja".
- **Cómo integrar:** Ya se generan. El paso es construir el pipeline de análisis.

---

### Tier 2 — Alto Valor (integrar post-MVP 2)

#### 5. Cyanite.ai — AI Music Tagging
- **URL:** cyanite.ai
- **Datos:** 300+ tags por track (mood, energía, instrumentación, vibe), análisis por segmentos de 15 segundos
- **API:** Sí, REST API
- **Costo:** €290/mes base + volumen de catálogo
- **Relevancia:** 🟠 ALTA — Va más allá de las audio features de Spotify. Puede responder "esta canción es elegante" o "esta canción es para una cena romántica" con tags de lenguaje natural. Ideal para mapear mood presets con más precisión.
- **Limitación:** Costo mensual — viable cuando el revenue lo justifique.

#### 6. Soundtrack Your Brand — Research Validado
- **URL:** soundtrack.io/research
- **Datos:** Investigación empírica sobre música y restaurantes
- **Hallazgos clave:**
  - Música con "brand fit" → +9.1% ventas vs -4.3% con música random
  - Música lenta → +13.56 min de permanencia → +40% gasto en barra
  - Clientes se quedan 42% más con música que sin ella
  - 92% de marcas reportan que la música incrementa tiempo y gasto
- **Relevancia:** 🟠 ALTA — Validación científica de que la música contextual tiene impacto medible en ventas. Usar estos hallazgos para calibrar el algoritmo (ej: en franja "cena", bajar tempo deliberadamente para incrementar permanencia).

#### 7. Last.fm — Patrones Temporales de Escucha
- **URL:** last.fm/api
- **Datos:** Scrobbling con timestamps exactos — cuándo la gente escucha qué
- **API:** Sí, gratuita
- **Relevancia:** 🟠 ALTA — Muestra patrones reales como: pico de escucha 8AM-5PM en semana, caída 50%+ a las 17-18h, patrones nocturnos distintos los fines de semana. Útil para calibrar transiciones de franja horaria.
- **Limitación:** Los datos son de consumo personal, no de venues. Pero los patrones temporales son transferibles.

#### 8. TikTok Trending Sounds
- **URL:** tiktok.com/discover/trending-sounds
- **Datos:** Sonidos virales rankeados por cantidad de creaciones, actualizados por hora
- **API:** Vía Apify
- **Relevancia:** 🟠 ALTA para público joven — TikTok mueve el 73% del descubrimiento musical en Gen Z. Una canción viral en TikTok esta semana probablemente genere reconocimiento en un bar el viernes. Videos con trending sounds tienen 2-5x más alcance.
- **Cómo integrar:** Score de "viralidad" basado en trending sounds → aplicar como boost para franjas de peak_night en locales con público joven.

---

### Tier 3 — Complementarias (evaluar caso por caso)

#### 9. Chartmetric — Analytics Multi-plataforma
- **URL:** chartmetric.com
- **Datos:** 9M+ artistas, 30+ fuentes (Spotify, Apple, TikTok, YouTube, Instagram)
- **API:** $350/mes
- **Relevancia:** 🟡 MEDIA-ALTA — Agregador potente pero caro para MVP. Útil cuando Glowsong necesite entender tendencias cross-platform.

#### 10. Reddit Communities (r/ifyoulikeblank, r/Music)
- **URL:** reddit.com/r/ifyoulikeblank (337K miembros)
- **Datos:** Recomendaciones musicales humanas y contextuales ("si te gusta X, prueba Y")
- **API:** Reddit API (requiere autenticación)
- **Relevancia:** 🟡 MEDIA — Oro para entrenar un modelo de "similaridad contextual". Los humanos explican *por qué* recomiendan algo, no solo qué. Papers académicos analizan los patrones de recomendación en estos subreddits.

#### 11. MusicBrainz — Metadata Abierta
- **URL:** musicbrainz.org
- **Datos:** 2.6M+ artistas, 35.2M+ grabaciones, metadata en formato abierto
- **API:** Sí, gratuita
- **Relevancia:** 🟡 MEDIA — Enriquecimiento de metadata para tracks que Spotify no clasifica bien.

#### 12. Every Noise at Once
- **URL:** everynoise.com
- **Datos:** Mapa algorítmico de 1,386 géneros musicales basado en Echo Nest/Spotify
- **Relevancia:** 🟡 MEDIA — Referencia visual para entender relaciones entre géneros. Útil para mejorar el mapeo RELATED_GENRES de genreMapping.ts.

#### 13. Deezer Charts & API
- **URL:** deezer.com + developers.deezer.com/api
- **Datos:** Charts regionales, metadata, streaming
- **API:** Sí, gratuita para búsquedas básicas
- **LATAM:** Importante en LATAM como segunda plataforma
- **Relevancia:** 🟡 MEDIA — Diversificar señales de popularidad más allá de Spotify.

---

## Investigación Académica Clave

### Hallazgo 1: Los patrones musicales son diurnos y predecibles
**Fuente:** Royal Society Open Science — "Diurnal fluctuations in musical preference" (análisis de 2B+ streaming events en Spotify)

Las preferencias musicales tienen 5 bloques temporales claros:
- **Mañana (6-12h):** Energía creciente, valence alta (música positiva para empezar el día)
- **Mediodía-Tarde (12-17h):** Energía moderada-alta, preferencia por "familiar comfort"
- **Tarde-Noche (17-21h):** Transición — la energía baja si es cena, sube si es bar
- **Noche (21-02h):** Pico de energía para venues de entretenimiento
- **Madrugada (02-06h):** Caída abrupta, preferencia por lo melódico y lento

**Implicación para Glowsong:** Nuestras 5 franjas horarias están alineadas con la ciencia. Pero podemos ser más granulares: no es lo mismo las 17:00 que las 19:30, y los datos lo confirman.

### Hallazgo 2: El tempo impacta directamente el comportamiento del cliente
**Fuente:** Journal of Consumer Research + PubMed PMC11673941

- Música lenta (< 100 BPM) → clientes se quedan 13.56 minutos más → +40% gasto en barra
- Música rápida (> 120 BPM) → clientes compran más variedad pero se van antes
- El volumen importa: moderado = óptimo; alto = acorta la visita

**Implicación para Glowsong:** Para restaurantes en franja "cena" (early_night), el algoritmo debería bajar el tempo target a 80-100 BPM deliberadamente. El moodPreset de "restaurante" ya tiene keywords ["smooth", "romantic", "warm"] pero no fuerza el tempo bajo explícitamente.

### Hallazgo 3: Music-Brand Fit > Popularidad
**Fuente:** Soundtrack Your Brand — estudio con 2M+ datapoints en retail/restaurantes

La música que "encaja" con la marca del venue genera +9.1% ventas vs la música popular pero descontextualizada que genera -4.3%.

**Implicación para Glowsong:** No siempre poner el #1 de Chile. Si el local es una coctelería de jazz en Barrio Italia, un track de bossa nova poco conocido pero con el mood perfecto genera más valor que Bad Bunny a las 16:00. **El score de "fit contextual" debería pesar más que el score de "popularidad regional"**.

---

## Propuesta: Evolución del Algoritmo en 3 Fases

### Fase 1: Enriquecimiento de Datos (ahora → MVP 2)
**Sin cambiar el algoritmo, empezar a recolectar más datos.**

Acciones concretas:
1. **Agregar audio features a SessionEvents** — Guardar `energy`, `valence`, `tempo`, `danceability` de cada track reproducido. Costo: 1 llamada extra a Spotify por track.
2. **Pipeline diario de Spotify Charts Chile** — Scraper simple que descarga top 200 → tabla `regional_trends` en Supabase.
3. **Registrar "skips" como señal negativa** — Cuando el Owner hace skip, registrar el track + contexto. Un skip es la señal más fuerte de "esta canción no encaja aquí ahora".
4. **Registrar bloqueos como señal fuerte** — Un Block permanente = "nunca" vs Block de sesión = "no ahora".

**Dataset resultante después de 3 meses con 50 locales:**
- ~225,000 SessionEvents enriquecidos
- ~15,000 skips con contexto
- ~3,000 bloqueos
- 90 días × top 200 Chile = 18,000 data points de tendencias

### Fase 2: Modelo Contextual (MVP 2 → 6 meses post-launch)
**Entrenar un modelo simple con los datos acumulados.**

Arquitectura propuesta:

```
Input Features:
├── Local: tipo, barrio, géneros_permitidos, perfil_activo
├── Temporal: hora, día_semana, mes, estación
├── Track: audio_features (energy, valence, tempo, danceability)
├── Popularidad: ranking_regional, tendencia_shazam, viral_tiktok
├── Historial: tracks_recientes, skips_recientes, blocks_activos
└── Contexto: horas_desde_apertura, % de sesión transcurrido

Output:
└── Score de "fit contextual" (0-1) para cada track candidato
```

No necesita ser deep learning. Un **gradient boosting (XGBoost/LightGBM)** entrenado con los SessionEvents + skips puede aprender patrones como:
- "Los viernes a las 16:00 en bares de Barrio Italia, los tracks con valence > 0.7 y tempo 100-120 casi nunca se skipean"
- "En coctelerías a las 22:00, tracks con acousticness > 0.4 y energy < 0.6 tienen mejor retención"

**El modelo reemplaza los moodPresets hardcodeados** — en vez de keywords manuales ["smooth", "elegant", "sophisticated"], el modelo aprende qué combinaciones de audio features realmente funcionan en cada contexto.

### Fase 3: IA Generativa Contextual (12+ meses post-launch)
**El momento en que puedes responder "¿cuál es la mejor canción para este restaurante a las 4pm?"**

Con suficientes datos (500+ locales, 12+ meses), se puede fine-tunear un LLM con:
- Prompt template: `"Dado un [tipo_local] en [barrio] a las [hora] del [día], con perfil musical [géneros] y historial de [top_tracks_del_local], ¿qué 5 tracks deberían sonar ahora y por qué?"`
- Training data: SessionEvents exitosos (sin skip) + contexto completo
- Validación: A/B test contra el algoritmo rule-based

Esto es lo que convierte a Glowsong en una compañía de datos, no solo un reproductor de Spotify inteligente.

---

## Fuentes de Datos: Resumen Ejecutivo

| # | Fuente | Tipo | Costo | Fase | Valor Principal |
|---|--------|------|-------|------|-----------------|
| 1 | Spotify Audio Features | API | Gratis | 1 | Clasificación granular de tracks |
| 2 | Spotify Charts Chile | Scraping | Gratis | 1 | Popularidad regional en tiempo real |
| 3 | SessionEvents propios | BD interna | Gratis | 1 | Patrones reales de cada local |
| 4 | Skip tracking | Feature nueva | Gratis | 1 | Señal negativa más fuerte |
| 5 | Shazam Discovery | API/Scraping | Freemium | 2 | Canciones en fase de descubrimiento |
| 6 | TikTok Trending | API/Scraping | Freemium | 2 | Viralidad para público joven |
| 7 | Last.fm Scrobbling | API | Gratis | 2 | Patrones temporales de escucha |
| 8 | Cyanite.ai | API | €290/mes | 2 | Mood tagging avanzado (NLP) |
| 9 | Chartmetric | API | $350/mes | 3 | Multi-platform trend aggregation |
| 10 | Reddit r/ifyoulikeblank | API | Gratis | 3 | Recomendaciones humanas contextuales |
| 11 | Research académico | Papers | Gratis | 1 | Validación científica del approach |
| 12 | Soundtrack Your Brand | Research | Gratis | 1 | ROI medible de música contextual |

---

## Cambios Inmediatos al Código (Fase 1, sin romper nada)

### 1. Enriquecer SessionEvent con Audio Features

```typescript
// En src/types/index.ts — agregar campos opcionales al SessionEvent
export interface SessionEvent {
  // ... campos actuales ...

  // NUEVOS — Audio Features de Spotify (opcionales para backwards compat)
  audio_valence?: number;      // 0-1 (triste → feliz)
  audio_danceability?: number; // 0-1
  audio_tempo?: number;        // BPM real
  audio_acousticness?: number; // 0-1
  was_skipped?: boolean;       // true si el Owner hizo skip
  skip_after_seconds?: number; // cuántos segundos sonó antes del skip
}
```

### 2. Pipeline de Spotify Charts Chile

```
Cron job diario a las 06:00 Chile:
1. GET kworb.net/spotify/country/cl_daily.html (scraping) O usar API de Chartmetric
2. Parsear top 200 tracks con spotify_track_id
3. INSERT en tabla regional_trends (fecha, rank, spotify_track_id, streams)
4. El algoritmo consulta esta tabla para dar un boost a tracks trending
```

### 3. Registrar Skips como Señal

```typescript
// En el endpoint POST /api/dashboard/skip — agregar logging
// Guardar: { local_id, skipped_track_id, skipped_at, time_slot, context }
// Esta tabla es el training data más valioso: "qué NO funciona dónde y cuándo"
```

---

## Respuesta a la Pregunta Original

> ¿Debería entrenar una IA que responda "cuál es la mejor canción para este restaurante a las 4 de la tarde"?

**Sí, pero no ahora.** El camino es:

1. **Ahora (MVP 1):** El algoritmo rule-based que ya tienes funciona bien. Mejóralo con datos de popularidad regional (Spotify Charts Chile) y empieza a guardar audio features + skips.

2. **MVP 2 (6 meses):** Con 225K+ SessionEvents, entrena un modelo XGBoost que prediga "probabilidad de skip" dado un track + contexto. Úsalo como score de ranking sobre los candidatos de Spotify /recommendations. Los moodPresets.ts dejan de ser hardcodeados.

3. **12+ meses:** Fine-tune un LLM con tus datos contextuales. Ahí puedes responder la pregunta en lenguaje natural: *"Para este restaurante de Barrio Italia a las 4pm un viernes, recomiendo esta playlist de 5 tracks porque..."*

Las fuentes de datos están. El pipeline está claro. Lo más valioso que puedes hacer ahora es **empezar a capturar más datos con cada reproducción**.

---

*Documento de research — Glowsong Intelligence Layer v1.0*
*Fuentes: Spotify API, Shazam, Cyanite.ai, Chartmetric, Last.fm, Soundtrack Your Brand Research, Royal Society Open Science, PubMed, Reddit, TikTok, Every Noise at Once, MusicBrainz, ISMIR Conference*
