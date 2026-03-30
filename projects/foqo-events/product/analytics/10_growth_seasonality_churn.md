# 10 — Growth: Seasonality y Churn
> Contexto de growth para Foqo Events · Marzo 2026

---

## Por qué esto importa
El churn silencioso mata más startups que la falta de adquisición. Si Foqo Events no diseña retención desde el MVP, los usuarios se irán después del primer concierto y el negocio no escala. Además, la industria de conciertos tiene estacionalidad marcada — necesitamos saberlo antes de interpretar métricas.

---

## Seasonality de conciertos en Chile

### El año en conciertos

| Período | Actividad | Eventos ancla |
|---|---|---|
| Enero | Media — fin de vacaciones | Shows internacionales, indie local |
| **Febrero–Marzo** | **MUY ALTA — temporada pico** | Festival de Viña (feb), Lollapalooza Chile (marzo) |
| Abril–Mayo | Moderada — post-temporada | Conciertos internacionales sueltos |
| Junio–Agosto | **BAJA — invierno** | Escasa actividad masiva |
| Septiembre | Recuperación | Post fiestas patrias |
| Octubre–Diciembre | Media-Alta — cierre de año | Shows de fin de año, preventa temporada siguiente |

### Implicancias para Foqo Events
- **Lanzar antes de febrero** es crítico para capturar el pico de demanda
- Los meses de invierno (junio–agosto) son el test real de retención — si los usuarios siguen usando la app sin conciertos frecuentes, el producto tiene valor genuino
- **Presupuesto de adquisición** debe concentrarse en enero–marzo cuando hay mayor propensión a descargar y usar una app de conciertos

### Seasonality global — cambio importante
La industria está migrando de "estacionalidad por clima" a **"estacionalidad impulsada por artistas"**: un tour de Taylor Swift o Karol G crea un pico agudo de demanda en cualquier mes del año, independiente de si es verano o invierno.

Esto es una ventaja para Foqo — si las notificaciones son relevantes, el usuario tiene razón para abrir la app en cualquier época del año.

---

## Benchmarks de retención

### Retención general en apps

| Métrica | Promedio LATAM | Benchmark bueno | Objetivo Foqo |
|---|---|---|---|
| D1 Retention | 19% | 40–50% | >35% |
| D7 Retention | 11% | 25–33% | >20% |
| D30 Retention | 5% | 15–20% | >15% |
| Retención mensual (churn) | ~95% churn anual | 93%+ retención mensual | >85% retención mensual |

**Referencia Spotify:**
- Monthly churn: 3.9% (2021), bajó a 1–2% en mercados maduros
- Audio streaming en general: 12% churn anual

**Referencia apps de noticias/entretenimiento LATAM:**
- D30: 5% (muy bajo, indica problema de hábito)

---

## Patrones de churn específicos en apps de eventos

### Cuándo ocurre el churn

1. **Post-compra de entrada:** El usuario descarga la app, compra la entrada, descarga el PDF de confirmación, y nunca vuelve. Es el patrón más frecuente y más costoso.

2. **Post-evento:** El usuario va al concierto, tal vez lo ve en el mapa, y no hay razón para volver si no hay otro evento próximo de su interés.

3. **Temporada baja:** Junio–agosto, pocos eventos → pocos motivos para abrir la app → hábito se rompe.

4. **Notificaciones irrelevantes:** Si las notificaciones no son personalizadas, el usuario las desactiva → el canal de re-engagement más poderoso queda inutilizado.

### Comportamientos predictores de churn (basado en investigación de ML sobre Sparkify)
- Baja diversidad de artistas seguidos (menos de 3–5)
- Pocas interacciones con features distintos al buscador
- Sesiones cortas y decrecientes en frecuencia
- Sin conexiones sociales en la app (0 amigos, 0 eventos compartidos)
- Primer evento asistido sin segundo evento planificado

### Comportamientos predictores de retención
- Alta diversidad de engagement (usa múltiples features)
- Interacción social (compartir eventos, invitar amigos)
- Exploración de artistas nuevos (no solo busca lo conocido)
- Historial de asistencia activo
- Notificaciones activas y sin silenciar

---

## Estrategias de retención

### 1. Onboarding que lleva al "aha moment" rápido

El aha moment de Foqo Events es: **"Me acabo de enterar de un concierto que no sabía y me interesa."**

El objetivo es que esto ocurra en los **primeros 5 minutos** de uso. Cada paso adicional antes de ese momento aumenta el riesgo de abandono.

**Diseño de onboarding:**
- Paso 1: Permiso de ubicación (opcional, para conciertos cerca)
- Paso 2: "¿Cuáles son tus 3 artistas favoritos?" (o conectar Spotify)
- Paso 3: Mostrar inmediatamente los próximos conciertos de esos artistas en Chile
- Paso 4: Activar notificaciones para esos artistas

**80% de los usuarios abandonan si el onboarding es pobre.** No hay segunda oportunidad.

---

### 2. Features de retención durante temporada baja

| Feature | Mecanismo | Impacto en retención |
|---|---|---|
| "Artista del día" | Contenido diario sin necesidad de evento | Construye hábito de apertura |
| Historial de conciertos | Timeline visual de eventos asistidos | Identidad de "concertero", engagement emocional |
| Setlist histórico pre-show | Intel sobre el artista que verá | Retiene al usuario semanas antes del evento |
| Artistas similares que tocan | Discovery incluso sin artistas seguidos | Extiende el repertorio del usuario |
| "Memoria" de hace un año | "Hace un año fuiste a [concierto]" | Re-engagement emocional |

---

### 3. Gamificación

Aplicaciones con gamificación tienen +22% de retención en promedio. Usuarios gamificados pasan 9% más tiempo en la app.

**Para Foqo Events:**
- **Badges de asistencia:** "Has visto a 10 artistas distintos"
- **Racha de conciertos:** asististe X meses seguidos
- **Explorer badge:** descubriste X artistas que nunca habías seguido
- **Historial como identidad:** la cantidad y variedad de conciertos asistidos es un status social en comunidades de música

**Referente:** Spotify Wrapped genera 70%+ de engagement anual y millones de UGC orgánico en diciembre. Un "Año en Conciertos" de Foqo Events puede replicar esto.

---

### 4. Push notifications como motor de retención

Push notifications superan al email 5–10x en open rate y efectividad.

| Canal | Open rate | Efectividad en reactivación |
|---|---|---|
| WhatsApp/SMS | 90–98% | 20–40% de reactivación |
| Push notification | 12–42% | Alta para usuarios que no las silenciaron |
| Email | 12% | Bajo, complementario |

**Reglas de oro para notificaciones de Foqo:**
- Notificar **mínimo 72–96 horas antes** del evento (no el mismo día)
- Notificar cuando **salen las entradas** (no cuando se agotaron)
- **Máximo 2–3 notificaciones/semana** por usuario para no saturar
- Personalización real: nunca mandar un concierto de reggaeton a alguien que solo sigue hardcore
- Urgencia legítima: "Quedan 200 entradas" solo si es verdad

---

### 5. Post-compra: el momento más subutilizado

La compra de entrada es el momento de **máxima propensión a engagement**. El usuario está emocionado. Hay que capitalizar eso inmediatamente.

**Secuencia recomendada post-compra:**
- Inmediato: "Tu entrada está confirmada. Aquí el setlist más tocado de [artista]"
- D-7: "Faltan 7 días. Crea tu playlist pre-show"
- D-3: "Setlist del último show de esta gira: [link]"
- D-1: "Mañana es el día. Cómo llegar a [venue], qué llevar, horarios"
- D+1: "¿Cómo estuvo? Deja tu review y ve las fotos de otros asistentes"

---

## Re-engagement: recuperar usuarios dormidos

### Cuándo actuar

- **30 días sin abrir la app:** Enviar primer mensaje de re-engagement
- **60 días:** Último intento antes de que sea muy difícil recuperarlos
- **90+ días:** Tasa de recuperación cae dramáticamente

### Secuencia de campaña de win-back (4 semanas)

| Semana | Mensaje | Canal | Tono |
|---|---|---|---|
| 1 | "Te hemos extrañado — hay conciertos nuevos cerca de ti" | Push | Suave, informativo |
| 2 | "X amigos están yendo a [evento] este mes" | Push + Email | Social proof |
| 3 | "[Artista favorito] acaba de anunciar fecha en Santiago" | WhatsApp | Urgencia |
| 4 | "Último aviso: 20% de descuento en tu próxima entrada" | WhatsApp + Email | Incentivo económico |

**Tasa de reactivación esperada:** 15–25% (algunas campañas alcanzan 50% con incentivos fuertes)

### Segmentación crítica
No todos los inactivos son iguales:
- **Inactivo 30 días** vs **inactivo 6 meses** → mensajes distintos
- **Usuario que compró entradas** vs **usuario que nunca compró** → valor diferente
- **High-value (5+ eventos)** vs **low-value (1 evento)** → inversión de recuperación diferente

---

## KPIs de retención a monitorear

| KPI | Frecuencia | Objetivo |
|---|---|---|
| D1 / D7 / D30 Retention | Semanal | D30 > 15% |
| Monthly churn rate | Mensual | < 15% |
| Post-compra retention (7 días) | Por cohorte | > 40% |
| Notificaciones activas / total usuarios | Mensual | > 70% |
| Post-event engagement (abre app D+1) | Por evento | > 25% |
| Win-back campaign success rate | Por campaña | > 15% |
| Seasonal decline (junio vs marzo) | Anual | < 40% de caída |

---

## Resumen: lo más importante

1. **La temporada baja es el test real** del producto. Si los usuarios usan Foqo Events en julio sin conciertos cercanos, el producto tiene valor intrínseco. Diseñar para esto desde el MVP.

2. **El post-compra es el momento más valioso y más subutilizado.** Hay que capitalizarlo con una secuencia de contenido que cree anticipación hasta el día del evento.

3. **Las push notifications son el canal de retención más poderoso**, pero solo si son personalizadas y oportunas. Mal usado, destruye el canal para siempre.

4. **La gamificación simple** (historial de conciertos, badges) crea identidad y retención emocional que ninguna feature funcional logra replicar.

5. **Actuar a los 30 días de inactividad**, no a los 90. La ventana de re-engagement se cierra rápido.
