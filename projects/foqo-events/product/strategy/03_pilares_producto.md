# Riff — Pilares del Producto
> Documento de producto · Foqo · Marzo 2026

---

## Los 5 pilares

Cada feature, cada decisión de diseño y cada prioridad de ingeniería en Riff debe responder a uno de estos cinco pilares. Si algo no cabe en ninguno, probablemente no pertenece al producto.

---

## Pilar 1 — INTELIGENCIA
### *"Riff sabe lo que te gusta antes de que se lo cuentes."*

El corazón técnico del producto. Riff procesa constantemente miles de fuentes de datos — Instagram de productoras, páginas de venues, redes sociales, ticketeras — y convierte ese ruido en información limpia y estructurada.

**Qué incluye:**
- Motor de scraping en tiempo real (Playwright + proxies)
- Parser con Claude API para extraer eventos desde texto e imágenes (flyers)
- Enriquecimiento con Spotify API (géneros, artistas similares, popularidad)
- Motor de recomendación por género y mood (embeddings + collaborative filtering)
- Detección de artistas locales independientes que no están en plataformas globales

**Cómo se mide:**
- % de eventos indexados vs eventos reales realizados en Chile
- Precisión del parser (eventos correctamente extraídos sin errores)
- Relevancia de recomendaciones (CTR de eventos sugeridos vs seguidos)

**Principio rector:**
> La inteligencia de Riff debe ser invisible para el usuario. Él solo ve la magia — el concierto correcto en el momento correcto.

---

## Pilar 2 — ANTICIPACIÓN
### *"Riff te avisa antes de que sea tarde."*

El pilar que resuelve el dolor central. No alcanza con tener la información — hay que entregarla en el momento preciso: cuando aún hay entradas, cuando el usuario tiene tiempo de planificar, cuando la emoción de ir todavía es posible.

**Qué incluye:**
- Sistema de notificaciones omnicanal: push + WhatsApp + email
- Timing inteligente: mínimo 72–96 horas antes del evento
- Alerta de presale: cuando salen las entradas, antes de que se agoten
- Alerta de últimas entradas: cuando queda menos del 20% del aforo
- Personalización de canal: el usuario elige dónde quiere recibir sus alertas
- Frecuencia controlada: máximo 2–3 notificaciones por semana para no saturar

**Cómo se mide:**
- % de notificaciones enviadas antes de sold out (objetivo: >95%)
- Tiempo promedio entre anuncio de evento y notificación al usuario (objetivo: <2 horas)
- Tasa de apertura de notificaciones (objetivo: >40%)
- % de usuarios que desactivan notificaciones (objetivo: <10%)

**Principio rector:**
> Una notificación que llega cuando las entradas ya se agotaron es peor que ninguna. La anticipación es una promesa — y Riff no puede romperla.

---

## Pilar 3 — PERSONALIZACIÓN
### *"Riff no te manda un concierto de reggaeton si solo escuchas hardcore."*

El filtro que convierte un agregador genérico en un asistente personal. La personalización opera en dos niveles: el explícito (artistas que el usuario sigue) y el implícito (géneros, mood, comportamiento dentro de la app).

**Qué incluye:**
- Onboarding por artistas favoritos o géneros
- Importación automática de artistas desde Spotify OAuth
- Seguimiento explícito de artistas (como Bandsintown pero confiable)
- Recomendación por género: si sigues a Terror, Riff te sugiere eventos de bandas hardcore
- Recomendación por mood: "quiero algo con mucha energía este sábado"
- Perfil de gustos evolutivo: aprende con cada interacción
- Sin spam: cero notificaciones de artistas o géneros que no están en tu perfil

**Cómo se mide:**
- % de eventos notificados que el usuario marca como relevantes (objetivo: >70%)
- Diversidad de artistas/géneros en el perfil del usuario a 30 días (indicador de exploración)
- Conversión de eventos sugeridos vs seguidos

**Principio rector:**
> La relevancia es respeto. Cada notificación irrelevante es un abuso de la atención del usuario.

---

## Pilar 4 — EXPERIENCIA
### *"Ir a un concierto con Riff no empieza el día del show."*

El pilar que convierte a Riff de herramienta de notificaciones en compañero de la experiencia musical. Cubre el journey completo: descubrimiento → anticipación → el evento → el recuerdo.

**Qué incluye:**

*Pre-show:*
- Setlists históricos del artista (integración con setlist.fm)
- "Las 10 canciones más tocadas en esta gira"
- Historia y contexto del artista
- Playlist pre-show automática (integración con Spotify)
- Quiénes de tus amigos van al mismo evento
- Info práctica: cómo llegar al venue, horarios, qué llevar

*El día del show:*
- Check-in en el evento
- Timeline en vivo (setlist en tiempo real, si está disponible)

*Post-show:*
- "¿Cómo estuvo?" — review rápido
- Setlist real del show (crowdsourced)
- Fotos de otros asistentes
- "También te puede interesar" — próximo evento similar

*Historial:*
- Timeline visual de todos los conciertos asistidos
- Badges por hitos (10 artistas vistos, 5 géneros distintos, etc.)
- "Hace un año fuiste a [concierto]" — memoria musical

**Cómo se mide:**
- Engagement pre-show (% que usa features en los 7 días previos al evento)
- Retención post-show (% que abre la app en los 3 días después del evento)
- NPS post-experiencia

**Principio rector:**
> El concierto es el evento, pero la experiencia es mucho más grande. Riff existe en todos los momentos alrededor del show, no solo en la notificación.

---

## Pilar 5 — COMUNIDAD
### *"Riff es donde la gente que vive para la música se encuentra."*

El pilar de largo plazo y el motor de retención más poderoso. Las personas van a conciertos con otros — y Riff puede ser el lugar donde esas conexiones empiezan. También es el pilar que hace al producto defensible: una comunidad activa es imposible de copiar.

**Qué incluye:**

*Social básico (MVP):*
- Ver quiénes de tus contactos también van a un evento
- "Marcar interés" en un evento — señal social visible
- Compartir evento a WhatsApp/Instagram con 1 tap

*Social avanzado (Fase 2):*
- Grupos de asistencia: "Vamos juntos al Lollapalooza"
- Perfiles de usuario con historial de conciertos
- Reviews y ratings de conciertos
- Recomendaciones sociales: "Juan fue a este evento y le encantó"

*Comunidades por género (Fase 3):*
- Espacios de la escena hardcore, techno, reggaeton
- Artistas locales conectados directamente con su fanbase
- Rankings: "los más concerteros del mes"

**Cómo se mide:**
- % de usuarios con al menos 1 conexión social en la app (objetivo Fase 1: >20%)
- % de eventos compartidos externamente (objetivo: >15% de asistentes)
- Retención de usuarios con conexiones vs sin conexiones (diferencial esperado: +30%)

**Principio rector:**
> La música une a las personas. Riff es el lugar donde esa unión ocurre antes de llegar al venue.

---

## Cómo se relacionan los pilares

```
INTELIGENCIA
     ↓
(extrae y entiende eventos del mundo)
     ↓
PERSONALIZACIÓN ←→ ANTICIPACIÓN
(filtra lo relevante)  (entrega a tiempo)
     ↓
EXPERIENCIA
(acompaña antes, durante y después)
     ↓
COMUNIDAD
(crea lazos que retienen y hacen crecer)
```

Los primeros dos pilares (Inteligencia + Anticipación) son el **core del MVP** — sin ellos no hay producto. Personalización es el segundo nivel. Experiencia y Comunidad son los pilares que construyen defensibilidad y retención a largo plazo.

---

## Lo que NO es un pilar (y por qué)

**Ticketing propio:** Riff no es una ticketera. El negocio es la inteligencia y la relación con el usuario, no la transacción. Competir con Puntoticket nos haría perder foco y crear conflictos con aliados clave.

**Streaming de música:** Spotify existe. No competimos ahí. Vivimos en el espacio entre escuchar y vivir en vivo.

**Noticias musicales:** No somos un medio. El contenido en Riff existe para enriquecer la experiencia del evento, no para ser consumido por sí solo.
