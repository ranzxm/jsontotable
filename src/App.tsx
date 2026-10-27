import { useDeferredValue, useMemo, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpDownIcon,
  Cancel01Icon,
  ColumnInsertIcon,
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  FilterHorizontalIcon,
  Moon02Icon,
  Search01Icon,
  SourceCodeIcon,
  Sun03Icon,
  Table01Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import { useTheme } from "@/components/theme-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MAX_BYTES,
  cellText,
  compareCells,
  filterError,
  matchesFilter,
  operators,
  parseJson,
  toCsv,
  type Cell,
  type Filter,
  type Operator,
} from "@/lib/table-data"

const sample = JSON.stringify(
  [
    {
      nama: "Ayu Pratama",
      email: "ayu@contoh.id",
      divisi: "Design",
      kota: "Jakarta",
      status: "Full-time",
      gaji: 12000000,
      aktif: true,
    },
    {
      nama: "Bima Saputra",
      email: "bima@contoh.id",
      divisi: "Engineering",
      kota: "Bandung",
      status: "Full-time",
      gaji: 18000000,
      aktif: true,
    },
    {
      nama: "Citra Lestari",
      email: "citra@contoh.id",
      divisi: "Marketing",
      kota: "Surabaya",
      status: "Contract",
      gaji: 9500000,
      aktif: true,
    },
    {
      nama: "Dimas Wijaya",
      email: "dimas@contoh.id",
      divisi: "Engineering",
      kota: "Jakarta",
      status: "Full-time",
      gaji: 22000000,
      aktif: true,
    },
    {
      nama: "Eka Putri",
      email: "eka@contoh.id",
      divisi: "Design",
      kota: "Yogyakarta",
      status: "Freelance",
      gaji: 8500000,
      aktif: false,
    },
    {
      nama: "Fajar Hidayat",
      email: "fajar@contoh.id",
      divisi: "Operations",
      kota: "Bandung",
      status: "Full-time",
      gaji: 11000000,
      aktif: true,
    },
    {
      nama: "Gita Maharani",
      email: "gita@contoh.id",
      divisi: "Marketing",
      kota: "Jakarta",
      status: "Full-time",
      gaji: 13500000,
      aktif: true,
    },
    {
      nama: "Hadi Kusuma",
      email: "hadi@contoh.id",
      divisi: "Engineering",
      kota: "Surabaya",
      status: "Contract",
      gaji: 15000000,
      aktif: false,
    },
    {
      nama: "Indah Permata",
      email: "indah@contoh.id",
      divisi: "Design",
      kota: "Bandung",
      status: "Full-time",
      gaji: 14000000,
      aktif: true,
    },
    {
      nama: "Joko Santoso",
      email: "joko@contoh.id",
      divisi: "Operations",
      kota: "Jakarta",
      status: "Full-time",
      gaji: 10500000,
      aktif: true,
    },
    {
      nama: "Kartika Dewi",
      email: "kartika@contoh.id",
      divisi: "Marketing",
      kota: "Yogyakarta",
      status: "Freelance",
      gaji: 8000000,
      aktif: false,
    },
    {
      nama: "Lukman Hakim",
      email: "lukman@contoh.id",
      divisi: "Engineering",
      kota: "Bandung",
      status: "Full-time",
      gaji: 20000000,
      aktif: true,
    },
  ],
  null,
  2
)
const initialData = parseJson(sample)
type Sort = { column: string; direction: "asc" | "desc" } | null

function CellValue({ value }: { value: Cell | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  if (typeof value === "boolean")
    return (
      <Badge variant={value ? "secondary" : "outline"}>{String(value)}</Badge>
    )
  return (
    <span className={typeof value === "number" ? "font-mono tabular-nums" : ""}>
      {String(value)}
    </span>
  )
}

export function App() {
  const { theme, setTheme } = useTheme()
  const [draft, setDraft] = useState(sample)
  const [appliedText, setAppliedText] = useState(sample)
  const [data, setData] = useState(initialData)
  const [visible, setVisible] = useState(initialData.columns)
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [columnQuery, setColumnQuery] = useState("")
  const [filters, setFilters] = useState<Filter[]>([])
  const [mode, setMode] = useState("and")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [fileName, setFileName] = useState("Data contoh")
  const [importing, setImporting] = useState(false)
  const [inputTab, setInputTab] = useState("paste")
  const fileRef = useRef<HTMLInputElement>(null)
  const nextFilter = useRef(0)
  const dirty = draft !== appliedText

  const filteredRows = useMemo(() => {
    const search = deferredQuery.trim().toLocaleLowerCase()
    const rows = data.rows.filter((row) => {
      if (
        search &&
        !visible.some((column) =>
          cellText(row[column]).toLocaleLowerCase().includes(search)
        )
      )
        return false
      if (!filters.length) return true
      return mode === "and"
        ? filters.every((filter) => matchesFilter(row, filter))
        : filters.some((filter) => matchesFilter(row, filter))
    })
    if (sort)
      rows.sort(
        (a, b) =>
          compareCells(a[sort.column], b[sort.column]) *
          (sort.direction === "asc" ? 1 : -1)
      )
    return rows
  }, [data.rows, deferredQuery, visible, filters, mode, sort])

  const pages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pages)
  const start = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const columnMatches = data.columns.filter((column) =>
    column.toLocaleLowerCase().includes(columnQuery.toLocaleLowerCase())
  )
  const invalidFilters = filters.some((filter) => filterError(filter))

  function resetView() {
    setQuery("")
    setColumnQuery("")
    setFilters([])
    setMode("and")
    setSort(null)
    setPage(1)
    setVisible(data.columns)
  }

  function applyJson(text: string, name: string, source?: string) {
    try {
      const next = parseJson(text, source)
      setData(next)
      setDraft(text)
      setAppliedText(text)
      resetView()
      setVisible(next.columns)
      setFileName(name)
      setError("")
      setMessage(`${next.rows.length} baris berhasil dikonversi.`)
      return true
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "JSON tidak dapat diproses."
      )
      setMessage("")
      return false
    }
  }

  async function importFile(file: File | undefined) {
    if (!file || importing) return
    if (file.size > MAX_BYTES) {
      setError("File terlalu besar. Maksimal 5 MB.")
      return
    }
    setImporting(true)
    try {
      const text = await file.text()
      if (applyJson(text.replace(/^\uFEFF/, ""), file.name))
        setInputTab("paste")
    } catch {
      setError("File tidak dapat dibaca. Coba unggah ulang.")
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function updateFilter(id: number, patch: Partial<Filter>) {
    setFilters((current) =>
      current.map((filter) =>
        filter.id === id ? { ...filter, ...patch } : filter
      )
    )
    setPage(1)
  }

  function addFilter(column = data.columns[0]) {
    if (!column) return
    setFilters((current) => [
      ...current,
      {
        id: nextFilter.current++,
        column,
        operator: "contains",
        value: "",
        upper: "",
      },
    ])
    setFiltersOpen(true)
    setPage(1)
  }

  function toggleColumn(column: string) {
    setVisible((current) =>
      data.columns.filter((key) =>
        key === column ? !current.includes(key) : current.includes(key)
      )
    )
    if (sort?.column === column) setSort(null)
    setPage(1)
  }

  function toggleSort(column: string) {
    setSort(
      sort?.column !== column
        ? { column, direction: "asc" }
        : sort.direction === "asc"
          ? { column, direction: "desc" }
          : null
    )
    setPage(1)
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(draft)
      setMessage("JSON disalin ke clipboard.")
    } catch {
      setError(
        "Tidak dapat menyalin. Pilih teks JSON lalu salin secara manual."
      )
    }
  }

  function exportCsv() {
    let url: string | undefined
    try {
      const blob = new Blob([toCsv(filteredRows, visible)], {
        type: "text/csv;charset=utf-8;",
      })
      url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "hasil-tabel.csv"
      document.body.append(link)
      link.click()
      link.remove()
      setMessage(
        `${filteredRows.length} baris, ${visible.length} kolom diekspor.`
      )
    } catch {
      setError("Ekspor gagal. Coba kembali dengan data yang lebih kecil.")
    } finally {
      if (url) {
        const downloadUrl = url
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background">
        <header className="border-b">
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-8">
            <a
              href="./"
              className="flex items-center gap-2.5"
              aria-label="JSON to Table, beranda"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon
                  icon={Table01Icon}
                  className="size-4.5"
                  strokeWidth={2}
                />
              </div>
              <h1 className="text-sm font-semibold tracking-tight">
                json
                <span className="font-normal text-muted-foreground"> to </span>
                table
              </h1>
            </a>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ganti tema"
                    onClick={() =>
                      setTheme(
                        document.documentElement.classList.contains("dark")
                          ? "light"
                          : "dark"
                      )
                    }
                  >
                    <HugeiconsIcon
                      icon={theme === "dark" ? Sun03Icon : Moon02Icon}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ganti tema · D</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-8">
          <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-4" aria-label="Input JSON">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={SourceCodeIcon}
                      className="size-4 text-muted-foreground"
                    />
                    JSON
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyJson(sample, "Data contoh")}
                      disabled={importing}
                    >
                      Data contoh
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={inputTab} onValueChange={setInputTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="paste">
                        <HugeiconsIcon icon={SourceCodeIcon} />
                        Tempel JSON
                      </TabsTrigger>
                      <TabsTrigger value="upload">
                        <HugeiconsIcon icon={Upload04Icon} />
                        Unggah file
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="paste" className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="json-input" className="sr-only">
                          JSON editor
                        </Label>
                        <div className="flex items-center gap-1">
                          {dirty && (
                            <span className="text-[10px] text-muted-foreground">
                              Belum diterapkan
                            </span>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                aria-label="Salin JSON"
                                onClick={copyJson}
                                disabled={!draft}
                              >
                                <HugeiconsIcon icon={Copy01Icon} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Salin JSON</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Textarea
                        id="json-input"
                        value={draft}
                        onChange={(event) => {
                          setDraft(event.target.value)
                          setError("")
                        }}
                        spellCheck={false}
                        disabled={importing}
                        placeholder={
                          '[\n  { "nama": "Ayu", "kota": "Jakarta" }\n]'
                        }
                        className="h-[390px] min-h-56 resize-y font-mono text-xs leading-relaxed"
                      />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-3">
                      <div
                        className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/20 px-6 text-center"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          void importFile(event.dataTransfer.files[0])
                        }}
                      >
                        <div className="flex size-12 items-center justify-center rounded-lg border bg-background">
                          <HugeiconsIcon
                            icon={Upload04Icon}
                            className="size-5 text-muted-foreground"
                          />
                        </div>
                        <p className="font-medium">Tarik file JSON ke sini</p>
                        <Button
                          variant="outline"
                          onClick={() => fileRef.current?.click()}
                          disabled={importing}
                        >
                          <HugeiconsIcon icon={Upload04Icon} />
                          {importing ? "Membaca file…" : "Pilih file .json"}
                        </Button>
                        <p className="text-muted-foreground">Maksimal 5 MB</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    tabIndex={-1}
                    aria-label="Pilih file JSON"
                    onChange={(event) =>
                      void importFile(event.target.files?.[0])
                    }
                  />
                  {data.sources.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="data-source">Array sumber</Label>
                      <Select
                        value={`source:${data.source ?? ""}`}
                        disabled={dirty || importing}
                        onValueChange={(source) =>
                          applyJson(appliedText, fileName, source.slice(7))
                        }
                      >
                        <SelectTrigger id="data-source" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {data.sources.map((source) => (
                            <SelectItem key={source} value={`source:${source}`}>
                              {source || "(nama properti kosong)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => applyJson(draft, "JSON editor")}
                    disabled={importing}
                  >
                    <HugeiconsIcon icon={Table01Icon} />
                    Buat tabel
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="ml-auto"
                    />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Kosongkan editor"
                        disabled={importing || !draft}
                        onClick={() => {
                          setDraft("")
                          setError("")
                          setMessage(
                            "Editor kosong. Tabel sebelumnya tetap tersedia."
                          )
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kosongkan editor</TooltipContent>
                  </Tooltip>
                </CardFooter>
              </Card>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Gagal</AlertTitle>
                  <AlertDescription>
                    {error} Tabel sebelumnya tidak diubah.
                  </AlertDescription>
                </Alert>
              )}
            </aside>

            <section className="min-w-0 space-y-4" aria-label="Hasil tabel">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Table01Icon}
                      className="size-4 text-muted-foreground"
                    />
                    Tabel
                  </CardTitle>
                  <CardDescription className="max-w-44 truncate sm:max-w-none">
                    {fileName}
                  </CardDescription>
                  <CardAction>
                    <Button
                      variant="outline"
                      disabled={
                        !filteredRows.length ||
                        !visible.length ||
                        invalidFilters
                      }
                      onClick={exportCsv}
                    >
                      <HugeiconsIcon icon={Download04Icon} />
                      Ekspor CSV
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative min-w-36 flex-1">
                        <HugeiconsIcon
                          icon={Search01Icon}
                          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          aria-label="Cari di kolom yang tampil"
                          placeholder="Cari di kolom yang tampil…"
                          value={query}
                          onChange={(event) => {
                            setQuery(event.target.value)
                            setPage(1)
                          }}
                          className="pl-7"
                        />
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={filters.length ? "secondary" : "outline"}
                        >
                          <HugeiconsIcon icon={FilterHorizontalIcon} />
                          Filter
                          {filters.length > 0 && (
                            <Badge variant="outline">{filters.length}</Badge>
                          )}
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={filtersOpen ? "rotate-180" : ""}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <HugeiconsIcon icon={ColumnInsertIcon} />
                            Kolom
                            <Badge variant="secondary">
                              {visible.length}/{data.columns.length}
                            </Badge>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72 space-y-3">
                          <h2 className="text-sm font-medium">Kolom</h2>
                          <Input
                            aria-label="Cari nama kolom"
                            placeholder="Cari heading…"
                            value={columnQuery}
                            onChange={(event) =>
                              setColumnQuery(event.target.value)
                            }
                          />
                          <div className="flex justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setVisible(data.columns)
                                setPage(1)
                              }}
                            >
                              Pilih semua
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setVisible([])
                                setSort(null)
                                setPage(1)
                              }}
                            >
                              Sembunyikan semua
                            </Button>
                          </div>
                          <Separator />
                          <div className="max-h-64 space-y-1 overflow-auto">
                            {columnMatches.map((column) => (
                              <Label
                                key={column}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
                              >
                                <Checkbox
                                  checked={visible.includes(column)}
                                  onCheckedChange={() => toggleColumn(column)}
                                />
                                <span
                                  className="min-w-0 truncate font-mono text-xs"
                                  title={column}
                                >
                                  {column}
                                </span>
                              </Label>
                            ))}
                            {!columnMatches.length && (
                              <p className="py-3 text-center text-xs text-muted-foreground">
                                Heading tidak ditemukan.
                              </p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-3 rounded-lg border bg-muted/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            Cocokkan
                          </span>
                          <Select
                            value={mode}
                            onValueChange={(value) => {
                              setMode(value)
                              setPage(1)
                            }}
                          >
                            <SelectTrigger aria-label="Gabungan filter">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="and">
                                Semua kondisi (AND)
                              </SelectItem>
                              <SelectItem value="or">
                                Salah satu (OR)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {filters.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFilters([])
                              setPage(1)
                            }}
                          >
                            Hapus semua
                          </Button>
                        )}
                      </div>
                      {filters.map((filter, index) => {
                        const noValue =
                          filter.operator === "empty" ||
                          filter.operator === "notEmpty"
                        const numeric = ["gt", "lt", "between"].includes(
                          filter.operator
                        )
                        const validation = filterError(filter)
                        return (
                          <div key={filter.id} className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-5 text-[10px] font-medium text-muted-foreground">
                                {index === 0 ? "IF" : mode.toUpperCase()}
                              </span>
                              <Select
                                value={filter.column}
                                onValueChange={(column) =>
                                  updateFilter(filter.id, { column })
                                }
                              >
                                <SelectTrigger
                                  className="min-w-28 flex-1"
                                  aria-label={`Kolom filter ${index + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {data.columns.map((column) => (
                                    <SelectItem value={column} key={column}>
                                      {column}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={filter.operator}
                                onValueChange={(operator) =>
                                  updateFilter(filter.id, {
                                    operator: operator as Operator,
                                  })
                                }
                              >
                                <SelectTrigger
                                  className="min-w-32 flex-1"
                                  aria-label={`Operator filter ${index + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {operators.map((operator) => (
                                    <SelectItem
                                      key={operator.value}
                                      value={operator.value}
                                    >
                                      {operator.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {!noValue && (
                                <Input
                                  className="min-w-24 flex-1"
                                  type={numeric ? "number" : "text"}
                                  step={numeric ? "any" : undefined}
                                  placeholder={
                                    numeric ? "Angka…" : "Nilai… (true / false)"
                                  }
                                  aria-label={`Nilai filter ${index + 1}`}
                                  aria-invalid={!!validation}
                                  aria-describedby={
                                    validation
                                      ? `filter-error-${filter.id}`
                                      : undefined
                                  }
                                  value={filter.value}
                                  onChange={(event) =>
                                    updateFilter(filter.id, {
                                      value: event.target.value,
                                    })
                                  }
                                />
                              )}
                              {filter.operator === "between" && (
                                <Input
                                  className="min-w-24 flex-1"
                                  type="number"
                                  step="any"
                                  placeholder="Batas atas…"
                                  aria-label={`Batas atas filter ${index + 1}`}
                                  aria-invalid={!!validation}
                                  aria-describedby={
                                    validation
                                      ? `filter-error-${filter.id}`
                                      : undefined
                                  }
                                  value={filter.upper}
                                  onChange={(event) =>
                                    updateFilter(filter.id, {
                                      upper: event.target.value,
                                    })
                                  }
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Hapus filter ${index + 1}`}
                                onClick={() => {
                                  setFilters((current) =>
                                    current.filter(
                                      (item) => item.id !== filter.id
                                    )
                                  )
                                  setPage(1)
                                }}
                              >
                                <HugeiconsIcon icon={Cancel01Icon} />
                              </Button>
                            </div>
                            {validation && (
                              <p
                                id={`filter-error-${filter.id}`}
                                role="alert"
                                className="pl-7 text-xs text-destructive"
                              >
                                {validation}
                              </p>
                            )}
                          </div>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!data.columns.length || filters.length >= 20}
                        onClick={() => addFilter()}
                      >
                        <HugeiconsIcon icon={Add01Icon} />
                        Tambah kondisi
                      </Button>
                      <p className="text-[10px] text-muted-foreground">
                        Filter kolom tersembunyi tetap aktif.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  {(filters.length > 0 || query) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {query && (
                        <Badge variant="secondary" className="gap-1">
                          Cari: {query.slice(0, 30)}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Hapus pencarian"
                            onClick={() => {
                              setQuery("")
                              setPage(1)
                            }}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} />
                          </Button>
                        </Badge>
                      )}
                      {filters.map((filter) => (
                        <Badge
                          variant="secondary"
                          key={filter.id}
                          className="max-w-full gap-1"
                        >
                          <span className="max-w-56 truncate">
                            {filter.column} ·{" "}
                            {
                              operators.find(
                                (item) => item.value === filter.operator
                              )?.label
                            }{" "}
                            {filter.value}
                            {filter.operator === "between"
                              ? `–${filter.upper}`
                              : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Hapus kondisi ${filter.column}`}
                            onClick={() => {
                              setFilters((current) =>
                                current.filter((item) => item.id !== filter.id)
                              )
                              setPage(1)
                            }}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="w-10 pl-4 text-[10px] text-muted-foreground">
                            #
                          </TableHead>
                          {visible.map((column) => (
                            <TableHead
                              key={column}
                              aria-sort={
                                sort?.column === column
                                  ? sort.direction === "asc"
                                    ? "ascending"
                                    : "descending"
                                  : "none"
                              }
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-2 gap-2 font-mono"
                                onClick={() => toggleSort(column)}
                                title={`Urutkan ${column}`}
                              >
                                {column}
                                <HugeiconsIcon
                                  icon={
                                    sort?.column === column
                                      ? ArrowDown01Icon
                                      : ArrowUpDownIcon
                                  }
                                  className={
                                    sort?.column === column &&
                                    sort.direction === "asc"
                                      ? "rotate-180"
                                      : "text-muted-foreground"
                                  }
                                />
                              </Button>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visible.length > 0 &&
                          pageRows.map((row, index) => (
                            <TableRow key={start + index} className="h-12">
                              <TableCell className="pl-4 font-mono text-[10px] text-muted-foreground">
                                {start + index + 1}
                              </TableCell>
                              {visible.map((column) => (
                                <TableCell key={column}>
                                  <div
                                    className="max-w-64 truncate"
                                    title={cellText(row[column])}
                                  >
                                    <CellValue value={row[column]} />
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        {(!visible.length || !pageRows.length) && (
                          <TableRow>
                            <TableCell
                              colSpan={visible.length + 1}
                              className="h-80 text-center whitespace-normal"
                            >
                              <HugeiconsIcon
                                icon={
                                  visible.length
                                    ? Search01Icon
                                    : ColumnInsertIcon
                                }
                                className="mx-auto mb-3 size-7 text-muted-foreground"
                              />
                              <p className="text-sm font-medium">
                                {!visible.length
                                  ? "Belum ada kolom ditampilkan"
                                  : invalidFilters
                                    ? "Lengkapi kondisi filter"
                                    : "Tidak ada data yang cocok"}
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={resetView}
                              >
                                Reset tampilan
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground" role="status">
                      {filteredRows.length ? start + 1 : 0}–
                      {Math.min(start + pageSize, filteredRows.length)} dari{" "}
                      <span className="font-medium text-foreground">
                        {filteredRows.length}
                      </span>{" "}
                      hasil
                    </p>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                          setPageSize(Number(value))
                          setPage(1)
                        }}
                      >
                        <SelectTrigger aria-label="Baris per halaman">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50, 100].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                              {size} / halaman
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Halaman sebelumnya"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} />
                      </Button>
                      <span className="min-w-10 text-center text-xs tabular-nums">
                        {currentPage} / {pages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Halaman berikutnya"
                        disabled={currentPage >= pages}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        <HugeiconsIcon icon={ArrowRight01Icon} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t">
                  <Button variant="ghost" size="sm" onClick={resetView}>
                    Reset tampilan
                  </Button>
                </CardFooter>
              </Card>
              <p
                className="min-h-5 px-1 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            </section>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
