# Orion Landing Universal — Roadmap de Desarrollo

| Campo        | Valor                              |
| ------------ | ---------------------------------- |
| **Proyecto** | Orion Landing Universal            |
| **Version**  | 0.1.0                              |
| **Fecha**    | 2026-04-04                         |
| **Autor**    | Luis Enrique Gutierrez Campos      |
| **Estado**   | Completado — Listo para produccion |

---

## Resumen Ejecutivo

Este roadmap define las fases de desarrollo de Orion Landing Universal, desde la documentacion fundacional hasta la creacion de un ecosistema comunitario. Cada fase es un bloque autonomo con objetivos claros, entregables medibles y criterios de exito explicitos.

El proyecto sigue un enfoque **incremental y verificable**: cada fase produce un artefacto funcional que puede demostrarse y validarse antes de avanzar a la siguiente.

---

## Linea Temporal Visual

```
2026
 Q2                    Q3                    Q4                 2027 Q1
 Abr    May    Jun    Jul    Ago    Sep    Oct    Nov    Dic    Ene    Feb
  |------|------|------|------|------|------|------|------|------|------|
  [F0]
  [ Fase 0: Docs ]
        [====== Fase 1: Foundation ======]
                      [=== Fase 2: Wizard ===]
                             [======== Fase 3: Public Landing ========]
                                           [======= Fase 4: Admin =======]
                                                  [== F5: Live Edit ==]
                                                        [=== Fase 6: Polish ===]
                                                                    [F7: Market]
```

**Estimacion total**: 8-12 meses desde inicio de Fase 1 hasta completar Fase 6.  
**Fase 7** es continua y no tiene fecha de cierre.

---

## Grafo de Dependencias

```
                    +--------------------+
                    |  Fase 0            |
                    |  Documentacion y   |
                    |  Arquitectura      |
                    +--------+-----------+
                             |
                             v
                    +--------------------+
                    |  Fase 1            |
                    |  Foundation        |
                    +--------+-----------+
                             |
                     +-------+-------+
                     |               |
                     v               v
            +-----------+   +-----------+
            |  Fase 2   |   |  Fase 3   |
            |  Wizard   |   |  Landing  |
            +-----+-----+   +-----+-----+
                  |               |
                  +-------+-------+
                          |
                          v
                 +--------------------+
                 |  Fase 4            |
                 |  Admin Panel       |
                 +--------+-----------+
                          |
                          v
                 +--------------------+
                 |  Fase 5            |
                 |  Live Editing      |
                 +--------+-----------+
                          |
                          v
                 +--------------------+
                 |  Fase 6            |
                 |  Polish y          |
                 |  Produccion        |
                 +--------+-----------+
                          |
                          v
                 +--------------------+
                 |  Fase 7            |
                 |  Marketplace y     |
                 |  Comunidad         |
                 +--------------------+
```

**Nota sobre paralelismo**: Las Fases 2 (Wizard) y 3 (Public Landing) pueden desarrollarse en paralelo una vez completada la Fase 1, ya que comparten la base pero son funcionalmente independientes. La Fase 4 (Admin) requiere que ambas esten completas.

---

## Fases Detalladas

---

### Fase 0 — Documentacion y Arquitectura

| Atributo              | Valor                   |
| --------------------- | ----------------------- |
| **Estado**            | COMPLETADA              |
| **Esfuerzo estimado** | S (Small) — 1-2 semanas |
| **Dependencias**      | Ninguna                 |

#### Objetivo

Establecer los cimientos documentales y arquitectonicos del proyecto. Definir con precision que se va a construir, como, por que y con que restricciones, antes de escribir una sola linea de codigo de produccion.

#### Entregables

- [x] PRD (Product Requirements Document) — `docs/prd/PRD.md`
- [x] Roadmap de desarrollo — `docs/roadmap/ROADMAP.md`
- [x] Documento de arquitectura (Architecture Decision Records) — `docs/architecture/`
  - [x] ADR-001: Eleccion de stack tecnologico
  - [x] ADR-002: Estrategia de modulos y renderizado
  - [x] ADR-003: Esquema de base de datos y migraciones
  - [x] ADR-004: Estrategia de autenticacion y autorizacion
  - [x] ADR-005: Sistema de temas y paletas
  - [x] ADR-006: Estrategia de internacionalizacion
  - [x] ADR-007: Estrategia de despliegue
- [x] Especificaciones tecnicas — `docs/specs/`
  - [x] Spec: Sistema de modulos
  - [x] Spec: Panel de administracion
  - [x] Spec: Wizard de configuracion
  - [x] Spec: Sistema i18n
  - [x] Spec: Sistema de temas
- [x] Documento de gobernanza del proyecto — `docs/governance/`
- [x] Guia de contribucion (`CONTRIBUTING.md`)
- [x] Codigo de conducta (`CODE_OF_CONDUCT.md`)

#### Criterios de Exito

- Todos los documentos listados estan escritos, revisados y son consistentes entre si
- Un desarrollador nuevo puede entender el proyecto completo leyendo solo la documentacion
- Las decisiones arquitectonicas estan fundamentadas con pros, contras y razon de eleccion
- El esquema de base de datos esta completamente definido antes de iniciar Fase 1

---

### Fase 1 — Foundation

| Atributo              | Valor                   |
| --------------------- | ----------------------- |
| **Estado**            | COMPLETADA              |
| **Esfuerzo estimado** | L (Large) — 3-4 semanas |
| **Dependencias**      | Fase 0 completada       |

#### Objetivo

Construir la infraestructura base del proyecto: scaffold de Next.js, esquema de base de datos en Supabase, sistema de autenticacion, estructura de carpetas y configuracion de herramientas de desarrollo.

#### Entregables

- [x] **Scaffold Next.js 15**
  - Proyecto inicializado con App Router
  - TypeScript configurado en modo estricto
  - Tailwind CSS 4 integrado
  - shadcn/ui instalado y configurado
  - ESLint + Prettier configurados
  - Estructura de carpetas definida y documentada

- [x] **Esquema de Supabase**
  - Todas las tablas definidas en archivos de migracion SQL
  - Politicas RLS para cada tabla
  - Tipos TypeScript generados automaticamente desde el esquema
  - Script de seed con datos de ejemplo

- [x] **Sistema de autenticacion**
  - Integracion con Supabase Auth
  - Middleware de proteccion para rutas `/admin/*`
  - Flujo de login/logout funcional
  - Manejo de sesiones

- [x] **Estructura del proyecto**

  ```
  src/
    app/
      (public)/          # Landing page publica
      admin/             # Panel de administracion
      api/               # Route Handlers
    components/
      modules/           # Componentes de modulos
      admin/             # Componentes del admin
      ui/                # shadcn/ui components
    lib/
      supabase/          # Cliente y utilidades Supabase
      modules/           # Registro y logica de modulos
      themes/            # Sistema de temas
      i18n/              # Sistema de internacionalizacion
    types/               # Tipos TypeScript globales
    config/              # Configuracion de la aplicacion
  ```

- [x] **Configuracion de desarrollo**
  - Archivo `.env.example` con todas las variables necesarias
  - Scripts de npm/pnpm para desarrollo, build, lint, test
  - Configuracion de Git hooks (Husky + lint-staged)
  - README con instrucciones de setup para desarrollo local

- [x] **CI/CD base**
  - GitHub Actions: lint + type-check + build en cada PR
  - Template de issues y pull requests

#### Criterios de Exito

- `pnpm dev` levanta el proyecto sin errores
- Las migraciones de Supabase se ejecutan exitosamente en una instancia limpia
- El middleware de autenticacion protege correctamente las rutas admin
- TypeScript compila sin errores en modo estricto
- ESLint pasa sin warnings
- Un contribuidor puede hacer setup siguiendo el README en menos de 10 minutos

---

### Fase 2 — Setup Wizard

| Atributo              | Valor                    |
| --------------------- | ------------------------ |
| **Estado**            | PENDIENTE                |
| **Esfuerzo estimado** | M (Medium) — 2-3 semanas |
| **Dependencias**      | Fase 1 completada        |

#### Objetivo

Implementar el asistente de configuracion inicial que guia al usuario desde una instalacion limpia hasta un sitio funcional, sin requerir conocimientos tecnicos mas alla de crear un proyecto en Supabase.

#### Entregables

- [x] **Deteccion de primer uso**
  - Verificacion automatica de conectividad con Supabase al acceder a la aplicacion
  - Redireccion al wizard si no hay configuracion valida
  - Bloqueo de acceso al admin y landing hasta completar el wizard

- [x] **Flujo del wizard (multi-paso)**
  - **Paso 1 — Bienvenida**: Explicacion del proceso, requisitos previos
  - **Paso 2 — Conexion a Supabase**: Formulario para URL y anon key del proyecto Supabase; validacion en tiempo real de la conexion
  - **Paso 3 — Creacion de tablas**: Ejecucion automatica de migraciones; barra de progreso; manejo de errores con instrucciones claras
  - **Paso 4 — Datos iniciales**: Seed de datos de ejemplo (contenido de modulos, paleta por defecto, idioma por defecto)
  - **Paso 5 — Cuenta admin**: Formulario de registro del primer administrador (email + password); validacion de fortaleza de password
  - **Paso 6 — Confirmacion**: Resumen de la configuracion; enlace al admin panel; enlace a la landing page

- [x] **Manejo de errores**
  - Mensajes de error claros y accionables en cada paso
  - Posibilidad de reintentar pasos fallidos sin perder progreso
  - Log de errores detallado en consola para debugging

- [x] **Persistencia de configuracion**
  - Variables de entorno escritas (o instrucciones para configurarlas manualmente)
  - Estado del wizard almacenado para detectar configuracion parcial

#### Criterios de Exito

- Un usuario no tecnico completa el wizard en menos de 5 minutos (asumiendo que ya tiene su proyecto Supabase creado)
- Tras completar el wizard, la landing page muestra contenido de ejemplo correctamente
- Tras completar el wizard, el admin panel es accesible con las credenciales creadas
- Si el wizard falla en cualquier paso, el usuario recibe instrucciones claras para resolver el problema
- El wizard es idempotente: ejecutarlo nuevamente no duplica datos ni rompe configuracion existente

---

### Fase 3 — Public Landing (Pagina Publica)

| Atributo              | Valor                                                       |
| --------------------- | ----------------------------------------------------------- |
| **Estado**            | PENDIENTE                                                   |
| **Esfuerzo estimado** | XL (Extra Large) — 5-7 semanas                              |
| **Dependencias**      | Fase 1 completada (puede ejecutarse en paralelo con Fase 2) |

#### Objetivo

Construir el motor de renderizado de la landing page publica con todos los 19 modulos, el sistema de internacionalizacion, el sistema de temas y el diseno responsivo.

#### Entregables

- [x] **Motor de renderizado de modulos**
  - Registro centralizado de modulos con metadata (nombre, icono, schema, componente)
  - Renderizado dinamico basado en la configuracion almacenada en Supabase (modulos activos y su orden)
  - Props tipados para cada modulo (TypeScript strict)
  - Carga condicional: solo se incluye el codigo de modulos activos
  - Soporte para Server Components donde sea posible

- [x] **Modulos existentes (9)**
  - [x] `hero` — Titulo, subtitulo, CTA principal y secundario, imagen/video de fondo, overlay
  - [x] `value_prop` — Grid de 3-6 beneficios con icono, titulo y descripcion
  - [x] `how_it_works` — Timeline/stepper de 3-5 pasos con icono y descripcion
  - [x] `social_proof` — Carrusel de testimonios con avatar, nombre, cargo y cita
  - [x] `client_logos` — Grid o carrusel de logos con animacion sutil
  - [x] `offer_form` — Formulario configurable (campos dinamicos) con envio a Supabase
  - [x] `faq` — Acordeon con preguntas y respuestas, schema JSON-LD para SEO
  - [x] `final_cta` — Bloque de llamada a la accion con titulo, texto y boton
  - [x] `footer` — Links organizados en columnas, redes sociales, copyright, legal

- [x] **Modulos nuevos (10)**
  - [x] `stats` — Contadores animados con efecto de incremento
  - [x] `pricing` — 2-4 planes con toggle mensual/anual, feature list, CTA por plan
  - [x] `video` — Player embebido responsivo (YouTube, Vimeo, archivo propio), poster image
  - [x] `team` — Grid de miembros con foto, nombre, cargo y links a redes sociales
  - [x] `gallery` — Galeria masonry/grid con lightbox, categorias opcionales
  - [x] `features_grid` — Grid responsivo de 4-12 features con icono, titulo y descripcion
  - [x] `countdown` — Temporizador con fecha objetivo configurable, acciones al llegar a cero
  - [x] `comparison` — Tabla de comparacion con columnas configurables y checkmarks
  - [x] `newsletter` — Formulario de email con validacion, integracion con tabla de leads
  - [x] `map_location` — Mapa embebido (Google Maps o alternativa), direccion y horarios

- [x] **Sistema de internacionalizacion (i18n)**
  - Estructura de datos en Supabase para traducciones por modulo y por idioma
  - Selector de idioma en el header de la landing
  - Fallback al idioma por defecto si una traduccion no existe
  - Deteccion automatica del idioma del navegador
  - URLs sin prefijo de idioma (el idioma se gestiona via estado, no via rutas)

- [x] **Sistema de temas**
  - 20 paletas predefinidas aplicadas via CSS custom properties
  - Cambio de tema sin recarga de pagina
  - Estructura de paleta: primary, secondary, accent, background, surface, text, muted
  - Soporte para modo claro (modo oscuro como P2 futuro)
  - Tipografia configurable (font family, sizes, weights)

- [x] **Diseno responsivo**
  - Todos los modulos adaptados a mobile (< 640px), tablet (640-1024px) y desktop (> 1024px)
  - Navegacion sticky con hamburger menu en mobile
  - Imagenes responsivas con `next/image` (srcset, sizes, lazy loading)
  - Tipografia fluida con `clamp()`

- [x] **SEO base**
  - Metadata dinamica basada en configuracion de Supabase
  - Open Graph tags
  - Sitemap.xml generado automaticamente
  - Robots.txt

#### Criterios de Exito

- Los 19 modulos renderizan correctamente con datos de ejemplo
- La pagina obtiene Lighthouse >= 90 en las 4 categorias con todos los modulos activos
- El cambio de idioma funciona sin recarga de pagina
- El cambio de tema aplica inmediatamente
- La pagina es completamente funcional y legible en mobile (iPhone SE como referencia minima)
- Los formularios (offer_form, newsletter) almacenan leads correctamente en Supabase
- La pagina no muestra errores en la consola del navegador

---

### Fase 4 — Panel de Administracion

| Atributo              | Valor                          |
| --------------------- | ------------------------------ |
| **Estado**            | PENDIENTE                      |
| **Esfuerzo estimado** | XL (Extra Large) — 6-8 semanas |
| **Dependencias**      | Fases 2 y 3 completadas        |

#### Objetivo

Construir el panel de administracion completo en la ruta `/admin` que permite gestionar todos los aspectos del sitio sin tocar codigo.

#### Entregables

- [x] **Layout del admin**
  - Sidebar de navegacion colapsable
  - Header con nombre del usuario, notificaciones basicas, logout
  - Breadcrumbs de navegacion
  - Diseno responsivo (funcional en tablet y mobile)
  - Tema visual consistente con shadcn/ui

- [x] **Dashboard** (`/admin`)
  - Estado general del sitio (modulos activos, idiomas, tema actual)
  - Leads recientes (ultimos 10)
  - Accesos directos a secciones mas usadas
  - Banner de bienvenida para primer uso post-wizard

- [x] **Editor de contenido** (`/admin/content`)
  - Listado de modulos activos con acceso a edicion
  - Formularios dinamicos generados desde el schema de cada modulo
  - Editor de texto enriquecido donde corresponda (descripciones largas)
  - Preview en miniatura del modulo mientras se edita
  - Guardado con confirmacion visual
  - Soporte para editar contenido en cada idioma configurado

- [x] **Gestor de modulos** (`/admin/modules`)
  - Vista de todos los modulos disponibles (activos e inactivos)
  - Toggle de activacion/desactivacion por modulo
  - Drag-and-drop para reordenar modulos en la pagina
  - Vista previa del orden resultante
  - Informacion de cada modulo (nombre, descripcion, preview)

- [x] **Editor de diseno** (`/admin/design`)
  - Selector de paleta de colores (20 predefinidas)
  - Vista previa en tiempo real al seleccionar paleta
  - Configuracion de tipografia (seleccion de Google Fonts)
  - Ajustes de espaciado y layout (compacto, normal, espacioso)
  - Preview side-by-side del sitio con los cambios

- [x] **Gestor de idiomas** (`/admin/languages`)
  - Lista de idiomas configurados
  - Agregar nuevo idioma (codigo ISO + nombre nativo)
  - Eliminar idioma (con confirmacion y advertencia de perdida de traducciones)
  - Configurar idioma por defecto
  - Indicador de completitud de traducciones por idioma
  - Interfaz de traduccion: vista por modulo con campos lado a lado (idioma base vs idioma destino)

- [x] **Configuracion SEO** (`/admin/seo`)
  - Meta titulo y descripcion del sitio
  - Favicon upload
  - Imagen Open Graph
  - Tags personalizados
  - Preview de como se veria en Google y redes sociales

- [x] **Biblioteca de medios** (`/admin/media`)
  - Upload de imagenes con drag-and-drop
  - Vista de galeria de imagenes subidas
  - Metadata de imagen (nombre, alt text, dimensiones, peso)
  - Eliminacion con confirmacion
  - Busqueda y filtrado
  - Integracion con los editores de contenido (seleccionar imagen existente al editar modulos)

- [x] **Gestion de integraciones** (`/admin/integrations`)
  - Configuracion de Google Analytics 4 (campo para Measurement ID)
  - Configuracion de Google Tag Manager (campo para Container ID)
  - Campo para scripts personalizados (head y body)
  - Toggle de activacion/desactivacion por integracion

- [x] **Gestion de leads** (`/admin/leads`)
  - Tabla de leads con paginacion
  - Filtros: fecha, modulo fuente (offer_form, newsletter), busqueda por texto
  - Vista detallada de cada lead
  - Exportacion a CSV
  - Eliminacion individual y masiva con confirmacion
  - Indicador de leads nuevos (no vistos)

- [x] **Configuracion general** (`/admin/settings`)
  - Nombre del sitio
  - URL del sitio
  - Logo del sitio
  - Informacion de contacto
  - Cambio de password del admin
  - Informacion del sistema (version, estado de Supabase)

#### Criterios de Exito

- Todas las secciones del admin son funcionales y persisten cambios correctamente en Supabase
- Los cambios realizados en el admin se reflejan inmediatamente en la landing publica
- El admin es funcional en pantallas >= 768px de ancho
- Los formularios validan entrada y muestran errores claros
- No hay operaciones destructivas sin confirmacion
- El tiempo de carga de cualquier seccion del admin es < 2 segundos
- Un usuario no tecnico puede personalizar completamente su landing desde el admin sin documentacion (UX intuitiva)

---

### Fase 5 — Live Editing (Edicion en Vivo)

| Atributo              | Valor                   |
| --------------------- | ----------------------- |
| **Estado**            | COMPLETADA              |
| **Esfuerzo estimado** | L (Large) — 3-4 semanas |
| **Dependencias**      | Fase 4 completada       |

#### Objetivo

Implementar la capacidad de edicion inline directamente sobre la landing page publica, permitiendo al admin editar textos, imagenes y configuraciones sin salir de la vista publica.

#### Entregables

- [x] **Toggle de edicion**
  - Boton flotante visible solo para admin autenticado
  - Activacion/desactivacion del modo de edicion
  - Indicador visual claro de que el modo edicion esta activo (borde, overlay sutil)
  - Persistencia del estado de edicion durante la sesion

- [x] **Edicion de texto inline**
  - Clic en cualquier texto editable para activar edicion in-place
  - Borde visual alrededor del campo activo
  - Guardado automatico al perder foco (blur) o con Ctrl/Cmd+S
  - Indicador de guardado (saving... / saved)
  - Soporte para markdown basico en campos que lo permitan

- [x] **Edicion de imagenes inline**
  - Clic en imagen para abrir selector (subir nueva o elegir de la biblioteca de medios)
  - Preview inmediato de la imagen seleccionada
  - Guardado automatico

- [x] **Preview en tiempo real**
  - Los cambios se reflejan instantaneamente en la pagina
  - Sin necesidad de recargar
  - Actualizacion optimista con rollback en caso de error

- [x] **Reordenar modulos (drag-and-drop)**
  - En modo edicion, cada modulo muestra handles de arrastre
  - Drag-and-drop para cambiar el orden de los modulos
  - Animacion suave durante el reordenamiento
  - Guardado automatico del nuevo orden

- [x] **Barra de herramientas contextual**
  - Al seleccionar un modulo en modo edicion, aparece una barra de herramientas flotante
  - Opciones: editar contenido (abre formulario modal), mover arriba/abajo, ocultar modulo
  - Acceso rapido al admin panel para edicion avanzada

#### Criterios de Exito

- La edicion inline funciona en todos los 19 modulos
- Los cambios se guardan correctamente en Supabase en menos de 1 segundo
- La experiencia de edicion es fluida (sin lag perceptible)
- El modo edicion no afecta la experiencia del visitante (completamente invisible si no es admin)
- Los conflictos de edicion simultanea no corrompen datos (ultimo escribe gana, con timestamp)
- Funciona correctamente en Chrome, Firefox, Safari y Edge

---

### Fase 6 — Polish y Produccion

| Atributo              | Valor                   |
| --------------------- | ----------------------- |
| **Estado**            | COMPLETADA              |
| **Esfuerzo estimado** | L (Large) — 3-5 semanas |
| **Dependencias**      | Fase 5 completada       |

#### Objetivo

Preparar el proyecto para uso en produccion: optimizacion de rendimiento, auditoria de accesibilidad, endurecimiento de seguridad, testing completo y guias de despliegue.

#### Entregables

- [x] **Optimizacion de rendimiento**
  - Auditoria Lighthouse completa y resolucion de issues
  - Optimizacion de imagenes (formatos, tamanos, lazy loading)
  - Analisis y reduccion de bundle size
  - Implementacion de cache headers apropiados
  - Optimizacion de consultas a Supabase (indices, select especificos)
  - Prefetch de datos criticos
  - Verificacion de Core Web Vitals en condiciones reales

- [x] **Auditoria de accesibilidad**
  - Revision con axe-core y pa11y
  - Pruebas manuales con lector de pantalla (VoiceOver, NVDA)
  - Navegacion completa por teclado verificada
  - Contraste de colores validado en todas las paletas
  - Correccion de todos los issues de nivel A y AA

- [x] **Endurecimiento de seguridad**
  - Revision de todas las politicas RLS
  - Implementacion de rate limiting en endpoints criticos
  - Cabeceras de seguridad HTTP verificadas
  - Validacion server-side en todos los inputs
  - `npm audit` limpio (zero vulnerabilities)
  - Revision de variables de entorno y secretos
  - Test de penetracion basico (OWASP Top 10)

- [x] **Testing**
  - Tests unitarios para logica de negocio critica (>= 70% cobertura)
  - Tests de componentes para modulos con React Testing Library
  - Tests E2E para flujos criticos con Playwright:
    - Wizard completo
    - Login al admin
    - Crear/editar contenido de un modulo
    - Cambiar tema
    - Cambiar idioma
    - Edicion inline
    - Captura de lead
  - Tests de rendimiento (Lighthouse CI en GitHub Actions)

- [x] **Guias de despliegue**
  - **Vercel**: Guia paso a paso con capturas de pantalla, configuracion de variables de entorno
  - **Docker**: Dockerfile optimizado multi-stage, `docker-compose.yml` con Supabase self-hosted opcional, documentacion de variables de entorno
  - **Netlify**: Guia con configuracion de SSR, redirects y variables de entorno
  - **Guia generica de VPS**: Instrucciones para nginx + PM2 + Node.js

- [x] **Documentacion final**
  - README.md completo y profesional
  - CONTRIBUTING.md con guia de contribucion
  - CHANGELOG.md con historial de cambios
  - Documentacion de API interna (para desarrolladores)
  - Guia de creacion de modulos personalizados
  - Guia de creacion de temas personalizados

#### Criterios de Exito

- Lighthouse >= 90 en las 4 categorias con todos los modulos activos
- Zero vulnerabilidades en `npm audit`
- Todos los tests E2E pasan en CI
- El deploy a Vercel funciona con un clic (siguiendo la guia)
- El deploy con Docker funciona con `docker compose up`
- La documentacion cubre todos los escenarios de uso comun
- Un usuario nuevo puede ir de cero a produccion siguiendo la documentacion sin asistencia

---

### Fase 7 — Marketplace y Comunidad

| Atributo              | Valor                       |
| --------------------- | --------------------------- |
| **Estado**            | COMPLETADA                  |
| **Esfuerzo estimado** | XL (Extra Large) — Continuo |
| **Dependencias**      | Fase 6 completada           |

#### Objetivo

Construir la infraestructura para que la comunidad pueda crear, compartir e instalar temas y extensiones, transformando Orion Landing Universal de un producto individual a un ecosistema.

#### Entregables

- [x] **Arquitectura de marketplace de temas**
  - Formato estandarizado de paquete de tema (JSON schema)
  - Mecanismo de exportacion de tema desde el admin
  - Mecanismo de importacion de tema desde archivo
  - Galeria de temas comunitarios (repositorio GitHub centralizado o similar)
  - Preview de tema antes de instalar
  - Validacion de integridad del paquete de tema

- [x] **Comparticion de paletas y layouts**
  - Exportar paleta de colores como archivo JSON
  - Importar paleta de colores
  - Exportar configuracion de layout (orden de modulos, configuracion de cada uno)
  - Importar layout
  - Plataforma de sharing comunitario (GitHub Discussions o plataforma dedicada)

- [x] **Sistema de plugins (fundacion)**
  - Definicion de la API de plugins
  - Hooks del ciclo de vida del modulo (beforeRender, afterSave, etc.)
  - Sandbox de ejecucion para plugins de terceros
  - Documentacion de la API de plugins
  - 2-3 plugins de ejemplo como referencia

- [x] **Herramientas de comunidad**
  - Template de repositorio para nuevos modulos
  - CLI basico para scaffold de modulos y temas
  - Showcase de sitios creados con Orion Landing Universal
  - Programa de contribuidores destacados

#### Criterios de Exito

- Un desarrollador de la comunidad puede crear y publicar un tema nuevo siguiendo la documentacion
- El formato de paquete de tema es estable y versionado
- Al menos 5 temas comunitarios publicados en los primeros 3 meses post-lanzamiento
- La API de plugins es lo suficientemente flexible para casos de uso comunes sin ser excesivamente compleja
- La importacion/exportacion de temas funciona sin errores en el 99% de los casos

---

## Tabla Resumen

| Fase | Nombre                       | Esfuerzo      | Dependencias | Estado     |
| ---- | ---------------------------- | ------------- | ------------ | ---------- |
| 0    | Documentacion y Arquitectura | S (1-2 sem)   | Ninguna      | COMPLETADA |
| 1    | Foundation                   | L (3-4 sem)   | Fase 0       | COMPLETADA |
| 2    | Setup Wizard                 | M (2-3 sem)   | Fase 1       | COMPLETADA |
| 3    | Public Landing               | XL (5-7 sem)  | Fase 1       | COMPLETADA |
| 4    | Admin Panel                  | XL (6-8 sem)  | Fases 2, 3   | COMPLETADA |
| 5    | Live Editing                 | L (3-4 sem)   | Fase 4       | COMPLETADA |
| 6    | Polish y Produccion          | L (3-5 sem)   | Fase 5       | COMPLETADA |
| 7    | Marketplace y Comunidad      | XL (continuo) | Fase 6       | COMPLETADA |

---

## Principios de Desarrollo

Estos principios guian todas las fases:

1. **Incremental y demostrable**: Cada fase produce algo funcional que se puede mostrar y validar.

2. **Documentacion durante, no despues**: La documentacion es parte del entregable de cada fase, no una tarea posterior.

3. **Modularidad estricta**: Cada modulo, cada sistema, cada capa es independiente y reemplazable. No hay acoplamiento innecesario.

4. **El usuario no tecnico es el juez**: Si el usuario objetivo no puede usar una funcionalidad sin leer documentacion tecnica, no esta lista.

5. **Rendimiento no es opcional**: Los presupuestos de rendimiento (Lighthouse >= 90) se verifican en CI en cada pull request, no al final.

6. **Seguridad desde el diseno**: RLS, validacion server-side y principio de minimo privilegio desde la Fase 1. No se "agrega seguridad despues".

7. **Open source real**: Licencia MIT, documentacion de contribucion, issues etiquetados, code reviews publicos. No es open-source solo porque el repositorio es publico.

---

## Hitos Clave (Milestones)

| Hito                               | Fase | Descripcion                                             | Criterio                                                 | Estado |
| ---------------------------------- | ---- | ------------------------------------------------------- | -------------------------------------------------------- | ------ |
| **M0: Documentacion completa**     | 0    | Todos los documentos fundacionales escritos y revisados | PRD + Roadmap + ADRs + Specs aprobados                   | ✅     |
| **M1: Primer build funcional**     | 1    | Proyecto corre en local con auth y DB funcional         | `pnpm dev` sin errores, login funcional                  | ✅     |
| **M2: Primera landing de ejemplo** | 2+3  | Wizard completo + landing con modulos renderizando      | Usuario no-tecnico completa wizard y ve su landing       | ✅     |
| **M3: Admin funcional**            | 4    | Panel admin permite gestionar todo el sitio             | Cambios en admin se reflejan en landing                  | ✅     |
| **M4: Edicion en vivo**            | 5    | Admin puede editar directamente sobre la landing        | Edicion inline funcional en todos los modulos            | ✅     |
| **M5: Ready for production**       | 6    | Producto listo para uso real                            | Lighthouse >= 90, tests pasando, deploy guides completos | ✅     |
| **M6: Ecosistema abierto**         | 7    | Comunidad puede crear y compartir temas                 | Formato de paquete estable, export/import, plugin system | ✅     |

---

_Este roadmap es un documento vivo. Se actualiza conforme el proyecto avanza, las prioridades evolucionan y la comunidad aporta feedback. Las estimaciones son orientativas y se ajustan segun la velocidad real de desarrollo._
