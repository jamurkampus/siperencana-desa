# SiPerenDesa 🏘️
**Sistem Informasi Perencanaan Desa**

Aplikasi manajemen perencanaan kegiatan dan dokumen desa berbasis Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, dan Prisma ORM.

---

## ✨ Fitur Utama

- **Dashboard** statistik kegiatan dan anggaran
- **Form Input Kegiatan** lengkap dengan RAB, jadwal, panitia
- **AI Assistant** (Claude) untuk menyusun latar belakang, tujuan, manfaat, dan uraian kegiatan
- **Generator Dokumen** otomatis: Proposal, RAB, KAK, SK Panitia, Surat Tugas, Berita Acara, Laporan
- **Export** ke PDF, DOCX, dan XLSX
- **Laporan** rekapitulasi per bidang, sumber dana, dan status
- Desain **mobile-first**, responsive

---

## 🚀 Cara Deploy ke Vercel

### 1. Siapkan Database PostgreSQL

Gunakan salah satu provider gratis:
- **Neon**: https://neon.tech (recommended)
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

Catat `DATABASE_URL` connection string.

### 2. Push ke GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/siperencana-desa.git
git push -u origin main
```

### 3. Deploy di Vercel

1. Buka https://vercel.com/new
2. Import repository
3. Tambahkan environment variables:
   ```
   DATABASE_URL=postgresql://...
   GEMINI_API_KEY=AIzaSy...
   ```
4. Klik **Deploy**

### 4. Inisialisasi Database

Setelah deploy, jalankan dari lokal:

```bash
# Salin .env.example ke .env.local dan isi nilainya
cp .env.example .env.local

# Install dependencies
npm install

# Push schema ke database
npm run db:push

# Isi data awal (desa + sample kegiatan)
npm run db:seed
```

Atau gunakan **Vercel CLI**:
```bash
npx vercel env pull .env.local
npm run db:push
npm run db:seed
```

---

## 💻 Development Lokal

```bash
# Install
npm install

# Setup env
cp .env.example .env.local
# Edit .env.local dengan DATABASE_URL dan GEMINI_API_KEY

# Push schema
npm run db:push

# Seed data awal
npm run db:seed

# Jalankan dev server
npm run dev
```

Buka http://localhost:3000

---

## 🗄️ Struktur Database

| Model | Keterangan |
|---|---|
| `Desa` | Profil desa (nama, perangkat, alamat) |
| `TahunAnggaran` | Tahun anggaran aktif |
| `Kegiatan` | Data kegiatan utama |
| `JadwalKegiatan` | Bulan pelaksanaan per kegiatan |
| `Panitia` | Susunan panitia/TPK |
| `RabItem` | Baris RAB per kegiatan |
| `Dokumen` | Dokumen yang digenerate |
| `AiHistory` | Log penggunaan AI assistant |

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── kegiatan/         # CRUD kegiatan
│   │   ├── dokumen/          # Generate & export dokumen
│   │   ├── dashboard/        # Statistik
│   │   └── ai-assistant/     # Claude AI endpoint
│   ├── dashboard/            # Halaman dashboard
│   ├── kegiatan/             # List, tambah, detail, edit
│   ├── dokumen/              # List dokumen
│   ├── laporan/              # Laporan rekapitulasi
│   └── pengaturan/           # Settings desa
├── components/
│   ├── layout/               # Sidebar, TopBar
│   ├── forms/                # KegiatanForm, Filter
│   └── dokumen/              # DokumenGenerator
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
└── types/                    # TypeScript types
```

---

## 🔑 Environment Variables

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Gemini API key (gratis) untuk AI Assistant |

---

## 📝 Lisensi

MIT — Dibuat untuk administrasi pemerintahan desa Indonesia.

---

*Built with ❤️ untuk Desa Susuk Dalam, Kec. Anggana, Kutai Kartanegara*
