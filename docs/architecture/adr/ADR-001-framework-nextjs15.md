# ADR-001: Framework — Next.js 15

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal requiere un framework frontend que soporte:

- Renderizado del lado del servidor (SSR/SSG) para SEO óptimo en una landing page
- API Routes integradas para manejar operaciones de backend (CRUD de contenido, leads, media, autenticación)
- Separación clara entre componentes de servidor y cliente para seguridad (las claves de Supabase service_role nunca deben llegar al navegador)
- Soporte nativo para TypeScript
- Ecosistema maduro con componentes reutilizables (shadcn/ui)
- Despliegue flexible (Vercel, Docker, Netlify)
- Productividad de desarrollo con Hot Module Replacement
- Compatibilidad con herramientas de desarrollo asistido por IA (Claude Code)

Se evaluaron cuatro frameworks principales del ecosistema moderno.

---

## Decisión

Se adopta **Next.js 15** con **App Router** como framework principal del proyecto.

---

## Alternativas Consideradas

### 1. Next.js 15 (App Router) — SELECCIONADO

**Descripción**: Framework React full-stack de Vercel con App Router, React Server Components y Route Handlers.

**Pros**:

- App Router es la arquitectura estable y recomendada desde Next.js 14+, con Server Components como ciudadanos de primera clase
- React Server Components (RSC) permiten acceder a la base de datos directamente desde el servidor sin exponer claves al cliente
- API Routes (Route Handlers) integradas: no se necesita un backend separado
- Middleware en el edge para protección de rutas (`/admin/*`) antes de que llegue al servidor
- TypeScript como ciudadano de primera clase con configuración zero-config
- Ecosistema más grande de React: shadcn/ui, DND Kit, React Hook Form, Zod — todos compatibles
- Vercel como plataforma de deployment con zero-config, pero funciona en Docker y Netlify
- Claude Code tiene soporte nativo profundo para proyectos Next.js
- ISR (Incremental Static Regeneration) permite cachear la landing page y revalidar solo cuando el admin modifica contenido
- Comunidad más grande del ecosistema fullstack JavaScript: abundancia de tutoriales, soluciones y talento

**Contras**:

- Bundle del cliente más pesado que frameworks MPA como Astro (aunque RSC mitiga significativamente esto)
- Complejidad adicional al decidir qué es Server Component vs Client Component
- Versionado agresivo: Next.js cambia frecuentemente APIs internas (mitigado al usar solo APIs estables)
- Dependencia de React 19 (versión que incluye RSC nativos)

### 2. Astro

**Descripción**: Framework MPA (Multi-Page Application) con arquitectura de "islas" que envía cero JavaScript por defecto.

**Pros**:

- Zero JavaScript por defecto: ideal para landing pages estáticas puras
- Rendimiento de carga excepcional (MPA con hidratación selectiva)
- Framework-agnostic: puede usar React, Vue, Svelte como islas

**Contras**:

- Las API Routes de Astro son menos maduras y tienen menor ecosistema
- No tiene un equivalente directo a React Server Components para acceso seguro a datos
- El admin panel requiere un SPA completo, lo cual va contra la filosofía MPA de Astro
- Menor ecosistema de componentes UI profesionales comparado con React
- El patrón de "islas" complica la edición inline (que necesita interactividad global)
- Menor compatibilidad con herramientas de desarrollo IA
- La comunidad, aunque creciente, es significativamente menor que la de Next.js

### 3. SvelteKit

**Descripción**: Framework full-stack basado en Svelte con SSR, API routes y sistema de archivos como router.

**Pros**:

- Svelte compila a JavaScript vanilla: bundles más pequeños, rendimiento excelente
- Sintaxis más simple que React: menos boilerplate
- Transiciones y animaciones nativas
- API routes integradas con soporte TypeScript

**Contras**:

- Ecosistema de componentes UI significativamente menor que React
- No existe equivalente a shadcn/ui con la misma calidad y cobertura
- Menos talento disponible en el mercado
- La IA generativa (Claude, GPT) tiene menos entrenamiento en Svelte que en React/Next.js
- Menor madurez en el manejo de aplicaciones complejas tipo CMS
- Las bibliotecas de drag & drop, editores richtext y formularios complejos son menos maduras

### 4. Nuxt 3

**Descripción**: Framework full-stack basado en Vue 3 con SSR, API routes y auto-imports.

**Pros**:

- Vue 3 tiene una curva de aprendizaje más suave que React
- Auto-imports y convenciones reducen boilerplate
- Nitro server engine es potente y flexible
- Buena integración con TypeScript

**Contras**:

- Ecosistema de componentes UI profesionales menor que React (aunque Vuetify y PrimeVue existen)
- Menor base de código open-source para CMS patterns en Vue vs React
- La IA generativa tiene entrenamiento amplio en Vue pero menos profundo que en React/Next.js
- Server Components aún experimental en Nuxt (no tan maduro como en Next.js 15)
- Menor soporte de primera clase en Vercel comparado con Next.js

---

## Consecuencias

### Positivas

- **Seguridad por arquitectura**: RSC permite que las claves de servicio nunca lleguen al navegador
- **SEO óptimo**: HTML renderizado en servidor sin dependencia de JavaScript del cliente
- **Productividad**: El ecosistema React + shadcn/ui permite desarrollo rápido del admin panel
- **Flexibilidad de deployment**: Funciona nativamente en Vercel, Docker standalone y Netlify
- **Mantenibilidad a largo plazo**: Framework con el respaldo más fuerte (Vercel) y la comunidad más grande
- **Compatibilidad con IA**: Claude Code y otros asistentes tienen soporte profundo para Next.js

### Negativas

- **Curva de aprendizaje**: La distinción Server Component vs Client Component requiere comprensión del modelo mental
- **Peso del bundle**: Aunque RSC reduce significativamente el JavaScript del cliente, React sigue siendo más pesado que Svelte o Astro para la parte interactiva
- **Dependencia de Vercel**: Aunque funciona en Docker y Netlify, la experiencia óptima es con Vercel

### Riesgos

- **Breaking changes en Next.js**: Vercel tiene un historial de cambios agresivos entre versiones mayores. Mitigación: usar solo APIs estables y documentadas, evitar APIs experimentales
- **React 19 bugs**: Al ser relativamente reciente, pueden surgir bugs en RSC. Mitigación: seguir los patrones oficiales y mantener la versión actualizada
- **Lock-in de framework**: Si en el futuro se necesitara migrar, es un esfuerzo significativo. Mitigación: mantener la lógica de negocio separada de los componentes de UI

---

## Referencias

- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Supabase + Next.js 15 Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel Deployment Documentation](https://vercel.com/docs/frameworks/nextjs)
- [ADR-006: Deployment Strategy](ADR-006-deployment-strategy.md) — justificación detallada de la estrategia multi-plataforma
