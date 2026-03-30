# Glowsong — Definición del MVP 1
**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Relación con otros documentos:** Ejecuta la fase NOW de `product_strategy.md`, guiado por `product_pillars.md`

---

## El MVP en Una Frase

**El MVP 1 de Glowsong es una plataforma que gestiona la música de un bar de forma inteligente — adaptándose a la hora y el ambiente — con control total para el dueño, sin hardware y sin tocar al consumidor todavía.**

---

## La Hipótesis que Estamos Probando

> *"Si un local puede activar Glowsong en menos de 15 minutos y la plataforma gestiona su música mejor que su playlist de Spotify actual, el dueño no va a querer volver atrás — y lo va a recomendar."*

Todo lo que entra en el MVP 1 sirve para probar esta hipótesis. Todo lo que no la sirve, no entra — aunque sea una buena idea.

El MVP 1 no intenta demostrar la visión completa de Glowsong. Intenta demostrar una sola cosa: **que el local es el canal correcto y que el producto retiene**.

---

## Qué Problema Resuelve el MVP 1

El dueño de un bar tiene un problema cotidiano y silencioso: la música de su local no está gestionada con intención. Usa Spotify, pone un playlist genérico y lo olvida. El resultado es música que no representa al local, que no cambia con la noche, y que nadie controla.

Glowsong MVP 1 resuelve exactamente eso — y nada más. No resuelve la interacción del consumidor (eso es MVP 2). No resuelve la monetización avanzada (eso es MVP 2). Resuelve que **la música del local siempre tenga sentido para el momento**.

---

## Usuario del MVP 1

**El dueño o encargado del local.**

No el consumidor. No el DJ. No el bartender. El MVP 1 tiene un único usuario: la persona que decide qué música suena en el local y que es responsable de la experiencia de sus clientes.

### Perfil del usuario objetivo

| Atributo | Descripción |
|---|---|
| Rol | Dueño, socio operativo o encargado de local |
| Tipo de local | Bar, pub, coctelería, cervecería, restaurante de ambiente |
| Capacidad | 40–200 personas |
| Operación | Jueves a sábado como mínimo, con música activa durante toda la jornada |
| Tech literacy | Media — usa smartphone, WhatsApp, Instagram y algún POS digital. No es developer. |
| Relación con la música | Le importa pero no tiene tiempo de gestionarla. Usa Spotify o similar "porque algo tiene que sonar". |
| Pain point principal | "La música siempre queda en manos de alguien que no entiende el local" |

---

## Scope del MVP 1 — Lo Que Entra

### Feature 1 — Onboarding del Local en < 15 Minutos

**Qué es:** El proceso completo desde que el dueño llega al sitio de Glowsong hasta que la primera canción suena en su local, gestionada por la plataforma.

**Por qué entra:** Si el onboarding es difícil, la tasa de activación cae y nunca llegamos a los datos de retención. El onboarding es la primera experiencia del producto — tiene que ser impecable.

**Flujo:**
1. Registro con email y contraseña (o Google Auth)
2. Perfil del local: nombre, tipo de local, barrio, horario de operación
3. Configuración de perfil musical: géneros preferidos, géneros bloqueados, artistas bloqueados
4. Conexión con Spotify (cuenta del local o cuenta Glowsong delegada)
5. Activación — primera canción sonando

**Criterio de aceptación:** El 80% de los usuarios completan el onboarding sin asistencia del equipo de Glowsong en menos de 15 minutos.

---

### Feature 2 — Algoritmo de Playlist Inteligente

**Qué es:** El motor central del MVP 1. Un sistema que selecciona y organiza canciones automáticamente en función de la hora del día, el día de la semana y el perfil musical del local — dentro del marco definido por el dueño.

**Por qué entra:** Es la razón de ser del MVP 1. Sin esto, Glowsong es solo una interfaz de Spotify. El algoritmo es lo que genera valor diferencial desde el primer día.

**Comportamiento esperado:**

| Franja Horaria | Comportamiento del Algoritmo |
|---|---|
| Apertura (12hs–17hs) | Tempo moderado, volumen bajo-medio, géneros suaves del perfil del local |
| Tarde (17hs–20hs) | Energía creciente, transición gradual hacia géneros más activos |
| Noche temprana (20hs–23hs) | Peak de energía 1, géneros principales del local, canciones conocidas |
| Noche alta (23hs–02hs) | Peak de energía 2, máxima activación, mayor variedad |
| Cierre (02hs–04hs) | Descenso gradual de energía, transición hacia salida |

**Variables que considera el algoritmo:**
- Franja horaria actual
- Día de la semana (lunes vs. viernes son distintos)
- Perfil de géneros del local (configurado en onboarding)
- Historial de canciones recientes (sin repetir en ventana de 2 horas)
- Géneros y artistas bloqueados por el dueño

**Lo que el algoritmo NO hace en MVP 1:**
- No aprende del comportamiento del consumidor (eso requiere MVP 2)
- No adapta en tiempo real a la energía del local
- No recomienda nuevas canciones fuera del perfil configurado

**Criterio de aceptación:** En una prueba ciega con 5 dueños de locales distintos, el algoritmo recibe una evaluación de "la música tiene sentido para el momento" en ≥ 4 de 5 casos.

---

### Feature 3 — Dashboard de Control del Local

**Qué es:** El panel de gestión donde el dueño puede ver qué está sonando, controlar la música en tiempo real, y ajustar la configuración de la plataforma.

**Por qué entra:** El Pilar 2 es innegociable — el local siempre tiene el control. Sin un dashboard claro y de respuesta inmediata, el dueño no confía en la plataforma. La confianza es la condición de entrada.

**Vistas y funcionalidades:**

*Vista principal (operación en vivo):*
- Canción que está sonando ahora: título, artista, carátula, tiempo restante
- Cola de próximas 5 canciones
- Botón de "saltar canción" visible y accesible
- Botón de "pausa" para control total inmediato
- Indicador de franja horaria activa y siguiente

*Configuración del perfil musical:*
- Géneros activos y su peso relativo (más cumbia, menos electrónica)
- Lista de artistas bloqueados
- Lista de canciones específicas bloqueadas
- Modo "solo clásicos" para franjas especiales (cumpleaños corporativo, etc.)

*Scheduler semanal:*
- Vista de 7 días x 24 horas
- Por cada franja: perfil musical activo (puede ser distinto al del día normal)
- Posibilidad de crear franjas especiales (eventos, fechas puntuales)

**Criterio de aceptación:** El dueño puede saltar una canción, cambiar un género bloqueado y ajustar el scheduler en menos de 3 minutos sin instrucciones.

---

### Feature 4 — Scheduler de Música Semanal

**Qué es:** La capacidad de programar qué tipo de música suena en cada franja del día y cada día de la semana, con anticipación.

**Por qué entra:** El dueño no siempre está en el local. El scheduler le da tranquilidad de que el miércoles al mediodía suena algo distinto al viernes a la medianoche, sin que tenga que estar presente para cambiarlo.

**Comportamiento:**
- El dueño define perfiles musicales (ej: "Almuerzo tranquilo", "Tarde del viernes", "Noche de jazz")
- Asigna cada perfil a las franjas del scheduler
- El algoritmo usa el perfil asignado como marco de esa franja
- El dueño puede sobrescribir en tiempo real desde el dashboard si está en el local

**Criterio de aceptación:** El dueño puede configurar una semana completa de scheduler en menos de 10 minutos y el sistema lo respeta sin intervención posterior.

---

### Feature 5 — Analytics Básico

**Qué es:** Un resumen semanal simple de la actividad musical del local: géneros más reproducidos, franjas de mayor actividad, canciones más repetidas.

**Por qué entra:** Dos razones. Primera: da al dueño información que nunca tuvo sobre su propia música — eso genera valor percibido inmediato. Segunda: es la primera capa del activo de datos de Glowsong.

**Lo que muestra:**
- Top 10 canciones de la semana en ese local
- Distribución de géneros (pie chart simple)
- Franjas de mayor actividad (heatmap de hora × día)
- Comparación semana anterior (↑↓ en cada categoría)

**Lo que NO muestra en MVP 1:**
- Datos del consumidor (no existen aún)
- Benchmarks vs. otros locales (requiere masa crítica)
- Predicciones (requiere más datos históricos)

**Criterio de aceptación:** El dueño abre el reporte semanal al menos una vez por semana sin que el equipo de Glowsong se lo recuerde.

---

### Feature 6 — QR de "Esto está sonando"

**Qué es:** Un código QR único por local que, al escanearse, muestra una página simple con la canción que está sonando en este momento y las próximas en cola.

**Por qué entra:** No requiere ninguna acción del consumidor — es solo lectura. Pero planta la semilla del MVP 2 de forma natural: cuando el consumidor escanea el QR y ve la cola, la pregunta siguiente es "¿puedo influir en esto?". Esa pregunta es el gancho del MVP 2.

**Comportamiento:**
- El QR se puede imprimir o mostrar en pantalla
- La página cargada es mobile-first, sin necesidad de app
- Muestra: canción actual, próximas 3 canciones, nombre del local
- No hay ningún botón de acción todavía — solo lectura

**Criterio de aceptación:** Al menos el 20% de los locales activos usan el QR físicamente (en mesa, barra o pantalla) dentro de las primeras 2 semanas.

---

## Scope del MVP 1 — Lo Que NO Entra

Estas exclusiones son tan importantes como las inclusiones. Definen el foco y protegen el cronograma.

| Excluido | Por Qué No Entra | Cuándo Entra |
|---|---|---|
| Votación de canciones por el consumidor | Requiere resolver primero el lado del local | MVP 2 |
| Pago del consumidor por canción | Depende de la votación siendo validada | MVP 2 |
| App nativa (iOS / Android) | Web app es suficiente para validar. La app nativa suma costo sin sumar validación. | MVP 2 o después |
| Revenue share / dashboard de ingresos | No hay transacciones del consumidor aún | MVP 2 |
| Integración multi-local / cadenas | Complejidad innecesaria para validar el modelo | Later |
| Gamificación del consumidor | No hay consumidor activo aún | Later |
| Integraciones con POS o sistemas externos | No es crítico para la hipótesis del MVP 1 | Later |
| Modo offline / fallback de audio | Importante pero no es la primera prioridad | MVP 2 |
| Recomendación de canciones nuevas | Requiere más data histórica del local | MVP 2 |
| Soporte para más de una zona de audio | Complejidad técnica, 90% de los locales tienen una zona | Later |

---

## User Stories del MVP 1

Las user stories están escritas desde la perspectiva del único usuario del MVP 1: el dueño o encargado del local.

---

**US-01 — Registro y primer acceso**
*Como dueño de un bar, quiero registrarme en Glowsong y configurar el perfil de mi local para que el sistema entienda qué tipo de música quiero.*

Criterios de aceptación:
- Puedo registrarme con email/contraseña o con Google en menos de 2 minutos
- El formulario de perfil me pide: nombre del local, tipo de local, barrio, horario de operación, géneros preferidos y géneros/artistas que quiero bloquear
- Al completar el perfil, soy llevado directamente al siguiente paso (conexión con Spotify)

---

**US-02 — Conexión con Spotify**
*Como dueño, quiero conectar mi cuenta de Spotify (o una cuenta que Glowsong me facilite) para que la plataforma tenga acceso al catálogo musical.*

Criterios de aceptación:
- El proceso de OAuth con Spotify se completa en menos de 1 minuto
- Si no tengo cuenta de Spotify, hay una opción de usar una cuenta Glowsong preconfigurada
- Una vez conectado, veo una confirmación clara de que la integración está activa
- Puedo desconectar y reconectar en cualquier momento desde configuración

---

**US-03 — Primera canción sonando**
*Como dueño, quiero que después del onboarding la primera canción suene inmediatamente, para confirmar que todo funciona.*

Criterios de aceptación:
- Al finalizar el onboarding, hay un botón claro de "Activar Glowsong"
- Al presionarlo, la primera canción empieza a sonar en menos de 10 segundos
- El dashboard muestra en tiempo real qué está sonando
- Si hay un error (ej: Spotify no conectado), el mensaje es claro y orientado a solución

---

**US-04 — Control en tiempo real**
*Como encargado del local, quiero poder saltar una canción o pausar la música desde mi teléfono cuando sea necesario, sin interrumpir lo que estoy haciendo.*

Criterios de aceptación:
- El dashboard está optimizado para mobile — puedo operarlo con una mano
- El botón de "saltar" salta la canción en menos de 2 segundos
- El botón de "pausar" pausa instantáneamente
- Al reanudar, continúa desde donde estaba o inicia la siguiente canción (configurable)

---

**US-05 — Configurar géneros bloqueados**
*Como dueño, quiero bloquear ciertos géneros o artistas para que nunca suenen en mi local, aunque el algoritmo los considere apropiados para el horario.*

Criterios de aceptación:
- Puedo buscar y bloquear géneros de una lista predefinida
- Puedo buscar y bloquear artistas específicos por nombre
- Los bloqueos se aplican de forma inmediata — la próxima canción ya los respeta
- Puedo ver y editar la lista de bloqueos en cualquier momento
- Hay una opción de "bloqueo temporal" para el evento de esta noche sin afectar la configuración permanente

---

**US-06 — Programar el scheduler semanal**
*Como dueño, quiero configurar qué tipo de música suena en cada franja del día para no tener que cambiarla manualmente cada vez.*

Criterios de aceptación:
- La vista del scheduler es un calendario semanal con franjas de 1 hora
- Puedo crear perfiles musicales con nombre (ej: "Almuerzo", "Noche de viernes") y asignarlos a franjas
- El scheduler es visual — veo de un vistazo qué perfil está activo en cada momento
- Puedo copiar la configuración de un día a otro

---

**US-07 — Ver qué está sonando (vista móvil rápida)**
*Como encargado, quiero poder ver de un vistazo qué está sonando ahora mismo desde cualquier parte del local.*

Criterios de aceptación:
- El dashboard mobile muestra la canción actual como elemento principal
- La información es legible a distancia y con una mano
- No requiere hacer scroll para ver los controles básicos (saltar, pausar)

---

**US-08 — Reporte semanal**
*Como dueño, quiero recibir un resumen de cómo fue la semana musical de mi local para entender qué está funcionando.*

Criterios de aceptación:
- El reporte llega por email todos los lunes a las 10am (configurable)
- Incluye: top 10 canciones, géneros más reproducidos, franja de mayor actividad
- Es visual y legible en 2 minutos — no es un dump de datos
- Tiene un CTA claro para ajustar la configuración si algo no me gustó

---

**US-09 — QR de "esto está sonando"**
*Como dueño, quiero tener un QR que mis clientes puedan escanear para ver qué está sonando, para crear curiosidad sobre la plataforma.*

Criterios de aceptación:
- El QR es descargable en alta resolución para imprimir
- La página que abre es mobile-first, carga en menos de 3 segundos
- Muestra: canción actual, próximas 3 canciones, nombre del local con su logo/foto
- No hay botones de acción — solo lectura
- El diseño es lo suficientemente atractivo para estar en una mesa o barra

---

## Restricciones Técnicas del MVP 1

Estas decisiones técnicas están tomadas deliberadamente para maximizar velocidad de entrega sin comprometer la hipótesis.

| Decisión | Justificación |
|---|---|
| **Web app, no app nativa** | Menor tiempo de desarrollo, sin fricción de instalación para el dueño, suficiente para validar el MVP 1 |
| **Integración Spotify, no catálogo propio** | Evita problemas de licencias en la etapa de validación, acceso inmediato a 100M+ canciones, costo de desarrollo reducido |
| **Una zona de audio por local** | El 90% de los locales objetivo tienen una sola zona. El multi-zona es una complejidad prematura. |
| **Sin app del consumidor** | El MVP 1 no lo necesita. La web page del QR es suficiente para plantar la semilla. |
| **Backend simple, sin ML avanzado** | El algoritmo MVP 1 puede ser basado en reglas (franja horaria + perfil) con lógica determinista. El ML llega cuando hay suficiente data. |

---

## Métricas de Éxito del MVP 1

El MVP 1 es exitoso cuando:

| Métrica | Objetivo | Por Qué Esta Métrica |
|---|---|---|
| Locales activos al final del período de validación | 50 | Masa crítica mínima para detectar patrones de retención |
| Tasa de completación del onboarding | ≥ 80% sin asistencia | Si la mayoría necesita ayuda, el onboarding está mal diseñado |
| Tiempo de onboarding | < 15 minutos (p75) | Comprometido en el pilar de sin fricción |
| Churn mensual (locales con > 45 días) | < 5% | Señal de que el valor es real y sostenido |
| Frecuencia de uso del dashboard | ≥ 3 veces por semana por local | Si no lo usan, no lo valoran |
| NPS del local | ≥ 60 | Umbral que indica potencial de recomendación orgánica |
| % de locales que recomiendan a otro local | ≥ 20% | La señal más poderosa de PMF en el lado del local |
| % de locales que usan el QR físicamente | ≥ 20% | Indica preparación cultural para el MVP 2 |

---

## Criterio de "Done" del MVP 1

El MVP 1 está completo cuando:

1. **Técnicamente:** Las 6 features están implementadas, testeadas en al menos 5 locales reales, y el sistema corre estable durante 30 días consecutivos sin incidentes críticos.

2. **Validación:** 50 locales activos, churn < 5%, NPS ≥ 60. Si alguna de estas tres métricas no se cumple en el plazo definido, el MVP 1 se extiende hasta cumplirlas — no se avanza al MVP 2.

3. **Aprendizaje:** El equipo puede responder con evidencia real (no intuición) estas tres preguntas:
   - ¿Qué feature del MVP 1 genera más valor percibido para el local?
   - ¿Qué tipo de local retiene mejor y por qué?
   - ¿Qué le falta al MVP 1 que los locales piden de forma recurrente?

4. **Producto:** Al menos 3 locales activos expresan, sin ser preguntados, que no querrían volver a su sistema anterior.

---

## Lo Que el MVP 1 Le Promete al MVP 2

El MVP 1 no es un fin en sí mismo — es la infraestructura sobre la que el MVP 2 construye. Cuando el MVP 1 esté validado, el MVP 2 hereda:

- **Una red de 50 locales activos** que ya confían en Glowsong y tienen el QR instalado
- **Un algoritmo entrenado** con datos reales de comportamiento musical por tipo de local y franja horaria
- **Un canal de distribución probado** — sabemos cómo vender a locales, cuánto cuesta y cuánto demora
- **La semilla del consumidor plantada** — los clientes de esos 50 locales ya escanearon el QR y ya saben que existe algo

El MVP 2 no empieza de cero. Empieza donde el MVP 1 termina.

---

*Documento de definición de producto — Glowsong MVP 1 v1.0*
*Para revisarse ante cambios en el alcance, aprendizajes del mercado o decisiones técnicas que modifiquen la hipótesis central.*
