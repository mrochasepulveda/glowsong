# Glowsong — PRD S: F1 — Onboarding del Local en Menos de 15 Minutos

**Versión:** 1.0 | **Última actualización:** Marzo 2026
**Prioridad:** P0 — Crítica (bloqueante para todas las demás features)
**Dependencias:** Ninguna — es el punto de entrada al sistema

---

## ⚠️ Instrucciones para Claude Code

Este documento describe el flujo completo de onboarding de un nuevo Local en Glowsong. Antes de implementar:

1. **Lee el PRD-XL completo** — especialmente la Sección 1 (Glosario), Sección 5 (Modelo de Datos) y Sección 6 (Integración con Spotify Connect API).
2. **El onboarding tiene 4 pasos secuenciales**. El usuario no puede saltear ninguno. Debe poder abandonar y retomar desde donde lo dejó.
3. **El paso 4 (Spotify) es el único que marca al Local como `active`**. Sin él, el Local queda en estado `pending_spotify` y no puede reproducir música.
4. **Usa `GENRES_CATALOG` exactamente como está definido en el PRD-XL, Sección 5**. No inferas géneros adicionales.
5. **El refresh_token de Spotify se almacena CIFRADO**. No hay excusa para omitir esto.
6. **El campo `onboarding_completed` en `User`** solo se marca `true` cuando los 4 pasos se completan exitosamente.

---

## 1. Resumen de la Feature

El onboarding es el proceso mediante el cual un nuevo Owner registra su local en Glowsong y lo deja listo para reproducir música gestionada. El objetivo de producto es que un dueño de bar, sin conocimiento técnico, pueda completar el proceso en menos de 15 minutos desde el primer clic hasta ver el dashboard activo.

El onboarding tiene **4 pasos** presentados como un wizard secuencial con indicador de progreso:

| Paso | Nombre | Acción Principal | Estado Post-Paso |
|------|--------|-----------------|-----------------|
| 1 | Registro de cuenta | Email+contraseña o Google OAuth | `User` creado, `email_verified = false` (si email) |
| 2 | Perfil del Local | Nombre, tipo, barrio, horarios | `Local` creado con datos básicos |
| 3 | Perfil Musical | Géneros permitidos, configuración inicial | `MusicProfile` default creado |
| 4 | Conexión Spotify | OAuth 2.0 con Spotify Premium | `Local.status = active` |

**Criterio de éxito del onboarding:** El Owner ve el Dashboard con estado "Listo para reproducir" y puede iniciar una sesión haciendo clic en Play.

---

## 2. Alineación Estratégica

| Pilar Estratégico | Cómo F1 lo Implementa |
|---|---|
| Pilar 3 — Sin Fricción | El onboarding completo debe tomar < 15 minutos. Cada paso tiene una sola pantalla. |
| Pilar 6 — Sin Hardware | No se requiere instalar nada. El Owner conecta Spotify desde el navegador. |
| Pilar 2 — Control del Local | El Owner configura su identidad musical desde el primer minuto (géneros, tipo de local). |
| Pilar 8 — Data Como Ventaja | Desde el momento en que el Local está `active`, los `SessionEvents` comienzan a registrarse. |

**Métrica clave de esta feature:**
- Tasa de conversión del onboarding: % de Owners que inician el registro y llegan al Dashboard activo
- Objetivo MVP 1: > 70% de completación del onboarding

---

## 3. Jobs To Be Done (JTBD)

### Job 1: Registrar mi Local en el Sistema
**Quién:** Owner que acaba de conocer Glowsong y quiere probarlo.
**Motivación:** Quiero que Glowsong reconozca mi local como una entidad única para poder configurarlo y gestionarlo.
**Resultado esperado:** Tengo una cuenta, mi local existe en el sistema, y puedo volver a acceder en cualquier momento con mis credenciales.
**Contexto:** Probablemente lo hace desde su teléfono, en horario diurno, antes de abrir el local.

### Job 2: Configurar la Identidad Musical de mi Local
**Quién:** Owner que sabe qué tipo de música quiere que suene en su espacio.
**Motivación:** Quiero que el sistema sepa qué géneros son coherentes con mi bar para que no suene algo que no corresponde con mi ambiente.
**Resultado esperado:** He seleccionado géneros que representan mi local y el sistema los usa como base para seleccionar música.
**Contexto:** El Owner conoce su negocio muy bien. El sistema debe darle opciones claras y no intentar educarlo sobre géneros.

### Job 3: Conectar mi Cuenta de Spotify para que Glowsong la Controle
**Quién:** Owner con Spotify Premium activo que quiere delegar la gestión de la música.
**Motivación:** No quiero preocuparme por qué canción sigue. Quiero que Glowsong use mi Spotify sin que yo tenga que hacer nada en la app de Spotify.
**Resultado esperado:** Glowsong tiene acceso autorizado a mi cuenta Spotify y puede encolar y controlar canciones en mis dispositivos.
**Contexto:** El Owner puede tener dudas sobre "qué accesos le estoy dando a Glowsong". La pantalla debe ser clara sobre qué hace y qué no hace Glowsong con su cuenta.

---

## 4. User Stories (Framework INVEST)

### US-F1-01: Registro con Email
**Como** Owner nuevo,
**quiero** registrarme con mi email y una contraseña,
**para** crear mi cuenta en Glowsong y acceder al sistema.

**Criterios de Aceptación:**
- El formulario solicita: email (validado), contraseña (mínimo 8 caracteres, 1 número) y confirmación de contraseña.
- Si el email ya existe en el sistema, se muestra: *"Este email ya está registrado. ¿Olvidaste tu contraseña?"* con link a recuperación.
- Al enviar, se crea el `User` con `email_verified = false` y se envía email de verificación con link de un solo uso (TTL: 24 horas).
- El Owner puede continuar al paso 2 **sin verificar el email** (verificación no bloquea el onboarding).
- Un banner de aviso sobre la verificación pendiente se muestra en el paso 2.
- **Estimación:** 1 día.

---

### US-F1-02: Registro con Google OAuth
**Como** Owner nuevo,
**quiero** registrarme con mi cuenta de Google en un clic,
**para** no tener que crear ni recordar otra contraseña.

**Criterios de Aceptación:**
- El botón "Continuar con Google" inicia flujo OAuth 2.0 con Google.
- Si el Google ID ya está asociado a una cuenta existente, se hace login y se redirige al Dashboard.
- Si el email de Google ya existe en el sistema registrado por email-password, se muestra mensaje de merging o se rechaza con instrucción clara.
- Al completarse exitosamente, `User.google_id` se almacena y `email_verified = true` (Google ya verificó el email).
- Si el flujo de Google falla (OAuth error, ventana cerrada), se muestra el formulario tradicional con mensaje de error no técnico.
- **Estimación:** 1 día.

---

### US-F1-03: Configuración del Perfil del Local (Paso 2)
**Como** Owner que acaba de registrarse,
**quiero** ingresar los datos básicos de mi bar (nombre, tipo, barrio, horarios),
**para** que Glowsong tenga el contexto de mi local.

**Criterios de Aceptación:**
- Interfaz basada en tarjetas (Cards) con estética Premium y efectos glassmorphism.
- Campos requeridos: nombre del local (max 100 chars), tipo (selector visual en grilla con iconos/emojis para opciones del enum: `bar`, `pub`, `coctelería`, `cervecería`, `restaurante`, `discoteca`, `otro`), barrio/comuna (texto libre, max 100 chars).
- Horarios de operación: selector de días de la semana activos + hora de apertura y cierre por día (formato HH:MM en 24h). Al menos 1 día debe estar configurado.
- El sistema permite guardar el paso 2 y continuar al paso 3 sin validar horarios perfectos — advertencia si hay inconsistencias.
- Si el usuario abandona aquí, al volver se restaura el estado del formulario con los datos guardados.
- **Estimación:** 1-2 días.

---

### US-F1-04: Configuración del Perfil Musical (Paso 3)
**Como** Owner configurando mi local,
**quiero** seleccionar los géneros musicales que van con mi local,
**para** que el algoritmo de Glowsong seleccione canciones apropiadas para mi ambiente.

**Criterios de Aceptación:**
- Tarjeta dedicada a la Identidad Musical.
- Se muestra la lista completa de `GENRES_CATALOG` como chips/badges seleccionables, acompañados de un botón para "Desmarcar todos" si hay activos.
- Se incluye un buscador interactivo de "Artistas Base" (Seed Artists), que consulta a Spotify (`GET /v1/search?type=artist`) para permitir al Owner seleccionar hasta 5 artistas favoritos representativos de su local.
- El Owner puede seleccionar múltiples géneros y/o artistas. **Mínimo 1 género o 1 artista seleccionado** para poder avanzar.
- Los géneros y artistas seleccionados se almacenan en el `MusicProfile` default (`is_default = true`) del Local (`allowed_genres` y `seed_artists`).
- El campo `energy_level` del `MusicProfile` se crea con valor `auto` por defecto (el algoritmo ajusta por franja horaria).
- Hay un texto explicativo breve: *"Establece los géneros y artistas base que sonarán en tu local. El sistema ajustará la energía de la música según la hora del día."*
- Al guardar, se crea el `MusicProfile` en BD antes de avanzar.
- **Estimación:** 2 días.

---

### US-F1-05: Conexión de Spotify (Paso 4)
**Como** Owner en el último paso del onboarding,
**quiero** conectar mi cuenta de Spotify Premium con Glowsong,
**para** que el sistema pueda controlar la reproducción en mi local.

**Criterios de Aceptación:**
- La pantalla muestra QUÉ hace Glowsong con Spotify: *"Glowsong controla qué canciones suenan en tu local. No puede ver tu historial personal ni modificar tus playlists personales."*
- Al hacer clic en "Conectar Spotify", el backend genera la URL de autorización Spotify con los scopes requeridos (`user-read-playback-state`, `user-modify-playback-state`, `user-read-currently-playing`, `user-read-private`).
- El Owner es redirigido a Spotify y regresa al callback de Glowsong.
- Si Spotify retorna un error (usuario deniega, cierra la ventana), se muestra mensaje: *"No pudimos conectar tu Spotify. Puedes intentarlo nuevamente cuando quieras"* con botón de reintento.
- Si la cuenta de Spotify **no es Premium**, se detecta el error `403 PREMIUM_REQUIRED` y se muestra mensaje específico: *"Glowsong requiere Spotify Premium para funcionar. Verifica que tu cuenta sea Premium antes de conectar."*
- Al conectar exitosamente, el `refresh_token` se almacena cifrado y `Local.status` cambia a `configured`.
- **Estimación:** 1-2 días.

---

### US-F1-06: Reanudación del Onboarding Interrumpido
**Como** Owner que comenzó el onboarding pero no lo terminó,
**quiero** poder retomar desde donde lo dejé,
**para** no tener que repetir los pasos ya completados.

**Criterios de Aceptación:**
- Si un `User` autenticado tiene `onboarding_completed = false`, al iniciar sesión se redirige automáticamente al onboarding en el último paso completado.
- El wizard muestra visualmente qué pasos están completos (check verde) y en cuál está actualmente.
- La barra de progreso refleja el avance honesto: 0%, 25%, 50%, 75%, 100%.
- Los datos ingresados en pasos anteriores se mantienen y no se pierden al navegar entre pasos.
- Si el paso 4 (Spotify) está pendiente pero los pasos 1-3 están completos, el Owner ve directamente la pantalla de conexión Spotify.
- **Estimación:** 1 día.

---

### US-F1-07: Confirmación de Email Post-Registro
**Como** Owner que se registró con email,
**quiero** recibir un email de verificación y confirmar mi cuenta,
**para** asegurar que nadie más pueda usar mi email en Glowsong.

**Criterios de Aceptación:**
- El email de verificación se envía inmediatamente tras el registro exitoso con email.
- El subject del email es: *"Confirma tu cuenta en Glowsong"*.
- El link de verificación es de un solo uso y expira en 24 horas.
- Si el link expiró, el sistema muestra un botón para reenviar el email de verificación.
- Solo se puede reenviar el email 1 vez cada 5 minutos (rate limiting anti-spam).
- La verificación de email es un proceso paralelo que NO bloquea el uso del sistema.
- **Estimación:** 0.5 días.

---

## 5. Escenarios

### Happy Path

```
1. Owner accede a glowsong.app/register
2. Hace clic en "Continuar con Google" → autoriza → regresa a Glowsong
3. [Paso 2] Ingresa: "Bar El Copihue", tipo: bar, barrio: Barrio Italia, 
   horarios: Martes a Domingo 18:00–02:00 → "Continuar"
4. [Paso 3] Selecciona géneros: JAZZ, SOUL, FUNK, INDIE, y artistas: "Arctic Monkeys" → "Continuar"
5. [Paso 4] Lee descripción de accesos → clic "Conectar Spotify" → 
   autoriza en Spotify → regresa al callback
6. ✅ Sistema muestra: "¡Tu local está listo!" con botón "Ir al Dashboard"
7. Owner hace clic → llega al Dashboard con estado "Listo para reproducir"
8. Abre Spotify en su tablet del bar → vuelve al Dashboard → clic "Play"
9. Música comienza a sonar 🎵
```

### Edge Cases

#### EC-F1-01: Usuario cierra el browser en el paso 3
- El sistema habrá guardado los datos del paso 2 al hacer clic en "Continuar".
- Al volver a iniciar sesión, se redirige al paso 3 con el wizard mostrando pasos 1 y 2 como completos.
- El formulario del paso 3 aparece vacío (no había datos guardados aún en este paso para géneros o artistas).

#### EC-F1-02: Email ya registrado con otro método (Google vs Email)
- Si el email de Google ya existe como cuenta de email-password: mostrar mensaje *"Ya tienes una cuenta con este email. Inicia sesión con tu contraseña."*
- No mergear cuentas automáticamente en MVP 1.

#### EC-F1-03: Usuario cierra la ventana de autorización de Spotify
- El callback de Spotify recibe un error `access_denied`.
- El sistema muestra un mensaje amigable en el paso 4: *"Parece que cancelaste la conexión con Spotify. No pasa nada, puedes intentarlo cuando estés listo."*
- El botón "Conectar Spotify" vuelve a su estado inicial. El `Local.status` permanece en `pending_spotify`.

#### EC-F1-04: Google OAuth falla por error técnico
- El sistema muestra el formulario de email-password con el banner: *"Hubo un problema al conectar con Google. Puedes registrarte con tu email."*
- No se muestra el error técnico de Google al usuario.

#### EC-F1-05: El Owner intenta seleccionar 0 géneros y 0 artistas en paso 3
- El botón "Continuar" permanece deshabilitado con tooltip: *"Selecciona al menos 1 género o artista para continuar."*

### Estados de Error

| Error | Origen | Mensaje al Usuario | Acción del Sistema |
|---|---|---|---|
| Email duplicado | BD | "Este email ya está registrado. ¿Olvidaste tu contraseña?" | No crear usuario duplicado |
| Spotify no Premium | Spotify API 403 | "Glowsong requiere Spotify Premium. Verifica tu cuenta." | `Local.status` permanece `pending_spotify` |
| Spotify OAuth fallo | Spotify | "No pudimos conectar tu Spotify. Inténtalo nuevamente." | Log del error internamente |
| Error de red en paso 4 | Red | "Parece que hay un problema de conexión. Verifica tu internet." | Botón de reintento visible |
| Link de verificación expirado | Sistema | "Este enlace expiró. Te enviamos uno nuevo." | Reenvío automático del email |
| Timeout del servidor | Backend | "Algo salió mal de nuestro lado. Recarga la página." | Log de error con contexto del paso |

---

## 6. Criterios de Aceptación

### Criterios Funcionales Globales del Onboarding

- [ ] Un Owner puede completar el onboarding desde cero en menos de 15 minutos bajo condiciones normales de uso.
- [ ] Al finalizar el paso 4, `Local.status` es `active` y `User.onboarding_completed` es `true`.
- [ ] El progreso del onboarding persiste entre sesiones — si el usuario cierra y vuelve, retoma desde el último paso completado.
- [ ] En ningún momento del onboarding se solicita tarjeta de crédito, datos bancarios ni información de pago.
- [ ] En ningún momento del onboarding se solicita descargar una aplicación nativa.
- [ ] El flujo completo funciona en mobile (375px mínimo de ancho) sin scroll horizontal.
- [ ] El `MusicProfile` default tiene al menos 1 género o artista seleccionado antes de finalizar.
- [ ] El `spotify_refresh_token` se almacena cifrado en la BD. Nunca en logs ni en respuestas de API.

### Criterios de Estado del Sistema

- [ ] Un `Local` puede existir en estado `pending_spotify` (pasos 1-3 completos, paso 4 pendiente).
- [ ] Un `Local` con `status = pending_spotify` **no puede** iniciar reproducción ni acceder al Dashboard de control.
- [ ] El cambio de `Local.status` a `active` ocurre exactamente cuando el `refresh_token` de Spotify se almacena exitosamente.

---

## 7. Anti-patrones de esta Feature

### ❌ No pedir tarjeta de crédito
El MVP 1 no tiene modelo de cobro activo. No incluir ningún campo ni referencia a pago en el onboarding.

### ❌ No requerir descarga de app
Glowsong es una web app. El onboarding se completa completamente en el browser. No redirigir a App Store ni Google Play.

### ❌ No bloquear el onboarding si el email no está verificado
La verificación de email es importante pero no puede bloquear al Owner de usar el producto. Un Owner sin email verificado puede completar el onboarding y usar el sistema. El email verificado solo afecta funcionalidades de comunicación (reportes, recuperación de contraseña).

### ❌ No permitir saltar el paso 4 (Spotify)
El paso 4 es obligatorio para que el Local funcione. Puede deferirse (el Owner puede salir y volver), pero no pueden existir Locales en estado `active` sin Spotify conectado. Si el Owner intenta acceder al Dashboard sin completar el paso 4, se redirige al onboarding en el paso 4.

### ❌ No permitir avanzar en el paso 3 sin al menos 1 género o artista
Un `MusicProfile` sin géneros ni artistas no puede alimentar el algoritmo. El botón "Continuar" del paso 3 debe estar deshabilitado si `allowed_genres.length === 0` y `seed_artists.length === 0`.

### ❌ No mostrar el refresh_token en ninguna respuesta ni log
El `spotify_refresh_token` es una credencial. Si aparece en cualquier payload de respuesta HTTP, log de aplicación o mensaje de error, es un bug de seguridad crítico.

---

## 8. Dependencias

### Dependencias Externas
| Dependencia | Tipo | Descripción |
|---|---|---|
| Spotify OAuth 2.0 | Bloquea el paso 4 | Requiere credenciales de app registrada en Spotify Developer Dashboard |
| Google OAuth 2.0 | Opcional (solo si se implementa login con Google) | Requiere proyecto en Google Cloud Console con OAuth configurado |
| Servicio de Email | Bloquea la verificación de email | SendGrid / Resend / SES — necesario para US-F1-07 |

### Dependencias Internas
| Dependencia | Feature | Descripción |
|---|---|---|
| `GENRES_CATALOG` | PRD-XL Sección 5 | Lista fija de géneros. No crear lista adicional. |
| Modelo `User` | PRD-XL Sección 5 | Campos: `email_verified`, `onboarding_completed` |
| Modelo `Local` | PRD-XL Sección 5 | Campos: `status`, `spotify_refresh_token`, `active_device_id` |
| Modelo `MusicProfile` | PRD-XL Sección 5 | Creado al final del paso 3 |

### Features que Dependen de F1
- **F2 (Algoritmo):** Requiere `MusicProfile` configurado y Spotify conectado.
- **F3 (Dashboard):** Solo accesible si `onboarding_completed = true` y `Local.status = active`.
- **F4, F5, F6:** Todas dependen indirectamente de F1 como puerta de entrada.

---

## 9. Notas de Implementación

### Gestión de Estado del Wizard
Implementar el onboarding como un wizard de 4 pasos con estado persistido en el backend (no solo en el cliente). Cada paso completado debe disparar un `PATCH` o equivalente al backend para guardar el progreso antes de avanzar. El cliente solo navega al siguiente paso si el backend confirma el guardado.

```
POST /api/auth/register           → Crea User, retorna JWT
PATCH /api/onboarding/step-2      → Guarda datos del Local (perfil básico)
PATCH /api/onboarding/step-3      → Guarda MusicProfile default
GET /api/auth/spotify/authorize   → Genera URL OAuth de Spotify
GET /api/auth/spotify/callback    → Recibe code, intercambia, guarda refresh_token
GET /api/onboarding/status        → Retorna en qué paso está el Owner
```

### Flujo de Refresh Token de Spotify
```
1. Backend recibe `code` del callback
2. Llama a Spotify: POST https://accounts.spotify.com/api/token
   Body: { grant_type: 'authorization_code', code, redirect_uri }
3. Recibe: { access_token, refresh_token, expires_in }
4. Cifra el refresh_token (AES-256-GCM o libsodium)
5. Guarda refresh_token cifrado en Local.spotify_refresh_token
6. Guarda access_token en caché (memoria o Redis) con TTL de 50 minutos
7. Llama GET /v1/me para verificar que la cuenta es Premium
8. Si no es Premium → retorna error al frontend, NO guarda el refresh_token
9. Si es Premium → marca Local.status = 'active'
```

### Consideraciones de UX para el Paso 4
- Antes de redirigir a Spotify, abrir en la misma tab (no en popup). Los popups son bloqueados con frecuencia.
- El Owner que regresa del callback puede estar confundido sobre "¿qué pasó?". La pantalla de éxito debe ser inmediatamente clara: "✅ Spotify conectado. Tu local está listo."
- Si el callback tarda más de 3 segundos en responder, mostrar un loading state.

### Validaciones de Horarios
Los `operating_hours` se almacenan como JSON `{ lunes: { open: "18:00", close: "02:00" }, ... }`. Considerar que "close" puede ser al día siguiente (ej: abrir a 18:00, cerrar a 02:00 del día siguiente). El sistema debe manejar este caso sin confundir al algoritmo de franjas horarias de F2.

### Seguridad
- Rate limiting en el endpoint de registro: máximo 5 intentos de registro por IP en 10 minutos.
- El token del link de verificación de email debe ser un UUID v4 almacenado hasheado en BD, no el UUID en claro.
- Todas las respuestas de error de registro deben ser genéricas para no revelar si un email existe en el sistema (prevenir email enumeration attack).

---

*F1 Onboarding — Glowsong MVP 1 v1.0*
*Leer F2-algoritmo.md antes de implementar la lógica de reproducción post-onboarding.*
