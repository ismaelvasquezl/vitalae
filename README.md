# Vitalae — Sitio Web (v2.2)

Sitio web profesional para **Vitalae · Bienestar y Ciencia**. Estático, mobile-first, con despliegue automático a GitHub Pages y conexión directa a WhatsApp Business.

---

## Archivos

- `index.html` — Sitio completo (HTML + CSS + JS en un solo archivo)
- `logo.jpg` — Logo de Vitalae
- `apps-script.gs` — Backend en Google Apps Script (contador + guardado del quiz en Sheets)
- `.github/workflows/deploy.yml` — Workflow automático de despliegue a GitHub Pages
- `.nojekyll` — Marcador que indica a GitHub Pages no procesar con Jekyll
- `.gitignore` — Archivos a ignorar en git

---

## Novedades de la v2.2

### Correcciones visuales
- 🔧 **Móvil**: el contador de visitas (coin) ya no se superpone al hero. Ahora aparece solo cerca del footer.
- 🔧 **Desktop**: el badge "Más solicitado" ya no desalinea el título de Medicina Cannábica. Flota elegantemente sobre la tarjeta.
- 🔧 **Grid de servicios**: los tres títulos quedan perfectamente alineados.

### Dinamismo del cuestionario (nuevo)
Cada pregunta ahora tiene:
- **Icono circular propio** con órbita dashed animada (usuario, reloj, hoja, frasco)
- **Step counter visual** ("01 · 04" grande entre la barra y el icono)
- **Transición slide-in** cuando cambia de pregunta (260ms out → 500ms in con easing)
- **Haptic feedback** en móvil al tocar una opción (si el dispositivo lo soporta)
- **Animación de pulso** al seleccionar una opción
- **Hover shimmer** horizontal al pasar sobre una opción (desktop)
- **Emoji sutil** al lado del marker para cada opción
- **Pop animation** del indicador cuando el checkmark aparece
- **Delay perceptible** (420ms) para que el usuario vea su selección antes del cambio

### Conexión WhatsApp Business
- Nueva variable `CONFIG.WA_PHONE` para apuntar directo a tu número de WhatsApp Business
- Todos los botones del sitio usan ahora `wa.me` (formato oficial que abre WhatsApp Business si está instalado)
- Mensajes bien estructurados por contexto (header, hero, cada servicio, cuestionario)
- Los mensajes del cuestionario incluyen **resumen de respuestas** con emojis para que llegues con contexto completo

### Despliegue automático
- GitHub Actions configurado: cada `git push` a `main` redespliega el sitio
- Sin configuración manual de "Pages" branch cada vez
- Preserva la URL de GitHub Pages

---

## PASO 1 — Conectar con Google Sheets (una vez)

(Mismo flujo que en v2.1 — si ya lo hiciste, salta al Paso 2)

### 1.1 — Abrir Apps Script

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1CvDz8odzYO9t4-dRMjMcvqw41LfTZlJ0-6PnzJ51Vps/edit
2. Menú → **Extensiones → Apps Script**
3. Borra el código por defecto
4. Pega todo el contenido de `apps-script.gs`
5. Ctrl+S → nombre "Vitalae"

### 1.2 — Desplegar como Web App

1. **Desplegar → Nueva implementación**
2. ⚙️ → **Aplicación web**
3. Config:
   - Descripción: `Vitalae endpoint`
   - Ejecutar como: Yo
   - Quién tiene acceso: ⚠️ **Cualquier persona**
4. **Desplegar** → autorizar permisos
5. Copia la URL (`https://script.google.com/macros/s/.../exec`)

### 1.3 — Configurar en index.html

Edita `index.html`, línea ~3153:

```javascript
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/TU_URL/exec',
```

---

## PASO 2 — Conectar WhatsApp Business

En `index.html` busca el bloque CONFIG (~línea 3156):

```javascript
WA_PHONE: '',
```

Reemplaza por tu número de WhatsApp Business en **formato internacional sin "+" ni espacios**:

```javascript
WA_PHONE: '56912345678',    // Ejemplo Chile — tu número completo
```

Después de este cambio, **TODOS los botones de WhatsApp del sitio** (header, hero, cada servicio, FAB flotante, footer, resultado del quiz) van a abrir conversación directo en tu WhatsApp Business con un mensaje pre-rellenado según el contexto.

### ¿Qué recibes en WhatsApp Business?

Cuando el cuestionario completa, el mensaje que llega a tu bandeja Business se ve así:

```
Hola 🌿 Vengo desde el sitio web de Vitalae.

Me interesa agendar una *consulta de ingreso de Medicina Cannábica*.

🧾 *Resumen de orientación:*
• Género: Femenino
• Edad: 25–64 años
• Experiencia previa con cannabis: Sí
• Forma de uso: Vaporización

¿Pueden ayudarme a coordinar la primera consulta? ¡Gracias!
```

Así llegas a la conversación con contexto completo sin tener que preguntar lo básico.

### ¿Puedo usar WhatsApp API en vez del link?

Sí, pero no es necesario para empezar. El flujo `wa.me` abre tu WhatsApp Business directamente y permite que el usuario te escriba manteniendo todas las ventajas de Business (etiquetas, respuestas rápidas, catálogo). Para automatizar respuestas o integrar un chatbot necesitarías WhatsApp Cloud API — se puede hacer más adelante.

---

## PASO 3 — Despliegue en GitHub Pages (automatizado)

### 3.1 — Crear repo

1. Ve a https://github.com → nuevo repo público llamado `vitalae`
2. **No** inicialices con README

### 3.2 — Subir archivos

Sube **TODO el contenido** de esta carpeta al repo:

- `index.html`
- `logo.jpg`
- `apps-script.gs` (opcional pero recomendado como backup del backend)
- `.github/workflows/deploy.yml`
- `.nojekyll`
- `.gitignore`
- `README.md`

**Opción A — por web**: arrastra todos los archivos al repo. Importante: la carpeta `.github` debe subirse completa.

**Opción B — por terminal:**

```bash
cd /ruta/donde/estan/los/archivos
git init
git add .
git commit -m "Vitalae site v2.2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/vitalae.git
git push -u origin main
```

### 3.3 — Activar GitHub Pages con Actions

1. En tu repo → **Settings** → **Pages**
2. En "Build and deployment" → "Source" → selecciona **GitHub Actions**
3. Listo. En la pestaña **Actions** verás el workflow corriendo
4. Cuando termine (~1 minuto), tu sitio estará en:
   `https://TU-USUARIO.github.io/vitalae/`

### 3.4 — Actualizaciones futuras

Cada vez que cambies algo (texto, imagen, config) y hagas `git push`, el workflow se dispara automáticamente y redespliega el sitio. **Nunca más tienes que configurar nada en GitHub.**

Si quieres forzar un redeploy sin cambios: pestaña Actions → "Deploy to GitHub Pages" → **Run workflow**.

### 3.5 (Opcional) — Dominio propio

Si tienes `vitalae.cl`:
1. En Settings → Pages → "Custom domain": pega el dominio
2. En tu proveedor DNS crea un CNAME → `TU-USUARIO.github.io`
3. Marca "Enforce HTTPS" una vez propague

---

## Debug & diagnóstico

En `index.html` cambia `DEBUG: false` a `DEBUG: true` para ver logs detallados en Console (F12) del navegador.

### Contador muestra "—"
- URL de Apps Script mal pegada
- No pusiste "Cualquier persona" en el despliegue
- El script está propagándose (espera 1–2 min)

### Respuestas del quiz no llegan al Sheet
- Verifica en Console que no diga "Apps Script URL no configurada"
- Abre la URL `/exec` en el navegador — debería devolver JSON con `"status":"ok"`
- La hoja "Respuestas" se crea sola la primera vez

### WhatsApp abre WhatsApp normal, no Business
- WhatsApp Business tiene prioridad en tu teléfono SI el número del link está registrado en Business
- Si el link abre en la app estándar, es porque el número de `CONFIG.WA_PHONE` no coincide con el que tienes activo en Business
- Verifica que el número esté exactamente como aparece en tu app Business, sin "+", sin espacios, sin paréntesis

### El popup inicial no vuelve a aparecer
- Es intencional (cooldown de 7 días por localStorage)
- Para forzarlo: DevTools → Application → Local Storage → borra `vitalae_popup_seen`
- O usa modo incógnito

---

## Datos que se guardan en Sheets

**Hoja "Respuestas":**

| Fecha | Hora | Género | Edad | Usa cannabis | Forma de uso | Referrer | User Agent |
|-------|------|--------|------|--------------|--------------|----------|------------|
| 2026-10-02 | 15:32:41 | Femenino | 25–64 años | Sí | Vaporización | https://instagram.com | Mozilla/5.0... |

**Hoja "Contador":**

| Métrica | Valor | Última actualización |
|---------|-------|---------------------|
| Visitas totales | 1247 | 2026-10-02 16:04:12 |

**No se guardan**: IPs, nombres, emails, teléfonos. Solo lo del cuestionario, de forma anónima.
