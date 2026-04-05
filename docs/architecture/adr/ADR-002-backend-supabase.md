# ADR-002: Backend — Supabase

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal requiere un backend que provea:

- Base de datos relacional con soporte para JSONB (contenido multilingüe dinámico)
- Sistema de autenticación integrado (email/password para el admin)
- Almacenamiento de archivos (imágenes, logos, media)
- Row Level Security para proteger datos sin lógica adicional en el servidor
- API de consulta eficiente para Server Components de Next.js
- Soporte para suscripciones en tiempo real (actualización de contenido en el admin)
- Self-hosting como opción para usuarios que no quieran depender de un servicio cloud
- Costo razonable para un proyecto single-tenant

El sistema es single-tenant (una instalación = un sitio), lo que simplifica los requisitos de base de datos.

---

## Decisión

Se adopta **Supabase** (tier de pago) como backend-as-a-service, utilizando PostgreSQL, Auth, Storage y Realtime.

---

## Alternativas Consideradas

### 1. Supabase — SELECCIONADO

**Descripción**: Backend-as-a-service open-source construido sobre PostgreSQL, con Auth, Storage, Realtime y Edge Functions integrados.

**Pros**:

- **PostgreSQL nativo**: Estándar de la industria, JSONB nativo para contenido multilingüe, funciones avanzadas, extensiones disponibles
- **Row Level Security (RLS)**: Seguridad a nivel de fila declarativa en SQL — no se necesita lógica de autorización en el código de la aplicación
- **Auth integrado**: Email/password, JWT, gestión de sesiones, admin API — todo incluido
- **Storage integrado**: Buckets con políticas de acceso, transformaciones de imagen on-the-fly, CDN
- **Realtime**: Suscripciones a cambios en tablas vía WebSocket (útil para el admin panel)
- **Open source**: El proyecto puede auto-hospedarse con `supabase/supabase` Docker si se desea independencia total del servicio cloud
- **SDK oficial para Next.js**: `@supabase/ssr` maneja cookies y sesiones correctamente con App Router
- **Tier de pago generoso**: Sin restricciones artificiales que limiten el desarrollo (a diferencia del tier gratuito)
- **Dashboard web**: Interfaz gráfica para inspeccionar tablas, ejecutar SQL, gestionar auth y storage
- **Migraciones SQL**: Soporte nativo para archivos de migración versionados

**Contras**:

- Dependencia de un servicio externo para funcionalidades core (mitigado por ser open-source y self-hostable)
- El tier gratuito tiene limitaciones que podrían afectar en desarrollo (por eso se usa tier de pago)
- Las Edge Functions de Supabase usan Deno, no Node.js — pero no las necesitamos (usamos API Routes de Next.js)
- La documentación a veces se queda atrás respecto a nuevas features

### 2. Firebase (Firestore + Auth + Storage)

**Descripción**: Backend-as-a-service de Google con base de datos NoSQL, Auth y Storage.

**Pros**:

- Ecosistema maduro de Google con excelente documentación
- Auth muy completo con múltiples proveedores
- Hosting integrado con soporte para Next.js
- SDK JavaScript bien mantenido
- Generoso tier gratuito

**Contras**:

- **Firestore es NoSQL (document-based)**: No tiene JSONB nativo, no tiene JOINs, las consultas complejas son limitadas
- **No tiene RLS a nivel de base de datos**: Las "security rules" de Firestore son un DSL propietario, más difícil de razonar que SQL
- **Vendor lock-in severo**: No es open-source, no se puede self-host, migrar fuera de Firebase es costoso
- **Modelado de datos**: El modelo de documentos/colecciones no se alinea naturalmente con la estructura relacional de módulos + contenido + idiomas
- **Costo impredecible**: El pricing basado en lecturas/escrituras puede escalar de forma inesperada
- **Sin soporte de suscripciones eficientes para tablas completas**: Firestore listeners pueden ser costosos en documentos grandes

### 3. PlanetScale (MySQL serverless)

**Descripción**: Base de datos MySQL serverless compatible con Vitess, optimizada para escalabilidad.

**Pros**:

- MySQL es un estándar de la industria con soporte universal
- Branching de base de datos (como git para el schema)
- Escalabilidad automática serverless
- Excelente rendimiento para queries simples

**Contras**:

- **Solo base de datos**: No incluye Auth, Storage ni Realtime — habría que integrar servicios separados para cada uno
- **MySQL, no PostgreSQL**: No tiene JSONB nativo tan potente como PostgreSQL (MySQL 8 tiene JSON, pero con menos operadores)
- **Sin RLS nativo**: MySQL no tiene Row Level Security — toda la autorización tendría que implementarse en la aplicación
- **Sin tier gratuito**: El modelo de negocio cambió y ya no ofrece hobby tier (a fecha de esta decisión)
- **Complejidad adicional**: Se necesitaría Auth0/Clerk para auth, Cloudflare R2/AWS S3 para storage, Pusher/Ably para realtime — multiplicando dependencias

### 4. Backend Personalizado (Express/Fastify + PostgreSQL + S3)

**Descripción**: Backend construido desde cero con un framework Node.js, PostgreSQL directo y AWS S3 para storage.

**Pros**:

- Control total sobre cada decisión técnica
- Sin dependencia de servicios terceros
- Máxima flexibilidad arquitectónica
- Sin costos de servicio (solo infraestructura)

**Contras**:

- **Tiempo de desarrollo multiplicado**: Implementar auth, storage, realtime, RLS, migraciones y dashboard desde cero es semanas de trabajo adicional
- **Mantenimiento continuo**: Cada componente (auth, storage, security) necesita mantenimiento y actualizaciones de seguridad
- **Contradice el propósito del proyecto**: Orion Landing Universal es una plantilla para desplegarse rápidamente — un backend complejo contradice esa filosofía
- **Seguridad**: Implementar auth y gestión de sesiones correctamente es propenso a errores. Supabase Auth es auditado y mantenido por un equipo dedicado
- **Sin dashboard**: Se necesitaría construir herramientas de administración de base de datos

---

## Consecuencias

### Positivas

- **Velocidad de desarrollo**: Auth, Storage y Realtime disponibles desde el día uno sin implementación adicional
- **Seguridad por defecto**: RLS de PostgreSQL proporciona seguridad a nivel de datos sin código adicional
- **Estándar abierto**: PostgreSQL es el motor más portable — si Supabase desaparece, la base de datos se migra sin cambios
- **Self-hosting**: Los usuarios avanzados pueden hospedar todo el stack Supabase en su propia infraestructura
- **Contenido multilingüe natural**: JSONB de PostgreSQL es ideal para almacenar contenido con claves de idioma dinámicas
- **DX excelente**: El SDK `@supabase/ssr` + el dashboard web aceleran el desarrollo significativamente

### Negativas

- **Dependencia de servicio**: Aunque es open-source, la mayoría de los usuarios usarán el servicio cloud de Supabase
- **Costo recurrente**: El tier de pago tiene un costo mensual (justificado por lo que incluye)
- **Complejidad de auto-hosting**: Self-hospedar Supabase completo (PostgreSQL + GoTrue + Storage + Realtime + Kong) es significativamente más complejo que solo PostgreSQL
- **Edge Functions no utilizadas**: Se paga por funcionalidades que no se usan (las API Routes de Next.js reemplazan las Edge Functions)

### Riesgos

- **Cambios en pricing de Supabase**: El servicio podría cambiar su modelo de precios. Mitigación: self-hosting siempre es una opción al ser open-source
- **Latencia geográfica**: Si Supabase y el servidor de Next.js están en regiones diferentes, puede haber latencia. Mitigación: desplegar ambos en la misma región
- **Límites del tier**: Aunque el tier de pago es generoso, proyectos con altísimo tráfico podrían necesitar un plan superior. Mitigación: para una landing page single-tenant, es improbable superar los límites

---

## Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SSR Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [ADR-001: Framework Next.js 15](ADR-001-framework-nextjs15.md) — contexto sobre por qué se usa Next.js como servidor de aplicación
