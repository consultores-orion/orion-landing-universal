# I18N-SYSTEM.md — Especificacion del Sistema de Internacionalizacion

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Arquitectura

### 1.1 Enfoque General

Orion Landing Universal implementa internacionalizacion (i18n) mediante un enfoque **content-driven** donde todo el contenido multilingue se almacena como campos JSONB en Supabase. A diferencia de sistemas basados en archivos de traduccion (como `next-intl` con archivos `.json`), el contenido se gestiona completamente desde la base de datos y el panel admin.

### 1.2 Principios de Diseno

| Principio             | Descripcion                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| **DB-first**          | El contenido multilingue vive en Supabase, no en archivos estaticos         |
| **Fallback gracioso** | Si no existe traduccion, se muestra el idioma default, nunca un campo vacio |
| **Dinamico**          | Los idiomas se agregan/eliminan desde el admin sin redesplegar              |
| **No-rebuild**        | Cambiar idiomas o traducciones no requiere rebuild de la app                |
| **SEO-aware**         | Cada idioma tiene sus propios meta tags y hreflang                          |
| **Persistente**       | La eleccion de idioma del usuario se recuerda entre sesiones                |

### 1.3 Diagrama de Arquitectura

```
+----------------------------------+
|          Supabase DB             |
|                                  |
|  languages (tabla de idiomas)    |
|  page_modules.content (JSONB)    |
|  site_config (JSONB)             |
|  seo_config (por idioma)         |
+----------------------------------+
           |
           | Fetch en Server Component
           v
+----------------------------------+
|    I18nProvider (React Context)  |
|                                  |
|  - currentLang: string           |
|  - defaultLang: string           |
|  - languages: Language[]         |
|  - setLang: (lang) => void       |
+----------------------------------+
           |
           | useTranslation() hook
           v
+----------------------------------+
|   Componentes de la Landing      |
|                                  |
|   t('title') → resuelve al       |
|   idioma actual con fallback     |
+----------------------------------+
           |
           | Language Switcher
           v
+----------------------------------+
|   localStorage + URL param       |
|   (persistencia de eleccion)     |
+----------------------------------+
```

---

## 2. Estructura de Datos Multilingue

### 2.1 Patron JSONB

Todo campo de texto que debe soportar multiples idiomas se almacena como un objeto JSONB donde las claves son codigos ISO 639-1 y los valores son los textos:

```json
{
  "es": "Bienvenido a nuestra plataforma",
  "en": "Welcome to our platform",
  "fr": "Bienvenue sur notre plateforme"
}
```

### 2.2 Tipo TypeScript

```typescript
/**
 * Contenido multilingue.
 * Las claves son codigos ISO 639-1 (es, en, fr, de, etc.)
 * Los valores son strings con el contenido en ese idioma.
 */
export type MultilingualText = Record<string, string>

/**
 * Contenido multilingue con HTML (rich text).
 * Las claves son codigos ISO 639-1.
 * Los valores son strings HTML.
 */
export type MultilingualRichText = Record<string, string>

/**
 * Imagen con alt text multilingue.
 */
export interface MultilingualImage {
  url: string
  alt: MultilingualText
  width?: number
  height?: number
}
```

### 2.3 Donde se Usa

| Tabla            | Campos Multilingues                                    | Formato                                |
| ---------------- | ------------------------------------------------------ | -------------------------------------- |
| `page_modules`   | `content` (todos los campos de texto dentro del JSONB) | `content.title.es`, `content.title.en` |
| `site_config`    | `site_description`                                     | `{ "es": "...", "en": "..." }`         |
| `seo_config`     | `meta_title`, `meta_description` (una fila por idioma) | Texto plano por fila                   |
| `media`          | `alt_text`                                             | `{ "es": "...", "en": "..." }`         |
| `module_schemas` | `schema.fields[].label`, `schema.fields[].description` | Dentro del JSONB del schema            |

### 2.4 Ejemplo Completo de un Modulo Multilingue

```json
{
  "id": "uuid-hero-001",
  "section_key": "hero",
  "content": {
    "title": {
      "es": "Transforma tu Presencia Digital",
      "en": "Transform Your Digital Presence",
      "fr": "Transformez votre Presence Numerique"
    },
    "subtitle": {
      "es": "La solucion todo-en-uno para crear landing pages profesionales.",
      "en": "The all-in-one solution to create professional landing pages.",
      "fr": "La solution tout-en-un pour creer des pages de destination professionnelles."
    },
    "ctaText": {
      "es": "Comenzar Ahora",
      "en": "Get Started Now",
      "fr": "Commencer Maintenant"
    },
    "ctaLink": "#offer_form",
    "heroImage": {
      "url": "/images/hero.svg",
      "alt": {
        "es": "Ilustracion de landing page",
        "en": "Landing page illustration",
        "fr": "Illustration de page de destination"
      }
    }
  }
}
```

---

## 3. Tabla `languages`

### 3.1 Schema SQL

```sql
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,          -- ISO 639-1: "es", "en", "fr"
  name TEXT NOT NULL,                 -- Nombre en ingles: "Spanish", "English"
  native_name TEXT NOT NULL,          -- Nombre nativo: "Espanol", "English"
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo un idioma puede ser default
CREATE UNIQUE INDEX idx_languages_default
  ON languages (is_default) WHERE is_default = true;
```

### 3.2 Constraints

| Constraint                     | Descripcion                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| `code` UNIQUE                  | No puede haber dos idiomas con el mismo codigo              |
| `is_default` UNIQUE WHERE true | Solo un idioma puede ser el default                         |
| Al menos un idioma activo      | La aplicacion valida que no se desactiven todos los idiomas |
| No eliminar el default         | La API rechaza DELETE del idioma con `is_default = true`    |

### 3.3 Valores Iniciales (Seed)

```sql
INSERT INTO languages (code, name, native_name, is_default, is_active, sort_order) VALUES
  ('es', 'Spanish', 'Espanol', true, true, 1),
  ('en', 'English', 'English', false, true, 2);
```

### 3.4 Tipo TypeScript

```typescript
export interface Language {
  id: string
  code: string // "es", "en", "fr", etc.
  name: string // "Spanish"
  nativeName: string // "Espanol"
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}
```

---

## 4. Proveedor de i18n (React Context)

### 4.1 Implementacion del Provider

```typescript
// src/lib/i18n/I18nProvider.tsx

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type FC,
  type ReactNode,
} from 'react';
import type { Language, MultilingualText } from './types';

interface I18nContextValue {
  /** Codigo del idioma actual */
  currentLang: string;

  /** Codigo del idioma por defecto del sitio */
  defaultLang: string;

  /** Lista de idiomas activos */
  languages: Language[];

  /** Cambiar el idioma actual */
  setLang: (langCode: string) => void;

  /** Resolver un campo multilingue al idioma actual */
  t: (field: MultilingualText | string | undefined | null) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  languages: Language[];
  defaultLang: string;
  initialLang?: string;
}

export const I18nProvider: FC<I18nProviderProps> = ({
  children,
  languages,
  defaultLang,
  initialLang,
}) => {
  // Determinar idioma inicial
  const [currentLang, setCurrentLang] = useState(() => {
    // Prioridad: URL param > localStorage > defaultLang
    if (initialLang && languages.some(l => l.code === initialLang)) {
      return initialLang;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('orion_lang');
      if (stored && languages.some(l => l.code === stored)) {
        return stored;
      }
    }
    return defaultLang;
  });

  // Persistir eleccion de idioma
  const setLang = useCallback(
    (langCode: string) => {
      if (!languages.some(l => l.code === langCode)) return;

      setCurrentLang(langCode);

      // Persistir en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('orion_lang', langCode);
      }

      // Actualizar URL param
      const url = new URL(window.location.href);
      url.searchParams.set('lang', langCode);
      window.history.replaceState({}, '', url.toString());
    },
    [languages]
  );

  // Sincronizar con URL param al montar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && urlLang !== currentLang && languages.some(l => l.code === urlLang)) {
      setCurrentLang(urlLang);
      localStorage.setItem('orion_lang', urlLang);
    }
  }, []);

  // Funcion de traduccion con cadena de fallback
  const t = useCallback(
    (field: MultilingualText | string | undefined | null): string => {
      // Si es null/undefined, retornar string vacio
      if (field == null) return '';

      // Si ya es un string directo, retornarlo
      if (typeof field === 'string') return field;

      // Cadena de fallback:
      // 1. Idioma actual
      // 2. Idioma por defecto
      // 3. Primer valor disponible en cualquier idioma
      // 4. String vacio
      return (
        field[currentLang] ??
        field[defaultLang] ??
        Object.values(field)[0] ??
        ''
      );
    },
    [currentLang, defaultLang]
  );

  return (
    <I18nContext.Provider
      value={{
        currentLang,
        defaultLang,
        languages,
        setLang,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook para acceder al sistema de internacionalizacion.
 *
 * @returns { t, currentLang, setLang, defaultLang, languages }
 */
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation debe usarse dentro de un I18nProvider');
  }
  return context;
}
```

### 4.2 Uso del Provider en la App

```typescript
// src/app/layout.tsx (o src/app/(public)/layout.tsx)

import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { createServerClient } from '@/lib/supabase/server';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang?: string };
}) {
  const supabase = await createServerClient();

  // Cargar idiomas activos
  const { data: languages } = await supabase
    .from('languages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // Determinar idioma default
  const defaultLang = languages?.find(l => l.is_default)?.code ?? 'es';

  return (
    <html lang={params.lang ?? defaultLang}>
      <body>
        <I18nProvider
          languages={languages ?? []}
          defaultLang={defaultLang}
          initialLang={params.lang}
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 4.3 Uso en Componentes

```typescript
// Ejemplo: componente de modulo usando el hook
'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';

export function HeroSection({ content }: { content: HeroContent }) {
  const { t, currentLang } = useTranslation();

  return (
    <section>
      <h1>{t(content.title)}</h1>
      <p>{t(content.subtitle)}</p>
      <a href={content.ctaLink}>{t(content.ctaText)}</a>
    </section>
  );
}
```

### 4.4 Cadena de Fallback Detallada

Cuando `t(field)` se llama, la resolucion sigue esta cadena:

```
1. field[currentLang]    → Si existe y no esta vacio, usar este
       |
       v (si es null/undefined/empty)
2. field[defaultLang]    → Fallback al idioma por defecto del sitio
       |
       v (si es null/undefined/empty)
3. Object.values(field)[0]  → Primer valor disponible en cualquier idioma
       |
       v (si no hay ningun valor)
4. '' (string vacio)     → Ultimo recurso, retorna string vacio
```

**Justificacion**: Este orden garantiza que:

- El usuario siempre ve contenido en su idioma si existe
- Si no hay traduccion, ve el contenido en el idioma default (preferible a nada)
- Si el idioma default tampoco tiene valor (caso borde), se usa cualquier traduccion disponible
- Solo en caso extremo (campo completamente vacio) se muestra string vacio

---

## 5. Language Switcher Component

### 5.1 Componente Publico

```typescript
// src/components/LanguageSwitcher.tsx

'use client';

import { type FC } from 'react';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface LanguageSwitcherProps {
  /** Estilo visual */
  variant?: 'buttons' | 'dropdown' | 'flags';
  /** Tamano */
  size?: 'small' | 'medium';
}

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({
  variant = 'buttons',
  size = 'small',
}) => {
  const { currentLang, languages, setLang } = useTranslation();

  if (languages.length <= 1) return null; // No mostrar si solo hay un idioma

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1" role="group" aria-label="Selector de idioma">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLang(lang.code)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${currentLang === lang.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
            aria-current={currentLang === lang.code ? 'true' : undefined}
            aria-label={`Cambiar a ${lang.nativeName}`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-muted text-foreground rounded-md px-3 py-1 text-sm"
        aria-label="Selector de idioma"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    );
  }

  return null;
};
```

### 5.2 Persistencia de la Eleccion

La eleccion de idioma se persiste en dos mecanismos simultaneos:

| Mecanismo                  | Proposito                                               | Formato    |
| -------------------------- | ------------------------------------------------------- | ---------- |
| `localStorage.orion_lang`  | Recordar la eleccion entre sesiones del mismo navegador | `"en"`     |
| URL query param `?lang=en` | Permitir compartir URLs en un idioma especifico         | `?lang=en` |

**Prioridad de lectura al cargar la pagina**:

1. URL param `?lang=` (si existe y es un idioma valido activo)
2. `localStorage.orion_lang` (si existe y es un idioma valido activo)
3. `defaultLang` (idioma por defecto del sitio)

### 5.3 Ubicacion en la Pagina

- **Header/Navbar**: El LanguageSwitcher se ubica en la barra de navegacion, alineado a la derecha, antes de los botones de admin
- **Footer**: Opcionalmente, un segundo LanguageSwitcher en el footer
- **Mobile**: En el menu hamburguesa, como elemento superior

---

## 6. Admin Translation Editor

### 6.1 Interfaz del Editor de Traducciones

El admin panel ofrece dos modos de edicion de traducciones:

#### Modo Tabs (Default)

```
[ES] [EN] [FR]          ← Tabs de idioma
+----------------------------------+
| Titulo:                          |
| [Transforma tu Presencia       ] |
|                                  |
| Subtitulo:                       |
| [La solucion todo-en-uno...   ] |
|                                  |
| Texto CTA:                      |
| [Comenzar Ahora               ] |
+----------------------------------+
```

#### Modo Side-by-Side (Para traducciones)

```
+------------------+------------------+
| ES (Referencia)  | EN (Editando)    |
| (solo lectura)   | (editable)       |
+------------------+------------------+
| Titulo:          | Title:           |
| Transforma tu    | [Transform Your ]|
| Presencia        | [Digital Presen ]|
|                  |                  |
| Subtitulo:       | Subtitle:        |
| La solucion      | [The all-in-one ]|
| todo-en-uno...   | [solution to... ]|
+------------------+------------------+
```

### 6.2 Indicadores de Estado

Para cada campo multilingue, el editor muestra un indicador:

| Estado          | Indicador Visual     | Significado                                   |
| --------------- | -------------------- | --------------------------------------------- |
| Traducido       | Checkmark verde      | El campo tiene valor en este idioma           |
| Sin traducir    | Triangulo amarillo   | El campo esta vacio, se muestra fallback      |
| Fallback activo | Badge "Fallback: ES" | Se esta mostrando el valor del idioma default |

### 6.3 Acciones Masivas

| Accion                               | Descripcion                                                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| "Copiar todo desde [idioma default]" | Copia todos los valores del idioma default a los campos vacios del idioma seleccionado. No sobreescribe campos ya traducidos |
| "Marcar todos como sin traducir"     | Limpia todos los campos del idioma seleccionado (con confirmacion)                                                           |
| "Auto-completar vacios"              | Copia valores del default a los campos vacios (sin sobreescribir)                                                            |

### 6.4 Progreso por Modulo

En la vista de lista de contenido (`/admin/content`), cada modulo muestra un indicador de progreso de traduccion por idioma:

```
Hero Module
  ES: [==========] 100%
  EN: [========  ]  80%
  FR: [====      ]  40%
```

### 6.5 Implementacion del Calculo de Progreso

```typescript
// src/lib/i18n/translation-progress.ts

import type { ModuleSchema, SchemaField } from '@/lib/modules/types'

interface TranslationProgress {
  total: number
  translated: number
  percentage: number
  missingFields: string[]
}

export function calculateModuleTranslationProgress(
  content: Record<string, unknown>,
  schema: ModuleSchema,
  languageCode: string,
): TranslationProgress {
  let total = 0
  let translated = 0
  const missingFields: string[] = []

  function checkField(field: SchemaField, value: unknown, path: string) {
    if (!field.isMultilingual) return

    if (field.type === 'list' && Array.isArray(value) && field.listItemSchema) {
      // Recorrer cada item de la lista
      for (let i = 0; i < (value as any[]).length; i++) {
        const item = (value as any[])[i]
        for (const subField of field.listItemSchema) {
          checkField(subField, item[subField.key], `${path}[${i}].${subField.key}`)
        }
      }
      return
    }

    total++
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value as Record<string, string>)[languageCode]?.trim()
    ) {
      translated++
    } else {
      missingFields.push(path)
    }
  }

  for (const field of schema.fields) {
    checkField(field, content[field.key], field.key)
  }

  return {
    total,
    translated,
    percentage: total === 0 ? 100 : Math.round((translated / total) * 100),
    missingFields,
  }
}
```

---

## 7. Agregar Nuevo Idioma

### 7.1 Flujo desde el Admin

1. Admin navega a `/admin/languages`
2. Hace clic en "Agregar Idioma"
3. Se abre modal con lista de idiomas disponibles (ISO 639-1)
4. Admin busca y selecciona el idioma deseado
5. Se ejecuta la logica de insercion

### 7.2 Logica de Backend

```typescript
// src/app/api/languages/route.ts

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { code, name, nativeName } = await request.json()

  // Validar que es un codigo ISO 639-1 valido
  if (!ISO_639_1_CODES.includes(code)) {
    return NextResponse.json({ error: 'Codigo de idioma invalido' }, { status: 400 })
  }

  // Verificar que no exista ya
  const { data: existing } = await supabase.from('languages').select('id').eq('code', code).single()

  if (existing) {
    return NextResponse.json({ error: 'Este idioma ya esta registrado' }, { status: 409 })
  }

  // Obtener el siguiente sort_order
  const { data: lastLang } = await supabase
    .from('languages')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastLang?.sort_order ?? 0) + 1

  // Insertar nuevo idioma
  const { data, error } = await supabase
    .from('languages')
    .insert({
      code,
      name,
      native_name: nativeName,
      is_default: false,
      is_active: true,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Crear entrada SEO para el nuevo idioma
  await supabase.from('seo_config').insert({
    language_code: code,
    meta_title: null,
    meta_description: null,
    robots: 'index, follow',
    json_ld: {},
  })

  return NextResponse.json({ success: true, data })
}
```

### 7.3 Impacto en Contenido Existente

Cuando se agrega un nuevo idioma:

1. **No se modifica ningun contenido existente**. Los campos JSONB de `page_modules` no se tocan.
2. La ausencia de la clave del nuevo idioma en un campo multilingue se interpreta como "sin traducir".
3. La funcion `t()` aplica la cadena de fallback: si el campo no tiene valor en el nuevo idioma, muestra el valor del idioma default.
4. En el admin, los campos del nuevo idioma aparecen vacios con indicador "Sin traducir".
5. El admin puede traducir gradualmente, modulo por modulo, campo por campo.

### 7.4 Lista de Idiomas ISO 639-1 para el Selector

Se incluyen los idiomas mas relevantes a nivel global:

```typescript
export const ISO_639_1_LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Francais' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues' },
  { code: 'zh', name: 'Chinese', nativeName: 'Zhongwen' },
  { code: 'ja', name: 'Japanese', nativeName: 'Nihongo' },
  { code: 'ko', name: 'Korean', nativeName: 'Hangugeo' },
  { code: 'ar', name: 'Arabic', nativeName: 'Arabiyya' },
  { code: 'hi', name: 'Hindi', nativeName: 'Hindi' },
  { code: 'ru', name: 'Russian', nativeName: 'Russkiy' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Turkce' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'el', name: 'Greek', nativeName: 'Ellinika' },
  { code: 'cs', name: 'Czech', nativeName: 'Cestina' },
  { code: 'ro', name: 'Romanian', nativeName: 'Romana' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'th', name: 'Thai', nativeName: 'Phaasaahthai' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tieng Viet' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Ukrayinska' },
  { code: 'he', name: 'Hebrew', nativeName: 'Ivrit' },
  { code: 'ca', name: 'Catalan', nativeName: 'Catala' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
]
```

---

## 8. Eliminar Idioma

### 8.1 Flujo de Eliminacion

1. Admin hace clic en "Eliminar" junto al idioma
2. **Validacion**: No se puede eliminar el idioma default. Si lo intenta, se muestra: "No puedes eliminar el idioma predeterminado. Para eliminarlo, primero establece otro idioma como predeterminado."
3. Modal de confirmacion:

   ```
   Eliminar idioma: English (EN)

   ADVERTENCIA: Esta accion eliminara todas las traducciones
   en ingles de todos los modulos y la configuracion SEO.
   Esta accion NO se puede deshacer.

   Para confirmar, escribe "ELIMINAR" en el campo de abajo:
   [________________]

   [Cancelar]  [Eliminar Permanentemente]
   ```

4. El usuario debe escribir "ELIMINAR" para confirmar (proteccion contra clics accidentales)

### 8.2 Logica de Backend

```typescript
// src/app/api/languages/[code]/route.ts

export async function DELETE(request: Request, { params }: { params: { code: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const langCode = params.code

  // 1. Verificar que no es el idioma default
  const { data: lang } = await supabase
    .from('languages')
    .select('is_default')
    .eq('code', langCode)
    .single()

  if (!lang) {
    return NextResponse.json({ error: 'Idioma no encontrado' }, { status: 404 })
  }

  if (lang.is_default) {
    return NextResponse.json(
      { error: 'No se puede eliminar el idioma predeterminado' },
      { status: 400 },
    )
  }

  // 2. Verificar que quede al menos un idioma activo
  const { count } = await supabase
    .from('languages')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .neq('code', langCode)

  if (!count || count < 1) {
    return NextResponse.json({ error: 'Debe quedar al menos un idioma activo' }, { status: 400 })
  }

  // 3. Eliminar traducciones de page_modules
  const { data: modules } = await supabase.from('page_modules').select('id, content')

  if (modules) {
    for (const module of modules) {
      const updatedContent = removeLanguageFromContent(module.content, langCode)
      await supabase.from('page_modules').update({ content: updatedContent }).eq('id', module.id)
    }
  }

  // 4. Eliminar traducciones de site_config
  const { data: siteConfig } = await supabase
    .from('site_config')
    .select('id, site_description')
    .single()

  if (siteConfig?.site_description) {
    const updatedDesc = { ...siteConfig.site_description }
    delete (updatedDesc as any)[langCode]
    await supabase
      .from('site_config')
      .update({ site_description: updatedDesc })
      .eq('id', siteConfig.id)
  }

  // 5. Eliminar seo_config del idioma
  await supabase.from('seo_config').delete().eq('language_code', langCode)

  // 6. Eliminar alt_text del idioma en media
  const { data: mediaItems } = await supabase.from('media').select('id, alt_text')

  if (mediaItems) {
    for (const item of mediaItems) {
      if (item.alt_text && (item.alt_text as any)[langCode]) {
        const updatedAlt = { ...item.alt_text }
        delete (updatedAlt as any)[langCode]
        await supabase.from('media').update({ alt_text: updatedAlt }).eq('id', item.id)
      }
    }
  }

  // 7. Eliminar el registro del idioma
  await supabase.from('languages').delete().eq('code', langCode)

  return NextResponse.json({
    success: true,
    message: `Idioma "${langCode}" eliminado exitosamente con todas sus traducciones.`,
  })
}
```

### 8.3 Funcion Auxiliar: Eliminar Idioma del Contenido

```typescript
/**
 * Recorre recursivamente un objeto JSONB y elimina la clave del idioma
 * de todos los campos multilingues.
 */
function removeLanguageFromContent(
  content: Record<string, unknown>,
  langCode: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(content)) {
    if (value === null || value === undefined) {
      result[key] = value
    } else if (Array.isArray(value)) {
      // Recorrer arrays (listas de items)
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return removeLanguageFromContent(item as Record<string, unknown>, langCode)
        }
        return item
      })
    } else if (typeof value === 'object') {
      // Verificar si es un campo multilingue (tiene al menos un codigo de 2 letras como clave)
      const keys = Object.keys(value as object)
      const isMultilingual = keys.length > 0 && keys.every((k) => /^[a-z]{2}$/.test(k))

      if (isMultilingual) {
        // Es un campo multilingue: eliminar la clave del idioma
        const { [langCode]: _, ...rest } = value as Record<string, string>
        result[key] = rest
      } else {
        // Es un objeto normal: recorrer recursivamente
        result[key] = removeLanguageFromContent(value as Record<string, unknown>, langCode)
      }
    } else {
      result[key] = value
    }
  }

  return result
}
```

---

## 9. SEO por Idioma

### 9.1 Etiquetas hreflang

Para cada pagina, se generan las etiquetas `<link rel="alternate" hreflang="..." href="...">` en el `<head>`:

```typescript
// src/lib/seo/hreflang.ts

export function generateHreflangTags(
  languages: Language[],
  baseUrl: string,
  currentPath: string,
): string {
  const tags: string[] = []

  for (const lang of languages) {
    const url = `${baseUrl}${currentPath}?lang=${lang.code}`
    tags.push(`<link rel="alternate" hreflang="${lang.code}" href="${url}" />`)
  }

  // x-default apunta al idioma por defecto
  const defaultLang = languages.find((l) => l.isDefault)
  if (defaultLang) {
    const defaultUrl = `${baseUrl}${currentPath}?lang=${defaultLang.code}`
    tags.push(`<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`)
  }

  return tags.join('\n')
}
```

### 9.2 Meta Tags por Idioma

Cada idioma tiene su propia fila en `seo_config` con meta title, description, etc.

```typescript
// src/app/layout.tsx — Metadata dinamica

import { type Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const supabase = await createServerClient()

  // Determinar idioma
  const { data: languages } = await supabase.from('languages').select('*').eq('is_active', true)

  const defaultLang = languages?.find((l) => l.is_default)?.code ?? 'es'
  const currentLang = searchParams.lang ?? defaultLang

  // Obtener SEO config para el idioma actual
  const { data: seoConfig } = await supabase
    .from('seo_config')
    .select('*')
    .eq('language_code', currentLang)
    .single()

  // Fallback al idioma default si no hay config para el idioma actual
  const { data: fallbackSeo } = !seoConfig
    ? await supabase.from('seo_config').select('*').eq('language_code', defaultLang).single()
    : { data: null }

  const seo = seoConfig ?? fallbackSeo

  // Obtener site config
  const { data: siteConfig } = await supabase.from('site_config').select('site_name').single()

  return {
    title: seo?.meta_title ?? siteConfig?.site_name ?? 'Landing Page',
    description: seo?.meta_description ?? '',
    openGraph: {
      title: seo?.meta_title ?? siteConfig?.site_name,
      description: seo?.meta_description ?? '',
      images: seo?.og_image_url ? [seo.og_image_url] : [],
      locale: currentLang,
    },
    robots: seo?.robots ?? 'index, follow',
    alternates: {
      canonical: seo?.canonical_url ?? undefined,
      languages: Object.fromEntries((languages ?? []).map((l) => [l.code, `?lang=${l.code}`])),
    },
  }
}
```

### 9.3 Estrategia de URL

**Enfoque elegido**: Query parameter `?lang=en`

| Estrategia    | Formato       | Pros                                                    | Contras                                                      | Decision    |
| ------------- | ------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ----------- |
| Query param   | `/?lang=en`   | Simple, no requiere config de rutas, compatible con SSG | Menos "limpio" para SEO, Google lo soporta bien con hreflang | **ELEGIDO** |
| Subdirectorio | `/en/`        | Limpio, SEO-friendly                                    | Requiere rewrite rules, mas complejo en Next.js App Router   | Futuro v2   |
| Subdominio    | `en.site.com` | Aislamiento total                                       | Requiere config DNS, mas infraestructura                     | No planeado |

**Justificacion**: Para un producto self-hosted orientado a simplicidad, el query param `?lang=en` es la opcion que requiere menos configuracion y funciona en todos los entornos de despliegue (Vercel, Docker, Netlify) sin configuracion adicional de rewrites.

**Migracion futura**: Si se migra a subdirectorio en v2, el sistema de i18n esta preparado. Solo se necesita:

1. Agregar route groups `/(locale)/[lang]/` en Next.js App Router
2. Actualizar el middleware para leer el idioma del path
3. Actualizar el Language Switcher para cambiar la ruta

---

## 10. Rendimiento

### 10.1 Estrategia de Cache

| Dato                           | Cache                      | Revalidacion                                         |
| ------------------------------ | -------------------------- | ---------------------------------------------------- |
| Lista de idiomas               | Cache en Server Component  | Revalidar al agregar/eliminar idioma (revalidateTag) |
| Contenido de modulos           | Cache en Server Component  | Revalidar al guardar desde admin                     |
| SEO config                     | Cache en generateMetadata  | Revalidar al guardar SEO                             |
| Eleccion de idioma del usuario | localStorage (client-side) | Inmediato                                            |

### 10.2 Sin Re-fetch al Cambiar Idioma

El contenido de todos los idiomas se envia al cliente en la carga inicial (dentro del JSONB de cada modulo). Por lo tanto:

- **Cambiar de idioma NO dispara un nuevo fetch a Supabase**
- La funcion `t()` simplemente resuelve a una clave diferente del mismo objeto JSONB
- El cambio de idioma es **instantaneo** (solo React re-render)
- Esto es posible porque todo el contenido multilingue ya esta en el cliente

### 10.3 Optimizacion de Queries: Extraccion JSONB por Idioma

Las queries de la pagina publica DEBEN usar extraccion JSONB por path para enviar solo el idioma activo, no todo el blob multilingue. Esto reduce significativamente el payload de red, especialmente para sitios con 3+ idiomas.

**Regla**: La pagina publica usa `content->>'${lang}'` (extraccion JSONB). El admin panel obtiene el JSONB completo (necesita todos los idiomas para edicion).

```typescript
// PAGINA PUBLICA — Server Component (solo el idioma activo + fallback)
// Extrae solo el idioma necesario directamente en PostgreSQL
const { data: modules } = await supabase
  .from('page_modules')
  .select(
    `
    id,
    section_key,
    content->>${lang} as content_active,
    content->>${defaultLang} as content_fallback,
    styles,
    sort_order,
    is_visible
  `,
  )
  .eq('is_visible', true)
  .order('sort_order')

// ADMIN PANEL — necesita todos los idiomas para edicion
const { data: modules } = await supabase.from('page_modules').select('*').order('sort_order')
```

> **Nota**: La extraccion JSONB con `->>` es una operacion nativa de PostgreSQL altamente optimizada. PostgREST/supabase-js la soporta completamente via la sintaxis de select con `->`. Esto NO es DDL, es simplemente una query SELECT optimizada.

**Beneficios medibles**:

- Con 5 idiomas y 15 modulos activos, el payload pasa de ~250KB a ~60KB (contenido de un solo idioma)
- Reduce tiempo de parse JSON en el cliente
- Mejora el Time to First Byte (TTFB) y el Largest Contentful Paint (LCP)

### 10.4 Consideracion de Payload General

Si un sitio tiene muchos idiomas (5+) con mucho contenido, el payload inicial puede crecer. Mitigaciones adicionales:

| Estrategia                  | Descripcion                                                     | Implementacion                            |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| Extraccion JSONB por idioma | La pagina publica obtiene solo `content->>'${lang}'` (ver 10.3) | Query selectiva en Supabase (OBLIGATORIO) |
| Lazy load por modulo        | Los modulos fuera del viewport no envian contenido hasta scroll | Intersection Observer + lazy fetch        |
| Compresion GZIP/Brotli      | El JSON se comprime muy bien                                    | Ya incluido en Next.js/Vercel             |

**Para la v1**: La extraccion JSONB por idioma (seccion 10.3) es OBLIGATORIA. Las demas optimizaciones son opcionales para sitios con contenido moderado.

### 10.5 Atributo `lang` del HTML

El atributo `lang` del `<html>` se actualiza dinamicamente al cambiar de idioma:

```typescript
// Dentro del I18nProvider, al cambiar idioma:
useEffect(() => {
  document.documentElement.lang = currentLang
}, [currentLang])
```

Esto es crucial para:

- Lectores de pantalla (accesibilidad)
- Traduccion automatica del navegador
- SEO

---

## Apendice A: Cambiar Idioma Default

### Flujo

1. Admin navega a `/admin/languages`
2. En la fila del nuevo idioma default, hace clic en "Establecer como predeterminado"
3. Confirmacion: "Cambiar el idioma predeterminado a [nuevo idioma]? El contenido sin traducir mostrara fallback a este idioma."
4. Backend:
   - `UPDATE languages SET is_default = false WHERE is_default = true`
   - `UPDATE languages SET is_default = true WHERE code = 'nuevo_codigo'`
   - `UPDATE site_config SET default_language = 'nuevo_codigo'`
5. La pagina publica ahora usa el nuevo idioma como fallback

### Impacto

- El contenido existente no se modifica
- Los visitantes nuevos ven el nuevo idioma default
- Los visitantes con preferencia guardada siguen viendo su idioma elegido
- Los campos sin traducir ahora hacen fallback al nuevo idioma default

## Apendice B: Soporte RTL (Right-to-Left)

Para idiomas RTL (arabe, hebreo), se debe:

1. Agregar propiedad `direction` a la tabla `languages`:

   ```sql
   ALTER TABLE languages ADD COLUMN direction TEXT NOT NULL DEFAULT 'ltr';
   -- Valores: 'ltr' o 'rtl'
   ```

2. En el I18nProvider, exponer la direccion actual:

   ```typescript
   const direction = languages.find((l) => l.code === currentLang)?.direction ?? 'ltr'
   ```

3. Aplicar al HTML:

   ```typescript
   useEffect(() => {
     document.documentElement.dir = direction
   }, [direction])
   ```

4. Tailwind CSS soporta RTL nativamente con el prefijo `rtl:`:
   ```html
   <div className="ml-4 rtl:mr-4 rtl:ml-0">...</div>
   ```

**Nota**: El soporte RTL completo se implementa como mejora futura. La arquitectura esta preparada para soportarlo sin cambios estructurales.
