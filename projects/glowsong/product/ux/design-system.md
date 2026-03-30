# Glowsong — Design System & UX Specification
**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Audiencia:** Diseñadores, ingenieros frontend, Claude Code
**Propósito:** Este documento es la fuente de verdad para toda decisión visual, de interacción y de experiencia de usuario en Glowsong MVP 1. Ninguna pantalla se construye sin haberlo leído.

---

## ⚠️ Instrucciones para Claude Code

1. **Este documento define el HOW visual.** Los PRD-S definen el QUÉ. Nunca hay contradicción — si la hay, este documento gana en todo lo visual.
2. **Los tokens de diseño son variables CSS.** No hardcodear colores, tipografías ni espaciados. Usar los nombres de variables definidos en la Sección 3.
3. **Dark mode es el único modo.** No hay light mode en Glowsong MVP 1. No construir variantes claras.
4. **Mobile-first es obligatorio.** Diseñar primero para 375px, luego escalar. No al revés.
5. **Los valores de latencia no son aspiracionales, son requerimientos.** Si una acción tarda más que el límite definido, es un bug.
6. **Cada estado tiene diseño.** Vacío, cargando, error, éxito — todos definidos. No usar el estado "default" para estados especiales.

---

## Tabla de Contenidos

1. Filosofía de Diseño
2. Identidad Visual y Principios
3. Design Tokens (Sistema de Variables)
4. Tipografía
5. Iconografía
6. Componentes Base
7. Patrones de Interacción
8. Arquitectura de Pantallas (MVP 1)
9. Especificaciones del Dashboard (F3)
10. Especificaciones del Onboarding (F1)
11. Motion & Animación
12. Accesibilidad
13. Estados del Sistema
14. Responsive Design
15. Checklist de Implementación

---

## 1. Filosofía de Diseño

### El Principio Rector

> **"Glowsong debe sentirse como el mejor bartender del mundo: presente cuando lo necesitas, invisible cuando no, y siempre haciendo que el ambiente sea el correcto."**

Glowsong es una herramienta operacional que vive en uno de los ambientes más exigentes para el diseño: un bar, a medianoche, con el Owner de pie detrás de la barra, teléfono en mano, clientes enfrente y música de fondo. El diseño no puede fallar en ese contexto.

### Los Tres Valores de Experiencia

#### 1. Claridad Radical
En un ambiente oscuro y ruidoso, cada pixel tiene que justificar su existencia. La información innecesaria es ruido. Si algo no ayuda al Owner a saber qué está sonando, controlarlo, o cambiarlo — no debe estar en pantalla.

**Principio aplicado:** Un vistazo de 2 segundos debe responder las preguntas críticas. Si el Owner tiene que buscar la información, el diseño falló.

#### 2. Confianza a través de Respuesta Inmediata
El Owner no tiene tiempo para dudar si su tap funcionó. Cada acción necesita confirmación visual inmediata — antes de que el servidor responda. La confianza se construye acción a acción, tap a tap.

**Principio aplicado:** Feedback optimista primero, sincronización después. El botón cambia de estado al instante del tap. Si la acción falla, se revierte con explicación clara.

#### 3. Carácter sin Esfuerzo
Glowsong debe tener personalidad visual que comunique que fue pensado para el mundo nocturno y musical — sin que esa personalidad agregue fricción. Un Owner que muestra el Dashboard a un cliente debe sentir que refleja el nivel de su local.

**Principio aplicado:** El diseño es oscuro, warm, con micro-detalles de calidad. No minimalismo frío. No dashboard corporativo. Nightlife professional.

---

## 2. Identidad Visual y Principios

### La Metáfora Visual: "Luz en la Oscuridad"

El nombre "Glowsong" define la estética. Un glow es una luz cálida que no enceguece — ilumina lo esencial. Eso es exactamente lo que debe hacer la interfaz: iluminar la información crítica sobre un fondo oscuro, con calidez, sin agresividad.

**Las tres capas visuales de Glowsong:**

```
[FONDO]         → Negro profundo. El espacio. La oscuridad del local.
[SUPERFICIES]   → Gris muy oscuro con tono azulado. Cards, panels. El escenario.
[LUZ]           → Dorado ámbar. El glow. Los elementos que importan.
```

### Personalidad de Marca en Diseño

| Atributo | Cómo se Manifiesta |
|---|---|
| **Profesional** | Tipografía limpia, grid consistente, sin inconsistencias |
| **Nocturno** | Dark mode, colores cálidos, sin blancos puros |
| **Musical** | La portada del álbum como elemento protagonista |
| **Local / Latinoamericano** | Español nativo (no traducido), referencias culturales |
| **Control** | Botones grandes, estados claros, feedback inmediato |
| **Invisible** | El algoritmo no se muestra — solo sus resultados |

---

## 3. Design Tokens (Sistema de Variables)

> **Para Claude Code:** Implementar como variables CSS custom properties (`:root { --color-bg: ... }`). Nunca usar valores hardcodeados en componentes. Si un valor no tiene variable, crear la variable antes de usarlo.

### 3.1 Color Palette

```css
:root {
  /* === BACKGROUNDS === */
  --color-bg-primary:        #080810;  /* Fondo base de toda la app */
  --color-bg-secondary:      #10101C;  /* Fondo de secciones/panels */
  --color-surface-1:         #16162A;  /* Surface de cards principales */
  --color-surface-2:         #1E1E35;  /* Surface de cards secundarias */
  --color-surface-3:         #252540;  /* Hover state de surfaces */
  --color-border:            #2A2A45;  /* Borders sutiles entre elementos */
  --color-border-active:     #4A4A7A;  /* Border de elementos en foco */

  /* === BRAND / ACCENT === */
  --color-accent-gold:       #C8A96E;  /* Dorado ámbar — el "glow" principal */
  --color-accent-gold-light: #E2C89A;  /* Versión clara del dorado (hover, highlights) */
  --color-accent-gold-dim:   #7A6540;  /* Dorado atenuado (elementos secundarios) */
  --color-accent-purple:     #7B61FF;  /* Violeta eléctrico — energía nocturna */
  --color-accent-purple-dim: #4A3A99;  /* Violeta atenuado */

  /* === SEMANTIC === */
  --color-success:           #22C55E;  /* Activo, connected, sonando ✓ */
  --color-success-dim:       #166534;  /* Success atenuado (backgrounds) */
  --color-warning:           #F59E0B;  /* Advertencias, estados intermedios */
  --color-error:             #F87171;  /* Errores, bloqueos críticos */
  --color-error-dim:         #7F1D1D;  /* Error background */
  --color-info:              #60A5FA;  /* Información neutral */

  /* === TEXT === */
  --color-text-primary:      #F0F0F8;  /* Texto principal — no blanco puro */
  --color-text-secondary:    #8A8A9E;  /* Texto secundario, labels */
  --color-text-tertiary:     #4A4A6A;  /* Texto muy sutil, placeholders */
  --color-text-disabled:     #333355;  /* Elementos deshabilitados */
  --color-text-on-accent:    #0A0A1A;  /* Texto sobre fondo dorado/accent */

  /* === OVERLAY === */
  --color-overlay-subtle:    rgba(255, 255, 255, 0.04);
  --color-overlay-medium:    rgba(255, 255, 255, 0.08);
  --color-overlay-strong:    rgba(0, 0, 0, 0.60);
  --color-scrim:             rgba(8, 8, 16, 0.85);  /* Para modals y bottom sheets */
}
```

### 3.2 Tipografía: Escala y Variables

```css
:root {
  /* === FONT FAMILIES === */
  --font-display:   'Clash Display', 'DM Serif Display', Georgia, serif;
  --font-body:      'Inter', 'DM Sans', -apple-system, sans-serif;

  /* === FONT SIZES (escala modular 1.25) === */
  --text-xs:   0.75rem;   /* 12px — Labels, captions */
  --text-sm:   0.875rem;  /* 14px — Body small, metadata */
  --text-base: 1rem;      /* 16px — Body estándar */
  --text-lg:   1.125rem;  /* 18px — Body large, subtítulos */
  --text-xl:   1.25rem;   /* 20px — Títulos pequeños */
  --text-2xl:  1.5rem;    /* 24px — Títulos de sección */
  --text-3xl:  1.875rem;  /* 30px — Títulos de pantalla */
  --text-4xl:  2.25rem;   /* 36px — Display, nombre del track */

  /* === FONT WEIGHTS === */
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;

  /* === LINE HEIGHTS === */
  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  /* === LETTER SPACING === */
  --tracking-tight:  -0.02em;
  --tracking-normal:  0em;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.1em;   /* Para labels en uppercase */
}
```

### 3.3 Spacing System (8px base grid)

```css
:root {
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### 3.4 Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-full: 9999px;  /* Chips, pills, badges */
}
```

### 3.5 Shadows y Glows

```css
:root {
  /* Sombras para profundidad de cards */
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg:  0 8px 32px rgba(0, 0, 0, 0.6);

  /* El "glow" característico de Glowsong */
  --glow-gold:   0 0 20px rgba(200, 169, 110, 0.25),
                 0 0 60px rgba(200, 169, 110, 0.10);
  --glow-purple: 0 0 20px rgba(123, 97, 255, 0.30),
                 0 0 60px rgba(123, 97, 255, 0.12);
  --glow-green:  0 0 16px rgba(34, 197, 94, 0.35);

  /* Glow para el botón de acción primario */
  --glow-btn-primary: 0 4px 20px rgba(200, 169, 110, 0.40);
}
```

### 3.6 Motion / Durations

```css
:root {
  --duration-instant:  80ms;   /* Feedback de tap, hover */
  --duration-fast:     150ms;  /* Micro-animaciones UI */
  --duration-normal:   250ms;  /* Transiciones estándar */
  --duration-slow:     400ms;  /* Transiciones de pantalla, modals */
  --duration-veryslow: 600ms;  /* Animaciones de entrada de página */

  --ease-snappy: cubic-bezier(0.4, 0, 0.2, 1);  /* Material-like, usada para la mayoría */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring para botones presionados */
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);    /* Para elementos que entran a pantalla */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);    /* Para elementos que salen de pantalla */
}
```

---

## 4. Tipografía

### Uso por Contexto

| Elemento | Fuente | Size | Weight | Color | Ejemplo |
|---|---|---|---|---|---|
| Nombre del track (hero) | `--font-body` | `--text-3xl` | Bold | `--color-text-primary` | "Uptown Funk" |
| Artista del track (hero) | `--font-body` | `--text-xl` | Medium | `--color-accent-gold` | "Bruno Mars" |
| Títulos de sección | `--font-body` | `--text-2xl` | Semibold | `--color-text-primary` | "Sonando Ahora" |
| Labels de UI | `--font-body` | `--text-xs` | Semibold | `--color-text-secondary` | "SIGUIENTE" |
| Nombres en cola | `--font-body` | `--text-sm` | Medium | `--color-text-primary` | "Happy" |
| Artistas en cola | `--font-body` | `--text-sm` | Regular | `--color-text-secondary` | "Pharrell Williams" |
| Tiempo restante | `--font-body` | `--text-base` | Semibold | `--color-text-secondary` | "2:15" |
| Botones primarios | `--font-body` | `--text-base` | Semibold | `--color-text-on-accent` | "Conectar Spotify" |
| Botones secundarios | `--font-body` | `--text-base` | Medium | `--color-text-primary` | "Cancelar" |
| Toast / notificación | `--font-body` | `--text-sm` | Regular | `--color-text-primary` | "Artista bloqueado" |
| Nombre del app (header) | `--font-display` | `--text-2xl` | Bold | `--color-accent-gold` | "Glowsong" |

### Reglas de Tipografía

1. **Nunca usar pesos menores a 400** en texto sobre fondos oscuros. A baja luminosidad, los pesos light son ilegibles.
2. **Los labels de categoría van en uppercase** con `--tracking-wider`. Ejemplo: "SONANDO AHORA", "SIGUIENTE EN COLA".
3. **Truncar con ellipsis**, no con text-wrap inesperado. Nombres de track: 2 líneas máximo. Artistas: 1 línea máximo.
4. **El nombre del track en la tarjeta principal** es el elemento visual más prominente de toda la app. Nunca debe ser más pequeño que `--text-2xl`.

---

## 5. Iconografía

### Sistema de Iconos

Usar **Lucide Icons** (sistema open-source, consistente, bien mantenido). SVG inline para control total sobre color y tamaño.

| Icono Lucide | Uso en Glowsong | Tamaño |
|---|---|---|
| `skip-forward` | Botón Skip | 24px |
| `pause` | Botón Pause | 24px |
| `play` | Botón Play | 24px |
| `more-horizontal` | Menú de acciones en tarjeta | 20px |
| `ban` | Bloquear track/artista | 18px |
| `settings` | Acceso a Configuración | 22px |
| `music` | Estado vacío / sin track | 32px |
| `wifi-off` | Sin conexión | 24px |
| `bluetooth` | Dispositivo Spotify | 20px |
| `check-circle` | Confirmación de acción | 20px |
| `x-circle` | Error / eliminar bloqueo | 16px |
| `chevron-right` | Navegación, "ver más" | 16px |
| `clock` | Tiempo restante, bloqueo temporal | 14px |

### Reglas de Iconografía

1. **Alineación óptica, no matemática.** Los íconos deben sentirse centrados visualmente, no solo numéricamente.
2. **Stroke width consistente:** usar `strokeWidth={1.5}` como default en Lucide.
3. **No usar íconos sin label** en acciones críticas — solo para elementos ornamentales o cuando el contexto es absolutamente inequívoco.

---

## 6. Componentes Base

### 6.1 Botón Primario — Acción Principal

El botón primario de Glowsong tiene una personalidad definida: es cálido, tiene peso visual, y responde al toque de forma satisfactoria.

```
Anatomía:
[     ←16px→ [Icono opcional 18px] [Label — semibold 16px] ←16px→     ]

Estado Default:
  - Background: var(--color-accent-gold)
  - Text: var(--color-text-on-accent)
  - Border-radius: var(--radius-full)
  - Box-shadow: var(--glow-btn-primary)
  - Padding: 14px 24px
  - Min-height: 52px (área táctil para mobile)

Estado Hover (desktop):
  - Background: var(--color-accent-gold-light)
  - Transform: translateY(-1px)
  - Transition: var(--duration-fast) var(--ease-snappy)

Estado Active/Pressed:
  - Transform: scale(0.97) translateY(1px)
  - Box-shadow: none
  - Transition: var(--duration-instant) var(--ease-spring)

Estado Loading:
  - Background: var(--color-accent-gold-dim)
  - Spinner reemplaza al label
  - Pointer-events: none

Estado Disabled:
  - Background: var(--color-surface-2)
  - Text: var(--color-text-disabled)
  - Box-shadow: none
  - Cursor: not-allowed
```

### 6.2 Botón de Control — Skip y Pause/Play

Los botones de control del Dashboard son especiales: grandes área táctil, diseño circular, feedback háptico.

```
Anatomía: [Círculo 72px × 72px con icono 28px centrado]

Estado Default — Skip:
  - Background: var(--color-surface-2)
  - Border: 1px solid var(--color-border)
  - Icon color: var(--color-text-primary)

Estado Default — Pause (activo, reproduciendo):
  - Background: var(--color-accent-gold) con opacidad 15%
  - Border: 1px solid var(--color-accent-gold)
  - Icon color: var(--color-accent-gold)
  - Box-shadow: var(--glow-gold) 

Estado Pressed (ambos):
  - Transform: scale(0.92)
  - Transition: var(--duration-instant) var(--ease-spring)
  - Haptic feedback: vibrate(25ms) si está disponible

CRÍTICO: El área táctil real es 72×72px mínimo. 
No reducir por ningún motivo de diseño.
```

### 6.3 Tarjeta "Sonando Ahora" (Now Playing Card)

El componente más importante de toda la aplicación.

```
Anatomía (375px viewport):

┌─────────────────────────────────────────┐
│ LABEL: "SONANDO AHORA"  [... menú]      │  ← 16px horizontal padding
│                                         │
│  ┌──────┐  Nombre del Track             │
│  │ ART  │  Artista                      │
│  │ 88px │                              │
│  └──────┘                              │  ← Album art 88×88px, radius-lg
│                                         │
│  [═══════════════════════>]   2:15      │  ← Progress bar + tiempo restante
└─────────────────────────────────────────┘

Surface: var(--color-surface-1)
Border: 1px solid var(--color-border)
Border-radius: var(--radius-xl)
Padding: 20px
Box-shadow: var(--shadow-lg)

Album Art:
  - Border-radius: var(--radius-md)
  - Si no hay imagen: placeholder con icono music sobre --color-surface-2
  - Aspect ratio: 1:1 siempre

Progress Bar:
  - Track (fondo): var(--color-surface-3) height: 3px
  - Fill (progreso): linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-purple))
  - La animación del fill es via JS con requestAnimationFrame — no CSS transition
  - Border-radius: var(--radius-full)

Menú de acciones ("..."):
  - Icono: more-horizontal 20px
  - Color: var(--color-text-secondary)
  - Al tocar: bottom sheet con opciones de bloqueo

Estado Pausado:
  - Album art: overlay con var(--color-overlay-strong) + icono pause 32px centrado
  - Progress bar: no animado
  - Label cambia a: "PAUSADO"
  - Todo el texto: var(--color-text-secondary)
```

### 6.4 Item de Cola (Queue Item)

```
Anatomía:
[Album 40×40px] [Track name  ] [Artista     ] [Nro de posición]
                 semibold sm    regular sm     text-tertiary xs

Spacing entre items: var(--space-3)
Al presionar: surface cambia a --color-surface-3 (efecto pressed)
Sin acciones secundarias en los items de cola (MVP 1)
```

### 6.5 Bottom Sheet (Módal de acciones)

```
Contexto de uso: Menú "..." en la tarjeta Now Playing, confirmaciones

Anatomía:
  - Scrim: var(--color-scrim) — toca fuera para cerrar
  - Sheet: var(--color-surface-1), border-radius: radius-2xl radius-2xl 0 0
  - Handle bar: 4px × 36px, var(--color-border), centrado, margin-top: 12px
  - Opciones: lista de items con padding 18px 20px, separados por border

Animación entrada:
  - translateY(100%) → translateY(0)
  - Duration: var(--duration-slow)
  - Ease: var(--ease-out)

Opciones de bloqueo en NOW PLAYING:
  [🚫 Bloquear esta canción]      → crea Block type=track, scope=permanent
  [🚫 Bloquear este artista]      → crea Block type=artist, scope=permanent
  [✕ Cancelar]                    → cierra el sheet
```

### 6.6 Toast / Notificación

```
Posición: Fija, top: 16px, centrada horizontalmente
Max-width: calc(100% - 32px)

Anatomía: [Icono 16px] [Texto en --text-sm] [Botón "Deshacer" opcional]

Variantes:
  Success: border-left 3px solid --color-success + icono check-circle
  Error:   border-left 3px solid --color-error + icono x-circle  
  Info:    border-left 3px solid --color-info + icono info

Surface: var(--color-surface-2)
Border-radius: var(--radius-md)
Padding: 12px 16px
Box-shadow: var(--shadow-lg)

Auto-dismiss: 4 segundos
Animación entrada: translateY(-100%) → translateY(0), opacity 0 → 1
Animación salida: translateY(-100%), opacity → 0

Máximo 1 toast visible a la vez. El segundo hace queue.
```

### 6.7 Genre Chip (Selector de Géneros)

```
Contexto: Paso 3 del onboarding, editor de perfil musical

Estado Default (no seleccionado):
  - Background: var(--color-surface-2)
  - Border: 1px solid var(--color-border)
  - Text: var(--color-text-secondary), --text-sm, weight-medium
  - Padding: 8px 16px
  - Border-radius: var(--radius-full)

Estado Selected:
  - Background: rgba(200, 169, 110, 0.15)
  - Border: 1px solid var(--color-accent-gold)
  - Text: var(--color-accent-gold)
  - Box-shadow: 0 0 10px rgba(200, 169, 110, 0.15)

Transición entre estados: var(--duration-fast) var(--ease-snappy)
Animación de selección: scale(1) → scale(1.05) → scale(1), duration: 200ms
```

### 6.8 Indicador de Estado del Local

```
Posición: Header del Dashboard (junto al nombre del local)

Estados y su representación:
  "Sonando"   → punto verde 8px pulsante + label "En vivo"
  "Pausado"   → punto ámbar 8px estático + label "Pausado"  
  "Sin Spotify" → punto rojo 8px parpadeante + label "Desconectado"
  "Sin sesión"  → punto gris 8px + label "Inactivo"

Animación del punto verde (pulsante):
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.4); }
  }
  animation: pulse 2s ease-in-out infinite;
```

### 6.9 Progress Step (Wizard de Onboarding)

```
Posición: Parte superior del wizard, sticky
Pasos: 4

Anatomía por paso:
  Completado: círculo 32px filled con --color-accent-gold + check icon
  Activo:     círculo 32px border --color-accent-gold + número interno --text-sm
  Pendiente:  círculo 32px border --color-border + número interno --color-text-tertiary

Línea conectora entre pasos:
  Completada: --color-accent-gold
  Pendiente:  --color-border
  Height: 2px

Label debajo de cada paso: --text-xs, --tracking-wide, uppercase
```

---

## 7. Patrones de Interacción

### 7.1 Feedback Optimista (Optimistic UI)

Para las acciones críticas del Owner (Skip, Pause, Block), aplicar siempre el patrón de feedback optimista:

```
Flujo:
1. Owner toca el botón
2. [INMEDIATO] UI cambia al estado "objetivo" — sin esperar al servidor
3. [INMEDIATO] Feedback visual/háptico confirma el tap
4. Request al servidor en background
5a. Si éxito: el estado ya estaba correcto. No hay cambio adicional.
5b. Si error: revertir el estado con animación + toast de error
```

**Aplicación por acción:**

| Acción | Cambio Optimista Inmediato | En caso de error |
|---|---|---|
| Skip | Progress bar resetea, spinner en Now Playing | Revertir + toast "No pudimos saltar" |
| Pause | Botón cambia a Play, overlay pause en art | Revertir + toast "Error al pausar" |
| Play | Botón cambia a Pause, overlay desaparece | Revertir + toast "Error al reanudar" |
| Block | Track desaparece de cola con fade | Revertir + toast "Error al bloquear" |

### 7.2 Debounce y Protection de Acciones

```
Skip y Pause:
  - Al tocar: deshabilitar el botón por 1.5 segundos (la latencia máxima esperada)
  - Visual: opacity 0.6 durante el período de debounce
  - Propósito: evitar doble-skip accidental

Block:
  - Al tocar "Bloquear": no hay confirmación modal (la acción es reversible)
  - El toast incluye botón "Deshacer" visible por 5 segundos
  - Si el Owner toca "Deshacer": DELETE del Block, revertir el skip automático
```

### 7.3 Estados de Carga

```
Dashboard (primera carga):
  Skeleton screens para:
  - Now Playing Card: rectángulos con shimmer animation
  - Queue Items: 3 filas skeleton
  No usar spinners globales — afean la experiencia

Skeleton shimmer:
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    var(--color-surface-3) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
```

### 7.4 Gestos Mobile

```
Dashboard — Cola de canciones:
  Swipe horizontal en un queue item → no implementar en MVP 1
  Tap en queue item → no implementar en MVP 1 (acciones futuras)

Bottom Sheet:
  Swipe hacia abajo → cerrar el sheet (transición hacia fuera)
  Umbral de swipe: 150px o velocidad > 500px/s

Now Playing — Bloqueo emergencia:
  Long press en la tarjeta (400ms) → abrir bottom sheet de acciones
  Alternativa: el botón "..." siempre visible
```

---

## 8. Arquitectura de Pantallas (MVP 1)

### Mapa de Navegación

```
[/]  → Redirect a /login o /dashboard según sesión

[/login]
  → /onboarding  (nuevo usuario)
  → /dashboard   (usuario con onboarding completado)

[/onboarding]
  → /onboarding/step-1  (registro)
  → /onboarding/step-2  (perfil del local)
  → /onboarding/step-3  (perfil musical)
  → /onboarding/step-4  (Spotify)
  → /dashboard          (al completar)

[/dashboard]
  → Vista principal: Now Playing + Queue + Controles
  → /dashboard/config    (Perfil musical + Bloqueos)
  ← /dashboard           (botón Back en config)

[/qr/:token]
  → Now Playing Page pública (sin autenticación)
  → No tiene navbar, no tiene controles
```

### Layout Global del Dashboard

```
Mobile (375px — diseño primario):

┌─────────────────────────────────────────┐ ← max-width: 100%
│ ████ Glowsong          ● En vivo  ⚙️   │ ← Header 56px, sticky
│                        [indicador badge]│
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ SONANDO AHORA               [...]   ││
│  │ [Art 88px] Track Name               ││
│  │            Artista                  ││
│  │ [══════════════════>]  2:15         ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌──────────┐    ┌──────────┐           │
│  │  ⏭ SKIP  │    │ ❚❚ PAUSE │           │ ← Botones 72×72px
│  └──────────┘    └──────────┘           │
│                                         │
│  SIGUIENTE EN COLA                      │ ← Label uppercase tracking-wide
│                                         │
│  [40px] Track B · Artista B        1    │
│  [40px] Track C · Artista C        2    │
│  [40px] Track D · Artista D        3    │
│                                         │
└─────────────────────────────────────────┘

Importante: Todo lo anterior debe caber en 667px de alto (iPhone SE) sin scroll.
Si necesita scroll: el Header y los controles son sticky, el scroll ocurre SOLO en la lista de cola.

Desktop (768px+):
  Max-width: 480px
  Margin: auto
  El dashboard no se expande a full-width desktop — mantiene su forma de "app móvil centrada"
  Fondo del body: var(--color-bg-primary) con patrón sutil (opcional: grid dots con opacity 0.03)
```

---

## 9. Especificaciones del Dashboard (F3)

### 9.1 Header

```
Height: 56px (mobile), 64px (desktop)
Background: var(--color-bg-secondary) con backdrop-filter: blur(8px)
Border-bottom: 1px solid var(--color-border)
Position: sticky, top: 0, z-index: 100

Contenido (izquierda → derecha):
  - Logo "Glowsong" → font-display, --text-xl, color: --color-accent-gold
  - [Spacer flexible]
  - Indicador de estado (ver 6.8)
  - Botón Configuración (icono settings, 22px, --color-text-secondary)
    → Navega a /dashboard/config
```

### 9.2 Sección de Controles (Skip + Pause)

```
Layout: flex row, justify-content: center, gap: var(--space-8)
Margin: var(--space-8) 0

Los dos botones siempre visibles.
Nunca ocultar los controles al hacer scroll.

Si no hay dispositivo Spotify activo:
  - Ambos botones deshabilitados (opacity 0.3)
  - Tooltip/label debajo: "Abre Spotify en tu dispositivo"
```

### 9.3 Barra de Progreso

```
La barra de progreso del track actual usa JavaScript, no CSS transitions.

Lógica:
  1. Al recibir datos del polling: guardar { duration_ms, progress_ms, timestamp }
  2. Cada frame (requestAnimationFrame): calcular progress actual
     = progress_ms + (Date.now() - timestamp)
  3. Si progress actual >= duration_ms: no continuar animando, esperar siguiente poll
  4. Renderizar el fill de la barra: width = (progress_actual / duration_ms) * 100%

El tiempo restante se calcula de la misma manera:
  remaining = duration_ms - progress_actual
  Formato: Math.floor(remaining/1000/60) + ":" + String(Math.floor((remaining/1000) % 60)).padStart(2, '0')
```

### 9.4 Estado: Sin Dispositivo Spotify

```
Reemplaza toda la sección de Now Playing Card + Controles:

┌─────────────────────────────────────────┐
│                                         │
│           🎵 (icono music, 48px)        │
│                                         │
│     No hay un dispositivo activo        │  ← --text-xl, semibold
│                                         │
│  Para comenzar, abre Spotify en tu      │  ← --text-sm, --color-text-secondary
│  teléfono o computador del local.       │
│                                         │
│  [    Abrir Spotify    ]                │  ← Botón secundario (outline)
│  [  Revisar Conexión   ]                │  ← Trigger para refresh del estado
│                                         │
└─────────────────────────────────────────┘

El sistema revisa cada 30 segundos. Si detecta un dispositivo, la pantalla
transiciona automáticamente al estado normal con: fade + slide-up de la tarjeta.
```

---

## 10. Especificaciones del Onboarding (F1)

### 10.1 Layout del Wizard

```
Mobile — estructura de pantalla completa:

┌─────────────────────────────────────────┐
│ ← Volver    Paso 2 de 4    [50%]        │ ← Header del wizard
├─────────────────────────────────────────┤
│ [●━━━━━●━━━━━━○━━━━━━○]                  │ ← Progress dots (ver 6.9)
│  1     2      3      4                   │
├─────────────────────────────────────────┤
│                                         │
│  [TÍTULO DEL PASO — --text-3xl bold]    │
│  [Subtítulo descriptivo — --text-base]  │
│                                         │
│  [               CONTENIDO              │
│                 del formulario          │
│                  o selector             │
│                                         ]
│                                         │
└─────────────────────────────────────────┘
│ [    Continuar →    ] ← sticky bottom   │  ← Botón Always visible, sticky
└─────────────────────────────────────────┘
```

### 10.2 Paso 1 — Registro

```
Título: "Bienvenido a Glowsong"
Subtítulo: "Gestiona la música de tu local de forma inteligente."

Opciones (en orden visual):
  1. [G] Continuar con Google         ← Botón Google-style (no primario)
     ─────────── o ───────────         ← Separator con --color-border
  2. Campo: Email
  3. Campo: Contraseña (toggle show/hide)
  4. Campo: Confirmar contraseña
  5. [    Crear cuenta    ]            ← Botón primario

Debajo del botón:
  "¿Ya tienes cuenta? Inicia sesión"  ← link --color-accent-gold

Campos Input (estilo consistente):
  - Background: var(--color-surface-2)
  - Border: 1px solid var(--color-border)
  - Border-radius: var(--radius-md)
  - Padding: 14px 16px
  - Height: 52px (área táctil cómoda)
  - Font: --text-base, --color-text-primary
  - Placeholder: --color-text-tertiary
  
  Estado Focus:
    - Border: 1px solid var(--color-accent-gold)
    - Box-shadow: 0 0 0 3px rgba(200, 169, 110, 0.15)
    - Transition: var(--duration-fast)
  
  Estado Error:
    - Border: 1px solid var(--color-error)
    - Mensaje de error: --text-sm, --color-error, margin-top: 4px
```

### 10.3 Paso 2 — Perfil del Local

```
Título: "Sobre tu local"
Subtítulo: "Cuéntanos quién eres para personalizar tu experiencia."

Campos:
  1. Nombre del local (text input)
  2. Tipo de local (styled select):
     Opciones: Bar, Pub, Coctelería, Cervecería, Restaurante, Discoteca, Otro
     Custom dropdown con íconos pequeños por tipo (opcional)
  3. Barrio / Comuna (text input)
  4. Horario de operación:
     → Toggle por día: Lun Mar Mié Jue Vie Sáb Dom
     → Por cada día activo: [Desde 18:00] [Hasta 02:00]
     → Input tipo time, native mobile para mejor UX
```

### 10.4 Paso 3 — Perfil Musical

```
Título: "Tu identidad musical"
Subtítulo: "¿Qué géneros definen el ambiente de tu local?"

Instrucción secundaria (--text-sm, --color-text-secondary):
  "Selecciona los géneros que van con tu local. 
   El sistema ajustará la energía según la hora del día."

Grid de chips (ver componente 6.7):
  - Columnas: 3 en móvil, 4 en desktop
  - Gap: var(--space-3)
  - Los 25 géneros del GENRES_CATALOG en español

Nombres de géneros en UI (mapeo de GENRES_CATALOG → display):
  ROCK → Rock           POP → Pop            ELECTRONICA → Electrónica
  REGGAETON → Reggaetón CUMBIA → Cumbia       SALSA → Salsa
  JAZZ → Jazz           BLUES → Blues         FUNK → Funk
  SOUL → Soul           HIP_HOP → Hip-Hop     R_AND_B → R&B
  LATIN_POP → Pop Latino INDIE → Indie        ALTERNATIVO → Alternativo
  CLASICA → Clásica     BOSSA_NOVA → Bossa Nova FLAMENCO → Flamenco
  FOLK → Folk           COUNTRY → Country      MUSICA_CHILENA → Música Chilena
  BOLERO → Bolero       TANGO → Tango         BACHATA → Bachata
  MERENGUE → Merengue

Contador de seleccionados (visible, actualización en tiempo real):
  "3 géneros seleccionados" — --text-sm, --color-accent-gold

Si 0 géneros: botón Continuar deshabilitado + tooltip "Selecciona al menos 1 género"
```

### 10.5 Paso 4 — Conexión Spotify

```
Título: "Conecta tu Spotify"
Subtítulo: "Glowsong usa tu cuenta Spotify para controlar la música de tu local."

Bloque de explicación de permisos (diseño tipo "card informativa"):
  Visual: surface-1, border-left: 3px solid --color-accent-purple, radius-md, padding-lg
  
  "¿Qué puede hacer Glowsong con tu Spotify?"
  ✓ Controlar qué canciones suenan en tu local
  ✓ Ver qué dispositivos Spotify tienes disponibles
  ✓ Encolar canciones automáticamente según el momento

  "¿Qué NO puede hacer?"
  ✗ Ver tu historial de escucha personal
  ✗ Modificar tus playlists personales
  ✗ Hacer cambios cuando no tienes el local activo

Botón principal:
  [🎵 Conectar con Spotify]
  Background: #1DB954 (verde Spotify — excepción a la regla de colores)
  Text: #FFFFFF

Nota debajo del botón (--text-xs, --color-text-secondary):
  "Necesitas una cuenta Spotify Premium para usar Glowsong."
  Link: "¿No tienes Premium? Ver opciones" → URL de Spotify Premium

Estado post-conexión exitosa:
  Pantalla de éxito con animación:
  - Icono check animado (scale 0 → 1.2 → 1, duration: 600ms)
  - "¡Tu local está listo para sonar!"  ← --text-3xl bold
  - Nombre del local en dorado
  - [Ir al Dashboard →]  ← botón primario
```

---

## 11. Motion & Animación

### Principios de Movimiento

1. **Propósito, no decoración.** Cada animación comunica algo: confirmación, transición, estado.
2. **Velocidad respetuosa.** El Owner está ocupado. Ninguna animación "obligatoria" dura más de 400ms.
3. **Nunca bloquear.** Las animaciones de entrada de pantalla ocurren mientras el contenido ya está disponible.
4. **Preference media query.** Respetar `prefers-reduced-motion`.

### Catálogo de Animaciones

#### Entrada de pantalla (Page Transition)
```css
/* Pantalla entra desde la derecha al navegar hacia adelante */
@keyframes slideInRight {
  from { transform: translateX(24px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
.page-enter { animation: slideInRight var(--duration-normal) var(--ease-out); }
```

#### Tarjeta Now Playing — Cambio de track
```css
/* Cuando el track cambia: fade out, nueva info, fade in */
@keyframes trackChange {
  0%   { opacity: 1; transform: translateY(0); }
  40%  { opacity: 0; transform: translateY(-8px); }
  60%  { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.track-changing { animation: trackChange 500ms var(--ease-snappy); }
```

#### Pulso del indicador "En vivo"
```css
@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}
.live-indicator { animation: livePulse 2s ease-in-out infinite; }
```

#### Toast de entrada
```css
@keyframes toastIn {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
```

#### Shimmer para Skeleton
```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface-2) 25%,
    var(--color-surface-3) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
```

#### Respeto por prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Accesibilidad

### Principios WCAG 2.1 AA aplicados al contexto de Glowsong

| Criterio | Implementación |
|---|---|
| Contraste mínimo 4.5:1 (texto normal) | `--color-text-primary` (#F0F0F8) sobre `--color-bg-primary` (#080810) = ≈ 18:1 ✓ |
| Contraste mínimo 3:1 (texto grande ≥ 18pt) | Todos los textos grandes están sobre fondos oscuros ✓ |
| Área táctil mínima 44×44px | Todas las acciones críticas: 52px mínimo (ver botones) ✓ |
| Focus visible | `outline: 2px solid var(--color-accent-gold); outline-offset: 2px;` en todos los elementos interactivos |
| Labels semánticos | Todos los botones de icono tienen `aria-label` descriptivo |
| Roles ARIA | `role="status"` para el estado de reproducción, `aria-live="polite"` para toasts |
| Skip navigation | No aplica (app single-page, no document-structure) |

### Labels ARIA Obligatorios

```html
<!-- Botón skip -->
<button aria-label="Saltar canción">
  <icon:skip-forward />
</button>

<!-- Botón pause/play -->
<button aria-label="Pausar reproducción" aria-pressed="false">
  <icon:pause />
</button>

<!-- Indicador de estado -->
<span aria-live="polite" aria-atomic="true">
  Sonando: Uptown Funk — Bruno Mars
</span>

<!-- Progress bar -->
<div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"
     aria-label="Progreso de la canción">
```

---

## 13. Estados del Sistema

### Matriz de Estados del Dashboard

| Estado | Now Playing Card | Controles | Indicador Header |
|---|---|---|---|
| Sonando | Track + art + barra animada | Skip activo + Pause activo | 🟢 "En vivo" |
| Pausado (por Owner) | Track visible + overlay pause | Skip activo + Play activo | 🟡 "Pausado" |
| Pausado (externo) | Como pausado, con banner "Pausado externamente" | Skip activo + Play activo | 🟡 "Pausado" |
| Sin dispositivo | Estado vacío + CTA Spotify | Ambos deshabilitados | 🔴 "Desconectado" |
| Cargando (inicial) | Skeleton screen | Skeleton | Sin indicador |
| Sin conexión | Último estado conocido + banner "Sin conexión" | Deshabilitados | ⚪ — |
| Error Spotify | Banner de error específico + botón "Reintentar" | Deshabilitados | 🔴 "Error" |

### Prioridad de Banners de Error

Si hay múltiples condiciones de error simultáneas, mostrar el más crítico:
1. Sin Spotify Premium (bloquea todo)
2. Sin dispositivo Spotify
3. Sin conexión a internet
4. Rate limit de Spotify (temporal)
5. Error de API genérico

---

## 14. Responsive Design

### Breakpoints

```css
/* Mobile first — diseño primario */
/* 375px — iPhone SE, base de diseño */

@media (min-width: 480px) {
  /* Móviles grandes */
}

@media (min-width: 768px) {
  /* Tablets y desktop — dashboard centrado */
  .app-container {
    max-width: 480px;
    margin: 0 auto;
  }
}
```

### Comportamiento por breakpoint

| Elemento | 375px | 480px | 768px+ |
|---|---|---|---|
| Dashboard | Full-width | Full-width | Centrado 480px |
| Album art | 88×88px | 96×96px | 96×96px |
| Control buttons | 72×72px | 80×80px | 80×80px |
| Genre chips | 3 columnas | 4 columnas | 5 columnas |
| Toast | calc(100vw - 32px) | 400px max | 400px max |

### La Regla del Pulgar

En 375px, el Owner usa el Dashboard con el pulgar de la mano con que sostiene el teléfono. Todos los elementos interactivos del are "zona segura del pulgar" (parte inferior central de la pantalla). Los controles Skip y Pause siempre están en esa zona.

```
Zona segura del pulgar en 375×667px:
  →  x: 80px - 295px (centro del ancho)
  →  y: 400px - 620px (parte baja de la pantalla)

Los botones Skip y Pause deben estar en y: 450-530px approx.
```

---

## 15. Checklist de Implementación

Antes de declarar una pantalla como "lista para producción", verificar:

### Visual
- [ ] Todos los valores de color usan variables CSS (`--color-*`)
- [ ] Todos los valores de tipografía usan variables CSS (`--text-*`, `--font-*`)
- [ ] Todos los espaciados usan variables CSS (`--space-*`)
- [ ] Dark mode es el único modo — no hay valores blancos ni claros hardcodeados
- [ ] Los bordes `border-radius` usan variables (`--radius-*`)

### Interacción
- [ ] Todos los botones tienen estado hover, pressed, disabled definidos
- [ ] Las acciones críticas (skip, pause) tienen feedback visual en ≤ 80ms
- [ ] Los botones tienen área táctil mínima de 52px (height) en mobile
- [ ] El debounce está implementado en Skip y Pause (1.5s)
- [ ] El feedback optimista está implementado para Skip, Pause y Block

### Estados
- [ ] El estado vacío está diseñado y construido (no hay "null" invisible)
- [ ] El estado de carga tiene skeleton screen (no spinner global)
- [ ] El estado de error tiene mensaje específico y acción de recuperación
- [ ] El estado de sin conexión está manejado con gracia

### Accesibilidad
- [ ] Todos los botones de icono tienen `aria-label`
- [ ] El contenido dinámico tiene `aria-live` donde corresponde
- [ ] El contraste de texto pasa 4.5:1 en todos los casos
- [ ] `prefers-reduced-motion` está respetado

### Performance
- [ ] La página Dashboard carga (FCP) en < 2 segundos en 4G
- [ ] Las imágenes de álbum tienen lazy loading
- [ ] Las fuentes tienen `font-display: swap`
- [ ] Los íconos SVG son inline (no requests HTTP adicionales)
- [ ] El polling del dashboard no bloquea la UI (worker o setTimeout no-blocking)

### Mobile
- [ ] Todas las acciones críticas son alcanzables sin scroll en 375px
- [ ] Los inputs en iOS no hacen zoom automático (font-size ≥ 16px)
- [ ] El bottom safe area de iPhone está respetado (`padding-bottom: env(safe-area-inset-bottom)`)
- [ ] Las animaciones son 60fps en iPhone SE (test en dispositivo real)

---

## Apéndice A: Fuentes Web

```html
<!-- En el <head> de la aplicación -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Clash Display se obtiene de Fontshare (gratuita para uso comercial) -->
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet">
```

Si por alguna razón Clash Display no está disponible, usar `DM Serif Display` de Google Fonts como fallback para los elementos display (logo). Los elementos de UI usan únicamente `Inter`.

---

## Apéndice B: Color en Spotify

La marca Spotify tiene un color verde oficial (`#1DB954`) que solo debe usarse en el botón de "Conectar con Spotify" del Paso 4 del onboarding. Es la única excepción a la paleta de Glowsong. El resto de las referencias a Spotify en la UI usan los colores estándar de Glowsong.

---

*Design System Glowsong MVP 1 — v1.0*
*Para revisarse cuando se incorpore F4 (Scheduler) al desarrollo — esa feature requiere un componente de calendar custom no especificado en este documento.*
