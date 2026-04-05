# Guia de Contribucion — Orion Landing Universal

> Gracias por tu interés en contribuir a Orion Landing Universal. Este documento te guiará paso a paso para que puedas aportar al proyecto de manera efectiva, sin importar tu nivel de experiencia.

---

## 1. Bienvenida

Orion Landing Universal es un proyecto de la comunidad **Orion AI Society** y cada contribución cuenta. Ya sea que quieras corregir un typo, reportar un bug, proponer una idea o desarrollar un módulo completo — tu aporte es valioso y bienvenido.

Este proyecto nació con vocación educativa. Si estás aprendiendo, este es un excelente lugar para practicar. Los Core Contributors se comprometen a dar feedback constructivo y a ayudarte a crecer.

**No necesitas ser experto para contribuir.** Solo necesitas ganas de aportar y disposición para seguir las convenciones del proyecto.

---

## 2. Formas de Contribuir

Hay muchas formas de aportar, y no todas requieren escribir código:

| Tipo de Contribución | Descripción                                          | Nivel de Experiencia |
| -------------------- | ---------------------------------------------------- | -------------------- |
| **Reportar bugs**    | Encontrar y documentar problemas                     | Cualquier nivel      |
| **Sugerir mejoras**  | Proponer nuevas funcionalidades o mejoras            | Cualquier nivel      |
| **Documentación**    | Mejorar guías, README, comentarios en código         | Principiante+        |
| **Traducciones**     | Traducir la interfaz o documentación a otros idiomas | Principiante+        |
| **Diseño**           | Proponer mejoras visuales, mockups, iconos           | Diseñadores          |
| **Testing**          | Escribir tests unitarios o E2E                       | Intermedio           |
| **Bug fixes**        | Corregir bugs reportados                             | Intermedio           |
| **Nuevos módulos**   | Crear módulos para la landing page                   | Intermedio+          |
| **Core features**    | Trabajar en funcionalidades del core                 | Avanzado             |
| **Revisión de PRs**  | Revisar código de otros contribuidores               | Intermedio+          |

---

## 3. Configuración del Entorno de Desarrollo

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 20+** — [Descargar](https://nodejs.org/)
- **pnpm** — Gestor de paquetes del proyecto. Instalar con: `npm install -g pnpm`
- **Git** — [Descargar](https://git-scm.com/)
- **Cuenta de Supabase** — [Registrarse](https://supabase.com/) (el tier gratuito es suficiente para desarrollo)
- **Editor de código** — Recomendamos VS Code con las extensiones: ESLint, Tailwind CSS IntelliSense, Prettier

### Pasos de Instalación

```bash
# 1. Hacer fork del repositorio en GitHub (botón "Fork" en la página del repo)

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/landingpage_universal.git
cd landingpage_universal

# 3. Agregar el repositorio original como remote
git remote add upstream https://github.com/ORION-OCG/landingpage_universal.git

# 4. Instalar dependencias
pnpm install

# 5. Copiar el archivo de variables de entorno
cp .env.example .env.local

# 6. Configurar las variables de entorno
# Edita .env.local con tus credenciales de Supabase:
#   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
#   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key (solo para migraciones)

# 7. Ejecutar el wizard de configuración inicial
pnpm setup

# 8. Iniciar el servidor de desarrollo
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`.

### Verificar la Instalación

Después de `pnpm dev`, verifica que:

- La landing page se carga correctamente en el navegador.
- El panel de admin (`/admin`) es accesible.
- No hay errores en la consola del navegador ni en la terminal.

### Comandos Útiles

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `pnpm dev`        | Servidor de desarrollo con hot reload |
| `pnpm build`      | Build de producción                   |
| `pnpm lint`       | Ejecutar ESLint                       |
| `pnpm type-check` | Verificación de tipos TypeScript      |
| `pnpm test`       | Ejecutar tests unitarios (Vitest)     |
| `pnpm test:e2e`   | Ejecutar tests E2E (Playwright)       |
| `pnpm format`     | Formatear código con Prettier         |

---

## 4. Flujo de Trabajo para Contribuciones

### 4.1 Antes de Empezar

1. **Busca Issues existentes** — quizás alguien ya reportó lo mismo o está trabajando en algo similar.
2. **Abre un Issue primero** (para cambios no triviales) — discutir antes de implementar ahorra tiempo.
3. **Espera confirmación** — para features nuevas, espera a que un Core Contributor o el Project Lead confirme que el cambio es deseado.

### 4.2 Flujo Paso a Paso

```
1. Fork ─── 2. Branch ─── 3. Implement ─── 4. Test ─── 5. PR ─── 6. Review ─── 7. Merge
```

**Paso 1: Sincronizar tu fork**

```bash
git checkout main
git pull upstream main
git push origin main
```

**Paso 2: Crear una rama**

```bash
# Usar el formato de ramas definido en CANONICAL.md
git checkout -b feat/nombre-de-la-feature
# o: fix/descripcion-del-bug
# o: docs/tema-de-documentacion
```

**Paso 3: Implementar los cambios**

- Sigue las convenciones definidas en [CANONICAL.md](./CANONICAL.md).
- Haz commits pequeños y frecuentes siguiendo Conventional Commits.
- Mantén el scope enfocado — un PR debe resolver una sola cosa.

**Paso 4: Verificar antes de enviar**

```bash
pnpm lint          # Sin errores de lint
pnpm type-check    # Sin errores de tipos
pnpm test          # Tests pasan
pnpm build         # Build exitoso
```

**Paso 5: Crear el Pull Request**

```bash
git push origin feat/nombre-de-la-feature
```

Luego, abre un Pull Request en GitHub hacia el branch `main` del repositorio original.

### 4.3 Template de Pull Request

Al crear un PR, usa esta estructura:

```markdown
## ¿Qué cambia este PR?

[Descripción clara y concisa del cambio]

## ¿Por qué es necesario?

[Contexto y motivación — enlace al Issue si aplica]

## ¿Cómo se implementó?

[Descripción técnica breve de la solución]

## Capturas de Pantalla

[Si hay cambios visuales, incluir antes/después]

## Checklist

- [ ] He leído CONTRIBUTING.md y CANONICAL.md
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He agregado tests para los cambios (si aplica)
- [ ] Todos los tests pasan localmente
- [ ] He actualizado la documentación (si aplica)
- [ ] Mi PR tiene un scope enfocado (una sola funcionalidad o fix)
```

---

## 5. Crear un Nuevo Módulo

Crear módulos es la contribución más común y una excelente forma de aportar al proyecto. Un módulo es una sección de la landing page (testimonios, galería, equipo, precios, etc.).

### 5.1 Guía Paso a Paso

**Paso 1: Crear la estructura de archivos**

```bash
mkdir -p src/modules/tu-modulo
```

```
src/modules/tu-modulo/
├── TuModulo.tsx            # Componente principal (Server Component)
├── tu-modulo.schema.ts     # Schema Zod para los datos del módulo
├── tu-modulo.seed.ts       # Datos de ejemplo para el wizard
├── TuModuloEditor.tsx      # Editor para el panel de admin (Client Component)
├── TuModulo.test.tsx       # Tests del componente
├── tu-modulo.schema.test.ts # Tests del schema
└── index.ts                # Barrel exports
```

**Paso 2: Definir el Schema**

```typescript
// tu-modulo.schema.ts
import { z } from 'zod'

export const tuModuloSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(120),
  subtitle: z.string().max(300).optional(),
  items: z
    .array(
      z.object({
        // campos específicos del módulo
      }),
    )
    .min(1)
    .max(20),
})

export type TuModuloData = z.infer<typeof tuModuloSchema>
```

**Paso 3: Implementar el Componente**

```typescript
// TuModulo.tsx
import type { TuModuloData } from './tu-modulo.schema';

interface TuModuloProps {
  data: TuModuloData;
}

export function TuModulo({ data }: TuModuloProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {data.title}
        </h2>
        {/* Contenido del módulo */}
      </div>
    </section>
  );
}
```

**Paso 4: Crear los datos de ejemplo**

```typescript
// tu-modulo.seed.ts
import type { TuModuloData } from './tu-modulo.schema'

export const tuModuloSeed: TuModuloData = {
  title: 'Título de Ejemplo',
  subtitle: 'Subtítulo descriptivo para el wizard de configuración',
  items: [
    // datos de ejemplo realistas
  ],
}
```

**Paso 5: Implementar el Editor**

```typescript
// TuModuloEditor.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tuModuloSchema, type TuModuloData } from './tu-modulo.schema';

interface TuModuloEditorProps {
  initialData: TuModuloData;
  onSave: (data: TuModuloData) => Promise<void>;
}

export function TuModuloEditor({ initialData, onSave }: TuModuloEditorProps) {
  const form = useForm<TuModuloData>({
    resolver: zodResolver(tuModuloSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)}>
      {/* Campos del formulario usando componentes de shadcn/ui */}
    </form>
  );
}
```

**Paso 6: Crear los barrel exports**

```typescript
// index.ts
export { TuModulo } from './TuModulo'
export { TuModuloEditor } from './TuModuloEditor'
export { tuModuloSchema } from './tu-modulo.schema'
export { tuModuloSeed } from './tu-modulo.seed'
export type { TuModuloData } from './tu-modulo.schema'
```

**Paso 7: Registrar el módulo en el registry**

Sigue las instrucciones del archivo de registro de módulos para declarar tu nuevo módulo en el sistema.

### 5.2 Checklist del Módulo

Antes de enviar el PR de un nuevo módulo, verifica:

- [ ] **Responsive**: Se ve bien en mobile (320px), tablet (768px) y desktop (1280px+).
- [ ] **Accesible**: Navegable con teclado, contraste adecuado, alt text en imágenes, roles ARIA donde sea necesario.
- [ ] **Tema**: Usa variables CSS del tema (`var(--color-primary)`, etc.) en lugar de colores hardcodeados.
- [ ] **Schema validado**: El schema Zod cubre todos los campos con validaciones apropiadas.
- [ ] **Datos de ejemplo**: Los seed data son realistas y demuestran las capacidades del módulo.
- [ ] **Editor funcional**: El editor del admin panel permite modificar todos los campos del módulo.
- [ ] **Tests**: Mínimo tests del schema y del componente.
- [ ] **Server Component**: El componente principal es un Server Component (sin `'use client'`).
- [ ] **Sin dependencias extra**: No agrega dependencias npm sin aprobación previa.
- [ ] **Documentación**: JSDoc en funciones públicas y README si la complejidad lo amerita.

---

## 6. Estándares de Código

Todas las contribuciones de código deben seguir las convenciones definidas en **[CANONICAL.md](./CANONICAL.md)**. Los puntos más importantes:

- **TypeScript estricto** — sin `any`, validación con Zod.
- **Server Components por defecto** — `'use client'` solo cuando es necesario.
- **Tailwind CSS** — sin CSS modules, sin styled-components.
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, etc.
- **Mobile-first** — diseño responsive desde el breakpoint más pequeño.

Si tienes dudas sobre alguna convención, pregunta en el Issue o Discussion antes de implementar.

---

## 7. Reporte de Bugs

Para reportar un bug, abre un Issue en GitHub con la etiqueta `bug` usando la siguiente estructura:

```markdown
## Descripción del Bug

[Descripción clara y concisa del problema]

## Pasos para Reproducir

1. Ir a '...'
2. Hacer clic en '...'
3. Escribir '...'
4. Ver el error

## Comportamiento Esperado

[Qué debería pasar]

## Comportamiento Actual

[Qué pasa realmente]

## Capturas de Pantalla

[Si aplica, incluir capturas o videos del problema]

## Entorno

- Sistema Operativo: [ej. Windows 11, macOS 14, Ubuntu 24.04]
- Navegador: [ej. Chrome 124, Firefox 126]
- Versión de Node.js: [ej. 20.12.0]
- Versión del proyecto: [ej. 1.2.3 o commit hash]

## Contexto Adicional

[Cualquier otra información relevante]
```

**Consejos para un buen reporte de bug:**

- Incluir la menor cantidad de pasos posible para reproducir el problema.
- Si el bug es intermitente, mencionarlo y describir bajo qué condiciones ocurre.
- Incluir mensajes de error exactos de la consola si los hay.
- Un bug bien documentado se resuelve más rápido.

---

## 8. Solicitud de Features

Para proponer una nueva funcionalidad, abre un Issue con la etiqueta `enhancement` o `rfc`:

```markdown
## Problema que Resuelve

[Describe el problema o necesidad que motiva esta propuesta]

## Solución Propuesta

[Describe cómo debería funcionar la funcionalidad]

## Alternativas Consideradas

[¿Pensaste en otras formas de resolver esto? ¿Por qué las descartaste?]

## Mockups o Ejemplos

[Si aplica, incluir bocetos, mockups o ejemplos de otras herramientas]

## Consideraciones Adicionales

[Impacto en el proyecto, dependencias necesarias, complejidad estimada]
```

**Antes de proponer, pregúntate:**

- ¿Esto está dentro del alcance del proyecto? (Revisa la sección "No-Goals" en [CONSTITUTION.md](./CONSTITUTION.md))
- ¿Alguien ya propuso algo similar? (Busca en Issues cerrados también)
- ¿Beneficia a la mayoría de los usuarios o es un caso muy particular?

---

## 9. Revisión de Pull Requests

### Para Autores

- Responde a todos los comentarios de la revisión, incluso si es solo para confirmar que entendiste.
- No tomes el feedback de forma personal — es sobre el código, no sobre ti.
- Si no estás de acuerdo con un comentario, explica tu razonamiento con respeto.
- Haz los cambios solicitados en commits separados (no en force push) para facilitar la re-revisión.

### Para Revisores

- **Turnaround esperado**: Primera revisión dentro de 48 horas hábiles.
- Sé constructivo y específico. En lugar de "esto está mal", explica qué debería cambiar y por qué.
- Diferencia entre "debe cambiar" (bloqueante) y "sugerencia" (opcional).
- Si el PR es grande, enfócate primero en la arquitectura y luego en los detalles.

### Qué Se Revisa

| Aspecto           | Preguntas Clave                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Funcionalidad** | ¿Hace lo que dice? ¿Los edge cases están cubiertos?                      |
| **Convenciones**  | ¿Sigue CANONICAL.md? ¿Naming correcto? ¿Estructura correcta?             |
| **Seguridad**     | ¿Hay validación? ¿Se exponen datos sensibles? ¿RLS configurado?          |
| **Rendimiento**   | ¿Hay imports pesados innecesarios? ¿Server vs Client Component correcto? |
| **Tests**         | ¿Hay tests? ¿Cubren los casos importantes?                               |
| **Documentación** | ¿Los cambios están documentados? ¿JSDoc donde corresponde?               |
| **Scope**         | ¿El PR está enfocado? ¿Incluye cambios no relacionados?                  |

---

## 10. Reconocimiento y Créditos

Toda contribución merece reconocimiento:

- **Todos los contribuidores** aparecen listados en `CONTRIBUTORS.md`.
- **Contribuciones significativas** se mencionan en las notas de release.
- **Módulos comunitarios** se acreditan a su autor en la documentación del módulo.
- Usamos el bot [All Contributors](https://allcontributors.org/) para mantener la lista actualizada.

### Tipos de Contribución Reconocidos

| Emoji         | Tipo            | Descripción                      |
| ------------- | --------------- | -------------------------------- |
| `code`        | Código          | Commits, PRs                     |
| `doc`         | Documentación   | Guías, README, comentarios       |
| `bug`         | Reporte de bugs | Issues con bugs                  |
| `ideas`       | Ideas           | Propuestas de features o mejoras |
| `design`      | Diseño          | Mockups, UI/UX                   |
| `test`        | Testing         | Tests unitarios o E2E            |
| `translation` | Traducciones    | i18n                             |
| `review`      | Revisión        | Code review                      |
| `maintenance` | Mantenimiento   | CI, dependencias                 |

---

## 11. Preguntas Frecuentes

**¿Puedo contribuir si soy principiante?**
Absolutamente. Busca Issues con la etiqueta `good-first-issue` — están diseñados para ser accesibles.

**¿En qué idioma debo escribir los commits y PRs?**
Los commits y PRs pueden ser en español o inglés. El código (nombres de variables, funciones) debe ser en inglés.

**¿Necesito tests para mi contribución?**
Para correcciones de bugs y funcionalidades nuevas, sí. Para documentación y typos, no.

**¿Cuánto tarda en revisarse mi PR?**
El objetivo es dar una primera revisión en 48 horas hábiles. Para PRs complejos puede tomar más.

**¿Puedo trabajar en un Issue que no tiene a nadie asignado?**
Sí, pero deja un comentario primero diciendo que quieres trabajar en él para evitar duplicar esfuerzos.

**¿Qué pasa si mi PR es rechazado?**
Se te dará feedback sobre por qué y cómo mejorarlo. Un rechazo no es permanente — puedes iterar y volver a enviar.

---

## 12. Contacto

- **Issues y Discussions de GitHub**: Para preguntas técnicas y propuestas.
- **Canales de Orion AI Society**: Para discusión informal y soporte de la comunidad.
- **Project Lead**: Luis Enrique Gutiérrez Campos — para escalaciones y decisiones de gobernanza.

---

_Gracias por contribuir a Orion Landing Universal. Cada línea de código, cada reporte de bug y cada sugerencia hace que este proyecto sea mejor para todos._

---

_Última actualización: Abril 2026_
_Versión del documento: 1.0_
