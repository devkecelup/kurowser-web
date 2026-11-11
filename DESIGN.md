# DESIGN.md

Arah visual untuk portal unduh Kurowser (`kurowser-web`). Dokumen ini menyelaraskan situs unduh dengan tema dan tata letak aplikasi desktop Kurowser v1.1.2 saat ini (`ThemePreset::Graphite`, `ThemePreset::Paper`, tipografi Poppins, mode rail ramping 50px dengan pelebaran hover halus ke 240px, bilah pencarian sidebar, dan tombol kontrol jendela di kanan atas). Setiap keputusan besar punya alasan satu baris (R-31).

## Design Read

Reading this as: portal unduh dan lembar spesifikasi teknis untuk pengguna Windows, memakai sistem warna **Graphite & Paper + Teal** serta **Poppins + Cascadia Mono** yang identik dengan antarmuka Kurowser desktop, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Identitas

Kurowser adalah browser Windows berbasis Rust, Win32 native, dan Microsoft Edge WebView2. Situsnya menggunakan palet dan struktur yang sama dengan aplikasi aslinya: latar gelap Graphite (`#0f1217` dan `#161a21`) sebagai bawaan seperti startup Kurowser, pilihan tema terang Paper (`#ffffff` dan `#f4f5f7`), aksen Teal (`#0f766e`, `#5eead4` di gelap, `#0d635c` di terang), ikon huruf K berwarna teal, serta garis pemisah tipis dan angka monospace untuk membandingkan ukuran berkas, memori, dan hash SHA-256 secara presisi.

Motif yang diulang: **permukaan bertingkat tipis, satu garis aksen teal fungsional pada state aktif atau folder, dan angka monospace rata kanan/kiri**.

## Palet

Seluruh token diambil langsung dari `ThemePalette::Graphite` (bawaan aplikasi) dan `ThemePalette::Paper` di `src/storage.rs`, ditambah verifikasi rasio kontras WCAG AA (`>= 4.5:1` teks, `>= 3.0:1` batas kontrol non-teks).

### Graphite (Gelap, Default Aplikasi)

| Token | Nilai | Peran |
|---|---|---|
| `--paper` | `#0f1217` | Latar halaman utama (`bg_app`) |
| `--chrome` | `#161a21` | Latar hero band, header, dan sidebar mockup (`bg_chrome`) |
| `--surface` | `#1e242d` | Panel, tabel, kartu unduhan, tombol sekunder (`bg_surface`) |
| `--surface-2` | `#262d38` | Hover kontrol, header tabel, blok kode, inset (`bg_hover`) |
| `--active-tint` | `#163130` | Tab aktif di sidebar preview (`bg_active`) |
| `--ink` | `#f2f5f9` | Teks utama (`text_primary`) |
| `--ink-2` | `#c1c9d4` | Teks sekunder (`text_inactive_tab`) |
| `--muted` | `#a3adb9` | Label dan catatan (`text_muted`) |
| `--line` | `#2f3744` | Garis pemisah tipis (`border_subtle`) |
| `--line-strong` | `#757e8c` | Batas kontrol interaktif (`border`) |
| `--brand` | `#0f766e` | Latar tombol aksi utama dengan teks putih (`5.47:1`) |
| `--brand-strong` | `#0b5d56` | Hover dan active tombol aksi utama (`7.74:1`) |
| `--brand-text` | `#5eead4` | Teks aksen, indeks, tautan aksen, batang ukur Kurowser (`>= 8.56:1`) |
| `--brand-tint` | `#183836` | Latar item terpilih dan kolom Kurowser (`accent_soft`) |
| `--brand-line` | `#14b8a6` | Garis folder teal dan batas kontrol aktif (`>= 5.09:1`) |
| `--focus` | `#2dd4bf` | Cincin fokus keyboard (`focus_ring`) |
| `--data` | `#6ee7b7` | Tanda afirmatif "Ya" dan status Shields aktif (`success_fg`) |

### Paper (Terang, Pilihan Mode Terang)

| Token | Nilai | Peran |
|---|---|---|
| `--paper` | `#ffffff` | Latar halaman utama (`bg_app`) |
| `--chrome` | `#f4f5f7` | Latar hero band dan sidebar mockup (`bg_chrome`) |
| `--surface` | `#ffffff` | Panel, tabel, pratinjau halaman start |
| `--surface-2` | `#f4f5f7` | Hover kontrol, header tabel, blok kode |
| `--active-tint` | `#dff2ef` | Tab aktif di sidebar preview (`bg_active`) |
| `--ink` | `#111827` | Teks utama |
| `--ink-2` | `#374151` | Teks sekunder |
| `--muted` | `#4b5563` | Label dan catatan |
| `--line` | `#d9dee6` | Garis pemisah tipis |
| `--line-strong` | `#757d8a` | Batas kontrol (`>= 3.81:1`) |
| `--brand` | `#0f766e` | Latar tombol aksi utama (`5.47:1` dengan putih) |
| `--brand-strong` | `#0d635c` | Hover tombol utama (`7.10:1` dengan putih) |
| `--brand-text` | `#0d635c` | Teks aksen dan batang ukur Kurowser (`>= 6.02:1`) |
| `--brand-tint` | `#daf1ee` | Latar terpilih (`accent_soft`) |
| `--brand-line` | `#0f766e` | Batas kontrol terpilih (`>= 4.64:1`) |
| `--focus` | `#0f766e` | Cincin fokus keyboard |
| `--data` | `#065f46` | Tanda afirmatif "Ya" (`>= 6.51:1`) |

## Tipografi

- **Poppins** (`assets/fonts/Poppins-Regular.ttf`, `Poppins-Medium.ttf`, `Poppins-SemiBold.ttf`, self-hosted) untuk judul dan isi halaman, dengan cadangan `Segoe UI, system-ui, sans-serif`. Alasan: Kurowser menggunakan font Poppins yang sama pada Win32 chrome dan halaman internal `kurowser://start`.
- **Cascadia Mono** (`Consolas` cadangan) untuk hash SHA-256, ukuran berkas, angka memori, URL, dan indeks bagian. Alasan: nilai teknis dan hash perlu sejajar vertikal saat dibandingkan.

## Tata Letak dan Pratinjau Produk

- **Band pembuka Graphite / Paper (`0.9fr / 1.1fr`)**: teks dan CTA di kiri, pratinjau interaktif antarmuka Kurowser v1.1.2 terbaru di kanan, diikuti ledger angka terukur. Pratinjau default menampilkan mode rail ramping `50px` yang melebar mulus lewat transisi `cubic-bezier(0.22, 1, 0.36, 1)` dan crossfade `opacity`/`max-height` saat hover pointer (`224px` proporsi `240px`), serta dapat dikunci lewat tombol pin atau diakses via tap di perangkat sentuh, sementara tombol kontrol jendela berada di pojok kanan atas bilah `36px`.
- **Bagian Fitur (`1 baris utama + 3 kolom pendukung`)**: Tab Folders mendapat penjelasan dan sketsa vertikal teal; tiga komponen lainnya (Kurowser Shields, LRU RAM Cap, dan skema `kurowser://` tanpa localhost) tampil sebagai tiga kolom sejajar di desktop, lalu bertumpuk bersih di perangkat seluler.
- **Bagian Perbandingan (jujur tanpa angka tebakan)**: panel interaktif memiliki tab untuk melihat metrik memori terukur Kurowser, ukuran berkas rilis, serta peta arsitektur 7 browser, diikuti tabel perbandingan lengkap lintas browser (Chromium/WebView2/Gecko) tanpa angka RAM pihak ketiga yang tidak diukur di repositori ini.
- **Manifest Unduhan (`#unduh`)**: dua baris unduhan (`KurowserSetup.exe` `2.74 MiB` dan `kurowser.exe` `1.84 MiB`) lengkap dengan SHA-256 aktual dan perintah verifikasi PowerShell.
- Radius `4px`, `6px`, dan `10px` (atau `12px` bingkai jendela pratinjau agar selaras dengan sudut WebView2 aplikasi). Tidak ada gradient latar dekoratif, glow menyebar, background grid, atau glassmorphism.
- Elevasi bayangan `--shadow` hanya dipakai pada bingkai jendela pratinjau desktop dan laci navigasi seluler yang melayang di atas konten agar hierarki fokus jelas, bukan pada setiap kartu.
- Ikon SVG fungsional terbatas pada kontrol nyata (ikon K Kurowser, gembok `kurowser://`, Shield, lipat rail, kontrol jendela kanan atas, matahari/bulan tema, unduh installer, serta ikon `Hemat RAM` yang mencerminkan tombol asli di sidebar Kurowser).

## Data Terukur Kurowser

Ukuran paket diambil langsung dari artefak rilis `v1.1.2`, sedangkan baseline memori diukur dengan skrip [`measure_memory.ps1`](https://github.com/devkecelup/kurowser/blob/main/measure_memory.ps1) pada sesi bersih `kurowser://start` (`v1.0.0`):

- Binary portabel `kurowser.exe` (`v1.1.2`): `1.84 MB` (`1.84 MiB`, `1,933,312 bytes`).
- Installer `KurowserSetup.exe` (`v1.1.2`): `2.74 MB` (`2.74 MiB`, `2,875,904 bytes`).
- Host Rust + Win32 pada `kurowser://start` (baseline `v1.0.0`): `6.47 MB` Private (`34.86 MB` Working Set).
- Pohon proses lengkap saat start (`kurowser.exe` + 6 sub-proses `msedgewebview2`, baseline `v1.0.0`): `185.87 MB` Private (`386.74 MB` Working Set).
- Listener `localhost`: `0` port (`skema kurowser://`).

## Gerak dan Aksesibilitas

MOTION 1. Transisi terbatas pada hover, focus, active, buka/tutup menu atau folder, kolaps rail sidebar, dan lebar batang grafik (`350ms`), serta berhenti otomatis di bawah `prefers-reduced-motion: reduce`. Semua kontrol interaktif memiliki target klik memadai, outline fokus terlihat (`2px solid var(--focus)`), dan fallback aman bila JavaScript dimatikan.
