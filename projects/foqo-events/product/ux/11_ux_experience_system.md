# Riff — Sistema de Experiencia UX

> **Concepto en una frase:** Riff es un radar emocional de conciertos — no te muestra listas, te hace *sentir* la urgencia de la noche que no puedes perderte.

> **En dos frases:** La experiencia de descubrir música en vivo debería sentirse como la noche misma: oscura, vibrante, con momentos de sorpresa que generan adrenalina. Riff no es un directorio de eventos — es un sistema de presión social y temporal que convierte el "quizás vaya" en "ya compré mi entrada".

---

## 1. Diagnóstico brutal del estado actual

### Qué funciona
- **Swipe-to-discover en onboarding**: buena intuición, genera engagement inmediato
- **Urgency Ticker con "EN VIVO" pulsante**: correcto instinto de urgencia
- **Vibes como taxonomía emocional**: mejor que géneros musicales puros
- **Cards con countdown**: good — el tiempo es el recurso escaso

### Qué NO funciona (y por qué no se siente premium)

| Problema | Impacto | Root cause |
|----------|---------|------------|
| **Todo es estático** | Se siente como un catálogo, no como algo vivo | No hay estado que cambie con el tiempo real |
| **Home = feed genérico** | "Para ti" sin explicar por qué = Eventbrite | Sin señales sociales ni contexto de relevancia |
| **No hay tensión narrativa** | No hay razón para volver hoy vs mañana | Sin sistema de escasez ni FOMO real |
| **Discover = Tinder clone** | El swipe es un commodity | No hay consecuencia del swipe — guardar no genera nada |
| **Perfil = lista muerta** | Solo muestra guardados, no identidad | No construye ego del usuario |
| **Interacciones planas** | Tap y scroll — nada más | Sin haptics, sin gestos diferenciados, sin sorpresa |
| **Tipografía monótona** | Todo el mismo peso visual | Sin jerarquía dramática |
| **Sin vida social** | Es una experiencia solitaria | Nadie más existe en la app |

---

## 2. Core Loop — El ciclo adictivo

El core loop actual es: **Abrir → Scroll → Guardar → ...nada**. Es un dead end.

### Core Loop rediseñado: **PULSE → DISCOVER → COMMIT → SHARE → PULSE**

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────┐    ┌──────────┐    ┌────────┐    │
│  │PULSE │───▶│ DISCOVER │───▶│ COMMIT │    │
│  │      │    │          │    │        │    │
│  │Abro y│    │Descubro  │    │Compro/ │    │
│  │siento│    │algo que  │    │Confirmo│    │
│  │que me│    │me mueve  │    │que voy │    │
│  │estoy │    │          │    │        │    │
│  │perdi-│    └──────────┘    └───┬────┘    │
│  │endo  │                        │         │
│  │algo  │    ┌──────────┐        │         │
│  │      │◀───│  SHARE   │◀───────┘         │
│  │      │    │          │                  │
│  └──────┘    │Mi crew   │                  │
│              │sabe que  │                  │
│              │voy       │                  │
│              └──────────┘                  │
└─────────────────────────────────────────────┘
```

**PULSE** = La app me genera urgencia cada vez que la abro
- Counters en tiempo real ("quedan 23 entradas", "47 personas van")
- El estado de la app cambia con la hora del día (de día = planificación, de noche = modo nocturno urgente)
- Notificación: "3 de tus amigos van a X tonight"

**DISCOVER** = El descubrimiento tiene consecuencias
- No es scroll infinito — es un "drop" diario de 5-7 eventos curados por AI
- Cada evento tiene un "match score" visible: "94% tu vibe"
- Las recomendaciones mejoran visiblemente con el uso

**COMMIT** = Guardar no es suficiente — comprometerse sí
- "Voy" vs "Me interesa" — dos niveles de compromiso
- "Voy" genera un ticket visual shareable (como un boarding pass)
- Countdown personal activo desde que confirmaste

**SHARE** = La validación social cierra el loop
- "X va a Y" aparece en el feed de amigos
- Grupos de "crew" para planificar noches
- Post-evento: fotos y memories compartidas

---

## 3. El momento WOW

El WOW actual (pantalla de éxito del onboarding) es débil — es un checklist.

### El WOW real debe ocurrir en 3 momentos:

**WOW #1 — "La noche me encontró" (Primer descubrimiento)**
- El usuario abre la app por primera vez después del onboarding
- La pantalla es oscura, solo vibración sutil del teléfono
- Se revela gradualmente un evento con un 95%+ match
- El evento ya está "happening" — es esta semana
- Animación: la card emerge del fondo como si saliera de la oscuridad
- Copy: "Encontramos algo para ti" (no "eventos recomendados")

**WOW #2 — "No estoy solo" (Primera señal social)**
- El usuario ve que alguien que conoce (o sigue) va al mismo evento
- "María y 47 personas van a Polyphia"
- La card se ilumina con un glow diferente — señal de actividad social

**WOW #3 — "Mi ticket" (Primer commit)**
- Cuando el usuario dice "Voy", se genera un ticket visual animado
- Estilo boarding pass con diseño generativo basado en el artista/género
- Haptic feedback intenso (notch) — se siente como un momento
- El countdown comienza: "Faltan 4 días, 7 horas"

---

## 4. ¿Qué hace única esta experiencia? — Posicionamiento vs competidores

| App | Modelo mental | Emoción dominante |
|-----|--------------|-------------------|
| **Spotify** | Biblioteca personal | Comfort, nostalgia |
| **TikTok** | Stream infinito | Dopamina, sorpresa |
| **Eventbrite** | Directorio/marketplace | Utilidad, planificación |
| **Songkick** | Tracker de artistas | Organización |
| **Dice** | Ticketera premium | Exclusividad |

### Riff = **Presión temporal + match emocional + validación social**

La emoción dominante de Riff es: **URGENCIA ANTICIPATORIA** — esa sensación de "si no actúo ahora, me lo pierdo, y mis amigos van a estar ahí sin mí".

No es FOMO genérico. Es FOMO *calculado*:
- Con datos reales (personas que van, tickets restantes)
- Con relevancia personal (match score, tu vibe)
- Con presión social (tu crew va)
- Con presión temporal (countdown)

---

## 5. Arquitectura de navegación rediseñada

### Actual: `Home | Discover | Profile` → Genérico, funcional, forgettable

### Propuesta: Un modelo de **estados temporales**, no de páginas

```
┌─────────────────────────────────────────────┐
│                                             │
│   TONIGHT          FOR YOU          MY SET  │
│   (urgente)        (curado)        (mío)    │
│                                             │
│   Lo que pasa      Mi daily drop   Mi       │
│   AHORA            de matches      lineup   │
│                                             │
└─────────────────────────────────────────────┘
```

#### Tab 1: **TONIGHT** (antes: "Home")
No es un feed estático. Es un **tablero de urgencia** que cambia con la hora:
- **Antes de las 14h**: "Esta semana" — vista calendario visual
- **14h-19h**: "Tonight" — eventos de hoy con countdown
- **19h-02h**: "Ahora" — modo oscuro profundo, solo lo que está pasando AHORA + lo que empieza en las próximas horas
- **02h-08h**: "Recap" — qué pasó anoche (fotos, highlights, quién fue)

Componentes clave:
- **Pulse Bar**: barra superior que pulsa con el heartbeat de la ciudad. Muestra actividad en tiempo real
- **Hero Event**: EL evento más relevante para ti ahora — una sola card gigante, no un carousel
- **Happening Now**: strip horizontal con dot rojo pulsante — eventos en curso
- **Your Crew**: mini avatares de amigos con sus planes de hoy

#### Tab 2: **FOR YOU** (antes: "Discover")
No es un swipe infinito. Es un **drop system**:
- Cada día a las 11am recibes entre 3-7 eventos curados
- Se presentan como un **stack** que se revela uno a uno
- Cada card tiene: match score, razón del match ("porque te gusta el techno"), social proof
- Cuando se acaban los del día: "Mañana a las 11am — nuevo drop"
- Esto genera: **razón para volver, escasez artificial, anticipación**

Interacción: en vez de swipe binario (guardar/pasar), un **triple gesture**:
- **Swipe up** = "VOY" (commit)
- **Swipe right** = "Me interesa" (soft save)
- **Swipe left** = Skip
- **Long press** = Ver detalle sin comprometerse

#### Tab 3: **MY SET** (antes: "Profile")
No es una lista de guardados. Es tu **identidad musical en vivo**:
- **Lineup**: tus próximos eventos como un poster de festival personal
- **Taste DNA**: visualización de tu perfil (géneros, vibes, horarios preferidos)
- **Stats**: eventos este mes, artistas descubiertos, dinero en entries
- **Crew**: tu grupo de amigos y sus overlaps de gusto
- **Memories**: fotos/check-ins de eventos pasados

---

## 6. Interacciones clave rediseñadas

### 6.1 Descubrimiento: **The Daily Drop**

```
Estado inicial (cerrado):
┌─────────────────────────┐
│                         │
│    ╔═══════════════╗    │
│    ║  5 NUEVOS     ║    │  ← Stack visual con número
│    ║  MATCHES      ║    │
│    ║  ────────     ║    │
│    ║  Tap to       ║    │
│    ║  reveal       ║    │
│    ╚═══════════════╝    │
│                         │
│   Disponible hasta      │
│   mañana 11am           │
│                         │
└─────────────────────────┘

Al tocar → se despliega la primera card con animación de "unboxing":
- La card emerge con spring animation
- Blur del fondo se intensifica
- Haptic feedback sutil
- Match score se anima contando: 0% → 94%
```

### 6.2 Guardar vs Comprometerse: **Two-tier system**

| Acción | Gesto | Feedback | Resultado |
|--------|-------|----------|-----------|
| **Me interesa** | Swipe right | Vibración suave, card se ilumina naranja | Va a "Watchlist" |
| **VOY** | Swipe up | Vibración fuerte, confetti, ticket se genera | Va a "My Lineup", se notifica a crew |
| **Skip** | Swipe left | Nada — la card se desvanece | No aparece de nuevo (por ahora) |

### 6.3 FOMO Engine: **Presión inteligente**

No FOMO genérico. FOMO con data real:

- **Ticker de entradas**: "Quedan 23 de 500" (barra visual que se vacía)
- **Social proof en tiempo real**: "12 personas guardaron esto en la última hora"
- **Crew alerts**: "María acaba de confirmar que va" → push notification
- **Price urgency**: "Precio sube en 2 días" (si hay early bird)
- **Scarcity gradient**: la card cambia de color/intensidad mientras se agotan las entradas
  - Verde: abundante
  - Amarillo: llenándose
  - Rojo pulsante: últimas entradas

### 6.4 El Ticket como objeto: **Boarding Pass**

Cuando dices "VOY":
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │  ▓ [GENERATIVE ART       ▓   │   │  ← Arte generado por
│  │  ▓  basado en género]     ▓   │   │     el género del evento
│  │  ▓                        ▓   │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │                               │   │
│  │  POLYPHIA                     │   │
│  │  Live in Santiago             │   │
│  │  ─────────────────────────    │   │
│  │  📍 Teatro Caupolicán        │   │
│  │  📅 Sáb 12 Abr · 20:00      │   │
│  │                               │   │
│  │  ┌─────┐  ← Countdown       │   │
│  │  │4d 7h│    en tiempo real   │   │
│  │  └─────┘                     │   │
│  │                               │   │
│  │  - - - - - - - - - - - - -    │   │  ← Línea de corte
│  │                               │   │
│  │  [QR / Share button]          │   │
│  │  "Comparte con tu crew"       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

Este ticket es:
- **Shareable**: se puede enviar como imagen a WhatsApp/Instagram Stories
- **Dinámico**: el countdown se actualiza
- **Social**: muestra quién más va (avatares)
- **El artefacto central del loop** — no es un botón de "guardar", es un objeto que quieres mostrar

### 6.5 Modo Nocturno Automático: **Night Shift**

La app cambia su personalidad con la hora:

| Hora | Modo | Cambios |
|------|------|---------|
| 08-14h | **Day** | Colores más legibles, layout de planificación, "esta semana" |
| 14-19h | **Sunset** | Transición gradual, "Tonight" empieza a pulsar |
| 19-02h | **Night** | Fondo negro profundo, glows intensos, tipografía más grande, "AHORA" domina |
| 02-08h | **After** | Modo calm, recap, "¿cómo estuvo la noche?" |

Esto no es un dark mode toggle. Es la app VIVIENDO al ritmo de la ciudad.

---

## 7. Principios visuales

### 7.1 Dirección de arte: **"Club a las 2am con iPhone en la mano"**

No es "oscuro minimalista" (ya lo hacen todos). Es **oscuro con focos de luz que guían tu atención**.

Piensa en cómo se ve la realidad en un club:
- Fondo negro/casi negro
- Focos de color intenso que iluminan momentos
- Humo/blur que genera profundidad
- Luces que pulsan con el ritmo

#### Principio visual #1: **Spotlight, not flood**
- El fondo siempre es profundamente oscuro (`#06060E` — más oscuro que el actual)
- Solo 1-2 elementos en pantalla tienen color/luz intensa
- Los glows no son decoración — señalizan urgencia y relevancia
- Más relevante = más luminoso

#### Principio visual #2: **Time-based materiality**
- Las cards de eventos cercanos en el tiempo tienen más "energía visual" (glows, animaciones)
- Eventos lejanos son más opacos, como carteles en la distancia
- Eventos pasados se desaturan completamente → "memories"

#### Principio visual #3: **Motion as meaning**
- Nada se mueve sin razón
- Pulsar = algo está vivo/en curso
- Spring = respuesta a tu acción
- Fade in = contenido nuevo llegando
- Shake = urgencia (últimas entradas)

### 7.2 Tipografía

**Display Font:** Space Grotesk (ya la tienes) — pero usarla con más dramatismo:
- Títulos principales: **48-64px, weight 700, tracking -0.04em** → headlines de festival
- No usar tamaños medios para títulos — o es GRANDE o es small
- Crear tensión con la escala: el nombre del artista debe ocupar espacio como un poster

**Body Font:** Inter — funcional, legible

**Jerarquía dramática:**
```
POLYPHIA                    ← 48px, Bold, white
Live in Santiago            ← 14px, Medium, white/60%
Teatro Caupolicán           ← 13px, Regular, white/40%
────────────────
Sáb 12 Abr · 20:00        ← 12px, Bold, accent
En 4 días                   ← 11px, Bold, amber (urgencia)
```

El ratio entre headline y body debe ser al menos **3:1** — esto genera el efecto "poster".

### 7.3 Color system

```
FONDO
──────
#06060E     ← Primary background (más negro que el actual #0A0A12)
#0C0C18     ← Surface 1
#12122A     ← Surface 2
#1A1A38     ← Surface 3 (elevated)

ACCENT SYSTEM (no uno, tres)
────────────────────────────
#8B5CF6     ← Primary accent (purple, ligeramente más saturado)
#F59E0B     ← Urgency accent (amber — countdown, FOMO)
#22C55E     ← Live/happening accent (green)

GLOW SYSTEM
───────────
Cada accent tiene su glow correspondiente:
- Purple glow: tu match, tu perfil, tus acciones
- Amber glow: urgencia temporal, precios, countdowns
- Green glow: live, en curso, confirmado

ESTADO DE URGENCIA (la card cambia)
────────────────────────────────────
Lejano:     border: rgba(139, 92, 246, 0.10)  ← casi invisible
Esta semana: border: rgba(139, 92, 246, 0.25)
Tomorrow:    border: rgba(245, 158, 11, 0.35) + amber glow sutil
Tonight:     border: rgba(245, 158, 11, 0.60) + amber glow fuerte
NOW:         border: rgba(34, 197, 94, 0.70) + green glow + pulse animation
```

### 7.4 Motion design

```css
/* Springs — para acciones del usuario */
--spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);  /* botones, cards */
--spring-smooth: cubic-bezier(0.22, 1.0, 0.36, 1);    /* transiciones de pantalla */

/* Eases — para animaciones del sistema */
--ease-urgent: cubic-bezier(0.55, 0, 0.1, 1);         /* countdowns, tickers */
--ease-reveal: cubic-bezier(0, 0, 0.2, 1);            /* revelar contenido */

/* Durations por contexto */
--dt-tap: 100ms;         /* feedback inmediato */
--dt-transition: 300ms;  /* cambio de vista */
--dt-reveal: 500ms;      /* revelar card/drop */
--dt-ambient: 2000ms;    /* pulsos, breathing */
```

**Regla de oro del motion en Riff:**
- Si es respuesta a tu dedo → spring, < 200ms
- Si es el sistema mostrándote algo → ease-out, 300-500ms
- Si es ambiente/urgencia → loop suave, 1500-2500ms

### 7.5 Haptics (iOS)

| Acción | Haptic | Por qué |
|--------|--------|---------|
| Tap en card | `impact(.light)` | Feedback básico |
| Swipe "Me interesa" | `impact(.medium)` | Confirmación |
| Swipe "VOY" | `notificationSuccess` + `impact(.heavy)` | MOMENTO — se siente irreversible |
| Countdown llega a 0 | `notificationWarning` | ¡Es ahora! |
| Daily drop disponible | `impact(.rigid)` × 3 (staccato) | Como un knock en la puerta |

---

## 8. Ideas radicales — Lo que nadie hace

### 8.1 **"The Pulse" — Heartbeat de la ciudad**
Una línea de actividad en tiempo real en la parte superior de la app que muestra el ritmo de la ciudad. Cuando hay muchos eventos simultáneos, pulsa más rápido. Cuando la ciudad está tranquila, late lento. Es el vital sign de la escena musical local.

Implementación: una línea con waveform sutil que se anima. El grosor y velocidad de la onda reflejan la cantidad de eventos activos / personas comprando entradas en este momento.

### 8.2 **"Taste DNA" — Tu fingerprint musical**
En vez de una lista de géneros, un visualización generativa única para cada usuario. Imagina un patrón orgánico tipo:
- Si te gusta el techno → patrones geométricos, rígidos
- Si te gusta el jazz → formas fluidas, orgánicas
- Si eres ecléctico → caos hermoso

Esto se muestra en tu perfil y es compartible. "Mi taste DNA" como un NFT visual de tu identidad musical.

### 8.3 **"Ghost Mode" — Explorar sin compromiso**
Para el usuario que quiere navegar sin que nadie sepa. Un toggle que desactiva las señales sociales. Simple pero poderoso — le da control y privacidad al usuario.

### 8.4 **"Afterglow" — El post-evento**
24h después de un evento, la app te pregunta: "¿Cómo estuvo?" con una interfaz minimal:
- Un slider de emoji (🔥 → 💀)
- Opción de subir 1-3 fotos
- Esto alimenta las recomendaciones futuras
- Las fotos de todos los asistentes crean un mosaico compartido del evento

### 8.5 **"Sound Check" — Preview audio**
Un clip de 15s del artista que suena cuando mantienes presionado un evento. No como un player — como un aperitivo sensorial. El audio tiene un efecto de "sala" (reverb) que simula cómo sonaría EN el venue.

### 8.6 **"Sold Out Graveyard" — Lo que te perdiste**
Una sección que muestra eventos sold out a los que no fuiste. Suena cruel, pero es el FOMO más efectivo que existe. "Esto se agotó ayer — la próxima vez, actúa más rápido."

---

## 9. Resumen ejecutivo para implementación

### Prioridad 1 — Quick wins (1-2 semanas)
1. **Oscurecer el fondo** a `#06060E` y aumentar contraste de glows
2. **Tipografía dramática** — headlines a 48px, ratio 3:1 con body
3. **Time-aware UI** — cambiar header/hero según hora del día
4. **Triple gesture en discover** — up/right/left en vez de solo right/left
5. **Haptic feedback** en todas las acciones

### Prioridad 2 — Core differentiators (2-4 semanas)
6. **Daily Drop** — sistema de drops diarios en vez de feed infinito
7. **"VOY" vs "Me interesa"** — two-tier commitment
8. **Ticket/Boarding Pass** generado al confirmar
9. **Match Score** visible en cada card
10. **Scarcity gradient** — cards que cambian con la urgencia

### Prioridad 3 — Social layer (4-8 semanas)
11. **Crew system** — grupos de amigos
12. **Social proof** en cards ("María + 47 van")
13. **Afterglow** — post-evento memories
14. **Taste DNA** — visualización de perfil
15. **The Pulse** — heartbeat de la ciudad

---

## 10. Métricas de éxito

| Métrica | Actual (estimado) | Target |
|---------|-------------------|--------|
| DAU/MAU ratio | ~15% | 40%+ |
| Eventos guardados/sesión | 1-2 | 3-5 |
| Conversión guardar → comprar ticket | ~5% | 20% |
| Sessions/día por usuario activo | 1 | 2.5+ (mañana + noche) |
| Tiempo en app/sesión | 2-3 min | 5-8 min |
| Invitaciones enviadas/usuario/mes | 0 | 3+ |
| Retención D7 | ~20% | 45% |

La estrella norte: **"¿Cuántas noches a la semana Riff es la razón por la que alguien sale?"**
Target: al menos 1 de cada 3 salidas a conciertos fue influenciada por Riff.
