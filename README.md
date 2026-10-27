# JSON to Table

A browser-based workspace for turning JSON into interactive tables. Choose columns, combine filters, sort your data, and export the results as CSV—no account or application backend required.

**Live app:** [ranzxm.github.io/jsontotable](https://ranzxm.github.io/jsontotable/)

## Features

- **Flexible input** — paste JSON, upload a `.json` file, or drag and drop.
- **Column selection** — search headings, show individual columns, or select/hide all columns.
- **Combined filters** — filter text, numbers, ranges, booleans, and empty values using AND or OR logic.
- **Global search** — search values across currently visible columns.
- **Sorting and pagination** — sort by heading; display 10, 25, 50, or 100 rows per page.
- **Focused exports** — download all filtered rows and only selected columns, not just the current page.
- **Light and dark themes** — use the theme button or press `D` when not editing an input.
- **Non-destructive validation** — invalid JSON leaves the previously loaded table intact.

## Tech stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Interface       | React 19, TypeScript |
| Build tool      | Vite 8               |
| Components      | shadcn/ui, Radix UI  |
| Styling         | Tailwind CSS 4       |
| Icons           | Hugeicons            |
| Package manager | Bun                  |

## Getting started

### Prerequisites

- A recent version of [Bun](https://bun.sh/) compatible with the project dependencies.
- Git and a modern browser.

### Installation

```sh
git clone https://github.com/ranzxm/jsontotable.git
cd jsontotable
bun install
bun run dev
```

Open the URL printed by Vite in your terminal. No environment variables are required for the current features.

## Usage

1. Paste JSON in the **Paste JSON** tab, or choose a file in **Upload file**.
2. Click **Create table** after editing JSON. Uploaded files are processed automatically.
3. Open **Columns** to choose which headings to display.
4. Open **Filter**, add conditions, and select **All conditions (AND)** or **Any condition (OR)**.
5. Click a heading to cycle through ascending, descending, and original order.
6. Click **Export CSV** to download the results. **Reset view** clears search, filters, and sorting, and restores all columns.

### Supported JSON

The primary input format is an array of objects:

```json
[
  {
    "name": "Ayu",
    "address": { "city": "Jakarta" },
    "salary": 12000000,
    "active": true,
    "skills": ["Design", "Research"]
  },
  {
    "name": "Bima",
    "address": { "city": "Bandung" },
    "salary": 18000000,
    "active": false
  }
]
```

The resulting headings are `name`, `address.city`, `salary`, `active`, and `skills`.

- A single JSON object is also supported as one row.
- If an object contains top-level array properties, the first array is selected automatically. Use **Source array** to choose another.
- Every item in the source array must be an object. Primitive or mixed arrays are rejected.
- Nested objects are flattened into dot-separated headings. Literal dots in property names are escaped as `\.` to distinguish them from nested paths.
- Arrays inside cells remain JSON text.
- Headings include properties from all rows. Missing properties and `null` values are displayed as `—`.

### Filter behavior

- Search and text comparisons are case-insensitive.
- Global search checks only visible columns; per-column filters remain active when their columns are hidden.
- Filter booleans with **Equals** and the value `true` or `false`.
- Numeric filters accept JSON numbers and numeric strings. Empty values and booleans are not treated as numbers.
- **Between** includes both bounds.
- **Is empty** matches `null`, missing properties, and empty strings.

## Privacy and processing limits

JSON is processed in your browser, not sent to an application server, and not saved for future sessions. Theme preferences are stored in `localStorage`.

| Limit             | Value     |
| ----------------- | --------- |
| JSON/file size    | 5 MB      |
| Rows per table    | 20,000    |
| Columns per table | 200       |
| Object depth      | 20 levels |
| Filter conditions | 20        |

CSV files use UTF-8 with a BOM. Values detected as potential spreadsheet formulas are prefixed with an apostrophe to reduce formula injection risk.

## Development

### Commands

| Command                        | Purpose                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| `bun run dev`                  | Start the development server                                    |
| `bun run build`                | Type-check the project and create a production build in `dist/` |
| `bun run preview`              | Preview the production build locally                            |
| `bun run lint`                 | Run ESLint                                                      |
| `bun run format`               | Format TypeScript and TSX files with Prettier                   |
| `bun tests/table-data.test.ts` | Test parsing, filtering, sorting, and CSV generation            |

### Validation

Run these checks before publishing changes:

```sh
bun tests/table-data.test.ts
bun run lint
bun run build
```

### Project structure

```text
public/                    Static assets
src/
  App.tsx                  Workspace and user interactions
  components/
    ui/                    CLI-generated shadcn/ui components
    theme-provider.tsx     Theme management
  lib/
    table-data.ts          Parsing, validation, filters, sorting, and CSV
    utils.ts               Interface utilities
  index.css                Styles and theme variables
  main.tsx                 Application entry point
tests/
  table-data.test.ts        Data-processing tests
```

### UI components

Add shadcn/ui components through the official CLI:

```sh
bunx --bun shadcn@latest add <component>
```

Preserve the preset in `components.json`, theme variables, and default component designs. Use Bun for dependency management.

## Deployment

### GitHub Pages

The `.github/workflows/deploy-pages.yml` workflow runs tests, lint, and a production build, then deploys automatically on every push to `main`. It can also be triggered manually from the **Actions** tab.

- Pages source: **GitHub Actions** under **Settings → Pages**.
- URL: `https://ranzxm.github.io/jsontotable/`.
- Vite base path: `/jsontotable/`, matching the repository name.

### Other static hosts

```sh
bun install --frozen-lockfile
bun run build
```

Publish the `dist/` directory to a static hosting service. Adjust `base` in `vite.config.ts` to match the deployment path; use `/` when hosting at the domain root. No backend process is required. Run `bun run preview` to check the build before deployment.

## Contributing

Report bugs or suggest improvements through [GitHub Issues](https://github.com/ranzxm/jsontotable/issues). For code changes, describe the updated behavior, include relevant tests, and make sure all validation checks pass.
