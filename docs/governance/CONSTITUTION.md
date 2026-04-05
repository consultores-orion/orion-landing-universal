# Constitución del Proyecto — Orion Landing Universal

> Este documento establece la misión, visión, valores fundamentales, principios técnicos y compromisos permanentes del proyecto Orion Landing Universal. Funciona como la carta fundacional: todo lo que se construya debe estar alineado con lo que aquí se define.

---

## 1. Misión

**Democratizar la presencia web profesional.**

Cualquier persona, sin importar su nivel técnico, debe poder desplegar una landing page hermosa, funcional y profesional. No debería ser necesario saber programar para tener una presencia digital digna.

Orion Landing Universal existe para eliminar la barrera entre "quiero mi sitio web" y "tengo mi sitio web funcionando".

---

## 2. Visión

Convertirse en **el template de landing page open-source de referencia** para la comunidad hispanohablante y global de desarrolladores, emprendedores y pequeños negocios.

Un template que:

- Se instala en minutos, no en horas.
- Se configura desde el navegador, no desde el código.
- Se ve profesional desde el primer momento, no después de horas de personalización.
- Se mantiene por una comunidad activa, no por una empresa con incentivos ocultos.

---

## 3. Valores Fundamentales

### 3.1 Accesibilidad

El template debe ser utilizable por personas con conocimientos web basicos. Esto implica:

- Un wizard de configuración inicial que guíe paso a paso.
- Un panel de administración intuitivo que no requiera conocimientos de código.
- Documentación clara, en español, con ejemplos visuales.
- Mensajes de error comprensibles que sugieran soluciones.

**Criterio de validación**: Si una persona que solo ha usado WordPress no puede configurar el template en 30 minutos, algo está mal.

### 3.2 Calidad sobre Cantidad

Es preferible tener 10 módulos excelentes que 50 mediocres.

- Cada módulo debe ser robusto, accesible, responsive y bien documentado.
- No se acepta código "que funciona pero..." — debe funcionar bien.
- Las contribuciones se evalúan por calidad, no por volumen.
- Un módulo rechazado con feedback constructivo es mejor que un módulo aprobado que baja el estándar.

### 3.3 Transparencia

Todas las decisiones se documentan. Todo el código es abierto.

- Las decisiones arquitectónicas se registran como ADRs (Architecture Decision Records).
- Los debates técnicos ocurren en espacios públicos (Issues, Discussions).
- El roadmap es visible para toda la comunidad.
- No hay código privado, dependencias ocultas ni funcionalidades bloqueadas.

### 3.4 Comunidad

Construido por la comunidad, para la comunidad.

- Las contribuciones de todos son bienvenidas, sin importar la experiencia.
- Los Core Contributors tienen la responsabilidad de mentorizar a los nuevos.
- La comunidad tiene voz en las decisiones a través de los procesos de RFC.
- El proyecto existe para servir a sus usuarios, no al revés.

### 3.5 Educación

Cada componente es una oportunidad de aprender.

- El código debe ser legible y estar bien estructurado — es material de aprendizaje.
- La documentación no solo explica "qué" sino "por qué".
- Se fomentan las contribuciones de estudiantes y personas aprendiendo.
- El proyecto nace en un contexto educativo (Orion AI Society) y honra ese origen.

---

## 4. Principios Técnicos

Estos principios guían toda decisión técnica del proyecto. No son sugerencias — son requisitos.

### 4.1 Simplicidad Primero

> "La simplicidad es la sofisticación definitiva." — Leonardo da Vinci

- Preferir soluciones simples sobre soluciones ingeniosas.
- Si una implementación requiere un párrafo para explicarse, probablemente es demasiado compleja.
- Evitar abstracciones prematuras. Abstraer solo cuando el patrón se repita tres o más veces.
- Cada dependencia externa debe justificar su existencia. Si se puede resolver en 20 líneas claras, no se agrega un paquete.

### 4.2 Seguridad por Diseño

La seguridad no es un paso posterior — está integrada desde la concepción.

- Row Level Security (RLS) en Supabase para todo dato sensible.
- Validación de entrada en servidor y cliente (Zod).
- Nunca exponer claves de servicio (`service_role`) al cliente.
- Sanitización de contenido generado por el usuario antes de renderizar.
- Cabeceras de seguridad configuradas por defecto.
- Autenticación y autorización verificadas en cada endpoint.

### 4.3 Rendimiento Importa

Un Lighthouse score de 90+ en todas las categorías es un **requisito duro**, no una aspiración.

- Server Components por defecto — 'use client' solo cuando es estrictamente necesario.
- Carga dinámica (lazy loading) para módulos pesados.
- Optimización de imágenes con `next/image`.
- Optimización de fuentes con `next/font/google`.
- Minimizar el JavaScript enviado al cliente.
- Monitoreo de bundle size en CI.

### 4.4 Escalabilidad Modular

El sistema de módulos es el punto de extensión del proyecto — no los forks.

- La arquitectura de módulos permite agregar, remover y reordenar secciones sin tocar el core.
- Cada módulo es autocontenido: componente, schema, seed data, estilos.
- El registro de módulos es declarativo — agregar un módulo no requiere modificar código existente.
- Los módulos comunitarios son ciudadanos de primera clase.

### 4.5 Respetar al Usuario

El usuario del template y los visitantes de los sitios generados merecen respeto.

- **Cero dark patterns**: No hay pop-ups engañosos, contadores falsos ni urgencia artificial.
- **Cero recolección de datos oculta**: El template no envía telemetría, no rastrea usuarios, no incluye analytics por defecto.
- **Sin vendor lock-in innecesario**: La única dependencia de servicio es Supabase, y la arquitectura facilita migración si fuera necesario en el futuro.
- **Datos del usuario le pertenecen al usuario**: Todo el contenido está en su propia instancia de Supabase, bajo su control total.

---

## 5. No-Goals (Explícitamente Fuera de Alcance)

Es igual de importante definir qué **no es** el proyecto como qué sí es. Estos son límites deliberados, no limitaciones.

### 5.1 NO es un CMS completo

Orion Landing Universal no incluye ni incluirá:

- Motor de blog con gestión de artículos.
- Constructor de páginas con layouts arbitrarios (page builder).
- Sistema de gestión de contenido multi-página.

**Es un template de landing page con un panel de administración para configurar esa landing page.** Nada más, nada menos.

### 5.2 NO es una plataforma de e-commerce

No incluirá:

- Carrito de compras.
- Pasarelas de pago.
- Gestión de inventario.
- Catálogo de productos navegable.

Si un módulo muestra productos o servicios, es puramente informativo y redirige a plataformas externas.

### 5.3 NO es un SaaS multi-tenant

Cada instancia es independiente:

- Una instalación = un sitio web = una base de datos Supabase.
- No hay panel central que gestione múltiples sitios.
- No hay sistema de suscripciones ni planes.

### 5.4 NO es un website builder

Es un **template** — un patrón de layout único, infinitamente configurable:

- Una sola estructura de página (hero, secciones modulares, footer).
- La personalización está en el contenido, colores, tipografías y módulos activos.
- No se pueden crear layouts arbitrarios arrastrando y soltando bloques.

**Esta limitación es deliberada.** Un alcance acotado permite una ejecución excelente.

---

## 6. Compromiso con Open Source

### El proyecto siempre será MIT

Este compromiso es permanente e irrevocable dentro de este proyecto:

- El código fuente completo estará siempre disponible públicamente.
- La licencia MIT permite uso comercial, modificación y distribución sin restricciones.
- **Los forks comerciales son permitidos y alentados.** Si alguien puede construir un negocio sobre este template, el proyecto habrá cumplido su propósito.
- No habrá versión "Pro" ni funcionalidades detrás de paywall.
- El core completo — todos los módulos, el panel de admin, el wizard, la documentación — permanecerá libre.

### Qué significa esto en la práctica

| Escenario                                      | Permitido                              |
| ---------------------------------------------- | -------------------------------------- |
| Usar el template para un cliente comercial     | Si                                     |
| Vender sitios web basados en este template     | Si                                     |
| Crear un SaaS de hosting usando este template  | Si                                     |
| Modificar el código y no compartir los cambios | Si (MIT lo permite)                    |
| Atribuir el proyecto original                  | Apreciado pero no requerido legalmente |
| Contribuir mejoras de vuelta al proyecto       | Alentado y agradecido                  |

---

## 7. Origen y Reconocimiento

Este proyecto fue creado por el profesor **Luis Enrique Gutiérrez Campos** para la comunidad **Orion AI Society**.

El concepto original y la visión creativa nacieron de **Erwin Rojas**, cuya iniciativa e imaginación plantaron la semilla que se convirtió en este proyecto. Lo que comenzó como la chispa creativa de un estudiante evolucionó en una herramienta para toda la comunidad — prueba de que las grandes ideas pueden surgir de cualquier lugar cuando la curiosidad se encuentra con la guía adecuada.

Orion Landing Universal es testimonio de que la educación y la comunidad pueden producir herramientas que trascienden el aula.

---

## 8. Enmiendas a esta Constitución

Esta constitución puede ser enmendada, pero con el más alto nivel de escrutinio:

1. Cualquier enmienda requiere un RFC formal con período de discusión de **14 días**.
2. La propuesta debe explicar por qué el texto actual es inadecuado.
3. Se requiere consenso amplio de Core Contributors.
4. Aprobación final del Project Lead.
5. Los valores fundamentales (sección 3) y el compromiso open source (sección 6) tienen protección especial: solo pueden ser enmendados con unanimidad de Core Contributors y aprobación del Project Lead.

---

_Última actualización: Abril 2026_
_Versión del documento: 1.0_
