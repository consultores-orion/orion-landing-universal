# Screen Reader Testing Guide — Orion Landing Universal

> **Version**: 1.0 | **Session**: S14 | **Date**: 2026-04-05
> **WCAG Target**: 2.1 Level AA
> **Coverage**: Landing page (`/`), Setup wizard (`/setup`), Admin panel (`/admin`)

---

## Table of Contents

1. [Setup Instructions](#1-setup-instructions)
   - [VoiceOver on macOS](#11-voiceover-on-macos)
   - [NVDA on Windows](#12-nvda-on-windows)
   - [Key Navigation Commands](#13-key-navigation-commands)
   - [Navigating Orion Landing Specifically](#14-navigating-orion-landing-specifically)
2. [Test Scenarios](#2-test-scenarios)
3. [Known Limitations](#3-known-limitations)
4. [Reporting Format](#4-reporting-format)
5. [Remediation Guide](#5-remediation-guide)

---

## 1. Setup Instructions

### 1.1 VoiceOver on macOS

**Requirement**: macOS 12+ (Monterey or later recommended)

#### Enable / Disable

| Action                 | Command                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| Toggle VoiceOver       | `Cmd + F5`                                                               |
| Open VoiceOver Utility | `Cmd + F5` (hold for 3 s) or System Settings → Accessibility → VoiceOver |

#### First-time setup

1. Open System Settings → Accessibility → VoiceOver → Enable VoiceOver.
2. At the tutorial prompt, press **Space** to skip or follow it for 10 minutes to learn the basics.
3. Set the VoiceOver speech rate: `VO + Cmd + Right/Left Arrow` (VO = `Control + Option`).
4. Use **Safari** as the test browser — it has the best VoiceOver integration on macOS. Chrome is acceptable for a second pass.

#### Essential VoiceOver navigation

| Action                | Keys                                      |
| --------------------- | ----------------------------------------- |
| **VO modifier**       | `Control + Option` (abbreviated as VO)    |
| Read next item        | `VO + Right Arrow`                        |
| Read previous item    | `VO + Left Arrow`                         |
| Interact with element | `VO + Shift + Down Arrow`                 |
| Stop interacting      | `VO + Shift + Up Arrow`                   |
| Activate (click)      | `VO + Space`                              |
| Open Web Rotor        | `VO + U`                                  |
| Next heading          | `VO + Cmd + H`                            |
| Next link             | `VO + Cmd + L`                            |
| Next form control     | `VO + Cmd + J`                            |
| Next landmark         | `VO + Cmd + N` (or use Rotor → Landmarks) |
| Next table            | `VO + Cmd + T`                            |
| Read entire page      | `VO + A`                                  |
| Stop reading          | `Control`                                 |
| Tab to next focusable | `Tab`                                     |

#### Web Rotor (VO + U)

The Rotor lets you jump by element type. Press `VO + U`, then use Left/Right arrows to switch category (Headings, Links, Form Controls, Landmarks, etc.), then Up/Down to navigate items within a category. Press `Enter` to jump to an item.

---

### 1.2 NVDA on Windows

**Requirement**: Windows 10 or later | **Cost**: Free (open source)

#### Install NVDA

1. Download the installer from [https://www.nvaccess.org/download/](https://www.nvaccess.org/download/).
2. Run `nvda_YYYY.X.X.exe` and follow the prompts.
3. NVDA starts automatically after installation.
4. Use **Firefox** or **Chrome** for testing — both have good NVDA support. Avoid Edge for initial tests.

#### Enable / Disable

| Action             | Keys                                                  |
| ------------------ | ----------------------------------------------------- |
| Toggle NVDA        | `Ctrl + Alt + N` (launch), system tray → Exit (close) |
| Mute/unmute speech | `Insert + S` (toggle)                                 |
| Toggle speech mode | `Insert + S` (cycle)                                  |

#### Browse mode vs Focus mode

NVDA operates in two modes in browsers:

- **Browse mode** (default): Arrow keys read through content. NVDA intercepts most key presses for navigation.
- **Focus mode**: Active inside forms and interactive regions. `Tab` moves between controls. NVDA announces form elements and their labels.
- Toggle manually: `Insert + Space`
- NVDA switches automatically when you enter a form field.

#### Essential NVDA navigation

| Action                | Keys                                  |
| --------------------- | ------------------------------------- |
| **NVDA modifier**     | `Insert` or `CapsLock` (configurable) |
| Next/previous item    | `Down Arrow / Up Arrow` (Browse mode) |
| Next heading          | `H`                                   |
| Heading level N       | `1` – `6`                             |
| Next landmark         | `D`                                   |
| Next link             | `K`                                   |
| Next form field       | `F`                                   |
| Next button           | `B`                                   |
| Next list             | `L`                                   |
| Next table            | `T`                                   |
| Tab to next focusable | `Tab`                                 |
| Activate element      | `Enter`                               |
| Open Elements List    | `Insert + F7`                         |
| Read current line     | `Insert + Up Arrow`                   |
| Read from cursor      | `Insert + Down Arrow`                 |
| Stop reading          | `Control`                             |

#### NVDA Elements List (`Insert + F7`)

Equivalent to VoiceOver's Rotor. Lists headings, links, form fields, buttons, and landmarks. Use to audit structure without reading the whole page.

---

### 1.3 Key Navigation Commands

Quick reference comparing both screen readers for the tests below:

| Task                    | VoiceOver (macOS/Safari)  | NVDA (Windows/Firefox) |
| ----------------------- | ------------------------- | ---------------------- |
| Navigate by heading     | `VO + Cmd + H`            | `H`                    |
| Navigate by landmark    | `VO + Cmd + N` or Rotor   | `D`                    |
| Navigate by form field  | `VO + Cmd + J`            | `F`                    |
| Navigate by button      | Rotor → Buttons           | `B`                    |
| Navigate by link        | `VO + Cmd + L`            | `K`                    |
| Activate button/link    | `VO + Space`              | `Enter`                |
| Move into region        | `VO + Shift + Down Arrow` | Auto                   |
| Tab through interactive | `Tab`                     | `Tab`                  |
| Open elements panel     | `VO + U` (Rotor)          | `Insert + F7`          |

---

### 1.4 Navigating Orion Landing Specifically

**Prerequisites before testing**:

1. Supabase configured and `setup_completed = true` in `site_config`.
2. At least one module enabled (hero recommended).
3. The dev or production server running: `pnpm dev` or `pnpm start`.
4. Open the root URL (`http://localhost:3000`) in the test browser.

**Page structure to expect** (as rendered by `src/app/layout.tsx` and `src/app/(public)/page.tsx`):

```
<html lang="es">
  <body>
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
    <header>                   ← SiteHeaderClient
    <main id="main-content">   ← page.tsx — all modules render here
      <section id="hero">
      <section id="newsletter">
      ...
    </main>
    <footer>                   ← FooterModule (if enabled)
```

The skip link text is `"Saltar al contenido principal"` (Spanish default). If i18n is configured for English, verify the active language.

---

## 2. Test Scenarios

Each test case follows the format: ID, component/file, steps, expected behavior, and pass/fail criteria.

---

### TC-01 — Skip Link

**Component**: `src/app/layout.tsx` (line 24)
**WCAG criterion**: 2.4.1 Bypass Blocks (Level A)

**Steps**:

1. Open the landing page (`/`) in the browser.
2. Do NOT click anywhere.
3. Press `Tab` once.

**Expected behavior**:

- A link visually appears at the top of the page with the text "Saltar al contenido principal".
- The screen reader announces: _"Saltar al contenido principal, link"_.
- Press `Enter` (or `VO + Space`): focus moves to `<main id="main-content">`.
- The screen reader announces the main landmark or the first heading within it.

**Pass criteria**:

- [ ] Link is announced on first Tab press.
- [ ] Link text is read in full.
- [ ] Activating the link moves focus past the header navigation.
- [ ] No further Tab presses are required to reach main content after activation.

**Fail indicators**:

- Skip link is not announced (check `.skip-link` CSS — it should only be visually hidden when unfocused, not `display:none`).
- Pressing Enter does not move focus (`tabIndex={-1}` must be present on `<main>`; verify `src/app/(public)/page.tsx` line 120).
- Focus moves but screen reader does not announce the landmark.

---

### TC-02 — Page Landmarks

**Component**: `src/app/layout.tsx`, `src/app/(public)/page.tsx`, `src/components/shared/ModuleWrapper.tsx`
**WCAG criterion**: 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value (Level A)

**Steps**:

1. Open the landing page.
2. Use landmark navigation: `VO + Cmd + N` (VoiceOver) or `D` (NVDA).
3. Cycle through all landmarks.

**Expected behavior**:

| Landmark            | Role announced | Label announced                                |
| ------------------- | -------------- | ---------------------------------------------- |
| Site header         | "banner"       | (none required)                                |
| Main navigation     | "navigation"   | "Navegación principal"                         |
| Main content        | "main"         | (none required)                                |
| Each module section | "region"       | module section_key (e.g. "hero", "newsletter") |
| Footer              | "contentinfo"  | (none required)                                |

**Pass criteria**:

- [ ] `<header>` announced as "banner" landmark.
- [ ] `<nav aria-label="Navegación principal">` announced as "navigation, Navegación principal".
- [ ] `<main id="main-content">` announced as "main" landmark.
- [ ] Footer `<footer>` announced as "contentinfo".
- [ ] Mobile nav (`<nav aria-label="Navegación móvil">`) is announced separately when open.

**Fail indicators**:

- No landmarks found (ModuleWrapper must emit `<section>` with appropriate roles).
- Main landmark missing (check `id="main-content"` on `<main>` in `page.tsx`).

---

### TC-03 — Headings Hierarchy

**Component**: All modules — each module's `<h2>` or `<h3>`, HeroModule `<h1>`
**WCAG criterion**: 1.3.1 Info and Relationships (Level A)

**Steps**:

1. Open landing page.
2. Open the headings list: `VO + U` → Headings (VoiceOver) or `Insert + F7` → Headings (NVDA).
3. Read through the complete heading list.

**Expected heading structure**:

```
H1: [Site title / Hero headline]        ← src/components/modules/hero/HeroModule.tsx
  H2: [Section title per module]        ← e.g. Newsletter, Gallery, Stats sections
    H3: [Sub-items where applicable]    ← e.g. FAQ accordion items, Pricing plan names
```

**Pass criteria**:

- [ ] Exactly one `<h1>` on the page (hero title rendered via `EditableText as="h1"`).
- [ ] Each module section title is `<h2>`.
- [ ] No heading levels are skipped (H1 → H3 without H2 is a failure).
- [ ] Headings make logical sense when read out of page context.
- [ ] No purely decorative text is marked as a heading.

**Fail indicators**:

- Multiple `<h1>` elements.
- A module uses `<h4>` or `<h5>` where `<h2>` is expected.
- Heading text is empty (screen reader announces "heading level 2, blank").

---

### TC-04 — Hero Module CTA Button

**Component**: `src/components/modules/hero/HeroModule.tsx`
**WCAG criterion**: 2.4.6 Headings and Labels, 4.1.2 Name, Role, Value (Level AA)

**Steps**:

1. Open landing page.
2. Navigate to the hero section (press `H` to reach the H1 heading).
3. Press `Tab` to move to the CTA button(s).
4. Listen to the full announcement.

**Expected behavior**:

- Screen reader announces: _"[Button label text], button"_.
- If the button is a link (`<a>` rendered as button): _"[Button label text], link"_.
- The announcement does NOT include "button button" or read decorative icons.

**Pass criteria**:

- [ ] Button label is descriptive (not just "Click here" or "Submit").
- [ ] Decorative icons within the button have `aria-hidden="true"`.
- [ ] If there are two CTAs (primary + secondary), both have distinct accessible names.
- [ ] No duplicate announcements (icon text + label text together).

**Fail indicators**:

- Button announced as "button" with no label.
- Icon SVG text read aloud (missing `aria-hidden="true"` on icon).
- Two different buttons announced identically.

---

### TC-05 — Language Selector

**Component**: `src/components/shared/LanguageSelector.tsx`
**WCAG criterion**: 4.1.2 Name, Role, Value (Level A)

**Steps** (buttons variant — used in `SiteHeaderClient`):

1. Navigate to the site header.
2. Tab to the language selector group.
3. Listen to the group announcement.
4. Tab through individual language buttons.
5. Activate an inactive language button.
6. Listen to the state change announcement.

**Expected behavior**:

- Group announced: _"Seleccionar idioma, group"_.
- Each button announced: _"[native_name of language], toggle button, [pressed/not pressed]"_.
  - Example: _"Español, toggle button, pressed"_ / _"English, toggle button, not pressed"_.
- After activating a language button: _"[language name], toggle button, pressed"_.

**Steps** (dropdown variant — if configured):

1. Tab to the `<select>` element.
2. Listen to announcement: _"Seleccionar idioma, [current value], combo box"_.
3. Open with `Space` or `Alt + Down Arrow` (Windows).
4. Navigate options with Arrow keys.

**Pass criteria**:

- [ ] Group label "Seleccionar idioma" is announced.
- [ ] `aria-pressed` state is announced for each button.
- [ ] `aria-label` with `native_name` is read (not the flag emoji alone).
- [ ] Selecting a language updates `aria-pressed` states correctly.

**Fail indicators**:

- Only the flag emoji is announced (missing `aria-label`).
- No pressed/not pressed state announced (missing `aria-pressed`).
- Group label not announced (missing `role="group"` + `aria-label`).

---

### TC-06 — Mobile Menu (SiteHeaderClient)

**Component**: `src/components/shared/SiteHeaderClient.tsx`
**WCAG criterion**: 4.1.2 Name, Role, Value; 2.1.1 Keyboard (Level A)

**Steps**:

1. Resize browser to mobile width (< 768px) or use browser DevTools device emulation.
2. Tab to the hamburger button.
3. Listen to the announcement.
4. Activate the button (`Enter` or `Space`).
5. Listen to the state change announcement.
6. Press `Escape`.
7. Listen to the announcement and verify focus position.

**Expected behavior**:

- Closed state: _"Abrir menú, button, collapsed"_ (or _"Abrir menú, toggle button, not pressed"_ depending on AT).
- After activation: _"Cerrar menú, button, expanded"_.
- Mobile menu `<nav id="mobile-menu">` announced when opened: _"Navegación móvil, navigation"_.
- `Escape` closes the menu. Focus returns to the hamburger button.
- Closed state re-announced: _"Abrir menú, button, collapsed"_.

**Implementation notes** (for testers):

- Button uses `aria-label` that changes between "Abrir menú" and "Cerrar menú" (`SiteHeaderClient.tsx`, line 63).
- Button uses `aria-expanded` (line 65) and `aria-controls="mobile-menu"` (line 66).
- Escape handler in `useEffect` (line 22-28): fires on `document.keydown` when `isMenuOpen` is true.

**Pass criteria**:

- [ ] Button label changes between open and closed states.
- [ ] `aria-expanded` announced as "expanded" / "collapsed".
- [ ] Mobile menu region is announced when opened.
- [ ] `Escape` closes menu without JavaScript errors.
- [ ] Focus remains on the hamburger button after `Escape`.
- [ ] Icons inside button have `aria-hidden="true"` (lines 79, 97).

**Fail indicators**:

- Button always announced as "Abrir menú" regardless of state.
- `Escape` does not close menu (only affects component when `isMenuOpen` is true).
- Focus disappears after `Escape` (lost focus / moved to `<body>`).

---

### TC-07 — Gallery Module Lightbox

**Component**: `src/components/modules/gallery/GalleryModule.tsx`
**WCAG criterion**: 2.1.1 Keyboard; 1.3.1 Info and Relationships; 2.4.3 Focus Order (Level A/AA)

**Steps — Opening**:

1. Navigate to the Gallery module section.
2. Tab to the first image trigger button.
3. Listen to the announcement.
4. Activate the button (`Enter` or `Space`).
5. Listen to focus destination and announcement.

**Expected behavior on open**:

- Trigger button announced: _"Ver imagen: [alt text of image], button"_.
- Lightbox opens and focus moves to the close button.
- Close button announced: _"Cerrar visor, button"_.
- Dialog itself announced: _"Visor de imágenes, dialog"_ (or _"Visor de imágenes, modal dialog"_).
- Screen reader does NOT read content outside the dialog (aria-modal).

**Steps — Navigation inside lightbox**:

1. After lightbox opens, press `Tab`.
2. Cycle through: close button → previous button → next button.
3. Press `Arrow Right` to advance to next image.
4. Listen to counter announcement.

**Expected behavior inside lightbox**:

- Previous button: _"Imagen anterior, button"_ (disabled on first image: _"Imagen anterior, button, dimmed"_).
- Next button: _"Imagen siguiente, button"_ (disabled on last image).
- Image counter: announced via `aria-live="polite" aria-atomic="true"` — _"2 / 5"_ after navigating.

**Steps — Closing**:

1. Press `Escape`.
2. Listen to focus destination.

**Expected behavior on close**:

- Lightbox closes.
- Focus returns to the trigger button that opened the lightbox.
- Screen reader announces the trigger button again.

**Implementation notes** (for testers):

- Focus management: `closeButtonRef` (`line 40`), `triggerRef` (`line 41`).
- `useEffect` for focus: lines 44-51.
- Keyboard handler: lines 53-63 (Escape, ArrowRight, ArrowLeft).
- Dialog: `role="dialog" aria-modal="true" aria-label="Visor de imágenes"` (lines 138-140).

**Pass criteria**:

- [ ] Trigger button has meaningful `aria-label` with image alt text.
- [ ] Focus moves to close button when lightbox opens.
- [ ] Dialog announced as "dialog" or "modal dialog".
- [ ] Content outside dialog is not read while lightbox is open (`aria-modal="true"`).
- [ ] `Escape` closes lightbox and restores focus to trigger.
- [ ] Image counter updates are announced via live region.
- [ ] Previous/next buttons disabled state is announced.

**Fail indicators**:

- Focus stays behind the lightbox overlay after opening.
- Background content is read while the dialog is open.
- `Escape` does not close the dialog.
- After closing, focus moves to `<body>` instead of the trigger.

---

### TC-08 — Newsletter Module Success Message

**Component**: `src/components/modules/newsletter/NewsletterModule.tsx`
**WCAG criterion**: 4.1.3 Status Messages (Level AA)

**Steps**:

1. Navigate to the Newsletter module section.
2. Tab to the email input field.
3. Listen to the label announcement.
4. Type a valid email address.
5. Tab to the subscribe button and press `Enter`.
6. Wait for the success state.
7. Listen for the announcement WITHOUT moving focus.

**Expected behavior**:

- Email input: _"Tu dirección de email, text field"_ (from `aria-label`, line 109).
- After submission: the success `<div role="status" aria-live="polite">` is announced automatically.
- Announcement: _"[success_title text] [success_message text]"_ — without the user needing to navigate to it.

**Steps — Error path**:

1. Submit the form with an invalid email.
2. Listen for the error announcement.

**Expected behavior (error)**:

- Error `<p role="alert">` is announced immediately: _"Email inválido"_ (or English equivalent).
- `aria-invalid="true"` on the input changes announcement: _"Tu dirección de email, invalid, text field"_.

**Pass criteria**:

- [ ] Email input label is read before the input type.
- [ ] Success message announced automatically via live region (no focus movement required).
- [ ] Error message announced via `role="alert"` immediately.
- [ ] `aria-invalid` state changes are announced.

**Fail indicators**:

- Success message appears visually but is not announced.
- User must Tab to the success message to hear it.
- Error message not announced automatically.

---

### TC-09 — OfferForm Module Success Message

**Component**: `src/components/modules/offer-form/OfferFormModule.tsx`
**WCAG criterion**: 4.1.3 Status Messages (Level AA)

**Steps**:

1. Navigate to the Offer Form (lead capture form) section.
2. Tab through each form field and listen to label announcements.
3. Fill in valid data and submit.
4. Listen for the success announcement.

**Expected behavior**:

- Each field: label text announced before field type.
- Required fields: may announce "required" depending on AT (from `required` attribute or `aria-required`).
- Success `<div role="status" aria-live="polite">` is announced without focus movement.

**Pass criteria**:

- [ ] All form labels are read before their associated inputs.
- [ ] Success state announced via live region.
- [ ] Form is keyboard-navigable (Tab through all fields, Enter to submit).

---

### TC-10 — Client Logos Module

**Component**: `src/components/modules/client-logos/ClientLogosModule.tsx`
**WCAG criterion**: 1.1.1 Non-text Content (Level A); 2.2.2 Pause, Stop, Hide (Level A)

**Steps**:

1. Navigate to the Client Logos section.
2. Listen to what the screen reader announces in the region.
3. Check if the marquee animation is announced.

**Expected behavior**:

- The animated marquee `<div aria-hidden="true">` (line 77): NOT announced by screen reader.
- The screen-reader-only list `<ul class="sr-only" aria-label="Clientes">` (line 68): announced as _"Clientes, list"_.
- Individual logos announced as list items: _"[logo.name]"_.
- No duplicate readings (the marquee duplicates logos internally, but the sr-only list has each logo once).

**Implementation notes**:

- `@media (prefers-reduced-motion: reduce)` pauses the marquee animation (line 19 of component).
- The sr-only list uses `className="sr-only"` — visually hidden via Tailwind but present in DOM.

**Pass criteria**:

- [ ] Screen reader does NOT read the animated marquee content.
- [ ] Screen reader reads the sr-only list of client names.
- [ ] `aria-label="Clientes"` announced for the list.
- [ ] No individual logo images in marquee are announced (they are inside `aria-hidden`).

**Fail indicators**:

- Screen reader reads the client names twice (marquee visible to AT + sr-only list).
- Animated marquee content is read (aria-hidden not applied or overridden by CSS).
- sr-only list not found by AT (check that `sr-only` utility CSS is present in build).

---

### TC-11 — Forms — Label Associations

**Component**: All form-containing modules — `NewsletterModule`, `OfferFormModule`, `src/app/setup/`
**WCAG criterion**: 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions (Level A)

**Steps**:

1. Navigate to any form on the site.
2. Use form field navigation (`VO + Cmd + J` / `F`).
3. For each field, listen to the full announcement before typing.

**Expected behavior** — Full announcement format:

```
[Label text], [field type], [additional state if any]
```

Examples:

- _"Tu dirección de email, text field"_
- _"Nombre completo, text field, required"_
- _"Mensaje, text area"_

**Setup wizard specific** (`/setup/connect` and `/setup/admin`):

- Password fields: _"[label], secure text field"_.
- Eye-toggle button (show/hide password): _"Mostrar contraseña, button"_ or _"Ocultar contraseña, button"_.
- The eye-toggle uses `aria-label` that updates based on state (see `src/app/setup/connect/page.tsx`).

**Pass criteria**:

- [ ] Label text read BEFORE field type (not "text field, Email").
- [ ] `<input type="password">` announced as "secure text field" (VoiceOver) or "password" (NVDA).
- [ ] Eye-toggle button has descriptive aria-label (not just an icon).
- [ ] No fields announced as "unlabeled" or "edit text".

**Fail indicators**:

- Placeholder text announced as the label (using placeholder instead of `<label>` or `aria-label`).
- Field announced as "unlabeled combo box" or "edit text, blank".
- Eye-toggle announced as "button" with no name.

---

### TC-12 — Admin Panel — Icon Buttons

**Component**: `src/components/admin/AdminTopBar.tsx`, `src/components/admin/media/MediaGrid.tsx`, `src/components/admin/media/MediaPicker.tsx`
**WCAG criterion**: 4.1.2 Name, Role, Value (Level A)
**Note**: Admin is at `/admin` — requires an authenticated user (Supabase Auth session).

**Steps**:

1. Log in to the admin panel.
2. Navigate to any admin section with icon-only buttons (top bar, media grid, etc.).
3. Tab to each icon button.
4. Listen to the announcement.

**Expected behavior**:

- Every icon-only button must be announced with a meaningful name via `aria-label`.
- Example announcements: _"Cerrar sesión, button"_, _"Eliminar archivo, button"_, _"Seleccionar imagen, button"_.
- Icons themselves have `aria-hidden="true"`.

**Pass criteria**:

- [ ] No button announced as simply "button" with no name.
- [ ] `aria-label` text is action-descriptive (not "icon" or "x").
- [ ] Destructive actions (delete) have aria-labels that communicate the consequence.

**Fail indicators**:

- Button announced without a name (_"button"_ only).
- Screen reader reads icon SVG text or path data.

---

## 3. Known Limitations

### 3.1 jsdom Cannot Test Real Screen Reader Behavior

The test suite uses `jsdom` (via Vitest) as the DOM environment. jsdom simulates a browser DOM but:

- It does NOT render CSS, so `color-contrast` checks always fail in `jest-axe` (disabled in `src/__tests__/setup.ts`).
- It does NOT fire real `speech` events — live regions (`aria-live`) are present in the DOM but actual announcement timing cannot be verified programmatically.
- Focus management side effects (e.g., whether `closeButtonRef.current.focus()` actually moves the AT cursor) cannot be confirmed without a real AT session.
- `prefers-reduced-motion` media queries cannot be simulated in jsdom — verify in a real browser with the OS setting enabled.

**Implication**: Pass results from `jest-axe` confirm structural ARIA correctness. They do NOT confirm that a user experience with a real screen reader is acceptable. Both automated and manual testing are mandatory for WCAG AA compliance.

### 3.2 jest-axe Catches Structural Issues, Not Cognitive or UX Issues

`jest-axe` / `axe-core` tests:

- Missing labels, ARIA roles, contrast ratios (when CSS is available), heading structure.

`jest-axe` / `axe-core` does NOT test:

- Whether a label is meaningful (e.g., "Click here" passes the structural check).
- Whether the reading order makes logical sense to a real user.
- Whether live region announcements are timely or disruptive.
- Whether focus order follows visual layout expectations.
- Whether error messages are written in plain language.

Manual testing with real users (especially blind users) is the only reliable way to validate these dimensions.

### 3.3 WCAG Math vs. Real-World Readability

The WCAG 2.1 color contrast algorithm (used in `src/lib/themes/contrast.ts`) computes a mathematical ratio from hex color values. Passing the 4.5:1 ratio for normal text does not guarantee:

- Readability in low-light or bright-light environments.
- Adequate contrast for users with specific types of color vision deficiency (the ratio is luminance-based, not hue-aware).
- Perceived readability on lower-quality screens or at non-standard gamma settings.
- Contrast for text rendered on top of semi-transparent overlays or gradient backgrounds (the hero module's `overlayOpacity` creates dynamic layering).

**Recommendation**: Complement the `contrast.ts` validator with manual review of overlay combinations and test with the [APCA](https://www.myndex.com/APCA/) contrast algorithm as a supplementary check.

### 3.4 Orion-Specific Limitations

| Area                   | Limitation                                                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-modal` support   | Older AT (NVDA < 2021, JAWS < 2021) may not fully honor `aria-modal="true"`, allowing background content to bleed through. A full focus trap implementation would be more robust for the GalleryModule lightbox.                                        |
| Mobile menu focus trap | The mobile menu (`SiteHeaderClient`) closes on `Escape` but does NOT implement a focus trap. A keyboard user can `Tab` out of the menu without closing it.                                                                                              |
| `aria-live` in Next.js | Next.js App Router page transitions do not announce route changes to screen readers. This primarily affects navigation between `/`, `/admin`, and `/setup` — not within-page module navigation.                                                         |
| i18n and AT language   | `<html lang="es">` is hardcoded in `src/app/layout.tsx`. If a user switches to English via the LanguageSelector, the `lang` attribute does NOT update dynamically. Screen readers will continue to use Spanish pronunciation rules for English content. |

---

## 4. Reporting Format

### 4.1 Test Run Header

```
Project:    Orion Landing Universal
Version:    [git tag or commit hash]
Date:       [YYYY-MM-DD]
Tester:     [name]
AT:         [VoiceOver XX.X / NVDA YYYY.X.X]
Browser:    [Safari XX / Firefox XX / Chrome XX]
OS:         [macOS XX.X / Windows 11]
Base URL:   [http://localhost:3000 or production URL]
```

### 4.2 Results Table

| Test ID | Test Name               | Component File                                              | Pass/Fail | Notes |
| ------- | ----------------------- | ----------------------------------------------------------- | --------- | ----- |
| TC-01   | Skip Link               | `src/app/layout.tsx`                                        |           |       |
| TC-02   | Page Landmarks          | `src/app/(public)/page.tsx`                                 |           |       |
| TC-03   | Headings Hierarchy      | All modules                                                 |           |       |
| TC-04   | Hero CTA Button         | `src/components/modules/hero/HeroModule.tsx`                |           |       |
| TC-05   | Language Selector       | `src/components/shared/LanguageSelector.tsx`                |           |       |
| TC-06   | Mobile Menu             | `src/components/shared/SiteHeaderClient.tsx`                |           |       |
| TC-07   | Gallery Lightbox        | `src/components/modules/gallery/GalleryModule.tsx`          |           |       |
| TC-08   | Newsletter Success      | `src/components/modules/newsletter/NewsletterModule.tsx`    |           |       |
| TC-09   | OfferForm Success       | `src/components/modules/offer-form/OfferFormModule.tsx`     |           |       |
| TC-10   | Client Logos Marquee    | `src/components/modules/client-logos/ClientLogosModule.tsx` |           |       |
| TC-11   | Form Label Associations | All forms                                                   |           |       |
| TC-12   | Admin Icon Buttons      | `src/components/admin/`                                     |           |       |

### 4.3 Issue Report Template

For each **Fail**:

```markdown
## Issue: [Short description]

**Test ID**: TC-XX
**Severity**: Critical | Major | Minor | Informational
**WCAG Criterion**: [e.g., 4.1.2 Name, Role, Value (Level A)]
**AT / Browser**: [e.g., NVDA 2024.3 / Firefox 124]

### Observed behavior

[What the screen reader actually announced]

### Expected behavior

[What it should announce]

### Steps to reproduce

1. ...
2. ...

### Affected file

`src/path/to/file.tsx` line [N]

### Suggested fix

[Code snippet or approach]
```

### 4.4 Severity Definitions

| Severity          | Definition                                                           |
| ----------------- | -------------------------------------------------------------------- |
| **Critical**      | Feature is completely inaccessible with AT — blocks task completion. |
| **Major**         | Feature is difficult to use with AT — requires workaround.           |
| **Minor**         | Announcement is suboptimal but task can be completed.                |
| **Informational** | Enhancement — not a WCAG failure, but improves experience.           |

---

## 5. Remediation Guide

Quick reference for the most common screen reader issues found in Next.js / React projects.

### 5.1 Missing Button Label

**Symptom**: Screen reader announces "button" with no name.

**Cause**: Button contains only an icon (SVG or emoji) with no text alternative.

**Fix**:

```tsx
// Before (broken)
<button onClick={handleDelete}>
  <TrashIcon />
</button>

// After (correct)
<button onClick={handleDelete} aria-label="Eliminar archivo">
  <TrashIcon aria-hidden="true" />
</button>
```

---

### 5.2 Live Region Not Announcing

**Symptom**: Success or error message appears visually but screen reader does not announce it.

**Causes and fixes**:

1. **`aria-live` region added to DOM after content**: The live region must exist in the DOM BEFORE the content changes. Conditional rendering (`{status === 'success' && <div role="status">...`) mounts both the region and content simultaneously — AT may miss it.

   ```tsx
   // Problematic: region not in DOM until success
   {
     status === 'success' && (
       <div role="status" aria-live="polite">
         Success!
       </div>
     )
   }

   // Better: region always present, content conditionally rendered
   ;<div role="status" aria-live="polite">
     {status === 'success' && 'Success!'}
   </div>
   ```

   **Note**: The current NewsletterModule uses conditional rendering. If announcements are missed in testing, convert to the always-present pattern.

2. **`role="alert"` vs `role="status"`**: Use `role="alert"` (implicit `aria-live="assertive"`) for errors; `role="status"` (implicit `aria-live="polite"`) for success messages.

3. **`aria-atomic="true"` missing**: Add when the full region should be announced as a unit.

---

### 5.3 Focus Not Moving to Dialog

**Symptom**: Dialog opens visually but screen reader continues reading from the previous position.

**Fix**: Programmatically call `.focus()` on the first interactive element or the dialog container when it mounts.

```tsx
const closeButtonRef = useRef<HTMLButtonElement>(null)
useEffect(() => {
  if (isOpen && closeButtonRef.current) {
    closeButtonRef.current.focus()
  }
}, [isOpen])
```

This pattern is already implemented in `GalleryModule.tsx` (lines 44-51).

---

### 5.4 Focus Not Restored After Dialog Closes

**Symptom**: After closing a dialog, focus moves to `<body>` or is lost entirely.

**Fix**: Store a reference to the element that triggered the dialog and restore focus on close.

```tsx
const triggerRef = useRef<HTMLButtonElement | null>(null)

// On open: save trigger
<button onClick={(e) => { triggerRef.current = e.currentTarget; setOpen(true) }}>

// On close: restore
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus()
    triggerRef.current = null
  }
}, [isOpen])
```

This pattern is implemented in `GalleryModule.tsx` (lines 41-50).

---

### 5.5 Skip Link Does Not Move Focus

**Symptom**: Skip link is activated but content is not reached; user must Tab through navigation again.

**Fix**: The target element must be focusable. Add `tabIndex={-1}` to the target `<main>`.

```tsx
// layout.tsx
<a href="#main-content" className="skip-link">Saltar al contenido principal</a>

// page.tsx
<main id="main-content" tabIndex={-1}>
  {/* modules */}
</main>
```

In the landing `page.tsx`, `<main id="main-content">` exists (line 120) but does NOT have `tabIndex={-1}`. If skip link focus delivery fails in testing, add `tabIndex={-1}` to the main element. The setup layout (`src/app/setup/layout.tsx`) already has this fix applied.

---

### 5.6 `lang` Attribute Not Matching Content Language

**Symptom**: Screen reader pronounces English content with Spanish accent (or vice versa).

**Cause**: `<html lang="es">` is set once in `src/app/layout.tsx`. When the user switches language via LanguageSelector, `lang` is not updated.

**Fix** (enhancement — not a current blocker):

```tsx
// In a Client Component wrapping the layout, update lang dynamically:
useEffect(() => {
  document.documentElement.lang = currentLang
}, [currentLang])
```

This requires coordination with the i18n store (`useI18n` hook). Log as a **Minor** issue for a future session.

---

### 5.7 Marquee / Animation Not Paused for AT

**Symptom**: Animated content is read repeatedly or causes disorientation.

**Current implementation** (ClientLogosModule): Marquee is marked `aria-hidden="true"` and the animated track pauses via `@media (prefers-reduced-motion: reduce)`. An sr-only static list provides the same information.

**Verify in testing**: Enable "Reduce Motion" in OS settings (macOS: System Settings → Accessibility → Display → Reduce Motion; Windows: Settings → Ease of Access → Display → Show animations) and confirm the marquee pauses and the sr-only list is still readable.

---

### 5.8 `aria-pressed` State Not Updating

**Symptom**: Toggle buttons do not announce state changes when activated.

**Cause**: `aria-pressed` is set correctly but the component does not re-render with the new value, or the value is always `true`/`false` regardless of state.

**Correct pattern** (already used in `LanguageSelector.tsx`):

```tsx
<button
  aria-pressed={isActive}   // boolean — true when active
  aria-label={lang.native_name}
  onClick={() => setLang(lang.code)}
>
```

If AT does not announce the new state, verify that the component actually re-renders after `setLang` is called and that `aria-pressed` receives the updated value.

---

_This document was written for S14 of Orion Landing Universal. Update after each session that modifies a11y-relevant components._
