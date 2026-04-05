# Gobernanza del Proyecto — Orion Landing Universal

> Este documento define el modelo de gobernanza, los roles, los procesos de toma de decisiones y las prácticas de release del proyecto Orion Landing Universal.

---

## 1. Modelo de Gobernanza

Orion Landing Universal adopta el modelo **BDFL (Benevolent Dictator For Life)** — un modelo de liderazgo benevolente donde las decisiones fluyen a través de la comunidad pero la autoridad final recae en el líder del proyecto.

Este modelo se eligió porque:

- El proyecto nace de una visión clara con objetivos pedagógicos y comunitarios definidos.
- La comunidad Orion AI Society se beneficia de una dirección técnica coherente y estable.
- A medida que la comunidad crezca, los colaboradores principales (Core Contributors) tendrán cada vez mayor influencia en las decisiones.

El BDFL se compromete a escuchar activamente a la comunidad, documentar las razones detrás de cada decisión significativa y priorizar el consenso siempre que sea posible. La autoridad final es una red de seguridad, no una herramienta de gobierno diario.

---

## 2. Roles

### 2.1 Project Lead (BDFL)

**Luis Enrique Gutiérrez Campos**

- Autoridad final sobre la dirección del proyecto, roadmap y decisiones arquitectónicas.
- Responsable de la gestión de releases y versionado.
- Aprueba o rechaza RFCs y cambios mayores.
- Define las prioridades del proyecto alineadas con la misión de Orion AI Society.
- Otorga y revoca el rol de Core Contributor.
- Resuelve disputas técnicas y comunitarias cuando el consenso no sea alcanzable.

### 2.2 Core Contributors (Colaboradores Principales)

Miembros de confianza de la comunidad que han demostrado compromiso sostenido con la calidad del proyecto.

**Responsabilidades:**

- Revisar y aprobar Pull Requests.
- Derechos de merge en el repositorio principal.
- Participar activamente en discusiones de RFC y decisiones de diseño.
- Mentorizar a nuevos contribuidores.
- Mantener la calidad del código y la adherencia a las convenciones canónicas.

**Cómo se obtiene el rol:**

- A través de contribuciones sostenidas y de alta calidad (código, documentación, revisiones).
- Nominación por un Core Contributor existente o por el Project Lead.
- Aprobación final del Project Lead.
- No hay un número mínimo de PRs — se evalúa la calidad, consistencia y actitud.

**Cómo se pierde el rol:**

- Inactividad prolongada (6+ meses sin participación) — el rol se pone en pausa, no se revoca permanentemente.
- Violación del Código de Conducta.
- Decisión del Project Lead ante circunstancias excepcionales.

### 2.3 Contributors (Contribuidores)

Cualquier persona que aporte al proyecto de forma directa.

**Formas de contribución:**

- Enviar Pull Requests (código, documentación, traducciones).
- Reportar bugs con información reproducible.
- Proponer mejoras y nuevas funcionalidades.
- Mejorar la documentación existente.
- Crear módulos comunitarios.

**Reconocimiento:**

- Todo contribuidor aparece en `CONTRIBUTORS.md`.
- Las contribuciones significativas se mencionan en las notas de release.

### 2.4 Community Members (Miembros de la Comunidad)

Usuarios, testers, y personas que participan en la comunidad sin contribuir código directamente.

**Formas de participación:**

- Usar el template y dar feedback sobre la experiencia.
- Participar en discusiones y propuestas.
- Reportar problemas de usabilidad.
- Compartir el proyecto y ayudar a otros usuarios.
- Probar versiones pre-release y reportar hallazgos.

---

## 3. Proceso de Decisiones

Las decisiones se clasifican en tres niveles según su impacto:

### 3.1 Decisiones Menores

**Ejemplos:** corrección de bugs, typos, mejoras de documentación, refactoring menor.

| Aspecto             | Detalle                    |
| ------------------- | -------------------------- |
| **Proceso**         | Pull Request estándar      |
| **Aprobación**      | Un (1) Core Contributor    |
| **Tiempo estimado** | 1-3 días                   |
| **Documentación**   | Descripción clara en el PR |

### 3.2 Decisiones Medianas

**Ejemplos:** nuevo módulo, nueva funcionalidad, cambio en un flujo existente, nueva dependencia.

| Aspecto             | Detalle                                                            |
| ------------------- | ------------------------------------------------------------------ |
| **Proceso**         | RFC (Request for Comments) como GitHub Issue con la etiqueta `rfc` |
| **Discusión**       | Mínimo 3 días para comentarios de la comunidad                     |
| **Aprobación**      | Revisión de Core Contributors + aprobación del Project Lead        |
| **Tiempo estimado** | 3-10 días                                                          |
| **Documentación**   | RFC documentado, decisión registrada en el Issue, ADR si aplica    |

**Formato del RFC:**

```
## Problema
[Qué problema resuelve]

## Propuesta
[Descripción de la solución]

## Alternativas Consideradas
[Otras opciones evaluadas y por qué se descartaron]

## Impacto
[Qué áreas del proyecto se ven afectadas]
```

### 3.3 Decisiones Mayores

**Ejemplos:** cambio arquitectónico, breaking change, migración de tecnología, cambio en el modelo de datos core.

| Aspecto             | Detalle                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| **Proceso**         | RFC formal + período de discusión comunitaria                            |
| **Discusión**       | Mínimo 7 días calendario para comentarios                                |
| **Aprobación**      | Consenso de Core Contributors + aprobación explícita del Project Lead    |
| **Tiempo estimado** | 7-21 días                                                                |
| **Documentación**   | RFC completo, ADR obligatorio, guía de migración si hay breaking changes |

**Requisitos adicionales para decisiones mayores:**

- El RFC debe incluir una sección de impacto en usuarios existentes.
- Se debe proporcionar un plan de migración antes de la aprobación.
- El Project Lead debe emitir una declaración escrita con la razón de la decisión.

### 3.4 Resolución de Conflictos

1. Intentar consenso entre las partes involucradas.
2. Si no hay consenso, un Core Contributor actúa como mediador.
3. Si persiste el desacuerdo, el Project Lead toma la decisión final y documenta las razones.

---

## 4. Proceso de Release

### 4.1 Versionado Semántico

El proyecto sigue estrictamente [Semantic Versioning 2.0.0](https://semver.org/lang/es/):

- **MAJOR** (`X.0.0`): Cambios incompatibles con versiones anteriores (breaking changes).
- **MINOR** (`0.X.0`): Nueva funcionalidad compatible con versiones anteriores.
- **PATCH** (`0.0.X`): Corrección de bugs compatible con versiones anteriores.

Sufijos permitidos: `-alpha.N`, `-beta.N`, `-rc.N` para pre-releases.

### 4.2 Ramas de Release

```
main (estable)
  ├── release/vX.Y.Z (preparación de release)
  ├── feat/nombre-feature (desarrollo)
  ├── fix/nombre-bug (correcciones)
  └── docs/tema (documentación)
```

- `main` siempre contiene la última versión estable publicada.
- Las ramas `release/vX.Y.Z` se crean desde `main` para preparar una nueva versión.
- Solo se permiten fixes críticos en la rama de release una vez creada.

### 4.3 Checklist de Release

Antes de publicar cualquier release:

- [ ] Todas las pruebas pasan (lint, tipos, unit, E2E).
- [ ] La build de producción se genera sin errores.
- [ ] El `CHANGELOG.md` está actualizado con todos los cambios.
- [ ] Las notas de release están redactadas.
- [ ] Para MAJOR releases: guía de migración incluida.
- [ ] Tag de Git creado y firmado (`vX.Y.Z`).
- [ ] Release publicado en GitHub Releases.

### 4.4 Changelog

El `CHANGELOG.md` sigue el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) con las secciones:

- **Added**: Funcionalidades nuevas.
- **Changed**: Cambios en funcionalidad existente.
- **Deprecated**: Funcionalidades que serán removidas.
- **Removed**: Funcionalidades eliminadas.
- **Fixed**: Corrección de bugs.
- **Security**: Correcciones de seguridad.

### 4.5 Notas de Release

Cada release incluye:

- Resumen ejecutivo de los cambios.
- Lista de cambios categorizada.
- Guía de migración (si hay breaking changes).
- Agradecimiento a los contribuidores del release.
- Hash del commit de release para verificación.

---

## 5. Canales de Comunicación

| Canal                           | Propósito                                         | Acceso                   |
| ------------------------------- | ------------------------------------------------- | ------------------------ |
| **GitHub Issues**               | Reporte de bugs, solicitudes de features          | Público                  |
| **GitHub Discussions**          | RFCs, preguntas técnicas, propuestas              | Público                  |
| **GitHub Pull Requests**        | Revisión de código, discusión técnica             | Público                  |
| **Canales de Orion AI Society** | Discusión comunitaria, soporte informal, anuncios | Miembros de la comunidad |

### Lineamientos de comunicación:

- **Idioma principal**: Español. Se aceptan contribuciones en inglés.
- **Tono**: Profesional pero accesible. Constructivo siempre.
- **Respuestas**: Se espera una primera respuesta en Issues dentro de 72 horas hábiles.
- **Etiquetas**: Usar el sistema de etiquetas de GitHub para categorizar y priorizar.

---

## 6. Enmiendas a este Documento

Este documento de gobernanza puede ser enmendado siguiendo el proceso de decisiones mayores descrito en la sección 3.3. Cualquier cambio requiere:

1. RFC público con período de discusión de 7 días.
2. Aprobación del Project Lead.
3. Documentación de la razón del cambio.

---

## Créditos

- **Proyecto creado por**: Luis Enrique Gutiérrez Campos, para la comunidad Orion AI Society.
- **Concepto original y visión creativa**: Erwin Rojas, cuya iniciativa e imaginación plantaron la semilla que se convirtió en este proyecto.

---

_Última actualización: Abril 2026_
_Versión del documento: 1.0_
