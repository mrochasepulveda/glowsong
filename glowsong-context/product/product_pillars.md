# Glowsong — Pilares del Producto
**Versión:** 2.0 | **Última actualización:** Marzo 2026
**Relación con otros documentos:** Derivado de `product_vision.md`, informado por `competitive-landscape.md`, `market_size.md` y `customer_voice.md`

---

## Qué Son los Pilares y Para Qué Sirven

Los pilares son los principios no negociables de Glowsong. No son features ni funcionalidades — son las reglas del juego que guían cada decisión de producto y negocio. Cuando haya que elegir entre dos caminos, los pilares dicen cuál tomar.

Están divididos en dos capas: los **pilares de experiencia**, que definen cómo se siente usar Glowsong, y los **pilares estratégicos**, que definen cómo se construye el negocio.

### Orden de Prioridad

Cuando dos pilares entran en tensión, el de menor número gana. No porque los últimos importen menos — todos son necesarios — sino porque en caso de conflicto real, este es el orden que protege lo más esencial de Glowsong.

---

## Pilares de Experiencia de Producto

*Cómo tiene que sentirse Glowsong para quienes lo usan — el local y el consumidor.*

---

### Pilar 1 — La Música Como Experiencia Social

> **"Glowsong no es un servicio de streaming. Es una capa social sobre la música."**

Este es el pilar fundacional. Es lo que hace a Glowsong irreplicable y lo que justifica su existencia frente a Brandtrack, Spotify y Mood Media. La diferencia no está en el catálogo de música — está en que la música conecta a las personas que comparten el mismo espacio físico en el mismo momento.

Cuando Glowsong funciona bien, la música no es fondo. Es conversación. Es competencia. Es el momento que nadie olvida de esa noche.

**Implicancias de diseño:**
- Las mecánicas de votación, dedicatorias, reacciones y competencia entre usuarios no son features secundarias — son el corazón del producto.
- La interfaz del consumidor debe mostrar en tiempo real qué está sonando, qué viene después, quién lo pidió, y quiénes más están participando ahora mismo.
- El algoritmo no solo optimiza por coherencia musical — optimiza por energía social del espacio: más participación, más interacción, más momentum colectivo.
- El éxito de una noche en Glowsong no se mide solo en canciones pagadas, sino en cuántas personas del local interactuaron. Una noche donde el 30% del bar participó es mejor que una donde alguien pagó 20 canciones solo.
- Cada decisión de producto se filtra con la pregunta: *¿esto conecta a las personas presentes, o solo gestiona una playlist?*

**Por qué importa:** Un competidor puede copiar un algoritmo de recomendación. No puede copiar la red social efímera y local que Glowsong construye entre los presentes en un bar un viernes en la noche. La capa social es el moat de experiencia.

**Tensión resuelta:** Este pilar puede crear tensión con el Pilar 2 (control del local) cuando las preferencias sociales del público divergen de la identidad del local. La resolución es siempre la misma: el local define el marco, y dentro de ese marco la experiencia social florece. La participación no reemplaza el criterio del local — lo amplifica con información real.

---

### Pilar 2 — El Local Siempre Tiene el Control

> **"Glowsong amplifica la identidad del local, no la reemplaza."**

El local es el dueño de su experiencia. Glowsong es la herramienta que la potencia. Ninguna funcionalidad de la plataforma — ni el algoritmo, ni los votos de los clientes, ni ninguna mecánica social — puede tomar el control por encima de lo que el dueño decide.

El dueño define el marco: géneros permitidos, artistas bloqueados, franjas horarias, niveles de participación del cliente. Dentro de ese marco, Glowsong hace su trabajo. Nunca al revés.

**Implicancias de diseño:**
- El panel de control del local es siempre visible y de respuesta inmediata — puede intervenir en cualquier momento desde su teléfono o tablet.
- El dueño puede pausar, cambiar o bloquear cualquier selección en tiempo real, sin fricción.
- Las sugerencias del algoritmo y los pedidos de los clientes son siempre propuestas, nunca imposiciones.
- El onboarding debe dejar al local con sensación de dominio total, no de dependencia tecnológica.
- Debe existir siempre un "modo seguro" donde el local recupera el control completo en un toque.

**Por qué importa:** La razón #1 por la que un local no adoptaría Glowsong es el miedo a perder el control de su identidad. Si el dueño de una coctelería de jazz siente que sus clientes pueden convertir su local en una fiesta de reggaetón, no instala la plataforma. El control es la condición de entrada, no un feature opcional.

---

### Pilar 3 — Sin Fricción, en Ambos Lados

> **"Si cuesta más de tres pasos, está mal diseñado."**

La fricción mata la experiencia interactiva antes de que empiece. Un consumidor que necesita descargar una app, crear cuenta, verificar email y agregar tarjeta antes de pagar su primera canción abandona en el segundo paso. Un dueño que necesita configurar la plataforma durante dos horas antes de encenderla la va a apagar a la semana.

Glowsong se diseña para que la primera acción significativa sea posible en segundos, desde cualquier punto de entrada.

**Implicancias de diseño:**
- El consumidor accede desde un QR en la mesa o en el local — sin necesidad de descargar una app para su primera interacción.
- El pago funciona con los métodos que el consumidor ya usa: Apple Pay, Google Pay, Mercado Pago, tarjeta guardada. Nunca datos manuales en el primer uso.
- El local activa Glowsong en menos de 15 minutos desde el registro hasta la primera canción en vivo.
- Cada flujo crítico se mide en pasos. Si un flujo supera tres pasos, se rediseña antes de lanzar.
- El tiempo entre "escanear QR" y "canción en cola" debe ser menor a 30 segundos.

**Por qué importa:** Chile tiene 85% de pagos físicos con tap & pay y 315 transacciones digitales por persona por año. El consumidor ya tiene el hábito. La barrera no es la disposición a pagar — es la fricción del momento. Si en los primeros 30 segundos algo no funciona o no está claro, la oportunidad desaparece.

---

### Pilar 4 — El Algoritmo Trabaja Invisible

> **"El mejor momento con Glowsong es cuando nadie se pregunta quién eligió esta canción."**

El algoritmo no debería ser perceptible como tecnología. Su trabajo es que la música siempre tenga sentido — que la transición de las 19hs a las 23hs se sienta natural, que ninguna canción "rompa" el ambiente, que el local parezca tener un DJ invisible que conoce perfectamente el lugar y a su gente.

Cuando el algoritmo hace bien su trabajo, el local se ve más inteligente. No la plataforma.

**Implicancias de diseño:**
- Las transiciones entre géneros, tempos y energías son graduales y coherentes — nunca abruptas.
- El algoritmo aprende de cada local individualmente: su tipo de clientela, sus horarios, sus géneros dominantes, sus noches especiales. No existe un modelo genérico aplicado a todos.
- Las intervenciones visibles del algoritmo (sugerencias al dueño, cambios automáticos) se comunican como asistencia contextual, nunca como decisiones autónomas.
- El sistema anticipa: sube el tempo antes de que el local llegue a su hora pico, no cuando ya llegó.

**Relación con Pilar 2:** El algoritmo trabaja dentro del marco que define el local (Pilar 2). Su invisibilidad no significa autonomía — significa que dentro de los parámetros autorizados, sus decisiones son tan buenas que no hay necesidad de corregirlas. La confianza en el algoritmo se gana con el tiempo, local por local.

**Por qué importa:** El 80% de los locales hoy usa una playlist genérica porque gestionar la música activamente requiere tiempo que el dueño no tiene. Glowsong resuelve eso sin agregar trabajo. Esa invisibilidad — hacer algo complejo de manera transparente — es el producto en sí mismo.

---

### Pilar 5 — Confianza Como Infraestructura

> **"Si el dinero no llega o la música no suena, todo lo demás da igual."**

Glowsong es una plataforma de pagos reales entre personas reales. El consumidor paga con su tarjeta. El local recibe su comisión. Glowsong toma su porcentaje. Ese flujo de dinero tiene que ser transparente, confiable y predecible — para los dos lados. Cualquier falla en esa confianza destruye el modelo completo.

Además, la música tiene que sonar. Siempre. Una noche en que Glowsong falla técnicamente en un local no es un bug — es una pérdida de ingresos del local y una experiencia rota para sus clientes.

**Implicancias de diseño:**
- Los pagos se procesan en tiempo real y son visibles para el local en su dashboard de forma inmediata.
- El local recibe un resumen claro de cada noche: cuántas canciones se pagaron, cuánto generó, cuánto corresponde a Glowsong.
- La arquitectura de audio tiene un modo de fallback: si la conexión falla, la música sigue sonando con el último estado conocido.
- La privacidad de los datos de pago del consumidor nunca es negociable — se usan únicamente para procesar la transacción.
- El soporte ante problemas de pago o técnicos tiene tiempo de respuesta definido y visible para el local.

**Por qué importa:** En una plataforma de dos lados con dinero de por medio, la confianza no es un valor de marca — es infraestructura del negocio. Un solo episodio donde el dinero "desapareció" o la música se cortó en viernes en la noche puede costar no solo ese local, sino la reputación en toda la red.

---

## Pilares Estratégicos del Negocio

*Cómo se construye y opera Glowsong como empresa.*

---

### Pilar 6 — Sin Hardware, Sin Barreras

> **"Cualquier local que tenga un parlante y WiFi puede usar Glowsong hoy."**

No hay hardware propietario. No hay dispositivo que instalar. No hay costo de capital para el local ni logística de distribución para Glowsong. La plataforma vive en software y funciona sobre la infraestructura que el local ya tiene.

Este pilar es lo que hace a Glowsong escalable en Latinoamérica, donde el modelo de TouchTunes (hardware + operadores intermediarios) no funciona.

**Implicancias estratégicas:**
- El producto se diseña para funcionar con cualquier sistema de audio existente — desde un parlante Bluetooth hasta un sistema de sonido profesional.
- La integración con plataformas de streaming existentes (Spotify, Apple Music) es prioritaria para el MVP, en lugar de construir reproducción propia.
- Sin hardware significa sin soporte técnico físico — el modelo de atención se diseña para ser remoto y asíncrono desde el inicio.
- La escalabilidad geográfica no requiere infraestructura local previa: un local en Concepción puede activarse el mismo día que uno en Santiago.

**Por qué importa:** Es el diferenciador estructural frente a TouchTunes. Y es la razón por la que Glowsong puede llegar a 500 locales antes de que cualquier competidor con hardware pueda reaccionar. La velocidad de escala es la ventaja.

---

### Pilar 7 — Glowsong Gana Cuando el Local Gana

> **"Nuestro éxito está alineado con el éxito del local, no en tensión con él."**

El modelo de ingresos de Glowsong está diseñado para que el local lo perciba como una fuente de ingresos, no como un costo. El revenue share — donde Glowsong toma un porcentaje de lo que pagan los consumidores — crea alineación de incentivos real: mientras más atractiva sea la experiencia para el cliente final, más gana el local y más gana Glowsong.

**Implicancias estratégicas:**
- El pitch al local siempre abre con el potencial de ingresos adicionales, no con el precio de la suscripción.
- Las métricas de éxito internas incluyen el ingreso generado para los locales, no solo el MRR de Glowsong. Un local que gana USD 300/mes con Glowsong nunca se va.
- Las funcionalidades que se priorizan en el roadmap son las que aumentan la participación del consumidor — porque eso aumenta el ingreso de todos.
- El precio nunca debe sentirse como extracción: si el local paga USD 39/mes de suscripción y recibe USD 250/mes en revenue share, la ecuación habla sola.

**Por qué importa:** El churn de SaaS B2B ocurre cuando el cliente no percibe valor. Si el local recibe más de lo que paga — de forma visible y medible — no hay razón para irse. La alineación de incentivos es la estrategia de retención más poderosa y la más difícil de copiar.

---

### Pilar 8 — Data Como Ventaja Competitiva

> **"Cada noche activa construye un activo que ningún competidor puede comprar."**

Cada local que usa Glowsong genera datos únicos: qué géneros funcionan en qué tipo de local, a qué hora, en qué zona geográfica, qué canciones detonan más participación, qué momentos tienen mayor disposición a pagar. Ese dataset, acumulado en cientos de locales, es el motor del algoritmo y la barrera de entrada más defensible de Glowsong.

**Implicancias estratégicas:**
- La arquitectura de datos se diseña desde el MVP 1 — no como afterthought del MVP 2.
- Los datos se usan para mejorar la experiencia de cada local individual (privacidad by design) y para entrenar el modelo general de comportamiento musical.
- A medida que crece la red de locales, el algoritmo mejora para todos — efecto de red de datos que hace el producto más valioso con cada nuevo local activo.
- Los insights agregados y anonimizados pueden derivar en un producto secundario para la industria (reportes de tendencias musicales para la hostelería).

**Por qué importa:** Un competidor puede lanzar una app de votación de canciones en seis meses. No puede replicar dos años de datos de comportamiento musical en 500 locales chilenos. La data no es solo un activo — es el foso defensivo que se construye solo, noche a noche.

---

### Pilar 9 — LATAM Primero, No Adaptado de Otro Mercado

> **"Glowsong se construye para Latinoamérica, no se traduce para ella."**

El mercado de música para bares en LATAM tiene características propias que las soluciones gringas no contemplan: géneros locales con peso cultural enorme (cumbia, reggaetón, salsa, cueca, vallenato), sistemas de pago distintos (Mercado Pago, transferencias, Webpay, CLP, ARS, COP), y una relación con la música nocturna que tiene identidad regional irrepetible.

Glowsong se construye con eso como punto de partida, no como adaptación posterior.

**Implicancias estratégicas:**
- El catálogo musical, el algoritmo y las playlists por defecto incluyen géneros locales de cada mercado desde el inicio.
- Las integraciones de pago priorizan los métodos dominantes en cada país antes que los internacionales.
- El pricing se fija en moneda local y refleja el poder adquisitivo de cada mercado.
- El equipo de soporte opera en español, conoce la cultura del rubro y entiende el contexto de la noche latinoamericana.
- La expansión geográfica sigue la lógica cultural y de adopción digital de LATAM, no la de mercados desarrollados.

**Por qué importa:** El único riesgo de competencia externa real es que un player global decida entrar a LATAM. Si Glowsong está profundamente arraigado en los sistemas de pago locales, en los géneros locales y en la confianza de los operadores locales cuando eso ocurra, la ventaja es genuinamente defensible. La localización profunda no se puede comprar — solo se construye con tiempo y presencia.

---

## Resumen de Pilares

| # | Pilar | Capa | En Una Frase | Prioridad |
|---|---|---|---|---|
| 1 | La Música Como Experiencia Social | Experiencia | No es streaming, es conexión | 🔴 Máxima |
| 2 | El Local Siempre Tiene el Control | Experiencia | Glowsong amplifica, no reemplaza | 🔴 Máxima |
| 3 | Sin Fricción, en Ambos Lados | Experiencia | Tres pasos o menos, siempre | 🟠 Alta |
| 4 | El Algoritmo Trabaja Invisible | Experiencia | El mejor tech es el que no se nota | 🟠 Alta |
| 5 | Confianza Como Infraestructura | Experiencia | Si el dinero no llega, todo falla | 🔴 Máxima |
| 6 | Sin Hardware, Sin Barreras | Estrategia | Escala sin logística | 🟡 Media-Alta |
| 7 | Glowsong Gana Cuando el Local Gana | Estrategia | Incentivos alineados por diseño | 🟠 Alta |
| 8 | Data Como Ventaja Competitiva | Estrategia | El activo que no se puede copiar | 🟡 Media-Alta |
| 9 | LATAM Primero | Estrategia | Construido para acá, no traducido | 🟡 Media-Alta |

---

## Cómo Usar Este Documento

**En decisiones de producto:** Cuando haya dos opciones de diseño en tensión, identifica qué pilares apoya cada una y cuál tiene mayor prioridad. La decisión que respeta los pilares de mayor prioridad es la correcta.

**En conversaciones con inversores:** Los pilares estratégicos (6–9) articulan por qué Glowsong es defensible y escalable. Los de experiencia (1–5) explican por qué los usuarios no se van y el NPS es alto.

**En onboarding de equipo:** Cualquier persona nueva en Glowsong lee este documento antes de empezar. Define la cultura de producto antes que cualquier especificación técnica. La pregunta "¿esto cumple los pilares?" debe volverse instintiva.

**En revisiones de roadmap:** Cada feature propuesta debe mapearse a al menos un pilar. Si no puede, se cuestiona si debería estar. Si contradice un pilar de prioridad máxima, no entra — sin importar quién la pidió.

**En post-mortems:** Cuando algo falla, la primera pregunta es qué pilar fue violado, implícita o explícitamente. Esa es la raíz del problema.

---

*Documento de producto Glowsong — v2.0*
*Para revisarse cuando cambie la visión o cuando la evidencia del mercado justifique un ajuste estructural.*
