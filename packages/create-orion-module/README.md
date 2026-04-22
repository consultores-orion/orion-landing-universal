# create-orion-module

Interactive CLI to scaffold new modules for [Orion Landing Universal](https://github.com/orion-ai-society/orion-landing-universal).

## Usage

Run from the root of your Orion Landing Universal project:

```bash
# Interactive mode — prompts for all values
npx create-orion-module

# Pass module name directly — still prompts for display name, description, and category
npx create-orion-module my-module-name
```

### Interactive prompts

```
create-orion-module v0.1.0

Orion Landing Universal — Module Scaffold

Module name (kebab-case, e.g. "testimonial-slider"): testimonial-slider
Display name (e.g. "Testimonial Slider") [TestimonialSlider]: Testimonial Slider
Short description [Testimonial Slider module]: Scrolling testimonials carousel

Categories: header | content | social | conversion | info | footer
Category [content]: social
```

## What it generates

Running the CLI creates the following 5 files inside `src/components/modules/{name}/`:

| File               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `{Name}Module.tsx` | React component — implement your JSX here                     |
| `{name}.types.ts`  | TypeScript interface for the module's content shape           |
| `{name}.schema.ts` | Admin panel field definitions (type, label, i18n, validation) |
| `{name}.seed.ts`   | Default/demo content used during setup                        |
| `index.ts`         | Barrel re-exports for the module                              |

After scaffolding, the CLI prints the registry entry you need to add manually to `src/lib/modules/registry.ts`.

## Requirements

- **Node.js 18+**
- Must be run from the **root directory** of an Orion Landing Universal project (the directory that contains `src/components/modules/`)

## Main project

Full documentation and source code: [orion-ai-society/orion-landing-universal](https://github.com/orion-ai-society/orion-landing-universal)

## License

MIT
