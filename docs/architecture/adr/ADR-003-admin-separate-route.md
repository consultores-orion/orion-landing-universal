# ADR-003: Admin como Ruta Separada /admin

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal necesita una interfaz de administración para que los usuarios gestionen todos los aspectos de su landing page: contenido, módulos, diseño, idiomas, SEO, media, leads e integraciones.

La pregunta arquitectónica es: **¿dónde y cómo se implementa esta interfaz de administración?**

Las opciones principales son:

1. Un panel de admin en una ruta separada (`/admin/*`)
2. Edición inline exclusivamente (sin panel separado)
3. Una aplicación separada (otro dominio/repositorio)
4. Un híbrido: panel de admin + edición inline como complemento

---

## Decisión

Se implementa un **panel de administración completo en la ruta `/admin/*`** con un **modo de edición inline complementario** en la página pública.

El admin panel es la interfaz principal para todas las operaciones. La edición inline es un acceso rápido para modificar textos e imágenes directamente en la vista previa.

---

## Alternativas Consideradas

### 1. Admin en ruta separada (`/admin/*`) + edición inline — SELECCIONADO

**Descripción**: Panel CMS completo bajo `/admin` con dashboard, secciones especializadas y sidebar de navegación. Adicionalmente, un modo de edición inline activable desde la página pública para ediciones rápidas de contenido.

**Pros**:

- **Separación de responsabilidades**: El código del admin y el código público están en rutas diferentes con layouts diferentes
- **Funcionalidades ricas**: El admin panel puede incluir dashboard con estadísticas, tabla de leads con filtros y exportación, biblioteca de media con carpetas, configuración de SEO con previews, y cualquier funcionalidad futura sin contaminar la página pública
- **Seguridad clara**: El middleware protege todo `/admin/*` de forma uniforme — una sola regla cubre toda la sección
- **UX profesional**: El usuario tiene un "centro de control" completo similar a WordPress, Webflow o cualquier CMS profesional
- **Edición inline como complemento**: Para cambios rápidos de texto, el usuario no necesita navegar al admin — activa el toggle y edita en contexto
- **Performance pública**: La página pública no carga ningún código del admin (tree shaking natural por rutas)

**Contras**:

- Mayor volumen de código: el admin panel es una mini-aplicación dentro del proyecto
- Dos interfaces para editar contenido (admin panel + inline) requieren que ambas usen la misma API
- El usuario necesita aprender dos modos de edición

### 2. Solo edición inline (sin admin panel)

**Descripción**: Toda la administración se hace directamente sobre la página pública. Al autenticarse, aparecen controles flotantes para editar cada sección.

**Pros**:

- WYSIWYG puro: lo que editas es exactamente lo que se publica
- Menor volumen de código
- Experiencia intuitiva para ediciones simples de texto e imágenes

**Contras**:

- **Funcionalidades limitadas**: No hay espacio natural para un dashboard, tabla de leads, biblioteca de media o configuración de SEO
- **UI sobrecargada**: Los controles de edición para 19 módulos + configuración de diseño + idiomas + integraciones saturarían la página pública
- **Operaciones complejas imposibles**: Reordenar módulos con drag & drop, configurar integraciones con formularios complejos, exportar leads a CSV — todas estas operaciones necesitan una UI dedicada
- **Seguridad más difícil**: Cada componente público necesita verificar si el usuario está autenticado para mostrar/ocultar controles de edición
- **Testing más complejo**: La página pública tendría lógica condicional (modo vista vs modo edición) en todas partes

### 3. Aplicación separada (otro dominio/repo)

**Descripción**: El admin es una aplicación completamente independiente desplegada en un subdominio (ej: `admin.ejemplo.com`).

**Pros**:

- Aislamiento total: el admin no comparte código con la página pública
- Cada aplicación puede tener su propio ciclo de despliegue
- Se podría usar un framework diferente para el admin si se quisiera

**Contras**:

- **Contradice el propósito de "plantilla universal"**: Los usuarios deben desplegar DOS aplicaciones en lugar de una
- **Complejidad de CORS**: Dominios cruzados requieren configuración CORS explícita
- **Doble despliegue**: Docker necesitaría dos contenedores, Vercel necesitaría dos proyectos
- **Experiencia de edición inline imposible**: No se puede inyectar edición inline en la página pública si el admin está en otro dominio
- **Sincronización de tipos**: Los tipos TypeScript necesitarían compartirse entre dos repositorios

### 4. Solo admin panel (sin edición inline)

**Descripción**: Todo se gestiona desde `/admin/*` y la página pública es solo de lectura, sin modo de edición.

**Pros**:

- Implementación más simple: un solo modo de edición
- Menor código en la página pública
- Sin ambigüedad sobre dónde editar

**Contras**:

- **Peor DX para ediciones rápidas**: Cambiar un título requiere navegar al admin, encontrar el módulo, editar, guardar y volver a la vista previa
- **Sin contexto visual**: El admin edita campos en formularios abstractos sin ver cómo se verán en la página real
- **Estándar inferior al mercado**: Los CMS modernos (Webflow, Framer, WordPress con Gutenberg) ofrecen alguna forma de edición visual

---

## Consecuencias

### Positivas

- **CMS completo**: El admin panel proporciona todas las herramientas necesarias para gestionar un sitio profesionalmente
- **Experiencia mixta**: El usuario elige el modo que prefiera: admin panel para gestión completa, edición inline para cambios rápidos
- **Seguridad limpia**: Un middleware cubre todo `/admin/*`; la página pública no tiene lógica de autenticación excepto el toggle de edición inline
- **Escalabilidad de features**: Nuevas funcionalidades del admin (blog, analytics, A/B testing) se agregan como nuevas páginas bajo `/admin/` sin afectar la página pública
- **Performance**: La página pública es puramente Server Components sin código del admin

### Negativas

- **Volumen de código**: El admin panel es aproximadamente el 50% del código total del proyecto
- **Dos interfaces sincronizadas**: Los cambios hechos desde inline editing y desde el admin panel deben usar la misma API y producir los mismos resultados
- **Complejidad de edición inline**: Implementar overlays de edición sobre módulos arbitrarios es técnicamente retador

### Riesgos

- **Inconsistencia entre modos**: Si el admin panel y la edición inline no se mantienen sincronizados, podrían surgir bugs donde un cambio en un modo no se refleja en el otro. Mitigación: ambos modos usan las mismas API routes
- **Scope creep del admin**: El admin panel puede crecer indefinidamente. Mitigación: definir el alcance de v1.0 claramente y resistir la tentación de agregar features que no sean core
- **Edición inline puede ser frágil**: Depende de la estructura DOM de cada módulo. Si un módulo cambia su estructura, la edición inline puede romperse. Mitigación: cada módulo define explícitamente sus zonas editables

---

## Referencias

- [WordPress Admin Panel](https://wordpress.org/documentation/article/administration-screens/) — referencia de UX para un CMS con admin panel + editor visual (Gutenberg)
- [Webflow Designer](https://webflow.com/designer) — referencia de edición inline profesional
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — cómo separar layouts entre admin y público
- [ADR-001: Framework Next.js 15](ADR-001-framework-nextjs15.md) — el App Router permite esta separación natural
