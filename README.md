# JSON to Table

React + TypeScript + Vite. Komponen shadcn/ui menggunakan preset dan tema bawaan proyek.

```sh
bun install
bun run dev
```

## Fitur

- Tempel JSON atau unggah/tarik file `.json` (maksimal 5 MB).
- Array objek, satu objek, atau pilih array pada properti tingkat pertama.
- Objek bertingkat menjadi heading `alamat.kota`; titik literal di nama properti di-escape sebagai `\.`. Array dalam sel tetap JSON.
- Pilih/sembunyikan heading, cari pada kolom yang ditampilkan.
- Filter teks, angka, rentang, boolean (`true`/`false`), nilai kosong; gabungkan dengan AND/OR. Kolom tersembunyi tetap dapat difilter.
- Sorting tiga tahap, pagination, ekspor CSV seluruh hasil filter dengan kolom terpilih. Nilai berpotensi formula spreadsheet dinetralkan.
- Semua data diproses di browser; tidak disimpan atau dikirim ke server. Tema tersimpan melalui provider bawaan; tombol tema atau pintasan `D`.

Batas lokal: 20.000 baris, 200 kolom, 20 tingkat objek, 20 kondisi filter. Gunakan worker bila dukungan dataset lebih besar dibutuhkan.

## Validasi

```sh
bun tests/table-data.test.ts
bun run lint
bun run build
```

## Komponen tambahan

```sh
bunx --bun shadcn@latest add <komponen>
```

Pertahankan `components.json`, variabel tema, dan desain komponen yang dihasilkan CLI.
