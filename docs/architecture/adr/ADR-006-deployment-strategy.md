# ADR-006: Estrategia de Deployment Multi-Plataforma

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal es una plantilla open-source diseñada para ser desplegada por usuarios con perfiles técnicos diversos:

- **Usuarios no técnicos**: Necesitan un "deploy con un clic" en plataformas cloud
- **Desarrolladores**: Quieren desplegar en su propio VPS o infraestructura con Docker
- **Agencias**: Pueden necesitar desplegar múltiples instancias para diferentes clientes

El sistema tiene requisitos que limitan las opciones de deployment:

1. **Servidor Node.js obligatorio**: Server Components, API Routes y Middleware requieren un runtime de servidor — `next export` (static) no es viable
2. **Variables de entorno en servidor**: La `SUPABASE_SERVICE_ROLE_KEY` solo puede existir en el servidor
3. **Middleware edge**: El middleware de autenticación se ejecuta antes de cada request
4. **Supabase externo**: La base de datos está hospedada en Supabase (servicio cloud o self-hosted)

La pregunta es: **¿qué plataformas de deployment se soportan oficialmente y cómo?**

---

## Decisión

Se soportan oficialmente **tres plataformas de deployment**:

1. **Vercel** — Plataforma primaria, zero-config, recomendada
2. **Docker** — Para self-hosting en cualquier VPS o infraestructura propia
3. **Netlify** — Como alternativa cloud secundaria

Se descarta explícitamente static export (`next export`) como opción.

---

## Alternativas Consideradas

### 1. Vercel (primario) + Docker + Netlify — SELECCIONADO

**Descripción**: Soporte oficial para tres plataformas que cubren el espectro completo de usuarios.

#### Vercel (Primario)

**Pros**:

- Zero-config para Next.js: Vercel detecta el framework y configura automáticamente build, rutas, edge middleware y serverless functions
- Preview deployments automáticos por cada PR/branch
- CDN global con edge caching para assets estáticos
- Integración nativa con Analytics, Web Vitals y Speed Insights
- Dominio personalizado + SSL automático en un clic
- Variables de entorno gestionadas en dashboard con cifrado
- Soporte de primera clase para ISR (Incremental Static Regeneration)
- El "Deploy to Vercel" button permite que usuarios no técnicos desplieguen con un clic desde el README del repositorio

**Contras**:

- Vendor lock-in parcial: algunas optimizaciones son exclusivas de Vercel (Image Optimization, Edge Config)
- Costo: el tier Hobby es gratuito pero limitado; Pro cuesta $20/mes por miembro
- Las serverless functions tienen cold starts (mitigado con edge runtime para middleware)

#### Docker (Self-Hosted)

**Pros**:

- Independencia total: funciona en cualquier servidor con Docker
- Costo predecible: solo el costo del VPS (desde $5/mes en proveedores como Hetzner, DigitalOcean)
- Control total sobre la infraestructura, logs y monitoreo
- Ideal para agencias que despliegan múltiples instancias
- Next.js tiene soporte nativo para `output: 'standalone'` que produce un bundle mínimo

**Contras**:

- Requiere conocimiento técnico para configurar (Docker, reverse proxy, SSL, actualizaciones)
- El usuario es responsable de su propia disponibilidad y backups
- Sin preview deployments automáticos (a menos que se configure CI/CD)

#### Netlify (Secundario)

**Pros**:

- Alternativa cloud con tier gratuito generoso
- Soporte para Next.js vía `@netlify/next` adapter
- Netlify Functions para API Routes
- CI/CD integrado con Git
- Dominio + SSL automático

**Contras**:

- El soporte para Next.js no es tan nativo como en Vercel — requiere adapter
- Algunas features avanzadas de Next.js (ISR, Middleware edge) pueden tener limitaciones
- Menor rendimiento en edge comparado con Vercel para proyectos Next.js

### 2. Solo Vercel

**Descripción**: Soportar únicamente Vercel como plataforma de deployment.

**Pros**:

- Menor complejidad de documentación y testing
- Experiencia óptima garantizada
- No hay que mantener Dockerfile ni configuraciones de Netlify

**Contras**:

- **Vendor lock-in total**: Los usuarios están obligados a usar Vercel — contradice la filosofía open-source
- **Excluye self-hosting**: Usuarios que por política empresarial no pueden usar servicios cloud de terceros quedan fuera
- **Costo obligatorio**: Para proyectos de producción, Vercel Pro es necesario
- **Contradice MIT license**: Una plantilla MIT que solo funciona en una plataforma propietaria pierde credibilidad

### 3. Solo Docker (self-hosted)

**Descripción**: Soportar únicamente Docker, dejando que el usuario gestione todo.

**Pros**:

- Máxima libertad e independencia
- Sin dependencias de servicios cloud
- Un solo artefacto de deploy (imagen Docker)

**Contras**:

- **Barrera de entrada alta**: Usuarios no técnicos no pueden desplegar
- **Sin "Deploy with one click"**: Pierde uno de los atractivos principales de una plantilla open-source
- **Responsabilidad de infraestructura**: SSL, dominio, uptime, backups — todo recae en el usuario
- **Sin preview deployments**: Desarrollo más lento sin URLs de preview por branch

### 4. Static export (`next export`)

**Descripción**: Generar un sitio completamente estático (HTML/CSS/JS) sin servidor Node.js, desplegable en cualquier hosting de archivos.

**Pros**:

- Deployment universal: funciona en GitHub Pages, S3, cualquier CDN
- Sin servidor: cero costo de compute
- Rendimiento máximo: solo archivos estáticos

**Contras**:

- **Incompatible con la arquitectura del proyecto**: API Routes, Server Components con data fetching dinámico, Middleware y autenticación server-side requieren un runtime de servidor
- **Sin operaciones de escritura**: El admin panel necesita API routes para CRUD de contenido, leads, media — imposible sin servidor
- **Sin protección de rutas**: Sin middleware, no hay forma de proteger `/admin/*` en el servidor
- **Sin claves privadas**: La `SUPABASE_SERVICE_ROLE_KEY` no puede existir en archivos estáticos
- **Conclusión**: Static export es fundamentalmente incompatible con los requisitos del sistema

---

## Consecuencias

### Positivas

- **Accesibilidad universal**: Desde el usuario no técnico (Vercel 1-click) hasta el DevOps experimentado (Docker) — todos tienen una opción
- **Filosofía open-source respetada**: Self-hosting es una opción real, no solo teórica
- **Flexibilidad de costo**: Desde $0 (Vercel Hobby + Supabase Free) hasta infraestructura propia con costo fijo
- **Tres niveles de testing**: Se valida que el proyecto funcione correctamente en las tres plataformas

### Negativas

- **Complejidad de mantenimiento**: Tres configuraciones de deployment que mantener y testear
- **Documentación triplicada**: Cada plataforma necesita su propia guía de setup
- **Edge cases por plataforma**: Posibles diferencias de comportamiento entre Vercel, Docker y Netlify (especialmente en Middleware y caching)

### Riesgos

- **Drift entre plataformas**: Un feature puede funcionar en Vercel pero no en Docker o Netlify. Mitigación: CI/CD que ejecuta tests en las tres plataformas; evitar features exclusivas de Vercel (ej: `@vercel/og`)
- **Netlify adapter lag**: El adapter `@netlify/next` puede quedarse atrás cuando Next.js lanza nuevas features. Mitigación: Netlify es la plataforma "secundaria"; las features core se prueban primero en Vercel y Docker
- **Docker image size**: Next.js standalone puede generar imágenes grandes. Mitigación: multi-stage build con `node:20-alpine` para imagen final mínima

---

## Especificaciones Técnicas

### Vercel — Configuración

```json
// vercel.json (mínimo — la mayoría se detecta automáticamente)
{
  "framework": "nextjs"
}
```

**Button de deploy en README**:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/orion-ocg/landing-universal&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY)
```

### Docker — Configuración

```dockerfile
# Dockerfile (multi-stage build)
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

**`next.config.ts`**:

```typescript
const nextConfig = {
  output: 'standalone', // Habilita el bundle standalone para Docker
}
```

### Netlify — Configuración

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Referencias

- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Next.js Output Standalone](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Netlify Next.js Plugin](https://docs.netlify.com/frameworks/next-js/overview/)
- [ADR-001: Framework Next.js 15](ADR-001-framework-nextjs15.md) — contexto sobre los requisitos del framework
