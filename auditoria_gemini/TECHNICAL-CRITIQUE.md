# Crítica Técnica y Honestidad Brutal

**Auditor**: Antigravity (Gemini 3 Flash)
**Proyecto**: Orion Landing Universal

---

## 1. El Stack Next.js 15

Next.js 15 es la elección correcta, pero el documento `ARCHITECTURE.md` no profundiza en cómo evitar que el bundle del lado del cliente se infle con los 19 módulos.

- **Problema**: Cargar el JS de 19 módulos en el navegador, incluso en desuso, es fatal para Lighthouse.
- **Crítica**: Se debe especificar que el **Module Registry** debe usar `dynamic(() => import(...))` con `ssr: true` pero sin interactividad por defecto, de modo que el JS _solo_ se envíe si el módulo está activo.

## 2. El Esquema de Contenido (JSONB)

El uso de JSONB para el contenido de los módulos es profesional y flexible, ¡PERO! es un peligro para la indexación y la validación.

- **Problema**: Si el contenido es un JSON arbitrario, es fácil romper el renderizado del front si el admin envía una estructura incorrecta.
- **Crítica**: Es IMPRESCINDIBLE que la API Route (`/api/content`) valide el JSON contra un esquema **Zod** específico de cada módulo. El administrador no puede enviar lo que quiera. Esto no está suficientemente detallado en la `Spec de Módulos`.

## 3. Seguridad de Supabase

El documento de Claude menciona `service_role` únicamente en el servidor. Esto está perfecto.

- **Ojo con esto**: Si en el wizard dejas que el usuario ingrese la URL y las keys, y luego guardas eso en un `.env.local` en el disco de tu servidor (ej: Hostinger, DigitalOcean), tienes que asegurarte de que el proceso del servidor tenga permisos de escritura. Muchos ambientes de PaaS prohíben la escritura de archivos `.env` en runtime por seguridad.
- **Crítica**: Se requiere una alternativa al `.env.local`. Por ejemplo, inyectar las variables en una tabla de `config` interna (con RLS desactivado para el admin) y que el middleware las lea de ahí (aunque esto último es complejo por que el middleware no debería tener acceso a DB sin las keys). Es un reto de "bootstraping" que requiere una mejor solución que solo `fs.writeFileSync`.

## 4. El i18n Dinámico

¿Es profesional un i18n dinámico? **Totalmente**, es como lo hacen los CMS de nivel Enterprise (Strapi, Payload).

- **Problema**: Si el admin agrega 10 idiomas, la consulta a `page_content` traerá 10 veces el contenido (un JSONB gigante).
- **Crítica**: La consulta a la DB debe usar un **SELECT** que solo traiga el `content->'idioma_activo'`. No quieres saturar la red con traducciones que no se van a renderizar.

## 5. El "Setup Wizard" - Honestidad

Seamos honestos: el usuario "estudiante" o "cliente" puede asustarse al ver 5 pasos técnicos.

- **Crítica**: El Wizard debe ser extremadamente visual, con capturas de pantalla de Supabase indicando exactamente qué copiar. Si el usuario se pierde en "Obtener URL", el proyecto falla en su misión de democratización.

---

## Conclusión Técnica

La arquitectura de Claude es un **9.5/10**.
El 0.5 restante es el manejo del estado del Wizard y la inyección técnica del esquema en una base de datos virgen. Sin un script de bootstrap inicial, el edificio no tiene cimientos.
