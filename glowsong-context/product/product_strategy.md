# Glowsong — Estrategia de Producto
**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Relación con otros documentos:** Ejecuta `product_vision.md`, guiada por `product_pillars.md`

---

## Qué Es Este Documento

La visión dice a dónde vamos. Los pilares dicen cómo tomamos decisiones en el camino. La estrategia dice **cómo llegamos**: qué apuestas hacemos, en qué orden construimos, cómo encontramos product-market fit y cómo crecemos una vez que lo encontramos.

Una estrategia de producto no es un listado de features. Es un conjunto de decisiones deliberadas sobre dónde jugar, cómo ganar, y en qué secuencia.

---

## Las Apuestas Estratégicas

Toda estrategia implica apuestas — decisiones que podrían estar equivocadas pero en las que apostamos con convicción porque la evidencia las respalda. Nombrarlas explícitamente permite revisarlas cuando llegue nueva información.

---

### Apuesta 1: El Bar es el Canal, No el Cliente Final

Glowsong entra al mercado **a través del local**, no del consumidor. El local adopta la plataforma, la configura y la activa en su espacio. El consumidor la descubre porque está en ese local.

Esto es contraintuitivo en la era de las apps de consumo, pero es correcto por tres razones: el local tiene incentivo económico claro para adoptar (ingresos adicionales), concentra en un solo punto de distribución a decenas de consumidores simultáneos, y su satisfacción con Glowsong determina si la plataforma permanece activa o desaparece.

**Cómo sabemos que esta apuesta está funcionando:** Los locales activos aumentan semana a semana y el churn mensual es menor al 5%.

**Cuándo revisar esta apuesta:** Si el consumidor comienza a buscar activamente Glowsong antes de llegar al bar — en ese momento, la estrategia de adquisición puede volverse también B2C.

---

### Apuesta 2: Chile Primero, LATAM Después

El primer mercado es Chile. No México, no Brasil, no Colombia — aunque son mercados más grandes. Chile ofrece la combinación más favorable para validar el modelo: infraestructura de pagos digitales madura (85% tap & pay), concentración geográfica (Santiago = 40% del país), cultura de bares activa, y cero competencia directa.

Validar en Chile antes de escalar significa que cuando lleguemos a México o Brasil, el modelo estará probado y los errores ya habrán sido pagados con dinero chileno, no con dilución de equity.

**Cómo sabemos que esta apuesta está funcionando:** Alcanzamos 200 locales activos en Chile con métricas de retención saludables antes de abrir operaciones en otro país.

**Cuándo revisar esta apuesta:** Si un competidor entra agresivamente a un mercado LATAM más grande antes de que estemos listos, puede ser necesario acelerar la expansión aunque Chile no esté consolidado.

---

### Apuesta 3: B2B Primero, Luego Encendemos al Consumidor

El MVP 1 es para el local: algoritmo inteligente, control de música, dashboard de gestión. El consumidor llega en el MVP 2. Esta secuencia permite construir la base de locales activos, ganar su confianza, y tener data real antes de lanzar la capa que más importa en la visión.

Resolver un solo lado del marketplace primero es más difícil de contar como historia, pero es más fácil de ejecutar y valida el canal de distribución antes de apostarlo todo al doble.

**Cómo sabemos que esta apuesta está funcionando:** 50 locales usan el MVP 1 activamente (≥4 noches/semana) y lo recomendarían a otro local sin que se los pidan.

**Cuándo revisar esta apuesta:** Si los locales piden activamente la capa del consumidor antes de que la lancemos — eso sería la señal más poderosa de que hay pull genuino.

---

### Apuesta 4: Revenue Share Alinea Mejor que SaaS Puro

El modelo de ingresos de Glowsong combina una suscripción base (SaaS) con revenue share sobre lo que pagan los consumidores. Un modelo de SaaS puro cobra lo mismo sin importar si el local genera valor o no — eso crea tensión. El revenue share alinea los incentivos: Glowsong solo gana más cuando el local gana más.

Esta apuesta implica mayor variabilidad en los ingresos iniciales pero construye una relación con el local que es estructuralmente más duradera.

**Cómo sabemos que esta apuesta está funcionando:** El ingreso promedio por local crece mes a mes y el NPS del local es mayor a 50.

---

## Cómo Ganamos — La Lógica de la Ventaja

Para llegar a la visión, Glowsong tiene que ganar en tres dimensiones simultáneamente. No hay ventaja en una sola.

**Ganamos en distribución** siendo el primer producto en LATAM que los dueños de bares recomiendan entre ellos. El canal de distribución más poderoso en la industria de la hostelería es el boca a boca entre operadores. Un dueño de bar confía más en la recomendación de otro dueño de bar que en cualquier ad. Nuestro objetivo no es tener muchos locales — es tener locales que se conviertan en evangelistas.

**Ganamos en producto** haciendo que la primera semana de un local con Glowsong sea tan buena que sea imposible imaginar volver a Spotify. Eso requiere que el algoritmo funcione desde el día uno, que el onboarding sea impecable, y que el primer viernes con Glowsong activo sea una noche memorable.

**Ganamos en datos** operando más rápido que cualquier competidor potencial. Cada local activo en Chile es un dataset que ningún rival puede comprar. A los 12 meses de operación, el algoritmo de Glowsong sabrá cosas sobre la música en bares chilenos que nadie más sabe — eso es un moat que se construye solo, noche a noche.

---

## Estrategia de Features — Now / Next / Later

El framework Now/Next/Later no es un calendario — es una jerarquía de valor. **Now** es lo que resuelve el problema core hoy. **Next** es lo que amplifica el valor una vez que el core está validado. **Later** es lo que expande el mercado y defiende la posición.

---

### NOW — MVP 1: El Local Como Centro
*Objetivo: 50 locales activos que no quieran volver atrás*

Esta fase construye la base. El consumidor todavía no interactúa — pero el local ya recibe valor claro: la música de su local se gestiona sola, se adapta a la noche, y él tiene control total.

| Feature | Por Qué Ahora | Pilar |
|---|---|---|
| **Algoritmo de playlist inteligente** — adapta género, tempo y energía según hora del día, día de la semana y perfil del local | Es el core del MVP 1. Sin esto, Glowsong es solo otro Spotify. | P4 — Algoritmo Invisible |
| **Dashboard del local** — control en tiempo real: géneros permitidos, artistas bloqueados, volumen, cola activa | El local necesita confiar antes de adoptar. El control visible genera esa confianza. | P2 — Control del Local |
| **Onboarding en <15 minutos** — registro, configuración de perfil musical y primera canción sonando en menos de 15 minutos | La fricción en el onboarding es la primera causa de abandono en B2B SaaS. | P3 — Sin Fricción |
| **Scheduler de música** — configurar qué tipo de música suena en cada franja horaria (almuerzo, tarde, noche, cierre) | El 60% del valor percibido del algoritmo viene de que la música "siempre tiene sentido para el momento". | P4 — Algoritmo Invisible |
| **Analytics básico del local** — qué géneros dominan, horas pico, canciones más reproducidas | Da al local información que nunca tuvo. Primera semilla de la ventaja en datos. | P8 — Data |
| **QR de identidad del local** — código QR que los clientes pueden escanear para ver qué está sonando | Siembra la semilla del MVP 2 sin requerirle nada al consumidor todavía. | P1 — Exp. Social |
| **Integración con Spotify / Apple Music** — reproducción sobre plataforma existente, sin catálogo propio | Sin catálogo propio no hay problema de licencias ni costo de infraestructura de audio. | P6 — Sin Hardware |

**Lo que NO entra en NOW aunque parezca obvio:**
- Votación o pago del consumidor (es MVP 2)
- App nativa del consumidor (es MVP 2)
- Multi-local / cadenas (es Later)
- Gamificación (es Next)

---

### NEXT — MVP 2: El Consumidor Entra al Juego
*Objetivo: 200 locales activos, North Star Metric ≥ 15% de participación del consumidor por noche*

Esta fase enciende la visión. La música deja de ser gestionada y se convierte en experiencia social. El consumidor puede interactuar, el local empieza a generar ingresos adicionales, y Glowsong se diferencia irreversiblemente de cualquier competidor de background music.

| Feature | Por Qué Next | Pilar |
|---|---|---|
| **Interfaz del consumidor vía QR** — sin descarga, accesible desde el QR del local, muestra cola activa y permite interactuar | Es la puerta de entrada al valor diferencial de Glowsong para el consumidor. Sin app, sin fricción. | P3 — Sin Fricción |
| **Votación de canciones** — el consumidor vota la próxima canción dentro del marco definido por el local | Primera capa de interacción social. Bajo riesgo (no hay pago aún), alto impacto en participación. | P1 — Exp. Social |
| **Pago por canción** — el consumidor paga para subir su canción al tope de la cola | Es el modelo de monetización central. La canción pagada tiene prioridad sobre las votadas. | P7 — Glowsong gana cuando el local gana |
| **Integración de pagos LATAM** — Apple Pay, Google Pay, Mercado Pago, Webpay | Sin estos métodos, el pago tiene fricción. Con ellos, es un tap. | P3 — Sin Fricción |
| **Cola visible en tiempo real** — pantalla o visualización en el local mostrando qué suena y qué viene | La cola visible convierte la música en conversación. "¿Quién puso eso?" empieza aquí. | P1 — Exp. Social |
| **Dashboard de ingresos del local** — revenue share en tiempo real: cuánto generó hoy, esta semana, este mes | Hace el valor económico visible e innegable. Principal argumento de retención. | P7 — Glowsong gana cuando el local gana |
| **Dedicatorias** — pagar una canción con un mensaje para alguien en el local | Amplía el gesto social del pago. Cumpleaños, reuniones, celebraciones. | P1 — Exp. Social |
| **Confianza y pagos seguros** — confirmación de transacción, historial, soporte ante disputas | Sin esto, el primer problema de pago destruye la confianza del consumidor y del local. | P5 — Confianza |

---

### LATER — Escala y Defensa
*Objetivo: 1,000+ locales activos, expansión LATAM, modelo defensible*

Esta fase expande el mercado, profundiza el engagement y construye las barreras competitivas que hacen a Glowsong difícil de desplazar.

| Feature | Por Qué Later | Pilar |
|---|---|---|
| **Gamificación del consumidor** — rankings nocturnos, badges, "quien más pone", streaks de participación | Profundiza el engagement una vez que la base de usuarios está activa. No sirve antes. | P1 — Exp. Social |
| **Reacciones sociales en tiempo real** — emojis, aplausos, reacciones a canciones en vivo entre presentes | Capa social más ligera que la votación. Amplía la participación a personas que no van a pagar. | P1 — Exp. Social |
| **Perfil del consumidor y historial** — "tus noches con Glowsong", canciones que pusiste, locales que visitaste | Construye identidad de usuario y aumenta la retención del consumidor. | P8 — Data |
| **Gestión multi-local** — cadenas y dueños con múltiples locales gestionan todo desde un dashboard | Abre el mercado de cadenas y franquicias. Ticket promedio significativamente mayor. | P6 — Sin Hardware |
| **Glowsong para eventos** — activación puntual para cumpleaños, corporativos, eventos privados | Extiende el modelo a un mercado adyacente sin cambiar la plataforma core. | Expansión de mercado |
| **API de integración** — para POS, sistemas de reserva, apps de fidelización de locales | Permite que Glowsong viva dentro del ecosistema tecnológico que el local ya usa. | P6 — Sin Hardware |
| **Reportes de industria** — insights anonimizados sobre tendencias musicales para la hostelería | Producto secundario de alto margen derivado del activo de datos. | P8 — Data |
| **Expansión LATAM** — Colombia, Argentina, México con localización completa | Una vez que el modelo está probado en Chile, la expansión es replicación, no experimentación. | P9 — LATAM Primero |

---

## Estrategia de Product-Market Fit

El PMF no se declara — se detecta. Estas son las señales que confirmarán que Glowsong encontró su encaje en el mercado.

### Las Tres Señales de PMF

**Señal 1 — El local no vuelve atrás.**
Un local que ha usado Glowsong durante 30 días no puede imaginar volver a gestionar la música manualmente. No porque sea difícil salirse, sino porque ya no quiere. Esta es la señal de retención más poderosa que existe: churn voluntario cercano a cero.

*Cómo medirlo:* Churn mensual < 3% en locales con más de 45 días activos. NPS del local > 60.

**Señal 2 — Los locales traen otros locales.**
El boca a boca entre operadores de hostelería es el canal más eficiente posible. Cuando un dueño de bar le dice a otro "tenés que probar esto", Glowsong encontró PMF en distribución. El CAC baja, el ciclo de ventas se acorta y la credibilidad crece de forma orgánica.

*Cómo medirlo:* Al menos 30% de los nuevos locales llegan referidos por otro local activo. Este porcentaje crece con el tiempo, no decrece.

**Señal 3 — El consumidor vuelve a buscar locales con Glowsong.**
Cuando el consumidor, al elegir dónde salir el viernes, considera si el local tiene Glowsong como un criterio de decisión, la plataforma salió del local y entró en la cultura. Esta es la señal más difícil de alcanzar y la más valiosa.

*Cómo medirlo:* Menciones orgánicas en redes sociales. Búsquedas directas de "bares con Glowsong". Solicitudes de consumidores pidiendo a su bar favorito que se sume.

### El Camino al PMF

**Fase 0 — Descubrimiento (primeros 10 locales):**
Manual, founder-led, sin escala. El objetivo no es crecer sino aprender. Cada uno de estos 10 locales se atiende como si fuera el único cliente. Se documenta todo: qué funciona, qué no, qué piden, qué ignoran. Estos 10 locales son el laboratorio, no el negocio.

*Pregunta clave a responder:* ¿Qué feature hace que el local diga "esto es diferente a todo lo que probé"?

**Fase 1 — Validación (10 a 50 locales):**
Se implementan los aprendizajes de la Fase 0. Se lanza el MVP 1 con el producto más simple que resuelva el problema core. Se mide retención semana a semana. El objetivo es llegar a 50 locales con churn < 5% mensual — esa es la señal de que el valor es real.

*Pregunta clave a responder:* ¿Los locales que adoptan Glowsong permanecen activos sin intervención constante del equipo?

**Fase 2 — Aceleración (50 a 200 locales):**
Se activa el MVP 2 (capa del consumidor). Aquí el producto se vuelve complejo porque ahora hay dos lados que gestionar. El foco es que ambos lados retroalimenten el crecimiento del otro: más locales activos → más consumidores que lo conocen → más locales que quieren sumarse.

*Pregunta clave a responder:* ¿La capa del consumidor aumenta la retención del local?

---

## Estrategia de Growth

El growth de Glowsong tiene tres fases con lógicas distintas. Forzar la lógica de la fase 2 en la fase 1 quema recursos y distorsiona los aprendizajes.

---

### Fase 1 — Growth Manual (0 a 50 locales)
**Palanca principal: Ventas founder-led + comunidad acotada**

En esta fase no existe un playbook de ventas — existe el founder hablando directamente con dueños de bares. El objetivo no es eficiencia sino aprendizaje. Cada conversación revela objeciones, motivaciones y language market fit (las palabras exactas con las que los dueños describen el problema).

*Acciones concretas:*
- El o los founders visitan bares en Bellavista, Providencia y Barrio Italia — los tres barrios con mayor concentración de bares en Santiago — y tienen conversaciones directas.
- Se ofrece el primer mes gratis sin condiciones. El objetivo es activación, no revenue.
- Se construye una lista de espera con locales interesados pero que aún no onboardean — crea FOMO y permite priorizar por perfil.
- Se documentan verbatim las primeras 50 conversaciones de ventas. Este corpus es oro para el marketing posterior.

*Señal de que es momento de pasar a Fase 2:* 3 locales que no conocías antes llegaron referidos por locales activos en el mismo mes.

---

### Fase 2 — Growth por Red (50 a 200 locales)
**Palanca principal: Referidos + contenido generado por el local**

Cuando hay masa crítica de locales satisfechos, el crecimiento puede volverse parcialmente viral. El vector principal es el boca a boca entre operadores — pero puede acelerarse con incentivos y con contenido.

*Acciones concretas:*
- **Programa de referidos para locales:** Cada local que refiere a otro activo recibe un mes gratis o un upgrade de funcionalidades. El incentivo tiene que ser lo suficientemente atractivo para que valga la fricción de recomendar.
- **Contenido generado por los locales:** Cuando un local postea en Instagram "esta noche elige la música con Glowsong 🎵", está haciendo marketing gratuito. Facilitar ese comportamiento (templates, stickers, integración con historias) multiplica el awareness sin costo.
- **Casos de éxito publicados:** "Bar X generó $180,000 CLP extra el mes pasado con Glowsong." Ese tipo de contenido cierra ventas sin reunión.
- **Comunidad de operadores:** Un grupo de WhatsApp o Slack con los locales activos donde comparten aprendizajes crea red, reduce churn y genera feedback de producto en tiempo real.

*Señal de que es momento de pasar a Fase 3:* El CAC baja más del 40% respecto a la Fase 1 y el tiempo de ciclo de ventas se acorta a menos de una semana.

---

### Fase 3 — Growth Escalable (200+ locales)
**Palanca principal: Self-serve + canales pagados + expansión geográfica**

Con el modelo validado y el producto estable, el crecimiento puede automatizarse parcialmente. El local puede registrarse, configurarse y activarse sin intervención del equipo de Glowsong.

*Acciones concretas:*
- **Self-serve onboarding completo:** El local puede activar Glowsong en cualquier momento del día sin asistencia humana. Incluye video tutoriales, chat de soporte automatizado y checklist de activación.
- **Performance marketing dirigido a operadores:** Anuncios en Instagram y Facebook apuntando a dueños y encargados de locales con intereses en hostelería, gastronomía y música. El mensaje es simple: "Tu competencia ya genera ingresos con la música. Tú no."
- **Partnerships con proveedores de la industria:** Integraciones y acuerdos de referidos con proveedores de POS (Poster, Revel), sistemas de reserva (TheFork, Cover Manager) y distribuidores de equipos de audio. Acceso a su base de clientes de locales.
- **Expansión a Colombia / Argentina:** Con el playbook chileno documentado, se abre el segundo mercado con un equipo local mínimo (1 persona de ventas) replicando la Fase 1 en ese nuevo contexto.

---

## OKRs por Fase

Los OKRs vinculan la estrategia con la ejecución. Se revisan trimestralmente.

### Fase 1 — Validación del Modelo (MVP 1)

| Objetivo | Key Result |
|---|---|
| Encontrar PMF en el lado del local | KR1: 50 locales activos (≥4 noches/semana de uso) al final del trimestre |
| | KR2: Churn mensual < 5% en locales con >45 días activos |
| | KR3: NPS del local ≥ 60 |
| | KR4: Al menos 3 locales llegan referidos por otro local activo |
| Construir el algoritmo que hace PMF posible | KR1: El algoritmo activo en 100% de los locales sin intervención manual del equipo |
| | KR2: Tiempo promedio de onboarding < 15 minutos |

### Fase 2 — Activación del Consumidor (MVP 2)

| Objetivo | Key Result |
|---|---|
| Activar la capa del consumidor | KR1: 200 locales activos con capa del consumidor encendida |
| | KR2: North Star Metric ≥ 15% de participación del consumidor por noche en locales activos |
| Validar el modelo de monetización | KR1: Ingreso promedio por local ≥ USD 80/mes (revenue share + suscripción) |
| | KR2: 70% de los locales activos generan ingresos adicionales vía revenue share |
| Confirmar PMF del consumidor | KR1: 30% de consumidores que participan en una noche vuelven a participar en la siguiente visita al mismo local |

### Fase 3 — Escala

| Objetivo | Key Result |
|---|---|
| Escalar en Chile | KR1: 1,000 locales activos en Chile |
| | KR2: CAC < USD 150 por local |
| | KR3: LTV/CAC ≥ 4x |
| Iniciar expansión LATAM | KR1: 100 locales activos en un segundo país (Colombia o Argentina) |
| | KR2: Primer mes de operación en nuevo mercado con churn < 8% |

---

## Riesgos Estratégicos y Planes de Contingencia

| Riesgo | Probabilidad | Impacto | Contingencia |
|---|---|---|---|
| Los consumidores no pagan por canciones (fricción o cultura) | Media | Muy alto | MVP 2 inicia con votación gratuita antes del pago. Si la votación tiene alta participación, el paso al pago es natural. Si no hay participación gratuita, el pago tampoco funcionará y hay que replantear la mecánica. |
| Los locales no renuevan después del período de prueba | Media | Alto | El mes 2 debe mostrar un número concreto de ingresos adicionales. Si el local no generó al menos USD 50 extra, el pitch de renovación es débil. Solución: asegurar que cada local tiene al menos una "noche ganadora" documentada antes de la renovación. |
| Competidor global entra a LATAM antes de que Glowsong tenga escala | Baja | Alto | Acelerar la expansión a 2-3 mercados simultáneamente en lugar de secuencial. La ventaja de Glowsong no es la tecnología — es el conocimiento local y los locales ya activos. Eso no se copia de un día para el otro. |
| Problema de licencias musicales (SCD / derechos) | Media | Muy alto | Resolver el marco legal antes del lanzamiento público. Contacto temprano con SCD. El modelo de operar sobre plataformas de streaming (Spotify, Apple Music) que ya tienen licencias es el escudo principal de corto plazo. |
| El algoritmo no funciona bien en los primeros locales | Media | Alto | Los primeros 10 locales se configuran manualmente con apoyo del equipo. El algoritmo se afina con datos reales antes de escalar. No se escala hasta que el algoritmo funciona sin intervención en 3 locales consecutivos durante 30 días. |

---

## El Criterio de Éxito en 18 Meses

Si en 18 meses Glowsong cumple los siguientes tres criterios, la estrategia está funcionando:

1. **200 locales activos en Chile** con churn mensual < 5% — demuestra que el canal B2B está validado y el producto retiene.

2. **North Star Metric ≥ 15%** en al menos el 60% de los locales activos — demuestra que la capa social del consumidor es real, no aspiracional.

3. **Al menos un local que diga públicamente** — en redes, en una entrevista, en una conversación — que Glowsong cambió la forma en que gestiona su local — demuestra que el producto tiene impacto real, no solo métricas de vanidad.

---

*Documento estratégico de producto — Glowsong v1.0*
*Para revisarse trimestralmente o ante cambios significativos en el mercado, la competencia o los aprendizajes del producto.*
