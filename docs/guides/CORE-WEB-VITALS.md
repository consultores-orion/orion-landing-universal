# Core Web Vitals — Guía de Medición y Optimización

> Guía específica para Orion Landing Universal. Cubre LCP, INP y CLS con checkpoints concretos por componente.

---

## 1. Qué Medir y Qué Esperar

### LCP — Largest Contentful Paint (< 2.5 s)

Mide cuándo el elemento de contenido más grande visible en el viewport termina de renderizarse. Un valor <= 2.5 s es "bueno"; entre 2.5 s y 4 s necesita mejora; > 4 s es malo.

**En este proyecto, el LCP candidato más probable es:**

- El título `<h1>` del módulo Hero (texto grande above-the-fold).
- La imagen de fondo del Hero (`backgroundImage.url`) si está configurada.
- La imagen de cabecera del sitio si aparece above-the-fold en mobile.

### INP — Interaction to Next Paint (< 200 ms)

Reemplazó a FID en 2024. Mide la latencia de la respuesta visual a cualquier interacción del usuario (click, tap, teclado). <= 200 ms es "bueno"; entre 200 ms y 500 ms necesita mejora; > 500 ms es malo.

**Interacciones críticas a monitorear en este proyecto:**

- Admin: guardar contenido inline (PUT /api/inline-edit)
- Admin: toggle de visibilidad de módulo (DnD reorder)
- Lightbox de GalleryModule: abrir/cerrar
- Formulario de OfferFormModule: envío y validación
- Setup wizard: navegación entre pasos

### CLS — Cumulative Layout Shift (< 0.1)

Mide la estabilidad visual: cuánto se desplazan los elementos mientras la página carga. Un score <= 0.1 es "bueno"; entre 0.1 y 0.25 necesita mejora; > 0.25 es malo.

**Fuentes de CLS a vigilar en este proyecto:**

- Imágenes sin dimensiones explícitas (causan reflowing al cargar)
- Font swap de Google Fonts (FOUT — Flash of Unstyled Text)
- Inserción dinámica de módulos (visibilidad toggle en admin)
- Marquee de ClientLogosModule (animación CSS)
- Módulos que cargan datos async y empujan contenido

---

## 2. Cómo Medir — Paso a Paso

### A. Chrome DevTools — Lighthouse Tab

1. Abre Chrome y navega a `http://localhost:3000` (con servidor corriendo).
2. Abre DevTools (`F12` o `Cmd+Option+I`).
3. Ve a la pestaña **Lighthouse**.
4. Selecciona las categorías: Performance, Accessibility, Best Practices, SEO.
5. Elige el modo: **Navigation** y el dispositivo: **Desktop** o **Mobile**.
6. Click **Analyze page load**.
7. Los resultados incluyen LCP, CLS, y TBT (proxy para INP en Lighthouse).

**Importante:** Lighthouse mide en condiciones simuladas (CPU throttling 4x, red lenta). Los valores reales en producción serán mejores.

### B. Chrome DevTools — Performance Tab

Para medir con más detalle (especialmente LCP y CLS reales):

1. Abre DevTools > pestaña **Performance**.
2. Click en el ícono de grabación (círculo rojo).
3. Recarga la página (`Ctrl+Shift+R` o `Cmd+Shift+R` para hard reload).
4. Detén la grabación después de que la página cargue completamente.
5. Busca el marcador **LCP** en la línea de tiempo (aparece como una estrella verde).
6. En la sección **Timings**, verás los marcadores FCP, LCP, y otros.
7. Para CLS, revisa la sección **Layout** — los shifts aparecen como barras rojas.

### C. Chrome DevTools — Performance Insights Panel (INP)

1. Abre DevTools > pestaña **Performance insights** (puede requerir activarla en Experiments).
2. Click **Measure page load** para cargar, o **Start recording** para capturar interacciones.
3. Interactúa con la página (clicks, scroll, formularios).
4. Detén la grabación y revisa la sección **Interactions** — cada interacción muestra su latencia.
5. Las interacciones con latencia > 200 ms se marcan en naranja o rojo.

### D. Web Vitals Chrome Extension

1. Instala la extensión: [Web Vitals](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibgt)
2. Con la extensión activa, el ícono del puzzle en Chrome muestra un badge de color (verde/amarillo/rojo).
3. Click en el ícono para ver LCP, INP, y CLS en tiempo real mientras navegas.
4. Especialmente útil para capturar INP: la extensión actualiza el valor con cada interacción.

**Ventaja:** Captura métricas en condiciones reales (sin throttling artificial).

### E. Comando `pnpm lighthouse` (LHCI configurado en el proyecto)

Este proyecto tiene Lighthouse CI pre-configurado. Para correr:

```bash
# Requiere servidor corriendo y Supabase configurado (ver sección 4)
pnpm build
pnpm start &        # inicia servidor en background
pnpm lhci           # ejecuta LHCI contra http://localhost:3000
```

O en un solo paso:

```bash
pnpm lighthouse     # hace build + lhci en secuencia
```

Los resultados se suben a Lighthouse CI temporary storage y se imprime el URL del reporte en consola.

---

## 3. Checkpoints Específicos por Métrica

### LCP — Checkpoints en Este Proyecto

**Archivo: `src/components/modules/hero/HeroModule.tsx`**

El módulo Hero usa `EditableText` para el `<h1>` y un `<video>` o imagen de fondo CSS para el background. Hallazgos actuales:

- El `<h1>` (título) es un Server Component renderizado sin `next/image` — no hay carga de imagen para el texto, LCP debería ser rápido para layouts sin imagen.
- El `backgroundImage.url` se aplica como CSS background (via `ModuleWrapper`/estilos dinámicos), NO como `<img>` o `next/image`. Esto significa que el navegador no puede priorizar su descarga — puede retrasar el LCP si es una imagen grande.
- El `<video>` de fondo tiene `autoPlay` y carga inmediata — puede bloquear LCP si la conexión es lenta.

**Acciones recomendadas para LCP:**

- Si se usa `backgroundImage` en el Hero, considerar agregar un `<link rel="preload">` en el `<head>` para esa imagen (en `layout.tsx` o via `next/head`).
- Si el LCP candidato es el `<h1>`, asegurarse de que no haya CSS que bloquee el render (ningún `display: none` condicional en el elemento).
- Para videos de fondo: agregar `preload="none"` si el video no es crítico para el LCP.

**Archivo: `src/components/shared/SiteHeaderClient.tsx`**

Si el logo del sitio es una imagen above-the-fold en mobile, puede ser el candidato LCP. Verificar que use `next/image` con `priority` prop.

### CLS — Checkpoints en Este Proyecto

**`src/components/modules/gallery/GalleryModule.tsx`**

Las imágenes de galería usan `next/image` con `width={800}` y `height={600}` explícitos — ratio 4:3 reservado correctamente. Sin riesgo de CLS en grid layout.

El lightbox usa `<img>` nativo (sin dimensiones fijas) — correcto porque el tamaño es `max-h-[85vh] max-w-[90vw]` y el fondo es `fixed inset-0`, sin afectar el layout del documento.

**`src/components/modules/client-logos/ClientLogosModule.tsx`**

El marquee usa animación CSS `@keyframes`. Verificar que el contenedor tenga altura fija o `min-height` para que la animación no cause shifts durante la carga inicial.

**Fonts (globals.css / layout.tsx)**

Si se cargan Google Fonts con `font-display: swap` o sin `font-display`, puede causar FOUT (Flash of Unstyled Text) que produce CLS. Verificar en `src/app/layout.tsx` cómo se cargan los fonts del tema. Preferir `font-display: optional` para minimizar CLS, aunque esto puede mostrar el fallback font en conexiones lentas.

**Módulos con contenido dinámico**

Los módulos que dependen de datos de Supabase se renderizan como Server Components — no hay loading states en el cliente que puedan causar CLS. El riesgo es solo si hay `useEffect` que modifique el DOM tardíamente.

**Módulos con `prefers-reduced-motion`**

El proyecto tiene `@media (prefers-reduced-motion: reduce)` en `globals.css`. Esto detiene animaciones para usuarios que lo solicitan, lo que también elimina potenciales CLS de animaciones.

### INP — Checkpoints en Este Proyecto

**Inline editing (`src/app/api/inline-edit/route.ts`)**

El PUT hace `upsert()` en Supabase + logging non-blocking. Si el servidor tarda > 200 ms en responder, el INP del click puede superar el umbral. Verificar en Network tab del DevTools.

**Admin DnD (módulo sorting)**

`SortableModuleItem` usa `@dnd-kit`. Las interacciones de drag-and-drop son computacionalmente intensas. Verificar que no haya handlers síncronos pesados en los callbacks de drop.

**GalleryModule lightbox**

El lightbox maneja focus management con `useRef` y `useEffect`. La apertura/cierre debería ser instantánea (no hay fetch). Si hay INP alto en el lightbox, revisar si hay otros efectos disparándose simultáneamente.

---

## 4. Cómo Correr un Audit Real

El middleware/proxy de este proyecto redirige a `/setup/connect` si Supabase no está configurado. Para auditar la landing real:

### Prerequisitos

1. **Configurar `.env.local`** con credenciales reales de Supabase:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

2. **Verificar que el setup esté completo** — en la tabla `site_config` de Supabase:

   ```sql
   SELECT setup_completed FROM site_config LIMIT 1;
   -- Debe devolver: true
   ```

   Si devuelve `false` o no hay filas, completar el wizard de setup primero (`/setup`).

3. **Build y start:**

   ```bash
   pnpm build
   pnpm start
   ```

4. **Verificar que la landing carga** — navegar a `http://localhost:3000`. Debe mostrar los módulos configurados, NO redirigir a `/setup/connect`.

### Correr el Audit

```bash
# En una terminal (servidor ya corriendo):
pnpm lhci

# O desde cero:
pnpm lighthouse
```

### Alternativa: DevTools sin LHCI

Con el servidor corriendo en `http://localhost:3000`:

1. Abrir Chrome en modo incógnito (para evitar extensiones que afecten métricas).
2. Navegar a `http://localhost:3000`.
3. Abrir DevTools > Lighthouse > Run audit.
4. Para INP real: usar Web Vitals extension + interactuar con la página durante 30-60 segundos.

---

## 5. Umbrales y Configuración CI

### Tabla de Umbrales (Core Web Vitals 2024)

| Métrica | Bueno    | Necesita Mejora | Malo     |
| ------- | -------- | --------------- | -------- |
| LCP     | < 2.5 s  | 2.5 s – 4 s     | > 4 s    |
| INP     | < 200 ms | 200 ms – 500 ms | > 500 ms |
| CLS     | < 0.1    | 0.1 – 0.25      | > 0.25   |

### Configuración Actual de LHCI (`.lighthouserc.json`)

```json
{
  "assert": {
    "preset": "lighthouse:recommended",
    "assertions": {
      "categories:performance": ["warn", { "minScore": 0.8 }],
      "categories:accessibility": ["error", { "minScore": 0.9 }],
      "categories:best-practices": ["warn", { "minScore": 0.9 }],
      "categories:seo": ["warn", { "minScore": 0.5 }]
    }
  }
}
```

**Estado actual (S13):** 0 errores, 2 warnings. El audit cae en `/setup/connect` sin Supabase — LCP 0.71 en esa página es aceptable (es una página simple de formulario).

### Scripts Disponibles

```bash
pnpm analyze       # Bundle analyzer (webpack mode — requiere --webpack flag en Next.js 16)
pnpm lhci          # Solo LHCI (requiere servidor ya corriendo en puerto 3000)
pnpm lighthouse    # Build + LHCI en secuencia
pnpm build         # Build de producción (Turbopack por defecto en Next.js 16)
```

### Integración con GitHub Actions

El archivo `.github/workflows/ci.yml` corre LHCI en cada PR. Las flags `--no-sandbox --disable-dev-shm-usage` están configuradas para el entorno de CI (sin display real).

---

## 6. Quick Wins de Optimización (Específicos a Este Codebase)

### LCP

1. **Hero con imagen de fondo:** si `backgroundImage.url` es la imagen LCP candidata, agregar un `<link rel="preload">` en el `<head>` del layout. La imagen de fondo CSS no se preloadea automáticamente por el navegador.

   ```tsx
   // En src/app/layout.tsx — solo si la imagen de fondo es conocida en SSR
   // (requiere leer la config de Supabase en el Server Component del layout)
   <link rel="preload" as="image" href={heroBackgroundUrl} />
   ```

2. **Logo del sitio:** si `SiteHeaderClient` muestra un logo above-the-fold y usa `next/image`, agregar `priority` prop.

3. **Fonts:** usar `next/font` de Next.js en lugar de `@import` de Google Fonts — esto elimina la request externa y optimiza el `font-display` automáticamente.

### CLS

4. **Verificar todos los `next/image`:** todos los módulos que usan `next/image` (SiteHeaderClient, SocialProofModule, TeamModule, ClientLogosModule, GalleryModule) deben tener `width`/`height` o `fill` con un contenedor con dimensiones conocidas. La GalleryModule ya tiene `width={800} height={600}` — correcto.

5. **ClientLogosModule marquee:** verificar que el contenedor del marquee tenga `height` fijo o `min-height` para prevenir CLS durante la primera carga.

6. **useEffect con DOM mutations:** buscar `useEffect` que inserten elementos o cambien `display`/`visibility` después del hydration — pueden causar CLS. Usar `suppressHydrationWarning` o mover al SSR.

### INP

7. **Debounce en inline editing:** si el usuario tipea rápidamente en campos editables, cada keystroke puede disparar una actualización. Verificar que `EditableText` tenga debounce antes de llamar al API.

8. **Lazy loading de módulos pesados:** el registry ya usa `next/dynamic`. Verificar que módulos con animaciones (StatsModule contador, ClientLogosModule marquee) no bloqueen el thread principal durante la carga inicial.

9. **Admin panel — operaciones de drag:** si el DnD de módulos tiene jank, revisar que los callbacks de `onDragEnd` sean síncronos y ligeros (la llamada al API puede ser async/non-blocking).

---

## Recursos

- [web.dev/vitals](https://web.dev/vitals/) — Documentación oficial de Core Web Vitals
- [web.dev/lcp](https://web.dev/lcp/) — Guía detallada de LCP
- [web.dev/inp](https://web.dev/inp/) — Guía detallada de INP
- [web.dev/cls](https://web.dev/cls/) — Guía detallada de CLS
- [Lighthouse CI docs](https://github.com/GoogleChrome/lighthouse-ci) — Configuración avanzada de LHCI
- `.lighthouserc.json` — Configuración actual del proyecto
- `docs/guides/SCREEN-READER-TESTING.md` — Guía complementaria de accesibilidad
