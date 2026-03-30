# 04 — IA y Tecnología
> Contexto de discovery para Foqo Events · Marzo 2026

---

## El problema técnico central

Convertir información no estructurada (posts de Instagram, Facebook, páginas web de productoras, flyers en imagen) en datos estructurados de eventos: `{artista, fecha, venue, precio, url_entradas}`.

Esto es lo que hace posible todo lo demás — sin datos limpios, no hay notificaciones, no hay recomendaciones.

---

## Pipeline técnico propuesto

```
[Fuentes] → [Scraper] → [Parser IA] → [DB de eventos] → [Matching] → [Notificaciones]
```

### Paso 1: Fuentes de datos

**Fuentes primarias (scraping):**
- Instagram de productoras: @dgmedios, @moveconcertschile, @lotusproductions, @rockpopproducciones
- Instagram de recintos: @caupolicanchile, @movistararena, @blondiebar, @chocolateclubchile
- Puntoticket.com (HTML scraping de listado de eventos)
- Ticketmaster Chile (API pública o scraping)
- Facebook Events (scraping con Playwright)
- Páginas web de recintos y festivales

**Fuentes secundarias (enriquecimiento):**
- Spotify API: verificar artista, obtener géneros, popularidad, imagen
- Setlist.fm API: setlists históricos para la feature de pre-show intel
- Last.fm API: tags de géneros y artistas similares
- MusicBrainz: base de datos de artistas open source

**Fuentes B2B (a mediano plazo):**
- Productoras que publican directamente en Foqo Events (más confiable que scraping)
- API de Puntoticket (si existe relación comercial)

---

### Paso 2: Extracción con IA (NLP)

**Opción A — Claude API (Anthropic) — RECOMENDADA**

Enviar el texto de un post o página al API de Claude con un prompt estructurado y recibir JSON limpio.

```
POST https://api.anthropic.com/v1/messages

Prompt:
"Eres un extractor de información de eventos musicales para Chile.
Del siguiente texto extrae: artista, fecha (formato ISO), venue, ciudad, precio, URL de entradas.
Si algún campo no está disponible, devuelve null.
Responde SOLO con JSON válido, sin texto adicional.

Texto: [contenido del post]"

Respuesta esperada:
{
  "artista": "Terror",
  "fecha": "2026-04-30",
  "venue": "Club Chocolate",
  "ciudad": "Santiago",
  "precio": 15000,
  "url_entradas": "https://puntoticket.com/terror"
}
```

**Por qué Claude API para esto:**
- Entiende español con jerga chilena ("mañana", "este finde", "en el caupoli")
- Maneja texto ambiguo y mal formateado (típico de posts de IG)
- Structured outputs con alta precisión
- Costo: ~$0.003 por 1.000 posts procesados

**Opción B — GPT-4o (OpenAI)**
- Alternativa válida, similar costo y capacidad
- Mejor para procesamiento de imágenes (flyers)

**Opción C — Fine-tuned model propio**
- A largo plazo, entrenar un modelo ligero (llama3 o similar) específico para eventos chilenos
- Menor costo por volumen, mayor velocidad
- Requiere ~10.000 ejemplos etiquetados primero

---

### Paso 3: Vision AI para flyers

Los flyers de eventos en Chile se publican como **imágenes en Instagram Stories y Posts**. Contienen toda la información pero son texto en imagen.

**Solución: GPT-4o Vision o Claude 3.5 Sonnet (multimodal)**

```python
# Ejemplo con Claude API multimodal
response = anthropic.messages.create(
    model="claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "data": flyer_base64}},
            {"type": "text", "text": "Extrae artista, fecha, venue, precio y URL del flyer. Responde en JSON."}
        ]
    }]
)
```

---

### Paso 4: Motor de recomendación por género y mood

**Objetivo:** Conectar usuarios con eventos que les gustarán aunque no conozcan al artista.
Ejemplo: Si al usuario le gusta Terror (hardcore), también debería ver un evento de bandas hardcore locales.

**Arquitectura recomendada (3 fases):**

**Fase 1 — Perfilamiento de usuario**
- El usuario marca artistas favoritos o géneros
- Sistema mapea cada artista a un vector de características usando Spotify API:
  - Géneros (tags): `["hardcore", "punk", "metalcore"]`
  - Audio features: energy, tempo, valence, danceability
  - Popularidad y tamaño de audiencia

**Fase 2 — Embeddings de artistas y eventos**
- Cada artista tiene un vector en espacio semántico
- Artistas similares = vectores cercanos
- Herramientas: Sentence Transformers, OpenAI embeddings, o Spotify audio features directamente
- Storage: pgvector (PostgreSQL extension) para búsqueda por similitud

```python
# Búsqueda de eventos similares al perfil del usuario
similar_artists = vector_db.search(
    query_vector=user_profile_vector,
    k=20,
    filter={"city": "Santiago", "date": ">today"}
)
```

**Fase 3 — Collaborative Filtering (a mediano plazo)**
- "Usuarios con gustos similares a los tuyos también van a estos eventos"
- Requiere masa crítica de usuarios con comportamiento (≥10.000 usuarios activos)
- Implementar con modelo simple de matrix factorization inicialmente

---

### Paso 5: Notificaciones omnicanal

**Push notifications:**
- Firebase Cloud Messaging (FCM) para iOS y Android
- Segmentación por: artista, género, ciudad
- Timing: notificar mínimo 72–96 horas antes del evento (no el mismo día)

**WhatsApp:**
- WhatsApp Business API (Meta) para mensajes transaccionales
- Template messages pre-aprobados por Meta
- Costo: ~$0.005 por mensaje en Chile
- Alternativa: Twilio WhatsApp API (más fácil de integrar)

**Email:**
- Resend o SendGrid
- Digest semanal de eventos recomendados
- Alerta inmediata cuando se anuncia evento de artista seguido

---

## Stack tecnológico recomendado para MVP

| Capa | Tecnología | Justificación |
|---|---|---|
| App móvil | React Native (Expo) | Una codebase para iOS y Android |
| Backend | Node.js + Express o Fastify | Rápido de desarrollar, gran ecosistema |
| Base de datos | PostgreSQL + pgvector | Relacional + búsqueda por embeddings |
| Scraping | Playwright (Node.js) | Maneja JavaScript rendering, más robusto que Puppeteer |
| Parser IA | Claude API (Anthropic) | Mejor para español/jerga chilena |
| Vision AI | GPT-4o o Claude Sonnet multimodal | Para procesar flyers en imagen |
| Notificaciones push | Firebase Cloud Messaging | Gratuito hasta escala alta |
| Notificaciones WhatsApp | Twilio WhatsApp API | Fácil integración, buena doc |
| Email | Resend | Más simple que SendGrid para empezar |
| Auth | Clerk o Supabase Auth | Autenticación lista con OAuth social |
| Hosting | Railway o Render (backend), Expo (app) | Bajo costo inicial |
| Cache | Redis | Para rate limiting y cache de scraping |
| Proxy rotation | Bright Data o Oxylabs | Para scraping robusto anti-bloqueo |

---

## Obstáculos técnicos y soluciones

### Scraping de Instagram/Facebook
| Obstáculo | Solución |
|---|---|
| Rate limiting / bloqueo de IP | Rotación de proxies (Bright Data) |
| JavaScript rendering | Playwright con headless Chrome |
| Anti-bot fingerprinting | Headers realistas + delays humanos |
| Stories (desaparecen en 24h) | Scraping frecuente (cada 4–6 horas) |
| Cambios de layout | Monitoreo de errores + alertas |

**Marco legal (2024):** El fallo Meta vs. Bright Data establece que el scraping de datos **públicos sin login** es legal en EEUU. Para Chile aplican principios similares. Los posts públicos de productoras son datos públicos.

### Identificación de artistas (deduplicación)
- Problema: "Terror", "La Terror", "TERROR" son el mismo artista
- Solución: Normalización de nombres + verificación cruzada con Spotify API por ID de artista
- A mediano plazo: base de datos propia de artistas chilenos mapeados a Spotify IDs

### Falsos positivos en extracción
- Problema: Claude puede extraer un evento que no existe o con datos incorrectos
- Solución: Pipeline de validación — si falta fecha o venue, el evento va a cola de revisión humana
- A mediano plazo: feedback loop donde usuarios reportan errores y mejoran el modelo

---

## Costos estimados de IA (MVP a 10.000 usuarios)

| Servicio | Volumen estimado/mes | Costo estimado |
|---|---|---|
| Claude API (parsing de posts) | ~50.000 posts | ~USD 15 |
| Claude API (parsing de flyers) | ~5.000 imágenes | ~USD 25 |
| Twilio WhatsApp | ~100.000 mensajes | ~USD 500 |
| FCM (push) | Ilimitado | Gratis |
| Resend (email) | ~500.000 emails | ~USD 20 |
| Bright Data (proxies) | ~500GB | ~USD 150 |
| **Total IA + comunicaciones** | — | **~USD 710/mes** |

---

## Roadmap técnico

**Semanas 1–2 (Proof of Concept):**
- Scraper básico de Puntoticket.com
- Notificación por WhatsApp a número hardcodeado cuando aparece evento nuevo
- Demostrar el flujo end-to-end

**Mes 1–2 (MVP):**
- Scraping de top 10 cuentas de IG de productoras chilenas
- Parser Claude API para texto de posts
- Base de datos PostgreSQL con eventos indexados
- App React Native básica: onboarding → seguir artistas → recibir notificaciones
- Push + WhatsApp + email funcionando

**Mes 3–4:**
- Vision AI para flyers en imagen
- Spotify OAuth para importar artistas automáticamente
- Motor de recomendación básico por género (embeddings)
- Dashboard interno de calidad de datos

**Mes 5–6:**
- Collaborative filtering básico
- B2B: productoras pueden publicar eventos directamente
- Setlist.fm integration para pre-show intel
