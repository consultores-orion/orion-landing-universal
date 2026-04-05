# Orion Landing Universal — Product Requirements Document (PRD)

| Campo         | Valor                         |
| ------------- | ----------------------------- |
| **Proyecto**  | Orion Landing Universal       |
| **Version**   | 0.1.0                         |
| **Fecha**     | 2026-04-04                    |
| **Autor**     | Luis Enrique Gutierrez Campos |
| **Estado**    | Borrador (Draft)              |
| **Licencia**  | MIT                           |
| **Comunidad** | Orion AI Society              |

---

## 1. Vision del Producto

**Orion Landing Universal** es una plantilla de landing page open-source, auto-hospedada, con un panel de administracion CMS completo integrado en el navegador. Su proposito es democratizar la creacion de paginas de aterrizaje profesionales: cualquier persona con conocimientos basicos de web puede configurar, personalizar y publicar su sitio sin escribir una sola linea de codigo.

El proyecto nace de una conviccion simple: **las herramientas profesionales no deberian requerir presupuestos profesionales ni conocimientos de programacion avanzados**. Mientras que las plataformas SaaS cobran suscripciones mensuales y los templates tradicionales exigen edicion manual de codigo, Orion Landing Universal ofrece una tercera via: un sistema completo, gratuito y extensible que el usuario controla desde su propio servidor.

### Por que existe

1. **Brecha de accesibilidad**: Crear una landing page de calidad profesional hoy requiere pagar herramientas SaaS (Unbounce, Leadpages, Instapage) con costos de USD 30-200/mes, o contratar un desarrollador. Para estudiantes, freelancers y pequenos negocios en mercados emergentes, ambas opciones son prohibitivas.

2. **Soberania de datos**: Las plataformas SaaS almacenan los datos del usuario en servidores de terceros. Orion Landing Universal permite al usuario mantener el control total de su informacion mediante Supabase auto-hospedado o en la nube.

3. **Extensibilidad comunitaria**: Los templates HTML tradicionales son archivos estaticos que mueren al momento de descargarse. Este proyecto propone un sistema vivo: modular, configurable desde el navegador y extensible por una comunidad de desarrolladores.

---

## 2. Usuarios Objetivo

### 2.1 Usuario Primario — Creador de Contenido (No Tecnico)

| Atributo                 | Descripcion                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Perfil**               | Duenos de pequenos negocios, freelancers, estudiantes, emprendedores, profesionales independientes         |
| **Conocimiento tecnico** | Basico — sabe navegar la web, usar formularios, subir imagenes                                             |
| **Necesidad**            | Una landing page profesional sin codigo, sin suscripciones mensuales, con control total                    |
| **Frustracion actual**   | Las opciones gratuitas son feas o limitadas; las buenas son caras; los templates requieren editar HTML/CSS |
| **Criterio de exito**    | Puede ir de cero a landing publicada en menos de 30 minutos sin asistencia tecnica                         |

### 2.2 Usuario Secundario — Desarrollador / Comunidad

| Atributo                 | Descripcion                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Perfil**               | Estudiantes de desarrollo, desarrolladores junior/mid, miembros de la comunidad Orion AI Society                    |
| **Conocimiento tecnico** | Intermedio a avanzado — TypeScript, React, Next.js                                                                  |
| **Necesidad**            | Un proyecto real para aprender, contribuir y extender; una base solida para crear modulos y temas personalizados    |
| **Frustracion actual**   | Los proyectos open-source de calidad tienen barreras de entrada altas; falta de documentacion clara para contribuir |
| **Criterio de exito**    | Puede crear un nuevo modulo o tema siguiendo la documentacion y con asistencia de Claude Code                       |

---

## 3. Problema

### El panorama actual de creacion de landing pages presenta tres opciones insatisfactorias:

```
+---------------------------+--------------------+-------------------+
|        Opcion             |       Costo        |   Conocimiento    |
+---------------------------+--------------------+-------------------+
| SaaS (Unbounce, etc.)    | USD 30-200/mes     | Bajo              |
| Contratar desarrollador   | USD 500-5000+      | Ninguno           |
| Template HTML gratuito    | Gratis             | Alto (HTML/CSS)   |
+---------------------------+--------------------+-------------------+
```

**Orion Landing Universal llena el cuarto cuadrante: costo cero + conocimiento bajo.**

Problemas especificos que resuelve:

1. **Costo**: Elimina suscripciones mensuales. El unico costo es el hosting (que puede ser gratuito con Vercel + Supabase free tier, o de bajo costo en cualquier VPS).

2. **Barrera tecnica**: El wizard de configuracion inicial y el panel admin eliminan la necesidad de editar codigo. Todo se gestiona desde el navegador.

3. **Rigidez**: Los templates tradicionales vienen con secciones fijas. Orion ofrece 19 modulos que se activan, desactivan y reordenan a voluntad.

4. **Internacionalizacion**: La mayoria de templates gratuitos son monolingues. Orion soporta multiples idiomas configurables dinamicamente desde el admin.

5. **Dependencia del proveedor**: Al ser auto-hospedado y open-source, el usuario nunca queda atrapado en un ecosistema cerrado.

---

## 4. Solucion

Orion Landing Universal resuelve estos problemas mediante tres pilares:

### Pilar 1 — Panel de Administracion No-Code

Un CMS completo accesible en la ruta `/admin` que permite:

- Gestionar contenido de todos los modulos (textos, imagenes, enlaces)
- Activar/desactivar modulos individuales
- Reordenar secciones de la landing page
- Configurar temas y paletas de colores
- Administrar idiomas y traducciones
- Gestionar leads capturados
- Configurar SEO y metadatos
- Administrar la biblioteca de medios

### Pilar 2 — Backend Supabase

Supabase proporciona la infraestructura completa:

- **Auth**: Autenticacion del administrador con politicas RLS
- **Database**: PostgreSQL para toda la configuracion, contenido y leads
- **Storage**: Almacenamiento de imagenes y archivos multimedia
- **Migraciones**: Esquema versionado y reproducible

### Pilar 3 — Open Source y Extensible

- Licencia MIT sin restricciones
- Arquitectura modular que permite crear nuevos modulos
- Sistema de temas extensible (20 paletas predefinidas + arquitectura para marketplace futuro)
- Documentacion completa para contribuidores
- Asistencia de Claude Code para desarrollo de extensiones

---

## 5. Funcionalidades Clave

### 5.1 Prioridad P0 — Imprescindible (Must Have)

Estas funcionalidades definen el producto minimo viable. Sin ellas, el proyecto no cumple su proposito.

#### 5.1.1 Wizard de Configuracion Inicial

| Aspecto        | Detalle                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Disparador** | Deteccion automatica de ausencia de configuracion de base de datos al primer acceso              |
| **Flujo**      | Conexion a Supabase -> Creacion de tablas -> Seed de datos iniciales -> Creacion de cuenta admin |
| **Requisito**  | El usuario solo necesita la URL y la anon key de su proyecto Supabase                            |
| **Resultado**  | Sistema completamente funcional tras completar el wizard                                         |

#### 5.1.2 Sistema de Modulos (19 Modulos)

Cada modulo es una seccion independiente de la landing page con su propia configuracion, contenido y estilos.

**Modulos existentes (9):**

| Modulo         | Proposito                                                            |
| -------------- | -------------------------------------------------------------------- |
| `hero`         | Seccion principal con titulo, subtitulo, CTA y imagen/video de fondo |
| `value_prop`   | Propuesta de valor con iconos y descripciones de beneficios          |
| `how_it_works` | Pasos del proceso o funcionamiento del producto/servicio             |
| `social_proof` | Testimonios de clientes con foto, nombre y cita                      |
| `client_logos` | Carrusel o grilla de logos de clientes/partners                      |
| `offer_form`   | Formulario de captura de leads con campos configurables              |
| `faq`          | Preguntas frecuentes en formato acordeon                             |
| `final_cta`    | Llamada a la accion final antes del footer                           |
| `footer`       | Pie de pagina con enlaces, redes sociales e informacion legal        |

**Modulos nuevos (10):**

| Modulo          | Proposito                                                          |
| --------------- | ------------------------------------------------------------------ |
| `stats`         | Contadores animados de metricas clave (clientes, proyectos, etc.)  |
| `pricing`       | Tabla comparativa de planes/precios                                |
| `video`         | Seccion dedicada a video embebido (YouTube, Vimeo, archivo propio) |
| `team`          | Perfiles del equipo con foto, cargo y redes sociales               |
| `gallery`       | Galeria de imagenes con lightbox                                   |
| `features_grid` | Cuadricula de caracteristicas con icono, titulo y descripcion      |
| `countdown`     | Temporizador de cuenta regresiva para ofertas o lanzamientos       |
| `comparison`    | Tabla comparativa (antes/despues, nosotros/competencia)            |
| `newsletter`    | Formulario de suscripcion a newsletter                             |
| `map_location`  | Mapa interactivo con ubicacion del negocio                         |

**Requisitos del sistema de modulos:**

- Cada modulo se puede activar/desactivar independientemente desde el admin
- El orden de los modulos en la pagina es configurable via drag-and-drop
- Cada modulo tiene su propio schema de configuracion y contenido
- Los modulos son responsivos por defecto
- El contenido de cada modulo es internacionalizable

#### 5.1.3 Panel de Administracion (`/admin`)

El panel de administracion es el centro de control del sistema. Incluye:

- **Dashboard**: Vista general del estado del sitio, leads recientes, estadisticas basicas
- **Editor de contenido**: Formularios para editar el contenido de cada modulo activo
- **Gestor de modulos**: Activar/desactivar modulos, reordenarlos
- **Editor de diseno**: Seleccion de paleta de colores, tipografia, espaciado
- **Gestor de idiomas**: Agregar/eliminar idiomas, editar traducciones, configurar idioma por defecto y fallback
- **Configuracion SEO**: Meta titulo, descripcion, Open Graph, favicon, sitemap
- **Biblioteca de medios**: Subir, organizar y reutilizar imagenes y archivos
- **Gestion de leads**: Ver, filtrar y exportar leads capturados por los formularios
- **Configuracion general**: Nombre del sitio, dominio, integraciones externas

#### 5.1.4 Sistema de Temas y Paletas

| Aspecto                  | Detalle                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| **Paletas predefinidas** | 20 paletas de nicho (tecnologia, salud, educacion, gastronomia, etc.) |
| **Aplicacion**           | Cambio instantaneo desde el admin sin recarga                         |
| **Arquitectura**         | CSS custom properties (variables) gestionadas por Tailwind CSS 4      |
| **Extensibilidad**       | Estructura preparada para marketplace de temas en fases futuras       |

#### 5.1.5 Diseno Responsivo

- Mobile-first con breakpoints estandar de Tailwind
- Todos los modulos adaptan su layout a mobile, tablet y desktop
- Navegacion adaptativa (hamburger menu en mobile)
- Imagenes optimizadas con `next/image` y formatos modernos (WebP, AVIF)

#### 5.1.6 Integracion Supabase (Auth, DB, Storage)

| Servicio        | Uso                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| **Auth**        | Autenticacion del administrador (email/password). Soporte para un unico admin en v1                    |
| **Database**    | PostgreSQL para configuracion del sitio, contenido de modulos, leads, traducciones, temas              |
| **Storage**     | Bucket para imagenes subidas desde la biblioteca de medios del admin                                   |
| **RLS**         | Politicas de Row Level Security: lectura publica para contenido, escritura solo para admin autenticado |
| **Migraciones** | Esquema versionado con archivos SQL ejecutados por el wizard                                           |

---

### 5.2 Prioridad P1 — Deberia Tener (Should Have)

Funcionalidades que enriquecen significativamente la experiencia pero no bloquean el lanzamiento.

#### 5.2.1 Internacionalizacion Dinamica (i18n)

- Agregar y eliminar idiomas desde el panel admin (no requiere archivos de traduccion manuales)
- Selector de idioma visible en la landing page publica
- Fallback configurable: si una traduccion no existe, muestra el idioma por defecto
- Cada campo de contenido de cada modulo tiene su version por idioma
- Deteccion automatica del idioma del navegador del visitante

#### 5.2.2 Edicion Inline en Vivo

- Toggle de edicion en la pagina publica (visible solo para admin autenticado)
- Clic en cualquier texto para editarlo directamente sobre la landing
- Los cambios se guardan en tiempo real en Supabase
- Preview instantaneo sin necesidad de ir al panel admin

#### 5.2.3 Gestion SEO

- Meta titulo y descripcion por pagina
- Tags Open Graph para redes sociales
- Generacion automatica de `sitemap.xml`
- Generacion automatica de `robots.txt`
- Soporte para favicon personalizado
- Datos estructurados (JSON-LD) basicos

#### 5.2.4 Captura de Leads y Exportacion

- Los formularios (`offer_form`, `newsletter`) almacenan leads en Supabase
- Vista de leads en el admin con filtros por fecha, fuente (modulo) y estado
- Exportacion a CSV
- Notificaciones opcionales por email al admin cuando llega un nuevo lead

#### 5.2.5 Biblioteca de Medios

- Subida de imagenes con drag-and-drop
- Optimizacion automatica (resize, compresion)
- Organizacion por carpetas o tags
- Reutilizacion de imagenes en multiples modulos
- Almacenamiento en Supabase Storage

#### 5.2.6 Integracion de Analitica

- Soporte para Google Analytics 4 (GA4) configurable desde el admin
- Soporte para Google Tag Manager
- Eventos basicos de tracking: page view, form submit, CTA click
- Campo generico para scripts de terceros (pixel de Facebook, etc.)

---

### 5.3 Prioridad P2 — Deseable (Nice to Have)

Funcionalidades que se planifican para versiones futuras o se implementan si el tiempo lo permite.

#### 5.3.1 Arquitectura de Marketplace de Temas

- Estructura de datos y API preparada para que la comunidad comparta temas
- Formato estandarizado de paquete de tema (paleta + layout + tipografia)
- Mecanismo de importacion/exportacion de temas

#### 5.3.2 Inyeccion de CSS Personalizado

- Editor de CSS en el admin para ajustes finos
- Scope limitado para evitar romper el sistema base
- Syntax highlighting y validacion basica

#### 5.3.3 Backup y Restauracion

- Exportacion completa de la configuracion del sitio a JSON
- Importacion/restauracion desde archivo JSON
- Historial basico de versiones de contenido

#### 5.3.4 Roles Multi-Admin

- Soporte para multiples cuentas de administracion
- Roles basicos: super-admin (todo), editor (contenido), viewer (solo lectura)
- Registro de actividad (audit log) basico

---

## 6. Requisitos No Funcionales

### 6.1 Rendimiento

| Metrica                            | Objetivo |
| ---------------------------------- | -------- |
| **Lighthouse Performance**         | >= 90    |
| **Lighthouse Accessibility**       | >= 90    |
| **Lighthouse Best Practices**      | >= 90    |
| **Lighthouse SEO**                 | >= 95    |
| **First Contentful Paint (FCP)**   | < 1.5s   |
| **Largest Contentful Paint (LCP)** | < 2.5s   |
| **Cumulative Layout Shift (CLS)**  | < 0.1    |
| **Time to Interactive (TTI)**      | < 3.0s   |

**Estrategias:**

- Server-Side Rendering (SSR) con Next.js App Router para la landing publica
- Optimizacion de imagenes con `next/image` (lazy loading, formatos modernos, sizing responsivo)
- Code splitting automatico por ruta
- Carga diferida de modulos desactivados (no se incluyen en el bundle)
- Cache agresivo de contenido estatico

### 6.2 Seguridad

| Aspecto                   | Implementacion                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Autenticacion**         | Supabase Auth con tokens JWT, sesiones seguras                                                    |
| **Autorizacion**          | Row Level Security (RLS) en todas las tablas — lectura publica de contenido, escritura solo admin |
| **Operaciones sensibles** | Server-side exclusivamente (Route Handlers de Next.js, nunca client-side)                         |
| **Validacion**            | Validacion de entrada en cliente (UX) Y servidor (seguridad) con Zod                              |
| **Cabeceras HTTP**        | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy                                     |
| **Dependencias**          | Audit regular con `npm audit`, dependabot habilitado                                              |
| **Secretos**              | Variables de entorno, nunca en codigo fuente. `.env.local` en `.gitignore`                        |
| **Storage**               | Politicas de bucket en Supabase Storage: lectura publica, escritura solo admin                    |

### 6.3 Accesibilidad (WCAG 2.1 AA)

- Navegacion completa por teclado
- Contraste de colores minimo 4.5:1 (texto normal) y 3:1 (texto grande)
- Atributos ARIA semanticos donde corresponda
- Textos alternativos obligatorios para imagenes
- Estructura de headings jerarquica y semantica
- Focus visible en todos los elementos interactivos
- Soporte para lectores de pantalla
- Respeto a `prefers-reduced-motion` y `prefers-color-scheme`

### 6.4 SEO

- Renderizado del lado del servidor para todo el contenido publico
- Metadatos completos (titulo, descripcion, Open Graph, Twitter Cards)
- URLs limpias y semanticas
- Sitemap XML generado automaticamente
- Robots.txt configurable
- Datos estructurados JSON-LD
- Carga rapida (correlacion directa con ranking)

### 6.5 Compatibilidad de Navegadores

| Navegador           | Version Minima      |
| ------------------- | ------------------- |
| Chrome              | Ultimas 2 versiones |
| Firefox             | Ultimas 2 versiones |
| Safari              | Ultimas 2 versiones |
| Edge                | Ultimas 2 versiones |
| Mobile Safari (iOS) | iOS 15+             |
| Chrome Android      | Ultimas 2 versiones |

---

## 7. Metricas de Exito

### 7.1 Metricas de Producto

| Metrica                        | Objetivo                                              | Metodo de Medicion                 |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------- |
| **Tiempo de setup**            | < 5 minutos desde clonar hasta landing funcional      | Test cronometrado con usuario real |
| **Tiempo de personalizacion**  | < 30 minutos para landing completamente personalizada | Test de usabilidad                 |
| **Tiempo para agregar modulo** | < 2 minutos por modulo desde el admin                 | Test cronometrado                  |
| **Lighthouse Performance**     | >= 90 en las 4 categorias                             | Auditorias automatizadas en CI     |

### 7.2 Metricas de Comunidad

| Metrica                            | Objetivo (6 meses) | Objetivo (12 meses) |
| ---------------------------------- | ------------------ | ------------------- |
| **GitHub Stars**                   | 100+               | 500+                |
| **Forks**                          | 20+                | 100+                |
| **Contribuidores**                 | 5+                 | 15+                 |
| **Issues resueltos por comunidad** | 10+                | 50+                 |

### 7.3 Metricas Tecnicas

| Metrica                          | Objetivo                                     |
| -------------------------------- | -------------------------------------------- |
| **Cobertura de tests**           | >= 70% (unit) + E2E para flujos criticos     |
| **Build time**                   | < 60 segundos                                |
| **Bundle size (pagina publica)** | < 200KB (gzip, JS)                           |
| **Uptime**                       | 99.5%+ (dependiente del hosting del usuario) |

---

## 8. Fuera de Alcance (v1)

Las siguientes funcionalidades quedan **explicitamente excluidas** de la version 1.0. Podran considerarse en versiones futuras segun la demanda de la comunidad.

| Funcionalidad                                | Razon de Exclusion                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Multi-tenancy**                            | El producto es single-tenant por diseno. Una instalacion = un sitio. Simplifica arquitectura, seguridad y mantenimiento |
| **E-commerce**                               | Agrega una complejidad masiva (pagos, inventario, envios). Fuera del scope de una landing page                          |
| **Motor de blog**                            | Existen soluciones excelentes para blog (Ghost, WordPress). No es el proposito de este producto                         |
| **Aplicacion movil nativa**                  | La admin funciona en navegador movil. Una app nativa no agrega valor suficiente para la complejidad                     |
| **Editor visual drag-and-drop completo**     | Tipo Webflow/Elementor. Excesivamente complejo. Se ofrece drag-and-drop solo para reordenar modulos                     |
| **Autenticacion social**                     | OAuth con Google/GitHub para admin. Agrega complejidad sin beneficio claro para un single-admin                         |
| **API publica**                              | No se expone API REST/GraphQL para consumo externo. El admin usa Server Actions / Route Handlers internos               |
| **Soporte para subdominios/rutas multiples** | Una instalacion = una sola pagina. No es un CMS multi-pagina                                                            |

---

## 9. Dependencias

### 9.1 Dependencias de Infraestructura

| Dependencia           | Version / Requisito                    | Proposito               |
| --------------------- | -------------------------------------- | ----------------------- |
| **Node.js**           | >= 20.0.0 (LTS)                        | Runtime de Next.js      |
| **npm o pnpm**        | npm >= 10 o pnpm >= 9                  | Gestor de paquetes      |
| **Proyecto Supabase** | Instancia activa (cloud o self-hosted) | Auth, Database, Storage |

### 9.2 Dependencias de Stack Tecnologico

| Tecnologia             | Version           | Proposito                          |
| ---------------------- | ----------------- | ---------------------------------- |
| **Next.js**            | 15.x (App Router) | Framework fullstack React          |
| **TypeScript**         | 5.x               | Tipado estatico                    |
| **Tailwind CSS**       | 4.x               | Framework de estilos utility-first |
| **Supabase JS Client** | >= 2.x            | SDK para comunicacion con Supabase |
| **shadcn/ui**          | Latest            | Componentes UI para el panel admin |
| **Zod**                | >= 3.x            | Validacion de esquemas             |
| **React Hook Form**    | >= 7.x            | Gestion de formularios             |

### 9.3 Dependencias de Despliegue

| Plataforma  | Soporte    | Notas                                                            |
| ----------- | ---------- | ---------------------------------------------------------------- |
| **Vercel**  | Primario   | Deploy con un clic, soporte nativo Next.js                       |
| **Docker**  | Secundario | Dockerfile incluido para cualquier VPS (DigitalOcean, AWS, etc.) |
| **Netlify** | Terciario  | Compatible, con configuracion adicional para SSR                 |

---

## 10. Riesgos

### 10.1 Riesgos Tecnicos

| #   | Riesgo                                                                                                            | Probabilidad | Impacto | Mitigacion                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Dependencia de Supabase** — Si Supabase cambia su API, precios o deja de existir, el proyecto se ve afectado    | Media        | Alto    | Abstraer la capa de datos con interfaces TypeScript. Documentar alternativas (PocketBase, self-hosted Supabase). El codigo de Supabase esta concentrado en una capa de servicio intercambiable |
| R2  | **Complejidad progresiva** — 19 modulos + i18n + temas + admin puede volverse dificil de mantener                 | Alta         | Medio   | Arquitectura modular estricta. Cada modulo es auto-contenido. Tests unitarios por modulo. Documentacion clara de convenciones                                                                  |
| R3  | **Rendimiento con muchos modulos activos** — Activar los 19 modulos simultaneamente puede degradar el performance | Media        | Medio   | Lazy loading de modulos. SSR para contenido critico. Benchmarks periodicos. Presupuesto de rendimiento en CI                                                                                   |
| R4  | **Seguridad del panel admin** — Al ser accesible via web, el admin es un vector de ataque                         | Media        | Alto    | RLS en todas las tablas. Autenticacion robusta con Supabase Auth. Rate limiting. Validacion server-side obligatoria                                                                            |
| R5  | **Compatibilidad entre versiones de Next.js** — Next.js evoluciona rapidamente, posibles breaking changes         | Media        | Medio   | Pin de version en `package.json`. Actualizaciones controladas y testeadas. No usar APIs experimentales/inestables                                                                              |

### 10.2 Riesgos de Producto

| #   | Riesgo                                                                                         | Probabilidad | Impacto | Mitigacion                                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------- | ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| R6  | **Barrera de Supabase** — Usuarios no tecnicos pueden frustrarse al crear un proyecto Supabase | Media        | Alto    | Wizard de setup extremadamente guiado con capturas de pantalla. Video tutorial. Documentacion paso a paso                             |
| R7  | **Expectativas de CMS completo** — Usuarios pueden esperar funcionalidad tipo WordPress        | Alta         | Medio   | Messaging claro: "landing page builder", no "CMS". Documentacion explicita de alcance y limitaciones                                  |
| R8  | **Adopcion lenta** — Competencia con alternativas establecidas                                 | Media        | Medio   | Diferenciacion clara: gratuito + open-source + auto-hospedado + extensible. Marketing en comunidades hispanohablantes. Demos en video |

### 10.3 Riesgos de Comunidad

| #   | Riesgo                                                                     | Probabilidad | Impacto | Mitigacion                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------- | ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R9  | **Falta de contribuidores** — Proyecto depende de uno o pocos mantenedores | Alta         | Alto    | Documentacion excelente para contribuidores. Issues etiquetados por dificultad. Mentoria activa en la comunidad Orion AI Society. Claude Code como asistente de desarrollo |
| R10 | **Fragmentacion de forks** — Forks que divergen sin contribuir de vuelta   | Media        | Bajo    | Licencia MIT lo permite. Mitigacion: hacer que el upstream sea siempre la mejor opcion mediante releases regulares y buena gobernanza                                      |

---

## 11. Arquitectura de Alto Nivel

```
+----------------------------------------------------+
|                   NAVEGADOR                        |
|                                                    |
|  +-------------------+  +----------------------+  |
|  |   Landing Page    |  |    Panel Admin       |  |
|  |   (Publica)       |  |    (/admin)          |  |
|  |                   |  |                      |  |
|  |  - 19 Modulos     |  |  - Dashboard         |  |
|  |  - i18n           |  |  - Editor contenido  |  |
|  |  - Temas          |  |  - Gestor modulos    |  |
|  |  - Responsivo     |  |  - Temas/Paletas     |  |
|  |  - Edicion inline |  |  - SEO/Media/Leads   |  |
|  +-------------------+  +----------------------+  |
+----------------------------------------------------+
              |                        |
              v                        v
+----------------------------------------------------+
|              NEXT.JS 15 (App Router)               |
|                                                    |
|  +----------------------------------------------+  |
|  |          Server Components + Actions          |  |
|  |          Route Handlers (API)                 |  |
|  |          Middleware (Auth Guard)               |  |
|  +----------------------------------------------+  |
+----------------------------------------------------+
              |
              v
+----------------------------------------------------+
|                   SUPABASE                         |
|                                                    |
|  +------------+  +------------+  +-------------+  |
|  |    Auth    |  |  Database  |  |   Storage   |  |
|  |            |  | (PostgreSQL)|  |  (Buckets)  |  |
|  | - JWT      |  | - Config   |  | - Imagenes  |  |
|  | - Sessions |  | - Modulos  |  | - Medios    |  |
|  | - RLS      |  | - Leads    |  |             |  |
|  |            |  | - i18n     |  |             |  |
|  +------------+  +------------+  +-------------+  |
+----------------------------------------------------+
```

---

## 12. Creditos y Licencia

### Licencia

Este proyecto se distribuye bajo la **Licencia MIT**, permitiendo uso, modificacion y distribucion libre, tanto en proyectos personales como comerciales, sin restriccion alguna.

### Creditos

**Creado por el Profesor Luis Enrique Gutierrez Campos** para la comunidad **Orion AI Society**, como herramienta educativa y profesional al servicio de cualquier persona que necesite presencia web de calidad.

> Born from the creative vision and original concept of **Erwin Rojas**, whose initiative and imagination planted the seed that became this project. What started as a student's spark of creativity evolved into a tool for the entire community — proof that great ideas can come from anywhere when curiosity meets the right guidance.

### Origen

El proyecto evoluciono a partir de un prototipo HTML de archivo unico (~1046 lineas) creado por Erwin Rojas bajo la mentoria de Luis Enrique. Esa chispa inicial — un archivo HTML con CSS inline y una vision clara — demostro que la idea tenia merito. Orion Landing Universal es la materializacion de esa vision en una plataforma profesional, escalable y accesible para todos.

---

## Historial de Revisiones

| Version | Fecha      | Autor                         | Cambios                               |
| ------- | ---------- | ----------------------------- | ------------------------------------- |
| 0.1.0   | 2026-04-04 | Luis Enrique Gutierrez Campos | Documento inicial — Borrador completo |

---

_Este documento es un artefacto vivo. Se actualiza conforme el proyecto avanza y las decisiones arquitectonicas se consolidan._
