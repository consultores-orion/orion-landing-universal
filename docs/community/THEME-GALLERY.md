# Community Theme Gallery

> A curated collection of color palettes and full themes contributed by the Orion Landing community. Download any theme, import it in your admin panel, and go live in seconds.

---

## What is the Theme Gallery?

The Theme Gallery is a community-maintained list of themes built for Orion Landing Universal. Themes follow the standard format defined in [`docs/guides/CUSTOM-THEME.md`](../guides/CUSTOM-THEME.md) and are shared as JSON files you can import directly into any Orion Landing installation.

Each entry in the gallery includes:

- The theme name and author.
- The category / niche it was designed for.
- The dominant palette colors (for a quick visual reference).
- A preview screenshot.

---

## Gallery

| Theme             | Author | Category | Palette | Preview |
| ----------------- | ------ | -------- | ------- | ------- |
| _(submit yours!)_ | —      | —        | —       | —       |

---

## How to Submit a Theme

### Before you start

Read [`docs/guides/CUSTOM-THEME.md`](../guides/CUSTOM-THEME.md) in full. It covers the complete theme format, all CSS variables, the export/import workflow, and marketplace-readiness conventions. Your submission must conform to that format.

### Submission steps

#### Step 1 — Create the theme JSON

Build your theme using the standard `ThemeExport` format. The file must include the `meta` block so gallery tooling can read it:

```json
{
  "version": "1",
  "meta": {
    "name": "Your Theme Name",
    "author": "Your Name",
    "description": "Short description — one sentence.",
    "niches": ["technology"],
    "tags": ["dark", "minimal"],
    "license": "MIT"
  },
  "palette": {
    "name": "Your Palette Name",
    "colors": {
      "primary": "#...",
      "secondary": "#...",
      "accent": "#...",
      "background": "#...",
      "surface": "#...",
      "text_primary": "#...",
      "text_secondary": "#...",
      "success": "#...",
      "error": "#...",
      "warning": "#...",
      "info": "#...",
      "border": "#..."
    }
  },
  "typography": {
    "font_heading": "Inter",
    "font_body": "Inter",
    "base_size": "16px",
    "scale_ratio": 1.25
  },
  "spacing": {
    "section_padding": "comfortable",
    "container_max_width": "1200px",
    "element_gap": "16px"
  },
  "borderRadius": "medium",
  "customColors": {},
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

#### Step 2 — Add it to your fork

In your fork of the repository, add two files inside `themes/community/`:

```
themes/community/
  your-theme-name/
    theme.json          ← The JSON file from Step 1
    preview.png         ← Screenshot, 1200×800px minimum
```

The directory name must be kebab-case and match the `meta.name` field in lowercase (e.g., `corporate-blue`, `emerald-health`).

#### Step 3 — Add a row to this file

Edit `docs/community/THEME-GALLERY.md` in your fork and add a row to the Gallery table:

```markdown
| Your Theme Name | Your Name | technology | #1d4ed8 / #f1f5f9 | ![preview](../../themes/community/your-theme-name/preview.png) |
```

**Column guide**:

| Column   | What to put                                                     |
| -------- | --------------------------------------------------------------- |
| Theme    | Name from `meta.name`                                           |
| Author   | Your name or GitHub username                                    |
| Category | Primary niche (see values in CUSTOM-THEME.md)                   |
| Palette  | Primary and background hex values (e.g. `#1d4ed8 / #f1f5f9`)    |
| Preview  | Relative path to your `preview.png` using markdown image syntax |

#### Step 4 — Open a pull request

Submit a PR with the title `theme: add [Your Theme Name]`. Include a brief description of the theme and its intended niche in the PR body.

---

## Review Criteria

Every submitted theme is reviewed against these criteria before merging:

| Criterion                 | Requirement                                              |
| ------------------------- | -------------------------------------------------------- |
| Contrast — body text      | `text_primary` vs `background` must be ≥ 4.5:1 (WCAG AA) |
| Contrast — secondary text | `text_secondary` vs `background` must be ≥ 3:1           |
| Contrast — button text    | Text on `primary` must be ≥ 4.5:1                        |
| Name                      | Must be unique in the gallery                            |
| Category                  | Must be a non-empty string                               |
| Preview                   | Must be included, minimum 1200×800px                     |
| JSON validity             | Must parse without errors                                |
| License                   | Must be MIT or a compatible open license                 |

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or any WCAG AA tool to verify contrast before submitting.

---

## Using a Community Theme

1. Download the `theme.json` file from the gallery entry you want (click through to the file in the repository).
2. In your Orion Landing admin panel, go to **Admin → Diseño → Importar**.
3. Select the downloaded `.json` file and click **Importar y aplicar**.
4. The page will reload with the new theme applied.

For full import details, including the API route option, see [`docs/guides/CUSTOM-THEME.md#7-importar-un-tema`](../guides/CUSTOM-THEME.md#7-importar-un-tema).

---

## Questions?

Open a [GitHub Discussion](https://github.com/orion-ai-society/orion-landing-universal/discussions) or check the [Contributing guide](../governance/CONTRIBUTING.md).
