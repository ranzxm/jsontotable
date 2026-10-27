# JSON to Table

Workspace berbasis browser untuk mengubah JSON menjadi tabel interaktif. Pilih kolom, gabungkan kondisi filter, urutkan data, lalu ekspor hasilnya ke CSV—tanpa akun atau backend aplikasi.

**Aplikasi:** [ranzxm.github.io/jsontotable](https://ranzxm.github.io/jsontotable/)

## Fitur utama

- **Input fleksibel** — tempel JSON, unggah file `.json`, atau gunakan drag and drop.
- **Pemilihan kolom** — cari heading, tampilkan kolom tertentu, atau pilih/sembunyikan seluruh kolom.
- **Filter gabungan** — gunakan kondisi teks, angka, rentang, boolean, dan nilai kosong dengan logika AND atau OR.
- **Pencarian global** — cari nilai pada kolom yang sedang ditampilkan.
- **Sorting dan pagination** — urutkan melalui heading; tampilkan 10, 25, 50, atau 100 baris per halaman.
- **Ekspor terarah** — unduh CSV berisi seluruh baris hasil filter dan hanya kolom yang dipilih, bukan sekadar halaman aktif.
- **Tema terang dan gelap** — ganti melalui tombol tema atau pintasan `D` di luar kolom input.
- **Validasi aman** — kesalahan JSON tidak mengganti tabel yang sudah berhasil dimuat.

## Teknologi

| Bagian          | Teknologi            |
| --------------- | -------------------- |
| Antarmuka       | React 19, TypeScript |
| Build tool      | Vite 8               |
| Komponen        | shadcn/ui, Radix UI  |
| Styling         | Tailwind CSS 4       |
| Ikon            | Hugeicons            |
| Package manager | Bun                  |

## Menjalankan secara lokal

### Prasyarat

- [Bun](https://bun.sh/) versi terbaru yang kompatibel dengan dependensi proyek.
- Git dan browser modern.

### Instalasi

```sh
git clone https://github.com/ranzxm/jsontotable.git
cd jsontotable
bun install
bun run dev
```

Buka URL yang ditampilkan Vite di terminal. Tidak diperlukan konfigurasi environment variable untuk menjalankan fitur saat ini.

## Penggunaan

1. Tempel JSON melalui tab **Tempel JSON**, atau pilih file melalui tab **Unggah file**.
2. Klik **Buat tabel** setelah mengedit teks JSON. File yang diunggah diproses otomatis.
3. Buka **Kolom** untuk memilih heading yang ingin ditampilkan.
4. Buka **Filter**, tambahkan kondisi, lalu pilih **Semua kondisi (AND)** atau **Salah satu (OR)**.
5. Klik heading untuk beralih antara urutan naik, turun, dan urutan awal.
6. Klik **Ekspor CSV** untuk mengunduh hasil. Gunakan **Reset tampilan** untuk menghapus pencarian, filter, dan sorting serta menampilkan kembali semua kolom.

### Format JSON

Format utama adalah array berisi objek:

```json
[
  {
    "nama": "Ayu",
    "alamat": { "kota": "Jakarta" },
    "gaji": 12000000,
    "aktif": true,
    "keahlian": ["Design", "Research"]
  },
  {
    "nama": "Bima",
    "alamat": { "kota": "Bandung" },
    "gaji": 18000000,
    "aktif": false
  }
]
```

Heading yang dihasilkan: `nama`, `alamat.kota`, `gaji`, `aktif`, dan `keahlian`.

- Satu objek JSON juga didukung sebagai satu baris.
- Jika objek memiliki properti array pada tingkat pertama, aplikasi memilih array pertama. Gunakan **Array sumber** untuk memilih array lainnya.
- Setiap elemen array sumber harus berupa objek. Array primitif atau campuran ditolak.
- Objek bertingkat diratakan menjadi heading dengan notasi titik. Titik literal pada nama properti di-escape sebagai `\.` agar tidak bertabrakan dengan heading bertingkat.
- Array di dalam sel tetap ditampilkan sebagai teks JSON.
- Heading merupakan gabungan properti seluruh baris. Nilai `null` atau properti yang tidak tersedia ditampilkan sebagai `—`.

### Perilaku filter

- Pencarian dan perbandingan teks tidak membedakan huruf besar/kecil.
- Pencarian global hanya memeriksa kolom yang ditampilkan; filter per kolom tetap aktif meskipun kolomnya disembunyikan.
- Boolean dapat difilter menggunakan **Sama dengan** dan nilai `true` atau `false`.
- Filter angka menerima angka JSON atau teks numerik; nilai kosong dan boolean tidak dianggap angka.
- Kondisi **Di antara** menyertakan batas bawah dan batas atas.
- Kondisi **Kosong** mencakup `null`, properti yang tidak tersedia, dan string kosong.

## Privasi dan batas pemrosesan

Data JSON diproses di browser, tidak dikirim ke server aplikasi, dan tidak disimpan untuk sesi berikutnya. Preferensi tema disimpan di `localStorage`.

| Batas            | Nilai      |
| ---------------- | ---------- |
| Ukuran JSON/file | 5 MB       |
| Baris per tabel  | 20.000     |
| Kolom per tabel  | 200        |
| Kedalaman objek  | 20 tingkat |
| Kondisi filter   | 20         |

CSV menggunakan UTF-8 dengan BOM. Nilai yang terdeteksi berpotensi menjadi formula spreadsheet diberi awalan apostrof untuk mengurangi risiko formula injection.

## Pengembangan

### Perintah

| Perintah                       | Fungsi                                                           |
| ------------------------------ | ---------------------------------------------------------------- |
| `bun run dev`                  | Menjalankan development server                                   |
| `bun run build`                | Memeriksa tipe proyek dan menghasilkan build produksi di `dist/` |
| `bun run preview`              | Meninjau build produksi secara lokal                             |
| `bun run lint`                 | Menjalankan ESLint                                               |
| `bun run format`               | Memformat berkas TypeScript dan TSX dengan Prettier              |
| `bun tests/table-data.test.ts` | Menguji parsing, filter, sorting, dan pembuatan CSV              |

### Pemeriksaan sebelum perubahan dipublikasikan

```sh
bun tests/table-data.test.ts
bun run lint
bun run build
```

### Struktur proyek

```text
public/                    Aset statis
src/
  App.tsx                  Workspace dan interaksi pengguna
  components/
    ui/                    Komponen shadcn/ui dari CLI
    theme-provider.tsx     Pengelolaan tema
  lib/
    table-data.ts          Parsing, validasi, filter, sorting, dan CSV
    utils.ts               Utilitas antarmuka
  index.css                Styling dan variabel tema
  main.tsx                 Entry point aplikasi
tests/
  table-data.test.ts        Pengujian logika pengolahan data
```

### Komponen antarmuka

Gunakan komponen shadcn/ui melalui CLI resmi:

```sh
bunx --bun shadcn@latest add <komponen>
```

Pertahankan preset di `components.json`, variabel tema, dan desain komponen bawaan. Gunakan Bun untuk pengelolaan dependensi.

## Deployment

### GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` menjalankan pengujian, lint, build, lalu deploy otomatis setiap push ke `main`. Deployment juga dapat dijalankan secara manual melalui tab **Actions**.

- Sumber Pages: **GitHub Actions**, pada **Settings → Pages**.
- URL: `https://ranzxm.github.io/jsontotable/`.
- Base path Vite: `/jsontotable/`, sesuai nama repositori.

### Hosting statis lainnya

```sh
bun install --frozen-lockfile
bun run build
```

Publikasikan direktori `dist/` pada layanan hosting statis. Sesuaikan `base` di `vite.config.ts` dengan lokasi hosting; gunakan `/` jika aplikasi di-host pada root domain. Tidak diperlukan proses backend. Untuk memeriksa hasil build sebelum deployment, jalankan `bun run preview`.

## Kontribusi

Laporkan bug atau usulkan peningkatan melalui [GitHub Issues](https://github.com/ranzxm/jsontotable/issues). Untuk perubahan kode, sertakan penjelasan perilaku yang berubah, pengujian yang relevan, dan pastikan seluruh pemeriksaan di atas berhasil.
