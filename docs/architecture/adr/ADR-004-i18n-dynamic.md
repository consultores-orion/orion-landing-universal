# ADR-004: Internacionalización Dinámica desde el Admin

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal es una plantilla de landing page diseñada para ser usada en cualquier país e idioma. El sistema de internacionalización (i18n) debe cumplir con:

- Soporte para cualquier idioma sin necesidad de modificar código
- Los idiomas se agregan, eliminan y configuran desde el panel de administración
- El contenido de cada módulo está disponible en todos los idiomas activos
- Un idioma es el predeterminado (fallback cuando no existe traducción)
- El selector de idioma en la página pública muestra solo los idiomas activos
- La interfaz del admin panel puede tener traducciones fijas (UI labels), pero el contenido del sitio es completamente dinámico

La pregunta es: **¿cómo se implementa el sistema de i18n?**

---

## Decisión

Se implementa un sistema de **i18n dinámico** donde:

1. Los idiomas se registran en la tabla `languages` y se gestionan desde `/admin/languages`
2. El contenido de cada módulo se almacena como JSONB con claves de código de idioma
3. El admin panel genera campos de edición por cada idioma activo automáticamente
4. No se usan archivos de traducción estáticos (`/locales/*.json`) para el contenido del sitio
5. La UI del admin panel sí puede tener traducciones estáticas (labels, tooltips)

---

## Alternativas Consideradas

### 1. i18n dinámico desde JSONB + tabla de idiomas — SELECCIONADO

**Descripción**: Los idiomas se registran en una tabla de base de datos. El contenido de cada módulo se almacena como JSONB con una clave por idioma. Agregar un idioma = agregar una fila a `languages` + traducir el contenido de cada módulo.

```json
// Estructura de page_modules.content
{
  "es": { "title": "Bienvenido", "subtitle": "..." },
  "en": { "title": "Welcome", "subtitle": "..." },
  "fr": { "title": "Bienvenue", "subtitle": "..." }
}
```

**Pros**:

- **Completamente dinámico**: Agregar un nuevo idioma no requiere tocar código ni hacer redeploy
- **Estructura natural**: JSONB de PostgreSQL soporta esta estructura nativamente con consultas eficientes
- **Admin panel simplificado**: Al agregar un idioma, el editor de contenido muestra automáticamente un tab nuevo para ese idioma
- **Sin archivos de traducción**: No hay archivos `.json` que sincronizar, no hay builds que regenerar
- **Fallback natural**: Si `content["fr"]` no existe, se usa `content[defaultLang]`
- **Compatible con cualquier idioma**: RTL (árabe, hebreo), CJK (chino, japonés, coreano), cirílico — todo es texto en JSONB

**Contras**:

- El contenido JSONB crece linealmente con cada idioma (impacto menor: ~2-5 KB por módulo por idioma)
- No hay validación de tipo por idioma a nivel de base de datos (se valida con Zod en la API)
- El admin debe traducir todo manualmente (no hay traducción automática integrada en v1.0)

### 2. Archivos de traducción estáticos (`next-intl` / `next-i18next`)

**Descripción**: Usar una librería estándar de i18n con archivos JSON por idioma en el filesystem (`/messages/es.json`, `/messages/en.json`).

**Pros**:

- Patrón establecido en el ecosistema Next.js
- Type-safety con las claves de traducción
- Las traducciones se cachean eficientemente por el bundler
- Soporte maduro para pluralización, interpolación y formateo

**Contras**:

- **Requiere modificar código para agregar idioma**: Agregar un nuevo idioma implica crear un archivo, actualizar la configuración del router y posiblemente hacer redeploy
- **Contradice el principio "zero-code configuration"**: La plantilla promete que todo se configura desde el navegador
- **Dos fuentes de verdad**: Las traducciones de la UI estarían en archivos y el contenido dinámico en la base de datos — confuso
- **No escalable para idiomas arbitrarios**: Si un usuario quiere agregar quechua, necesitaría crear el archivo y redeployar
- **Sincronización compleja**: Si el admin agrega un módulo nuevo, ¿quién crea las claves de traducción en todos los archivos de idioma?

### 3. Tabla de traducciones relacional

**Descripción**: Una tabla separada `translations` con filas `(entity_type, entity_id, field_name, language_code, value)`.

**Pros**:

- Normalización relacional clásica
- Consultas por idioma eficientes con índices
- Facilita reportes de "traducciones faltantes"

**Contras**:

- **Explosión de filas**: 19 módulos × ~6 campos promedio × 5 idiomas = ~570 filas. Cada cambio de contenido toca múltiples filas
- **Queries complejos**: Obtener todo el contenido de un módulo en un idioma requiere JOINs o múltiples queries
- **Complejidad del admin**: La interfaz de edición necesita gestionar filas individuales de traducción en lugar de un objeto JSON cohesivo
- **Menor rendimiento**: Múltiples JOINs vs una lectura JSONB directa
- **Over-engineering**: Para un sistema single-tenant con ~19 módulos, la normalización relacional agrega complejidad sin beneficio proporcional

### 4. CMS externo de traducciones (Crowdin, Locize, Phrase)

**Descripción**: Usar un servicio externo de gestión de traducciones que se sincroniza con la base de datos.

**Pros**:

- Herramientas profesionales de traducción (memoria de traducción, glosarios)
- Posibilidad de traducción automática con IA integrada
- Workflows de revisión para equipos de traducción

**Contras**:

- **Dependencia externa**: Agrega un servicio más a gestionar y pagar
- **Complejidad de sincronización**: Los cambios en el CMS externo deben sincronizarse con Supabase y viceversa
- **Contradice la simplicidad**: Orion Landing Universal es para usuarios que quieren configurar todo desde un solo lugar
- **Overkill**: Una landing page con ~19 módulos no justifica un servicio profesional de gestión de traducciones

---

## Consecuencias

### Positivas

- **Verdaderamente universal**: El sistema soporta cualquier idioma del mundo sin modificar código
- **Zero-code para idiomas**: Un usuario no técnico puede agregar japonés, árabe o portugués desde el admin panel
- **Arquitectura simple**: Una tabla de idiomas + JSONB en el contenido — sin tablas de traducción, sin archivos, sin sincronización
- **Rendimiento**: Una sola lectura JSONB obtiene todo el contenido del módulo; extraer el idioma es una operación en memoria
- **Fallback robusto**: Si una traducción no existe, se muestra el idioma predeterminado — el sitio nunca muestra campos vacíos

### Negativas

- **Sin type-safety de traducción**: Las claves de contenido dentro del JSONB no tienen validación de tipos a nivel de TypeScript (se valida con Zod en runtime)
- **Traducción manual**: En v1.0, el admin debe traducir el contenido manualmente. No hay integración con servicios de traducción automática
- **Sin pluralización nativa**: JSONB no provee helpers para plurales, género o interpolación compleja. Si se necesitan, se implementan en la capa de renderizado
- **Crecimiento del JSONB**: Con muchos idiomas, los campos JSONB crecen (mitigado: es texto, no binario; PostgreSQL comprime JSONB eficientemente)

### Riesgos

- **Consistencia entre idiomas**: El admin podría olvidar traducir un módulo a un idioma, resultando en fallback silencioso al idioma predeterminado. Mitigación: el admin panel muestra indicadores de "traducción pendiente" por módulo/idioma
- **Migración de estructura de contenido**: Si se cambia la estructura de un módulo (ej: agregar un campo), hay que actualizar el JSONB de todos los idiomas. Mitigación: el campo `schema_version` permite migraciones progresivas
- **Rendimiento con muchos idiomas**: Si un usuario configura 20+ idiomas, el JSONB de cada módulo será grande. Mitigación: incluso con 20 idiomas, el JSONB de un módulo típico no supera 50 KB — insignificante para PostgreSQL

---

## Referencias

- [PostgreSQL JSONB Performance](https://www.postgresql.org/docs/current/datatype-json.html) — documentación oficial sobre rendimiento de JSONB
- [next-intl Documentation](https://next-intl.dev/) — referencia de la alternativa con archivos estáticos (descartada)
- [i18n Patterns in CMS](https://www.contentful.com/blog/i18n-cms/) — patrones de i18n en sistemas CMS
- [ADR-002: Backend Supabase](ADR-002-backend-supabase.md) — justificación de PostgreSQL/JSONB como almacenamiento
