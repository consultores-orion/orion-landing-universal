# INTEGRATIONS.md — Especificacion del Sistema de Integraciones

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Arquitectura

### 1.1 Enfoque General

El sistema de integraciones de Orion Landing Universal es **modular y auto-contenido**. Cada integracion se define como una entrada en la tabla `integrations` con su configuracion propia, y tiene un componente React asociado que inyecta el codigo necesario en la pagina.

### 1.2 Principios

| Principio                     | Descripcion                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| **Toggle global**             | Cada integracion se activa/desactiva con un switch              |
| **Configuracion en BD**       | Toda la configuracion vive en Supabase, no en archivos          |
| **Server-side injection**     | Los scripts se inyectan desde el servidor (no eval client-side) |
| **Datos sensibles separados** | Credenciales van en `sensitive_config` (campo separado)         |
| **Test button**               | Cada integracion tiene un boton para probar la configuracion    |
| **Zero JS si desactivada**    | Una integracion desactivada no agrega ningun byte al bundle     |

### 1.3 Diagrama de Arquitectura

```
Supabase: integrations table
  |
  | Fetch en Server Component
  v
IntegrationsProvider (Server Component)
  |
  +-- ScriptInjector (head scripts: GA, Meta Pixel, custom)
  |
  +-- WhatsAppButton (floating component, client-side)
  |
  +-- CalendlyEmbed (embeddable, por modulo)
  |
  +-- EmailNotifier (API route, server-side)
  |
  +-- CustomScripts (head + body injection)
```

### 1.4 Flujo General

```
1. Admin configura integracion en /admin/integrations
2. Configuracion se guarda en tabla `integrations`
3. Al cargar la landing page:
   a. Server Component lee integraciones activas
   b. Para cada activa, inyecta el componente/script correspondiente
   c. Scripts de tracking (GA, Meta Pixel) van en <head>
   d. Componentes visuales (WhatsApp, Calendly) se renderizan en el body
4. Eventos (lead form submit) disparan acciones en integraciones activas
```

---

## 2. Google Analytics 4

### 2.1 Configuracion

| Campo            | Tipo | Requerido | Descripcion                                  |
| ---------------- | ---- | :-------: | -------------------------------------------- |
| `measurement_id` | text |    Si     | ID de medicion GA4 (formato: `G-XXXXXXXXXX`) |

### 2.2 Validacion

- El `measurement_id` debe coincidir con el patron `/^G-[A-Z0-9]{10,}$/`
- Se valida en el frontend antes de guardar

### 2.3 Inyeccion del Script

```typescript
// src/components/integrations/GoogleAnalytics.tsx

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
```

### 2.4 Eventos Personalizados

Cuando GA esta activo, se disparan eventos automaticos en acciones clave:

| Evento               | Nombre GA         | Cuando                                                |
| -------------------- | ----------------- | ----------------------------------------------------- |
| Lead form submit     | `generate_lead`   | Al enviar el formulario de contacto                   |
| Newsletter subscribe | `sign_up`         | Al suscribirse al newsletter                          |
| CTA click            | `cta_click`       | Al hacer clic en un CTA principal                     |
| Language change      | `language_change` | Al cambiar el idioma                                  |
| Module view          | `section_view`    | Al hacer scroll a una seccion (Intersection Observer) |

```typescript
// src/lib/integrations/analytics.ts

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, params)
  }
}

// Uso:
trackEvent('generate_lead', {
  event_category: 'conversion',
  event_label: 'offer_form',
  value: 1,
})
```

### 2.5 Consent-Aware

En el futuro (v2), se implementara un banner de consentimiento de cookies. Hasta entonces:

- GA se carga con `strategy="afterInteractive"` (no bloquea la carga)
- Si se necesita consent, se puede condicionar la carga de GA a una cookie de consentimiento
- La arquitectura soporta agregar un CMP (Consent Management Platform) sin cambios estructurales

### 2.6 Boton de Prueba

El boton "Probar" en el admin verifica:

1. Que el `measurement_id` tenga formato valido
2. Que el script se pueda cargar (fetch HEAD al URL de gtag.js)
3. Muestra: "Configuracion valida. GA4 se activara en tu landing page."

---

## 3. Meta Pixel (Facebook)

### 3.1 Configuracion

| Campo      | Tipo | Requerido | Descripcion                             |
| ---------- | ---- | :-------: | --------------------------------------- |
| `pixel_id` | text |    Si     | ID del pixel de Meta (formato numerico) |

### 3.2 Validacion

- El `pixel_id` debe ser un numero de al menos 15 digitos: `/^\d{15,}$/`

### 3.3 Inyeccion del Script

```typescript
// src/components/integrations/MetaPixel.tsx

import Script from 'next/script';

interface MetaPixelProps {
  pixelId: string;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
```

### 3.4 Eventos de Conversion

| Evento               | Nombre Meta Pixel | Cuando                              |
| -------------------- | ----------------- | ----------------------------------- |
| Lead form submit     | `Lead`            | Al enviar el formulario de contacto |
| Newsletter subscribe | `Subscribe`       | Al suscribirse al newsletter        |
| CTA click            | `ViewContent`     | Al hacer clic en CTA principal      |

```typescript
// src/lib/integrations/meta-pixel.ts

export function trackMetaEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', eventName, params)
  }
}

// Uso:
trackMetaEvent('Lead', {
  content_name: 'offer_form',
  content_category: 'landing_page',
})
```

### 3.5 Boton de Prueba

Verifica:

1. Formato numerico del pixel_id
2. Muestra: "Pixel configurado. Los eventos se registraran cuando un visitante interactue con tu pagina."

---

## 4. WhatsApp Floating Button

### 4.1 Configuracion

| Campo             | Tipo                | Requerido | Descripcion                                                                    |
| ----------------- | ------------------- | :-------: | ------------------------------------------------------------------------------ |
| `phone_number`    | text                |    Si     | Numero de telefono con codigo de pais (sin +, sin espacios). Ej: `34600123456` |
| `default_message` | text (multilingual) |    No     | Mensaje predeterminado que se pre-llena en WhatsApp                            |
| `position`        | select              |    No     | Posicion del boton: `bottom-right` (default), `bottom-left`                    |
| `show_tooltip`    | boolean             |    No     | Mostrar tooltip con mensaje al hover                                           |
| `tooltip_text`    | text (multilingual) |    No     | Texto del tooltip. Default: "Chatea con nosotros"                              |
| `delay_seconds`   | number              |    No     | Segundos antes de mostrar el boton (default: 3)                                |
| `show_on_mobile`  | boolean             |    No     | Mostrar en mobile (default: true)                                              |

### 4.2 Componente

```typescript
// src/components/integrations/WhatsAppButton.tsx

'use client';

import { useState, useEffect, type FC } from 'react';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface WhatsAppButtonProps {
  phoneNumber: string;
  defaultMessage?: Record<string, string>;
  position?: 'bottom-right' | 'bottom-left';
  showTooltip?: boolean;
  tooltipText?: Record<string, string>;
  delaySeconds?: number;
  showOnMobile?: boolean;
}

export const WhatsAppButton: FC<WhatsAppButtonProps> = ({
  phoneNumber,
  defaultMessage,
  position = 'bottom-right',
  showTooltip = true,
  tooltipText,
  delaySeconds = 3,
  showOnMobile = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { t, currentLang } = useTranslation();

  // Delay antes de mostrar el boton
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [delaySeconds]);

  if (!visible) return null;

  // Construir URL de WhatsApp
  const message = defaultMessage
    ? encodeURIComponent(t(defaultMessage))
    : '';
  const waUrl = `https://wa.me/${phoneNumber}${message ? `?text=${message}` : ''}`;

  const positionClasses = position === 'bottom-left'
    ? 'left-6 bottom-6'
    : 'right-6 bottom-6';

  return (
    <div
      className={`fixed ${positionClasses} z-50 ${
        !showOnMobile ? 'hidden md:block' : ''
      }`}
    >
      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div
          className={`absolute bottom-16 ${
            position === 'bottom-left' ? 'left-0' : 'right-0'
          } bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap`}
        >
          {tooltipText ? t(tooltipText) : 'Chatea con nosotros'}
          <div
            className={`absolute top-full ${
              position === 'bottom-left' ? 'left-4' : 'right-4'
            } w-3 h-3 bg-white transform rotate-45 -mt-1.5`}
          />
        </div>
      )}

      {/* Boton */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20BA5A] transition-all hover:scale-110"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        aria-label="Contactar por WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};
```

### 4.3 Validacion del Telefono

```typescript
function validateWhatsAppNumber(number: string): boolean {
  // Solo numeros, entre 10 y 15 digitos (incluye codigo de pais)
  return /^\d{10,15}$/.test(number)
}
```

### 4.4 Boton de Prueba

El boton "Probar" abre una nueva pestana con el link de WhatsApp generado:

```
https://wa.me/34600123456?text=Hola,%20me%20interesa...
```

---

## 5. Calendly

### 5.1 Configuracion

| Campo          | Tipo                | Requerido | Descripcion                                                                                                     |
| -------------- | ------------------- | :-------: | --------------------------------------------------------------------------------------------------------------- |
| `calendly_url` | text                |    Si     | URL de Calendly (formato: `https://calendly.com/usuario/evento`)                                                |
| `embed_type`   | select              |    No     | Tipo de embed: `inline` (embebido en seccion), `popup` (boton que abre popup), `popup-widget` (widget flotante) |
| `button_text`  | text (multilingual) |    No     | Texto del boton para modos popup. Default: "Agendar una cita"                                                   |
| `button_color` | color               |    No     | Color del boton. Default: usa primary del tema                                                                  |

### 5.2 Validacion

```typescript
function validateCalendlyUrl(url: string): boolean {
  return /^https:\/\/calendly\.com\/[\w-]+\/[\w-]+\/?$/.test(url)
}
```

### 5.3 Componente Inline

```typescript
// src/components/integrations/CalendlyEmbed.tsx

'use client';

import { useEffect, type FC } from 'react';

interface CalendlyEmbedProps {
  url: string;
  embedType: 'inline' | 'popup' | 'popup-widget';
  buttonText?: string;
  buttonColor?: string;
}

export const CalendlyEmbed: FC<CalendlyEmbedProps> = ({
  url,
  embedType,
  buttonText = 'Agendar una cita',
  buttonColor,
}) => {
  useEffect(() => {
    // Cargar el script de Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (embedType === 'inline') {
    return (
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: '320px', height: '700px' }}
      />
    );
  }

  if (embedType === 'popup') {
    return (
      <button
        onClick={() => {
          if ((window as any).Calendly) {
            (window as any).Calendly.initPopupWidget({ url });
          }
        }}
        className="px-6 py-3 rounded-lg font-bold transition-colors"
        style={{
          backgroundColor: buttonColor ?? 'var(--color-primary)',
          color: 'var(--color-background)',
        }}
      >
        {buttonText}
      </button>
    );
  }

  // popup-widget: Calendly floating widget
  return (
    <div
      className="calendly-badge-widget"
      data-url={url}
      data-text={buttonText}
      data-color={buttonColor ?? '#6366F1'}
    />
  );
};
```

### 5.4 Integracion con Modulos

Calendly puede integrarse con modulos especificos:

- **offer_form**: Agregar boton "Agendar cita" junto al formulario
- **final_cta**: Agregar CTA secundario de Calendly
- **hero**: Reemplazar el CTA secundario con un link de Calendly

La configuracion de en que modulo aparece Calendly se maneja desde el admin de integraciones.

### 5.5 Boton de Prueba

Abre la URL de Calendly en una nueva pestana para verificar que el enlace es correcto.

---

## 6. SMTP / Email Notifications

### 6.1 Configuracion

| Campo                 | Tipo    | Storage            | Requerido | Descripcion                                            |
| --------------------- | ------- | ------------------ | :-------: | ------------------------------------------------------ |
| `host`                | text    | `config`           |    Si     | Servidor SMTP (ej: `smtp.gmail.com`)                   |
| `port`                | number  | `config`           |    Si     | Puerto (465 para SSL, 587 para TLS)                    |
| `secure`              | boolean | `config`           |    Si     | Usar SSL/TLS (true para port 465)                      |
| `from_address`        | text    | `config`           |    Si     | Email remitente                                        |
| `from_name`           | text    | `config`           |    No     | Nombre del remitente                                   |
| `username`            | text    | `sensitive_config` |    Si     | Usuario SMTP                                           |
| `password`            | text    | `sensitive_config` |    Si     | Contrasena SMTP                                        |
| `notification_emails` | text    | `config`           |    Si     | Emails que reciben notificaciones (separados por coma) |

### 6.2 Validacion

- `host`: no vacio, formato hostname valido
- `port`: numero entre 1 y 65535
- `from_address`: formato email valido
- `username` y `password`: no vacios
- `notification_emails`: lista de emails validos separados por coma

### 6.3 Logica de Envio de Notificaciones

```typescript
// src/lib/integrations/email.ts

import nodemailer from 'nodemailer'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  fromAddress: string
  fromName: string
  username: string
  password: string
  notificationEmails: string[]
}

interface LeadData {
  name: string
  email: string
  phone?: string
  message?: string
  sourceModule: string
  formData: Record<string, unknown>
  language: string
  createdAt: string
}

export async function sendLeadNotification(
  smtpConfig: SmtpConfig,
  leadData: LeadData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    })

    const htmlContent = generateLeadEmailHtml(leadData)
    const textContent = generateLeadEmailText(leadData)

    await transporter.sendMail({
      from: `"${smtpConfig.fromName || 'Orion Landing'}" <${smtpConfig.fromAddress}>`,
      to: smtpConfig.notificationEmails.join(', '),
      subject: `Nuevo lead: ${leadData.name || leadData.email} — ${leadData.sourceModule}`,
      text: textContent,
      html: htmlContent,
    })

    return { success: true }
  } catch (error: any) {
    console.error('[Email] Error enviando notificacion:', error.message)
    return { success: false, error: error.message }
  }
}
```

### 6.4 Template de Email

```typescript
function generateLeadEmailHtml(lead: LeadData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6366F1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #eee; }
        .field { margin-bottom: 12px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-top: 4px; }
        .footer { padding: 12px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nuevo Lead Recibido</h2>
          <p>Desde: ${lead.sourceModule}</p>
        </div>
        <div class="content">
          ${
            lead.name
              ? `
          <div class="field">
            <div class="field-label">Nombre</div>
            <div class="field-value">${escapeHtml(lead.name)}</div>
          </div>`
              : ''
          }
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></div>
          </div>
          ${
            lead.phone
              ? `
          <div class="field">
            <div class="field-label">Telefono</div>
            <div class="field-value">${escapeHtml(lead.phone)}</div>
          </div>`
              : ''
          }
          ${
            lead.message
              ? `
          <div class="field">
            <div class="field-label">Mensaje</div>
            <div class="field-value">${escapeHtml(lead.message)}</div>
          </div>`
              : ''
          }
          <div class="field">
            <div class="field-label">Fecha</div>
            <div class="field-value">${new Date(lead.createdAt).toLocaleString()}</div>
          </div>
          <div class="field">
            <div class="field-label">Idioma del visitante</div>
            <div class="field-value">${lead.language}</div>
          </div>
        </div>
        <div class="footer">
          Enviado por Orion Landing Universal
        </div>
      </div>
    </body>
    </html>
  `
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
```

### 6.5 Integracion con el Formulario de Lead

Cuando se recibe un nuevo lead via el formulario de contacto o newsletter:

```typescript
// src/app/api/leads/route.ts

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const body = await request.json()

  // 1. Validar datos del formulario
  // 2. Rate limiting (5 envios por IP por hora)
  // 3. Insertar en tabla leads
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      source_module: body.sourceModule ?? 'offer_form',
      form_data: body.formData ?? {},
      language: body.language,
      ip_address: request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent'),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }

  // 4. Enviar notificacion por email si SMTP esta configurado
  const { data: smtpIntegration } = await supabase
    .from('integrations')
    .select('config, sensitive_config, is_enabled')
    .eq('type', 'smtp')
    .single()

  if (smtpIntegration?.is_enabled) {
    // Enviar en background (no bloquear la respuesta)
    sendLeadNotification(
      {
        host: smtpIntegration.config.host,
        port: smtpIntegration.config.port,
        secure: smtpIntegration.config.secure ?? false,
        fromAddress: smtpIntegration.config.from_address,
        fromName: smtpIntegration.config.from_name ?? 'Orion Landing',
        username: smtpIntegration.sensitive_config.username,
        password: smtpIntegration.sensitive_config.password,
        notificationEmails:
          smtpIntegration.config.notification_emails?.split(',').map((e: string) => e.trim()) ?? [],
      },
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
        sourceModule: body.sourceModule ?? 'offer_form',
        formData: body.formData ?? {},
        language: body.language ?? 'es',
        createdAt: lead.created_at,
      },
    ).catch((err) => console.error('[Email] Failed to send:', err))
  }

  // 5. Retornar exito
  return NextResponse.json({ success: true, id: lead.id })
}
```

### 6.6 Boton de Prueba

Al hacer clic en "Probar" en el admin:

1. El servidor crea un transporter con las credenciales proporcionadas
2. Envia un email de prueba a la primera direccion de `notification_emails`
3. Asunto: "Prueba de configuracion SMTP — Orion Landing"
4. Cuerpo: "Este es un email de prueba. Si lo recibes, la configuracion SMTP esta correcta."
5. Retorna exito o el error especifico (timeout, auth failed, etc.)

```typescript
// src/app/api/integrations/smtp/test/route.ts

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const config = await request.json()

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? false,
      auth: {
        user: config.username,
        pass: config.password,
      },
    })

    // Verificar conexion
    await transporter.verify()

    // Enviar email de prueba
    await transporter.sendMail({
      from: `"Orion Landing" <${config.from_address}>`,
      to: config.notification_emails.split(',')[0].trim(),
      subject: 'Prueba de configuracion SMTP — Orion Landing',
      text: 'Este es un email de prueba. Si lo recibes, la configuracion SMTP esta correcta.',
      html: '<h2>Prueba SMTP</h2><p>Este es un email de prueba. Si lo recibes, la configuracion SMTP esta correcta.</p>',
    })

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${config.notification_emails.split(',')[0].trim()}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Error SMTP: ${error.message}`,
      },
      { status: 400 },
    )
  }
}
```

---

## 7. Custom Scripts

### 7.1 Configuracion

| Campo          | Tipo            | Requerido | Descripcion                                                      |
| -------------- | --------------- | :-------: | ---------------------------------------------------------------- |
| `head_scripts` | textarea (code) |    No     | Scripts para inyectar en `<head>` (tracking, fonts, etc.)        |
| `body_scripts` | textarea (code) |    No     | Scripts para inyectar al final de `<body>` (widgets, chat, etc.) |

### 7.2 Ejemplo de Uso

```html
<!-- head_scripts -->
<script>
  // Codigo de tracking de Hotjar, etc.
  (function(h,o,t,j,a,r){...})(window,document,...);
</script>
<link rel="stylesheet" href="https://cdn.example.com/widget.css" />

<!-- body_scripts -->
<script src="https://cdn.example.com/chat-widget.js"></script>
<script>
  ChatWidget.init({ key: 'xxx' })
</script>
```

### 7.3 Inyeccion Server-Side

Los scripts personalizados se inyectan desde el Server Component, NO mediante eval client-side:

```typescript
// src/app/layout.tsx

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();

  // Obtener scripts personalizados
  const { data: customScripts } = await supabase
    .from('integrations')
    .select('config, is_enabled')
    .eq('type', 'custom_scripts')
    .single();

  const { data: siteConfig } = await supabase
    .from('site_config')
    .select('custom_head_scripts, custom_body_scripts')
    .single();

  const headScripts = customScripts?.is_enabled
    ? customScripts.config.head_scripts
    : siteConfig?.custom_head_scripts;

  const bodyScripts = customScripts?.is_enabled
    ? customScripts.config.body_scripts
    : siteConfig?.custom_body_scripts;

  return (
    <html>
      <head>
        {headScripts && (
          <div dangerouslySetInnerHTML={{ __html: headScripts }} />
        )}
      </head>
      <body>
        {children}
        {bodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />
        )}
      </body>
    </html>
  );
}
```

### 7.4 Advertencia de Seguridad en el Admin

Cuando el admin edita los scripts personalizados, se muestra una advertencia prominente:

```
ADVERTENCIA: Los scripts personalizados se ejecutan directamente en tu pagina.
Solo inserta codigo de fuentes confiables. Codigo malicioso puede comprometer
la seguridad de tu sitio y la privacidad de tus visitantes.

Usos comunes:
- Codigo de tracking (Hotjar, HubSpot, Intercom, etc.)
- Widgets de chat en vivo
- Fuentes personalizadas
- Verificacion de dominio (Google Search Console, Facebook, etc.)
```

---

## 8. Tabla `integrations`

### 8.1 Schema SQL

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  sensitive_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.2 Campo `type` — Valores Permitidos

| Type               | Nombre                          |
| ------------------ | ------------------------------- |
| `google_analytics` | Google Analytics 4              |
| `meta_pixel`       | Meta Pixel (Facebook)           |
| `whatsapp`         | WhatsApp Floating Button        |
| `calendly`         | Calendly                        |
| `smtp`             | Notificaciones por Email (SMTP) |
| `custom_scripts`   | Scripts Personalizados          |

### 8.3 Separacion de Datos Sensibles

| Campo              | Tipo de Datos                                  | Ejemplo                                      |
| ------------------ | ---------------------------------------------- | -------------------------------------------- |
| `config`           | Configuracion no sensible, visible en el admin | `{ "measurement_id": "G-XXXXX" }`            |
| `sensitive_config` | Credenciales y datos sensibles                 | `{ "username": "user", "password": "pass" }` |

**Reglas de `sensitive_config`**:

1. **Nunca se envia al frontend completo**. La API retorna `sensitive_config` con valores enmascarados:
   ```json
   { "username": "us***", "password": "●●●●●●●●" }
   ```
2. Al guardar, si el valor es el enmascarado, se mantiene el valor anterior (no se sobreescribe con la mascara)
3. Los valores reales solo se leen en el servidor (API routes)

```typescript
// src/lib/integrations/mask.ts

export function maskSensitiveConfig(config: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {}
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      masked[key] = ''
    } else if (key === 'password') {
      masked[key] = '\u25CF'.repeat(8) // ●●●●●●●●
    } else {
      // Mostrar primeros 2 caracteres + ***
      masked[key] = value.substring(0, 2) + '***'
    }
  }
  return masked
}

export function isMaskedValue(value: string): boolean {
  return value === '\u25CF'.repeat(8) || value.endsWith('***')
}
```

### 8.4 API de Integraciones

```typescript
// GET /api/integrations — Lista todas (con sensitive_config enmascarado)
// PUT /api/integrations/[type] — Actualizar configuracion
// POST /api/integrations/[type]/test — Probar configuracion

// src/app/api/integrations/[type]/route.ts

export async function PUT(request: Request, { params }: { params: { type: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { is_enabled, config, sensitive_config } = body

  // Obtener configuracion actual
  const { data: current } = await supabase
    .from('integrations')
    .select('sensitive_config')
    .eq('type', params.type)
    .single()

  // Merge sensitive_config: mantener valores existentes para campos enmascarados
  const mergedSensitive: Record<string, string> = {}
  if (sensitive_config) {
    for (const [key, value] of Object.entries(sensitive_config)) {
      if (isMaskedValue(value as string)) {
        // Mantener valor anterior
        mergedSensitive[key] = (current?.sensitive_config as any)?.[key] ?? ''
      } else {
        // Nuevo valor
        mergedSensitive[key] = value as string
      }
    }
  }

  const { data, error } = await supabase
    .from('integrations')
    .update({
      is_enabled,
      config: config ?? {},
      sensitive_config:
        Object.keys(mergedSensitive).length > 0
          ? mergedSensitive
          : (current?.sensitive_config ?? {}),
    })
    .eq('type', params.type)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Retornar con sensitive_config enmascarado
  return NextResponse.json({
    success: true,
    data: {
      ...data,
      sensitive_config: maskSensitiveConfig(data.sensitive_config as Record<string, string>),
    },
  })
}
```

---

## 9. Admin UI

### 9.1 Layout de Integraciones (`/admin/integrations`)

Grid de tarjetas, una por integracion:

```
+------------------------------------------------------------------+
|  INTEGRACIONES                                                     |
|                                                                    |
|  +------------------------+  +------------------------+           |
|  | [GA Icon]              |  | [Meta Icon]            |           |
|  | Google Analytics 4     |  | Meta Pixel             |           |
|  |                        |  |                        |           |
|  | Rastrea visitas y      |  | Pixel de conversion    |           |
|  | eventos en tu pagina   |  | para campanas de Meta  |           |
|  |                        |  |                        |           |
|  | Estado: [Toggle OFF]   |  | Estado: [Toggle OFF]   |           |
|  | [Configurar]           |  | [Configurar]           |           |
|  +------------------------+  +------------------------+           |
|                                                                    |
|  +------------------------+  +------------------------+           |
|  | [WA Icon]              |  | [Cal Icon]             |           |
|  | WhatsApp               |  | Calendly               |           |
|  |                        |  |                        |           |
|  | Boton flotante de      |  | Widget para agendar    |           |
|  | chat via WhatsApp      |  | citas online           |           |
|  |                        |  |                        |           |
|  | Estado: [Toggle OFF]   |  | Estado: [Toggle OFF]   |           |
|  | [Configurar]           |  | [Configurar]           |           |
|  +------------------------+  +------------------------+           |
|                                                                    |
|  +------------------------+  +------------------------+           |
|  | [Mail Icon]            |  | [Code Icon]            |           |
|  | Notificaciones SMTP    |  | Scripts Personalizados |           |
|  |                        |  |                        |           |
|  | Recibe un email cada   |  | Inyecta scripts de     |           |
|  | vez que llega un lead  |  | terceros en tu pagina  |           |
|  |                        |  |                        |           |
|  | Estado: [Toggle OFF]   |  | Estado: [Toggle OFF]   |           |
|  | [Configurar]           |  | [Configurar]           |           |
|  +------------------------+  +------------------------+           |
+------------------------------------------------------------------+
```

### 9.2 Modal de Configuracion

Al hacer clic en "Configurar", se abre un Sheet (panel lateral) o Dialog (modal) con:

1. **Header**: Nombre de la integracion + icono
2. **Toggle de activacion**: Switch prominente arriba
3. **Formulario**: Campos segun la integracion (ver secciones 2-7)
4. **Seccion sensible**: Campos de credenciales con icono de candado, valores enmascarados
5. **Boton "Probar"**: Ejecuta la prueba y muestra resultado
6. **Boton "Guardar"**: Guarda la configuracion
7. **Footer**: Enlace a documentacion de la integracion

### 9.3 Estados Visuales de las Tarjetas

| Estado                      | Visual                                           |
| --------------------------- | ------------------------------------------------ |
| Desactivada, sin configurar | Gris, badge "No configurada"                     |
| Desactivada, configurada    | Gris con borde sutil, badge "Inactiva"           |
| Activada, configurada       | Color vivo, borde primario, badge "Activa" verde |
| Activada, error en config   | Color vivo, borde rojo, badge "Error" rojo       |

---

## 10. Seguridad

### 10.1 Server-Side Script Injection

Los scripts de tracking (GA, Meta Pixel, custom scripts) se inyectan usando `next/script` de Next.js o `dangerouslySetInnerHTML` en componentes del servidor. Esto garantiza que:

- Los scripts se renderizan como HTML estatico desde el servidor
- No se usa `eval()` en el cliente para ejecutar scripts dinamicos
- Los scripts se cargan con la estrategia apropiada (`afterInteractive`, `lazyOnload`)

### 10.2 Sanitizacion de Scripts Personalizados

Para los scripts personalizados (custom_scripts), se aplican estas restricciones:

```typescript
// src/lib/integrations/sanitize.ts

const BLOCKED_PATTERNS = [
  /document\.cookie/gi, // Acceso a cookies
  /localStorage\.clear/gi, // Limpiar storage
  /window\.location\s*=/gi, // Redireccion forzada
  /eval\s*\(/gi, // eval directo
  /new\s+Function/gi, // Creacion dinamica de funciones
  /fetch\s*\(\s*['"]data:/gi, // Data exfiltration
]

export function validateCustomScript(script: string): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(script)) {
      warnings.push(`Patron potencialmente peligroso detectado: ${pattern.source}`)
    }
  }

  return {
    isValid: true, // No bloquear, solo advertir
    warnings,
  }
}
```

**Nota**: No se bloquea la insercion de scripts, solo se advierte al admin. El admin tiene control total de su sitio y es responsable de los scripts que inserta. Bloquear patrones crearia falsos positivos con scripts legitimos.

### 10.3 Content Security Policy (CSP)

Se genera un CSP dinamico basado en las integraciones activas:

```typescript
// src/lib/security/csp.ts

export function generateCSP(activeIntegrations: string[]): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // unsafe-inline necesario para tracking scripts
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'connect-src': ["'self'"],
    'frame-src': ["'self'"],
  }

  // Agregar origenes segun integraciones activas
  if (activeIntegrations.includes('google_analytics')) {
    directives['script-src'].push(
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    )
    directives['connect-src'].push(
      'https://www.google-analytics.com',
      'https://analytics.google.com',
    )
    directives['img-src'].push('https://www.google-analytics.com')
  }

  if (activeIntegrations.includes('meta_pixel')) {
    directives['script-src'].push('https://connect.facebook.net')
    directives['connect-src'].push('https://www.facebook.com')
    directives['img-src'].push('https://www.facebook.com')
  }

  if (activeIntegrations.includes('calendly')) {
    directives['script-src'].push('https://assets.calendly.com')
    directives['frame-src'].push('https://calendly.com')
    directives['style-src'].push('https://assets.calendly.com')
  }

  // Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    directives['connect-src'].push(supabaseUrl)
    directives['img-src'].push(supabaseUrl)
  }

  // Construir el header
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}
```

### 10.4 Encriptacion de Datos Sensibles

En la version actual, los datos sensibles (`sensitive_config`) se almacenan como JSONB plano en Supabase, protegidos por RLS. En el futuro, se puede implementar encriptacion at-rest:

```typescript
// Futuro: encriptar antes de guardar
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32 bytes hex

export function encryptConfig(plaintext: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY!, 'hex'), iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decryptConfig(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':')
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY!, 'hex'),
    Buffer.from(ivHex, 'hex'),
  )
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

**Para v1**: La proteccion se basa en RLS de Supabase (solo usuarios autenticados acceden a `integrations`) y en que `sensitive_config` nunca se envia al frontend sin enmascarar.

---

## Apendice A: Componente IntegrationsLoader

Componente servidor que carga y renderiza todas las integraciones activas:

```typescript
// src/components/integrations/IntegrationsLoader.tsx

import { createServerClient } from '@/lib/supabase/server';
import { GoogleAnalytics } from './GoogleAnalytics';
import { MetaPixel } from './MetaPixel';
import { WhatsAppButton } from './WhatsAppButton';

export async function IntegrationsLoader() {
  const supabase = await createServerClient();

  const { data: integrations } = await supabase
    .from('integrations')
    .select('type, config, is_enabled')
    .eq('is_enabled', true);

  if (!integrations || integrations.length === 0) return null;

  const getConfig = (type: string) =>
    integrations.find(i => i.type === type)?.config;

  return (
    <>
      {/* Scripts en head (via next/script) */}
      {getConfig('google_analytics') && (
        <GoogleAnalytics measurementId={getConfig('google_analytics').measurement_id} />
      )}
      {getConfig('meta_pixel') && (
        <MetaPixel pixelId={getConfig('meta_pixel').pixel_id} />
      )}

      {/* Componentes visuales */}
      {getConfig('whatsapp') && (
        <WhatsAppButton
          phoneNumber={getConfig('whatsapp').phone_number}
          defaultMessage={getConfig('whatsapp').default_message}
          position={getConfig('whatsapp').position}
          showTooltip={getConfig('whatsapp').show_tooltip}
          tooltipText={getConfig('whatsapp').tooltip_text}
          delaySeconds={getConfig('whatsapp').delay_seconds}
          showOnMobile={getConfig('whatsapp').show_on_mobile}
        />
      )}
    </>
  );
}
```

## Apendice B: Evento Unificado de Tracking

Para simplificar el tracking desde los componentes, se implementa un dispatcher unificado:

```typescript
// src/lib/integrations/tracking.ts

interface TrackingEvent {
  name: string
  category?: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
}

/**
 * Dispara un evento a todas las plataformas de tracking activas.
 * Los componentes llaman a esta funcion una sola vez y el dispatcher
 * se encarga de reenviar a GA, Meta Pixel, etc.
 */
export function trackEvent(event: TrackingEvent) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', event.name, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.metadata,
    })
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const fbEventMap: Record<string, string> = {
      generate_lead: 'Lead',
      sign_up: 'Subscribe',
      cta_click: 'ViewContent',
    }
    const fbEventName = fbEventMap[event.name] ?? event.name
    ;(window as any).fbq('track', fbEventName, {
      content_name: event.label,
      content_category: event.category,
      ...event.metadata,
    })
  }
}

// Uso en componentes:
// trackEvent({ name: 'generate_lead', category: 'conversion', label: 'offer_form' });
```
