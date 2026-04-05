# ADR-005: Patrón Registry para Módulos

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal estructura su landing page como una secuencia de **módulos** independientes (hero, FAQ, pricing, footer, etc.). Actualmente son 19 módulos, pero la arquitectura debe soportar crecimiento futuro y un eventual marketplace de módulos comunitarios.

El sistema necesita:

- Renderizar dinámicamente los módulos activos en el orden configurado por el admin
- Cada módulo tiene su propio componente React, esquema de campos editables y contenido por defecto (seed)
- El admin panel debe generar formularios de edición automáticamente a partir de los esquemas
- Agregar un nuevo módulo debe ser una operación simple y predecible
- Los módulos deben ser autocontenidos: no depender de lógica centralizada para su renderizado

La pregunta es: **¿cómo se conecta el `section_key` de la base de datos con el componente React correspondiente?**

---

## Decisión

Se implementa un **patrón Registry** centralizado que mapea cada `section_key` a su definición completa: componente React, esquema de campos, contenido por defecto y metadatos.

```typescript
// src/lib/modules/registry.ts
type ModuleDefinition = {
  component: React.LazyExoticComponent<React.ComponentType<ModuleProps>>
  schema: FieldDefinition[]
  seed: Record<string, unknown>
  displayName: string
  category: ModuleCategory
  isSystem: boolean
}

const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  hero: { ... },
  value_prop: { ... },
  // ... 19 módulos
}
```

Cada módulo se organiza en su propia carpeta:

```
src/components/modules/
  hero/
    HeroModule.tsx        ← Componente React
    hero.schema.ts        ← Definición de campos editables
    hero.seed.ts          ← Contenido por defecto multilingüe
  pricing/
    PricingModule.tsx
    pricing.schema.ts
    pricing.seed.ts
  ...
```

---

## Alternativas Consideradas

### 1. Patrón Registry centralizado — SELECCIONADO

**Descripción**: Un objeto JavaScript plano (`Record<string, ModuleDefinition>`) que mapea cada `section_key` a su definición completa. El registry es la única fuente de verdad para la relación "clave → componente".

**Pros**:

- **Descubrimiento explícito**: Abrir `registry.ts` muestra todos los módulos disponibles en un solo lugar
- **Type-safe**: TypeScript valida que cada módulo registrado cumpla con la interfaz `ModuleDefinition`
- **Lazy loading**: Los componentes se cargan con `React.lazy()`, lo que permite code splitting automático — solo se descarga el código de los módulos activos
- **Autocontenido**: Cada carpeta de módulo tiene todo lo necesario (componente, esquema, seed) — se puede copiar/pegar para crear un nuevo módulo
- **Admin panel genérico**: El admin panel lee los `schema` del registry para generar formularios de edición automáticamente, sin código específico por módulo
- **Agregar módulo = 3 pasos**: (1) Crear carpeta con componente + esquema + seed, (2) Registrar en `registry.ts`, (3) Insertar fila en `module_schemas` — no hay switch/case ni condicionales que actualizar
- **Marketplace-ready**: Un módulo comunitario es una carpeta que se copia y se registra

**Contras**:

- El registry es un archivo que crece con cada módulo (mitigado: son solo imports, no lógica)
- El registro es manual (hay que agregar la línea en `registry.ts`)
- Un error en el registry (ej: key duplicada) afecta a todo el sistema

### 2. Switch/case o if/else condicional

**Descripción**: Un componente `ModuleRenderer` con un switch/case que mapea cada `section_key` a su componente:

```typescript
function ModuleRenderer({ sectionKey }: Props) {
  switch (sectionKey) {
    case 'hero': return <HeroModule />
    case 'pricing': return <PricingModule />
    case 'faq': return <FaqModule />
    // ... 19 cases
    default: return null
  }
}
```

**Pros**:

- Patrón simple y familiar para desarrolladores junior
- Sin abstracción adicional
- Fácil de debuggear (stack trace directo)

**Contras**:

- **Violación de Open/Closed Principle**: Agregar un módulo requiere modificar el switch/case — el código existente se toca cada vez
- **Sin esquemas asociados**: El switch solo mapea al componente, pero ¿dónde viven los schemas y seeds? Necesitarían otro switch/case o estructura paralela
- **No soporta lazy loading natural**: Todos los imports están al inicio del archivo, lo que incluye todos los módulos en el bundle
- **El admin panel no puede descubrir campos automáticamente**: Sin un registry de schemas, cada módulo necesitaría su propio formulario hardcodeado en el admin
- **No escalable**: Con 19+ módulos, el switch se vuelve largo e inmantenible
- **No marketplace-ready**: Agregar un módulo externo requiere modificar código core

### 3. File-system convention (descubrimiento automático)

**Descripción**: Escanear el directorio `src/components/modules/` automáticamente y registrar cada carpeta como un módulo disponible, similar a cómo Next.js descubre rutas.

```
src/components/modules/
  hero/index.tsx       ← Auto-descubierto como módulo "hero"
  pricing/index.tsx    ← Auto-descubierto como módulo "pricing"
```

**Pros**:

- Zero-config: agregar una carpeta la convierte automáticamente en módulo
- Convención sobre configuración
- Imposible olvidar registrar un módulo

**Contras**:

- **Complejidad de implementación**: Requiere un plugin de webpack/turbopack o un script de build que genere el registry automáticamente
- **Type-safety reducida**: El descubrimiento en tiempo de build no permite la misma validación de tipos que un registry explícito
- **Metadatos implícitos**: El nombre, categoría y flag `isSystem` tendrían que derivarse de convenciones de archivo (ej: `hero.meta.json`) — más archivos, más convenciones que aprender
- **Debugging opaco**: Si un módulo no aparece, hay que investigar si el script de build lo detectó correctamente
- **Dynamic imports complicados**: `React.lazy()` necesita una ruta exacta; el escaneo dinámico complica esto
- **Over-engineering para 19 módulos**: El costo de implementar el sistema de auto-descubrimiento no se justifica cuando registrar manualmente 19 líneas es trivial

### 4. Plugin system con hooks

**Descripción**: Un sistema de plugins donde cada módulo se "registra" a sí mismo llamando a una función `registerModule()`, similar a WordPress hooks o Vite plugins.

```typescript
// src/components/modules/hero/index.ts
import { registerModule } from '@/lib/modules/registry'
registerModule('hero', { component: HeroModule, schema: heroSchema, ... })
```

**Pros**:

- Los módulos se auto-registran: máxima encapsulación
- Patrón familiar del ecosistema de plugins
- El registro está junto al componente, no en un archivo central

**Contras**:

- **Efectos secundarios en imports**: `registerModule()` se ejecuta como side-effect al importar — difícil de predecir cuándo se ejecuta en SSR vs client
- **Orden de registro no determinista**: Si dos módulos se registran con la misma key, el resultado depende del orden de import
- **Incompatible con Server Components**: Los side-effects de registro necesitan ejecutarse en un contexto específico; RSC complica esto
- **Testing más difícil**: Los tests necesitan importar módulos para que se registren, creando dependencias implícitas
- **Debugging opaco**: Si un módulo no se registra, hay que investigar si su archivo fue importado

---

## Consecuencias

### Positivas

- **Extensibilidad limpia**: Agregar un módulo no modifica código existente — solo se agrega una entrada al registry
- **Formularios automáticos en admin**: El admin panel lee los schemas del registry y genera la UI de edición sin código específico por módulo
- **Code splitting**: `React.lazy()` garantiza que solo se descarga el JavaScript de los módulos activos en la página
- **Consistencia**: Todos los módulos siguen la misma estructura (componente + esquema + seed), lo que facilita contribuciones open-source
- **Base para marketplace**: Un módulo del marketplace es una carpeta que sigue la convención + una línea de registro

### Negativas

- **Registro manual**: Agregar un módulo requiere editar `registry.ts` además de crear la carpeta. Es posible olvidar este paso
- **Archivo central**: `registry.ts` es un punto central que todos los módulos tocan indirectamente — un error ahí afecta a todos
- **Sin validación runtime del schema vs contenido**: El registry define qué campos tiene un módulo, pero no valida automáticamente que el JSONB en la base de datos siga ese schema

### Riesgos

- **Key duplicada**: Si dos módulos se registran con la misma `section_key`, TypeScript no lo detecta (es un string key de un objeto). Mitigación: la tabla `page_modules` tiene constraint `UNIQUE` en `section_key`, y se pueden agregar tests que validen unicidad
- **Schema drift**: Si se actualiza el schema de un módulo pero no se migra el contenido existente en la base de datos, el admin panel podría mostrar campos que no existen en el JSONB. Mitigación: `schema_version` + funciones de migración por módulo
- **Bundle size si no se usa lazy**: Si los componentes no se importan con `React.lazy()`, todos los módulos se incluirían en el bundle inicial. Mitigación: el registry usa `lazy()` por diseño; enforced por code review

---

## Decisión de Diseño: Estructura de un Módulo

Para que un módulo sea válido, su carpeta debe contener:

| Archivo              | Propósito                                                | Obligatorio                |
| -------------------- | -------------------------------------------------------- | -------------------------- |
| `{Module}Module.tsx` | Componente React que renderiza el módulo                 | Sí                         |
| `{module}.schema.ts` | Array de `FieldDefinition` describiendo campos editables | Sí                         |
| `{module}.seed.ts`   | Contenido por defecto multilingüe (al menos `es` y `en`) | Sí                         |
| `{module}.styles.ts` | Estilos por defecto del módulo                           | No (usa defaults globales) |

**Interfaz del componente**:

```typescript
interface ModuleProps {
  content: Record<string, unknown> // Contenido en el idioma activo
  styles: Record<string, unknown> // Estilos personalizados del módulo
  isEditing?: boolean // true en modo edición inline
}
```

Todos los componentes de módulo reciben la misma interfaz. La variación está en la estructura del `content`, que se define en el schema del módulo.

---

## Referencias

- [Registry Pattern](https://www.patterns.dev/posts/singleton-pattern/) — patrón de diseño para registro centralizado
- [React.lazy() Documentation](https://react.dev/reference/react/lazy) — lazy loading de componentes
- [SOLID Principles — Open/Closed](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle) — justificación de por qué el registry es preferible al switch/case
- [ADR-003: Admin como ruta separada](ADR-003-admin-separate-route.md) — el admin panel genera formularios a partir de los schemas del registry
