export type Cell = string | number | boolean | null
export type Row = Record<string, Cell>
export type Operator =
  | "contains"
  | "notContains"
  | "equals"
  | "notEquals"
  | "gt"
  | "lt"
  | "between"
  | "empty"
  | "notEmpty"

export type Filter = {
  id: number
  column: string
  operator: Operator
  value: string
  upper: string
}

export const operators: { value: Operator; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Does not contain" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "between", label: "Between" },
  { value: "empty", label: "Is empty" },
  { value: "notEmpty", label: "Is not empty" },
]

export const MAX_BYTES = 5 * 1024 * 1024

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function cellText(value: Cell | undefined): string {
  return value == null ? "" : String(value)
}

function flatten(record: Record<string, unknown>): Row {
  const result: Row = Object.create(null)
  function visit(value: unknown, path: string, depth: number) {
    if (depth > 20)
      throw new Error("JSON is too deeply nested. Maximum depth: 20 levels.")
    if (isRecord(value) && Object.keys(value).length) {
      for (const [key, child] of Object.entries(value)) {
        const escaped = key.replaceAll("\\", "\\\\").replaceAll(".", "\\.")
        visit(child, path ? `${path}.${escaped}` : escaped, depth + 1)
      }
    } else {
      result[path] =
        value === null ||
        typeof value === "string" ||
        typeof value === "boolean"
          ? value
          : typeof value === "number"
            ? Number.isFinite(value)
              ? value
              : String(value)
            : JSON.stringify(value)
    }
  }
  for (const [key, value] of Object.entries(record)) {
    visit(value, key.replaceAll("\\", "\\\\").replaceAll(".", "\\."), 1)
  }
  return result
}

export function parseJson(text: string, requestedSource?: string) {
  // ponytail: browser-only, 5 MB / 20,000 rows / 200 columns; use a worker for larger datasets.
  if (new TextEncoder().encode(text).length > MAX_BYTES)
    throw new Error("JSON must not exceed 5 MB.")
  if (!text.trim()) throw new Error("Paste JSON or upload a file first.")
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("Invalid JSON. Check quotes, commas, and brackets.")
  }
  if (!Array.isArray(parsed) && !isRecord(parsed))
    throw new Error("Use an array of objects or a single JSON object.")

  const sources = isRecord(parsed)
    ? Object.keys(parsed).filter((key) => Array.isArray(parsed[key]))
    : []
  const source =
    requestedSource !== undefined && sources.includes(requestedSource)
      ? requestedSource
      : sources[0]
  const records: unknown[] = Array.isArray(parsed)
    ? parsed
    : source !== undefined && isRecord(parsed) && Array.isArray(parsed[source])
      ? parsed[source]
      : [parsed]
  if (records.length > 20_000) throw new Error("Maximum 20,000 rows per table.")
  const rows = records.map((record, index) => {
    if (!isRecord(record))
      throw new Error(
        `Row ${index + 1} is not an object. Each row must be a JSON object.`
      )
    return flatten(record)
  })
  const columns = [...new Set(rows.flatMap(Object.keys))]
  if (columns.length > 200) throw new Error("Maximum 200 columns per table.")
  if (columns.includes("")) throw new Error("Heading names must not be empty.")
  return { rows, columns, sources, source }
}

function numeric(value: Cell | undefined): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") return undefined
  if (typeof value === "string" && !value.trim()) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

export function filterError(filter: Filter): string | undefined {
  if (["gt", "lt", "between"].includes(filter.operator)) {
    if (numeric(filter.value) === undefined) return "Enter a valid number."
    if (filter.operator === "between") {
      if (numeric(filter.upper) === undefined)
        return "Enter a numeric upper bound."
      if (Number(filter.value) > Number(filter.upper))
        return "The upper bound must be ≥ the lower bound."
    }
  }
}

export function matchesFilter(row: Row, filter: Filter): boolean {
  if (filterError(filter)) return false
  const value = row[filter.column]
  const text = cellText(value).toLocaleLowerCase()
  const query = filter.value.toLocaleLowerCase()
  switch (filter.operator) {
    case "contains":
      return text.includes(query)
    case "notContains":
      return !text.includes(query)
    case "equals":
      return text === query
    case "notEquals":
      return text !== query
    case "empty":
      return value == null || value === ""
    case "notEmpty":
      return value != null && value !== ""
    default: {
      const number = numeric(value)
      if (number === undefined) return false
      if (filter.operator === "gt") return number > Number(filter.value)
      if (filter.operator === "lt") return number < Number(filter.value)
      return number >= Number(filter.value) && number <= Number(filter.upper)
    }
  }
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

export function compareCells(a: Cell | undefined, b: Cell | undefined): number {
  if (a == null) return b == null ? 0 : 1
  if (b == null) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  return collator.compare(cellText(a), cellText(b))
}

export function toCsv(rows: Row[], columns: string[]): string {
  const escape = (value: string) => {
    // Neutralize spreadsheet formulas, including control-character prefixes.
    // eslint-disable-next-line no-control-regex -- Intentional detection of hidden formula prefixes.
    const safe = /^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/.test(value)
      ? `'${value}`
      : value
    return `"${safe.replaceAll('"', '""')}"`
  }
  return (
    "\uFEFF" +
    [columns, ...rows.map((row) => columns.map((key) => cellText(row[key])))]
      .map((record) => record.map(escape).join(","))
      .join("\r\n")
  )
}
