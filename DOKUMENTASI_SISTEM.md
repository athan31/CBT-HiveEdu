# 📚 DOKUMENTASI SISTEM — Catalyst CBT Engine
> **Versi:** 1.2.0 | **Author:** PT Karya Edukasi | **Terakhir diperbarui:** 4 Agustus 2026

---

## 📋 Daftar Isi

1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Teknologi yang Digunakan](#3-teknologi-yang-digunakan)
4. [Struktur Direktori Proyek](#4-struktur-direktori-proyek)
5. [Database — Skema & Model](#5-database--skema--model)
6. [Backend — Detail Teknis](#6-backend--detail-teknis)
7. [Frontend — Detail Teknis](#7-frontend--detail-teknis)
8. [Alur Kerja Sistem (Flow)](#8-alur-kerja-sistem-flow)
9. [Fitur Lengkap Sistem](#9-fitur-lengkap-sistem)
10. [Sistem Keamanan & Anti-Cheat](#10-sistem-keamanan--anti-cheat)
11. [Sistem Penilaian (Scoring Engine)](#11-sistem-penilaian-scoring-engine)
12. [WebSocket & Real-Time Monitoring](#12-websocket--real-time-monitoring)
13. [API Reference](#13-api-reference)
14. [Cara Menjalankan Sistem](#14-cara-menjalankan-sistem)
15. [Akun Default & Seed Data](#15-akun-default--seed-data)
16. [Catatan Teknis Penting](#16-catatan-teknis-penting)
17. [Riwayat Perubahan](#17-riwayat-perubahan)

---

## 1. Gambaran Umum Sistem

**Catalyst CBT Engine** adalah aplikasi *Computer-Based Test* (CBT) berbasis web yang dirancang khusus untuk simulasi ujian **SKD CPNS (Seleksi Kompetensi Dasar Calon Pegawai Negeri Sipil)**. Sistem ini menyediakan platform ujian online yang lengkap dengan fitur:

- ✅ Manajemen tryout dan soal berbasis kategori SKD (TWK, TIU, TKP)
- ✅ Sistem ujian dengan pengacakan soal dan pilihan jawaban (anti-contek)
- ✅ Anti-cheat detection berbasis deteksi tab-switching & window blur secara real-time
- ✅ Monitoring peserta secara live oleh admin via WebSocket
- ✅ Penilaian otomatis + perhitungan integrasi nilai SKD-SKB (formula BKN resmi)
- ✅ Leaderboard dan laporan pelanggaran
- ✅ Import soal massal dari file Excel
- ✅ Manajemen pengguna multi-role (Admin, Tutor, Peserta)
- ✅ Modal konfirmasi kesiapan peserta sebelum ujian dimulai (ReadyModal)
- ✅ Blokir otomatis akses ujian ketika waktu telah habis (ExpiredModal)
- ✅ Timer countdown yang akurat dengan error handling lengkap
- ✅ Resume sesi ujian otomatis jika koneksi terputus

---

## 2. Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                         │
│                                                                │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  React Frontend      │    │  Socket.io Client            │  │
│  │  (Vite + TailwindCSS)│◄──►│  (Real-time events)          │  │
│  └──────────┬───────────┘    └──────────────┬───────────────┘  │
│             │ HTTP/REST                     │ WebSocket        │
└─────────────┼──────────────────────────────-┼──────────────────┘
              │                               │
              ▼                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Port 5000)                  │
│                                                                │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │  Express.js  │  │  Socket.io    │  │  Middlewares       │   │
│  │  REST API    │  │  Server       │  │  (JWT Auth, Role)  │   │
│  └──────┬───────┘  └───────┬───────┘  └────────────────────┘   │
│         │                  │                                   │
│  ┌──────▼──────────────────▼──────────────────────────────┐    │
│  │              Prisma ORM + pg (PostgreSQL Driver)       │    │
│  └──────────────────────────┬───────────────────────────--┘    │
└─────────────────────────────┼───────────────────────────────---┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│                                                                 │
│   users │ exams │ questions │ exam_sessions │ violation_logs    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Teknologi yang Digunakan

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | Runtime | Platform JavaScript server-side |
| **Express.js** | ^5.2.1 | Framework REST API |
| **Prisma ORM** | ^7.8.0 | Database query builder & schema management |
| **@prisma/adapter-pg** | ^7.8.0 | Driver adapter PostgreSQL untuk Prisma v7 |
| **pg** | ^8.20.0 | PostgreSQL client (untuk raw SQL query) |
| **Socket.io** | ^4.8.3 | Komunikasi real-time WebSocket |
| **jsonwebtoken** | ^9.0.3 | Autentikasi berbasis JWT |
| **bcryptjs** | ^3.0.3 | Hashing password |
| **multer** | ^2.1.1 | Upload file (Excel) |
| **xlsx** | ^0.18.5 | Parsing file Excel |
| **express-validator** | ^7.3.2 | Validasi input request |
| **cors** | ^2.8.6 | Konfigurasi Cross-Origin Resource Sharing |
| **dotenv** | ^17.4.2 | Konfigurasi environment variable *(devDependency)* |

**DevDependencies Backend:**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **prisma** | ^7.8.0 | Prisma CLI (generate, migrate) |
| **tsx** | ^4.21.0 | TypeScript executor untuk Node.js |
| **typescript** | ^6.0.3 | TypeScript compiler |

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | ^18 | Framework UI |
| **Vite** | ^8.0.9 | Build tool & dev server |
| **@vitejs/plugin-react** | ^6.0.1 | Plugin React untuk Vite |
| **React Router DOM** | ^7.14.2 | Client-side routing |
| **Zustand** | ^5.0.12 | State management global |
| **Axios** | ^1.15.2 | HTTP client untuk REST API |
| **Socket.io-client** | ^4.8.3 | WebSocket client |
| **TailwindCSS** | ^4.2.4 | Utility-first CSS framework |
| **@tailwindcss/vite** | ^4.2.4 | Plugin Tailwind untuk Vite |
| **react-hot-toast** | ^2.6.0 | Notifikasi/toast UI |
| **xlsx** | ^0.18.5 | Export data Excel dari frontend |

**DevDependencies Frontend:**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **typescript** | ~6.0.2 | TypeScript compiler |
| **vite** | ^8.0.9 | Build tool & dev server |

### Database
| Teknologi | Fungsi |
|-----------|--------|
| **PostgreSQL** | Database relasional utama |

---

## 4. Struktur Direktori Proyek

```
projek akhir/
├── start.ps1                    # Script PowerShell untuk menjalankan backend + frontend sekaligus
├── DOKUMENTASI_SISTEM.md        # Dokumentasi teknis lengkap sistem
├── .gitignore
│
├── backend/                     # Server Node.js
│   ├── .env                     # Konfigurasi: DATABASE_URL, JWT_SECRET, PORT
│   ├── package.json
│   ├── prisma.config.js
│   ├── prisma/
│   │   ├── schema.prisma        # Definisi skema database (model, relasi, enum)
│   │   ├── seed.js              # Data awal (4 akun + 1 tryout + 9 soal contoh)
│   │   └── migrations/          # File migrasi database (Prisma Migrate)
│   └── src/
│       ├── index.js             # Entry point — inisialisasi Express + Socket.io
│       ├── lib/
│       │   └── prisma.js        # Singleton Prisma client + helper pgQuery (raw SQL)
│       ├── middlewares/
│       │   ├── auth.middleware.js    # Verifikasi JWT, inject req.user
│       │   └── admin.middleware.js   # Cek role ADMIN/TUTOR
│       ├── routes/
│       │   ├── auth.routes.js        # POST /login, POST /register, GET /me
│       │   ├── admin.routes.js       # CRUD exam, soal, user, leaderboard
│       │   └── exam.routes.js        # Endpoint peserta: start, soal, jawab, finish
│       ├── controllers/
│       │   ├── auth.controller.js        # Logic login & register
│       │   ├── admin.controller.js       # Logic manajemen tryout, soal, user
│       │   ├── participant.controller.js  # Logic peserta + scoring engine
│       │   └── importExcel.controller.js  # Import soal dari file Excel
│       └── socket/
│           └── socket.handler.js    # Handler WebSocket: monitoring, anti-cheat
│
└── frontend/                    # Aplikasi React
    ├── index.html
    ├── vite.config.js           # Konfigurasi Vite + proxy ke backend
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── main.jsx             # Entry point React
        ├── main.ts              # Entry TypeScript (unused)
        ├── counter.ts           # Counter TypeScript (unused)
        ├── App.jsx              # Router utama + PrivateRoute guard
        ├── index.css            # Global styles (CSS variables & utility classes)
        ├── style.css            # Style tambahan
        ├── assets/              # Asset statis
        ├── services/
        │   └── api.js           # Instance Axios + JWT interceptor
        ├── store/
        │   └── examStore.js     # State management ujian (Zustand)
        ├── components/
        │   ├── QuestionNavGrid.jsx   # Navigasi soal (grid nomor soal)
        │   ├── ViolationModal.jsx    # Popup peringatan pelanggaran
        │   ├── ReadyModal.jsx        # Modal konfirmasi kesiapan peserta sebelum ujian
        │   └── ExpiredModal.jsx      # Modal blokir akses ketika waktu ujian habis
        └── pages/
            ├── Login.jsx            # Halaman login
            ├── Register.jsx         # Halaman registrasi
            ├── Dashboard.jsx        # Dashboard peserta (daftar tryout aktif)
            ├── ExamPage.jsx         # Halaman ujian (state machine 5 fase)
            ├── ResultPage.jsx       # Halaman hasil ujian
            └── admin/
                ├── AdminLayout.jsx      # Layout sidebar admin
                ├── AdminDashboard.jsx   # Dashboard admin (statistik)
                ├── ExamManager.jsx      # Manajemen tryout (CRUD)
                ├── QuestionManager.jsx  # Manajemen soal (CRUD + import Excel)
                ├── Leaderboard.jsx      # Peringkat peserta per tryout
                ├── UserList.jsx         # Manajemen pengguna
                └── MonitorPage.jsx      # Monitoring peserta live (fullscreen)
```

---

## 5. Database — Skema & Model

Database menggunakan **PostgreSQL** dengan ORM **Prisma**. Terdapat 5 tabel utama:

### Enum Types
```prisma
enum Role          { ADMIN | TUTOR | PESERTA }
enum Kategori      { TWK | TIU | TKP }
enum SessionStatus { ONGOING | SUBMITTED }
```

### Model `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `nama_lengkap` | String | Nama lengkap pengguna |
| `email` | String (unique) | Email login |
| `password` | String | Password ter-hash (bcrypt, salt=12) |
| `role` | Enum | ADMIN / TUTOR / PESERTA (default: PESERTA) |

### Model `exams`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `judul_tryout` | String | Nama/judul tryout |
| `durasi_menit` | Int | Durasi ujian dalam menit |
| `waktu_mulai` | DateTime | Waktu mulai tryout aktif |
| `waktu_selesai` | DateTime | Waktu selesai tryout aktif |

### Model `questions`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `exam_id` | UUID (FK) | Relasi ke `exams` (cascade delete) |
| `kategori` | Enum | TWK / TIU / TKP |
| `teks_soal` | String | Isi pertanyaan |
| `opsi_jawaban` | JSON | Array `[{ huruf, teks, poin }]` |
| `kunci_jawaban` | String | Huruf kunci jawaban benar (A-E) |

### Model `exam_sessions`
| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | UUID | — | Primary key |
| `user_id` | UUID (FK) | — | Relasi ke `users` (cascade delete) |
| `exam_id` | UUID (FK) | — | Relasi ke `exams` (cascade delete) |
| `waktu_mulai` | DateTime | — | Waktu peserta mulai ujian |
| `status` | Enum | `ONGOING` | ONGOING / SUBMITTED |
| `skor_twk` | Int | `0` | Skor TWK (poin benar × 5) |
| `skor_tiu` | Int | `0` | Skor TIU (poin benar × 5) |
| `skor_tkp` | Int | `0` | Skor TKP (poin tiered) |
| `total_skor` | Int | `0` | Total skor SKD |
| `jumlah_pelanggaran` | Int | `0` | Counter pelanggaran tab-switching |
| `jawaban_peserta` | JSON | `{}` | `{ questionId: "huruf" }` |
| `urutan_soal` | JSON | `[]` | Array ID soal teracak untuk sesi ini |
| `urutan_opsi` | JSON | `{}` | `{ questionId: { hurufBaru: hurufAsli } }` |
| `maks_skd` | Int | `550` | Maksimum skor SKD (dapat disesuaikan admin) |
| `maks_skb` | Int | `100` | Maksimum skor SKB (dapat disesuaikan admin) |
| `skor_skb` | Float | `0` | Skor SKB (diinput admin setelah ujian) |
| `nilai_integrasi_skd` | Float | `0` | `(total_skor / maks_skd) × 40` |
| `nilai_integrasi_skb` | Float | `0` | `(skor_skb / maks_skb) × 60` |
| `total_nilai_akhir` | Float | `0` | `nilai_integrasi_skd + nilai_integrasi_skb` |

### Model `violation_logs`
| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | UUID | — | Primary key |
| `session_id` | UUID (FK) | — | Relasi ke `exam_sessions` (cascade delete) |
| `waktu_pelanggaran` | DateTime | `now()` | Timestamp pelanggaran |
| `jenis_pelanggaran` | String | `"TAB_SWITCHED"` | Jenis pelanggaran |
| `peringatan_ke` | Int | — | Nomor urut pelanggaran peserta ini |

### Relasi Antar Tabel
```
users ──< exam_sessions >── exams
                │
         violation_logs
exams ──< questions
```

---

## 6. Backend — Detail Teknis

### Entry Point (`src/index.js`)
- Membuat server **HTTP + Express** di port `5000` (default, dari `process.env.PORT`)
- Mengintegrasikan **Socket.io** dengan konfigurasi CORS ke `http://localhost:5173`
- Express juga dikonfigurasi CORS ke `http://localhost:5173` via middleware `cors`
- Mendaftarkan 3 grup route: `/api/auth`, `/api/admin`, `/api/exam`
- Menyediakan health check endpoint: `GET /api/health` → `{ status: 'ok', message: '...' }`
- Menginisialisasi socket handler via `initSocketHandler(io)`
- Mengeksport `{ app, io }` untuk keperluan testing/modul lain

### Database Client (`src/lib/prisma.js`)
- Menggunakan **Prisma v7 dengan `@prisma/adapter-pg`** (driver adapter pattern)
- Membuat **connection pool PostgreSQL** via variabel `DATABASE_URL`
- Mengekspos dua cara query:
  - `prisma` — Prisma Client (type-safe, ORM-style)
  - `pgQuery(sql, params)` — Raw SQL (untuk kolom baru yang belum dikenali Prisma generated client)

### Middlewares

#### `auth.middleware.js` — `requireAuth`
1. Membaca header `Authorization: Bearer <token>`
2. Memverifikasi JWT dengan `JWT_SECRET` dari `.env`
3. Mencari user di database berdasarkan `userId` dari payload JWT
4. Menyimpan user object ke `req.user` agar bisa diakses controller

#### `admin.middleware.js`
- `requireAdmin` — memastikan role adalah `ADMIN` atau `TUTOR`
- `requireAdminOnly` — memastikan role adalah `ADMIN` saja

### Controllers

#### `auth.controller.js`
| Fungsi | Method | Endpoint | Aksi |
|--------|--------|----------|------|
| `register` | POST | `/api/auth/register` | Buat akun baru (hash password, validasi email unik) |
| `login` | POST | `/api/auth/login` | Verifikasi password, buat JWT (7 hari) |
| `getMe` | GET | `/api/auth/me` | Kembalikan data user dari token |

#### `admin.controller.js`
| Fungsi | Method | Endpoint | Aksi |
|--------|--------|----------|------|
| `getAllExams` | GET | `/api/admin/exams` | Daftar semua tryout + jumlah soal & sesi |
| `getExamById` | GET | `/api/admin/exams/:id` | Detail tryout beserta soal-soalnya |
| `createExam` | POST | `/api/admin/exams` | Buat tryout baru (waktu mulai = sekarang, waktu selesai = mulai + durasi) |
| `updateExam` | PUT | `/api/admin/exams/:id` | Edit tryout (recalculate waktu selesai jika durasi berubah) |
| `deleteExam` | DELETE | `/api/admin/exams/:id` | Hapus tryout (cascade ke soal & sesi) |
| `toggleExamActive` | PATCH | `/api/admin/exams/:id/toggle` | Aktifkan/nonaktifkan tryout secara instan |
| `getQuestions` | GET | `/api/admin/exams/:examId/questions` | Daftar soal tryout |
| `createQuestion` | POST | `/api/admin/exams/:examId/questions` | Tambah soal baru |
| `updateQuestion` | PUT | `/api/admin/exams/:examId/questions/:questionId` | Edit soal |
| `deleteQuestion` | DELETE | `/api/admin/exams/:examId/questions/:questionId` | Hapus soal |
| `getLeaderboard` | GET | `/api/admin/leaderboard/:examId` | Peringkat peserta yang sudah submit (raw SQL) |
| `getViolationLogs` | GET | `/api/admin/violations/:examId` | Log pelanggaran peserta |
| `getExamSessions` | GET | `/api/admin/sessions/:examId` | Semua sesi ujian (untuk monitoring) |
| `getAllUsers` | GET | `/api/admin/users` | Daftar semua pengguna |
| `createUser` | POST | `/api/admin/users` | Buat akun peserta/tutor (admin only) |
| `updateUser` | PUT | `/api/admin/users/:id` | Edit profil pengguna (admin only) |
| `deleteUser` | DELETE | `/api/admin/users/:id` | Hapus pengguna + sesi + pelanggaran (admin only) |

**Detail `toggleExamActive`:**
- Jika tryout **sedang aktif** (`now >= waktu_mulai && now <= waktu_selesai`) → nonaktifkan dengan set `waktu_selesai` ke 1 detik sebelum sekarang
- Jika tryout **tidak aktif** → aktifkan dengan `waktu_mulai = now` dan `waktu_selesai = now + durasi_menit + 60 menit buffer`
- Buffer 1 jam ditambahkan saat aktivasi untuk memberi waktu lebih kepada peserta yang sudah terlambat bergabung

**Detail `deleteUser`:**
- Mencegah admin menghapus akun sendiri (`id === req.user.id`)
- Melakukan manual cascade via raw SQL: hapus `violation_logs` → `exam_sessions` → `users`

#### `participant.controller.js`
| Fungsi | Method | Endpoint | Aksi |
|--------|--------|----------|------|
| `getActiveExams` | GET | `/api/exam/active` | Daftar tryout yang sedang aktif (`waktu_mulai ≤ now ≤ waktu_selesai`) |
| `getExamInfo` | GET | `/api/exam/info/:examId` | Info ujian (judul, durasi, status expired/notStarted) **tanpa** membuat sesi |
| `startExam` | POST | `/api/exam/start` | Mulai ujian (buat sesi + acak soal+opsi) atau resume sesi ONGOING |
| `getQuestions` | GET | `/api/exam/questions/:examId` | Ambil soal sesuai urutan acak sesi |
| `saveAnswer` | PATCH | `/api/exam/save-answer` | Simpan jawaban satu soal ke DB |
| `finishExam` | POST | `/api/exam/finish` | Kumpulkan jawaban + trigger scoring |
| `getResult` | GET | `/api/exam/result/:sessionId` | Hasil ujian (hanya status SUBMITTED, raw SQL) |
| `updateSkorSkb` | PATCH | `/api/exam/skb/:sessionId` | Admin input skor SKB → recalculate integrasi |

**Detail `startExam`:**
- Cek tryout aktif (`waktu_mulai ≤ now ≤ waktu_selesai`)
- Cek sesi `ONGOING` yang sudah ada → jika ada, resume (hitung `remainingMs` dari `waktu_mulai`)
- Jika sesi ONGOING tapi `remainingMs ≤ 0` → auto-submit (`submitAndScore`) dan kembalikan pesan waktu habis
- Cek sesi `SUBMITTED` → tolak dengan 409 Conflict
- Acak urutan soal dengan **Fisher-Yates shuffle**
- Acak opsi jawaban per soal, simpan peta `{ hurufBaru: hurufAsli }` di `urutan_opsi`
- Buat `ExamSession` baru, kembalikan `{ session, remainingMs }`

**Detail `updateSkorSkb`:**
- Validasi: `skor_skb` wajib ada, berupa angka, tidak negatif, tidak melebihi `maks_skb`
- Hitung ulang nilai integrasi via `hitungIntegrasi()` dengan parameter baru
- Update via raw SQL (kolom integrasi tidak dikenali Prisma generated client)
- Kembalikan detail formula perhitungan dalam response

#### `importExcel.controller.js`
- Menggunakan **Multer** (memory storage, max 10MB) untuk upload file `.xlsx`/`.xls`
- Menerima nama kolom yang fleksibel (case-insensitive, multi-alias):
  - Kolom kategori: `kategori`, `category`, `tipe`
  - Kolom soal: `teks soal`, `soal`, `pertanyaan`, `question`
  - Pilihan A-E, Poin A-E, Kunci jawaban
- Validasi tiap baris: kategori valid (TWK/TIU/TKP), kunci valid (A-E), pilihan A-D wajib
- Bulk insert via `prisma.question.createMany()`
- Mengembalikan laporan: jumlah berhasil, dilewati, beserta detail error per baris

### Internal Functions (Participant Controller)

#### `shuffleArray(arr)` — Fisher-Yates Shuffle
```javascript
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

#### `shuffleOptions(opsiJawaban, kunciJawabanAsli)`
- Mengacak urutan opsi jawaban menggunakan Fisher-Yates
- Mengembalikan `{ shuffledOptions, optionMapping, newKunci }`:
  - `shuffledOptions` — opsi dengan huruf baru (A, B, C, ...) sesuai urutan acak
  - `optionMapping` — `{ hurufBaru: hurufAsli }` untuk decoding jawaban peserta
  - `newKunci` — huruf baru yang menjadi kunci jawaban (sudah ter-remap)
- Field `_hurufAsli` dihapus sebelum dikirim ke client

#### `hitungIntegrasi(totalSkorSkd, maksSkd, skorSkb, maksSkb)`
```
Nilai Integrasi SKD = (totalSkorSkd / maksSkd) × 40
Nilai Integrasi SKB = (skorSkb / maksSkb) × 60
Total Nilai Akhir   = Integrasi SKD + Integrasi SKB
```
- Pembulatan 4 desimal (`Math.round(n * 10000) / 10000`)
- Fallback: `maksSkd` minimum 550, `maksSkb` minimum 100

#### `submitAndScore(sessionId)` — Internal Scoring Engine
1. Ambil sesi dan semua soal dari DB
2. Baca `urutan_opsi` dari sesi untuk decoding huruf acak → huruf asli
3. Hitung skor per kategori (TWK: +5/0, TIU: +5/0, TKP: poin tiered)
4. Hitung nilai integrasi SKD (SKB default 0)
5. Update kolom status+skor via Prisma ORM
6. Update kolom integrasi via raw SQL (`pgQuery`)
7. Kembalikan data sesi terbaru via raw SQL

---

## 7. Frontend — Detail Teknis

### Entry Point & Routing (`App.jsx`)

Sistem routing menggunakan **React Router DOM v7** dengan 3 level akses:

```
/ → redirect ke /login

Public:
  /login      → Login.jsx
  /register   → Register.jsx

Protected (semua role):
  /dashboard              → Dashboard.jsx      (daftar tryout aktif)
  /exam/:examId           → ExamPage.jsx       (halaman ujian)
  /result/:sessionId      → ResultPage.jsx     (hasil ujian)

Admin/Tutor only:
  /admin                  → AdminLayout.jsx (sidebar)
    ├── /admin            → AdminDashboard.jsx
    ├── /admin/exams      → ExamManager.jsx
    ├── /admin/exams/:id/questions  → QuestionManager.jsx
    ├── /admin/exams/:id/leaderboard → Leaderboard.jsx
    └── /admin/users      → UserList.jsx

  /admin/monitor/:examId  → MonitorPage.jsx (fullscreen, tanpa sidebar)
```

**`PrivateRoute`** membaca `catalyst_token` dan `catalyst_user` dari `localStorage`. Jika token tidak ada → redirect ke `/login`. Jika role tidak sesuai (`adminOnly` tapi bukan ADMIN/TUTOR) → redirect ke `/dashboard`.

**Toaster Global** dikonfigurasi di `App.jsx`:
- Posisi: `top-right`
- Font: Inter, 14px, borderRadius 8px
- Ikon success: hijau `#10B981`, error: merah `#EF4444`

### API Service (`services/api.js`)
- Instance **Axios** dengan `baseURL: '/api'` (di-proxy Vite ke `localhost:5000`)
- **Request interceptor**: otomatis menyisipkan `Authorization: Bearer <token>` dari localStorage
- **Response interceptor**: jika status `401`, hapus `catalyst_token` & `catalyst_user` dari localStorage dan redirect ke `/login`

### State Management (`store/examStore.js`)
Menggunakan **Zustand** untuk state ujian global:

| State | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `examInfo` | Object\|null | `null` | Info ujian dari `/api/exam/info` sebelum sesi dibuat |
| `session` | Object\|null | `null` | Data sesi ujian aktif |
| `questions` | Array | `[]` | Daftar soal dalam urutan acak |
| `currentIndex` | Int | `0` | Index soal yang sedang ditampilkan |
| `answers` | Object | `{}` | `{ questionId: "huruf" }` jawaban peserta |
| `remainingMs` | Int | `0` | Sisa waktu dalam milidetik |
| `violationCount` | Int | `0` | Jumlah pelanggaran tercatat |
| `showViolationModal` | Boolean | `false` | Tampilkan popup peringatan |
| `isLoading` | Boolean | `false` | Status loading (fetch data) |
| `isSubmitting` | Boolean | `false` | Status pengumpulan jawaban |

**Actions:**

| Action | Keterangan |
|--------|------------|
| `setSession(session)` | Set data sesi ujian |
| `setQuestions(questions)` | Set daftar soal |
| `setCurrentIndex(index)` | Navigasi ke soal tertentu |
| `setRemainingMs(updater)` | Set sisa waktu — mendukung functional update |
| `setViolationCount(count)` | Set jumlah pelanggaran |
| `setShowViolationModal(show)` | Toggle modal pelanggaran |
| `getExamInfo(examId)` | Fetch info ujian tanpa membuat sesi |
| `startExam(examId)` | POST /exam/start — buat/resume sesi |
| `loadQuestions(examId)` | GET /exam/questions — muat soal + restore jawaban |
| `saveAnswer(questionId, jawaban)` | PATCH /exam/save-answer — optimistic update |
| `finishExam()` | POST /exam/finish — kumpulkan jawaban |
| `incrementViolation(total)` | Set violationCount + tampilkan ViolationModal |
| `dismissViolationModal()` | Tutup ViolationModal tanpa mengubah count |
| `resetExam()` | Reset semua state ke default (dipanggil saat unmount ExamPage) |

> **Catatan `setRemainingMs`**: Mendukung dua bentuk pemanggilan:
> - `setRemainingMs(3600000)` — set nilai langsung
> - `setRemainingMs(prev => prev - 1000)` — functional update (penting untuk timer interval agar tidak stale closure)
>
> Implementasi: `set(state => ({ remainingMs: typeof updater === 'function' ? updater(state.remainingMs) : updater }))`

### Halaman Utama

#### `Login.jsx`
- Form email + password dengan validasi
- Menyimpan `catalyst_token` dan `catalyst_user` (JSON) ke `localStorage`
- Redirect berdasarkan role: ADMIN/TUTOR → `/admin`, PESERTA → `/dashboard`

#### `Dashboard.jsx`
- Menampilkan daftar tryout yang sedang aktif (`GET /api/exam/active`)
- Tombol "Mulai Ujian" untuk setiap tryout aktif
- Cek apakah peserta sudah pernah mengikuti tryout tersebut (tampil status sudah selesai)

#### `ExamPage.jsx`
Halaman ujian yang menggunakan **state machine eksplisit** dengan 5 fase:

| Fase | Kondisi | Tampilan |
|------|---------|----------|
| `loading` | Pertama mount, `getExamInfo` belum selesai | Spinner "Memeriksa status ujian..." |
| `error` | `getExamInfo` gagal (network error, dll.) | Card error + tombol "Coba Lagi" & "Kembali" |
| `expired` | `examInfo.isExpired === true` | `ExpiredModal` — blokir total |
| `ready` | Ujian aktif, peserta belum klik mulai | `ReadyModal` — konfirmasi kesiapan |
| `exam` | Setelah klik "Siap" dan sesi dibuat | Tampilan soal + timer countdown |

**Lifecycle `useEffect` (6 hook):**

1. **Mount init** — panggil `getExamInfo(examId)`, tentukan fase awal, cleanup `resetExam()`
2. **handleReady** — dipanggil saat peserta klik "Saya Siap"; cek waktu, panggil `startExam` + `loadQuestions`, set fase `exam`
3. **Socket** — aktif hanya saat `phase === 'exam' && session?.id`; connect ke `localhost:5000`, join session room, listen `violation_warning`
4. **Progress socket** — emit `peserta_question_update` setiap kali `currentIndex` atau jumlah jawaban berubah
5. **Timer countdown** — `setInterval` 1 detik via `setRemainingMs(prev => prev - 1000)`, auto-finish saat `remainingMs ≤ 0`
6. **handleAutoFinish** — `useCallback` yang dipanggil timer saat waktu habis, navigate ke result page

**Anti-cheat di ExamPage:**
- `document.addEventListener('visibilitychange')` → emit `tab_violation` saat `document.hidden === true`
- `window.addEventListener('blur')` + 200ms debounce → emit `tab_violation` jika `document.hidden` tetap true setelah delay
- Socket hanya aktif saat fase `exam` (tidak aktif saat ReadyModal atau loading)

**UI Ujian:**
- Header sticky: logo, timer countdown (merah jika < 10 menit), tombol "Kumpul Jawaban"
- Progress bar: persentase soal terjawab
- Area soal: badge kategori, nomor soal, teks soal, pilihan jawaban dengan highlight pilihan aktif
- Navigasi: tombol "Sebelumnya" / "Selanjutnya"
- Sidebar (desktop): `QuestionNavGrid`, counter pelanggaran (jika ada)

**`formatTime(ms)` — Helper:**
```javascript
function formatTime(ms) {
  const safe = typeof ms === 'number' && isFinite(ms) ? ms : 0;
  if (safe <= 0) return '00:00:00';
  const t = Math.floor(safe / 1000);
  return `HH:MM:SS` // padStart(2, '0')
}
```

#### `ReadyModal.jsx`
- Modal premium yang muncul sebelum peserta memulai ujian (fase `ready`)
- Menampilkan: judul tryout, durasi, jumlah soal, kategori (TWK/TIU/TKP)
- Countdown waktu tersisa hingga ujian berakhir (real-time)
- Daftar aturan ujian (dilarang pindah tab, jawaban auto-save, dll.)
- Tombol **"Saya Siap, Mulai!"** — memicu `startExam()` + `loadQuestions()` + set fase `exam`
- Tombol **"Kembali ke Dashboard"** — navigate ke dashboard tanpa membuat sesi
- Tombol "Saya Siap" disabled jika `isStarting === true` atau waktu sudah habis

#### `ExpiredModal.jsx`
- Modal blokir penuh yang tampil ketika waktu ujian sudah lewat (fase `expired`)
- Menampilkan judul ujian dan waktu berakhirnya
- Tidak ada opsi untuk masuk ke ujian atau submit jawaban
- Hanya tombol "Kembali ke Dashboard"
- Menerima `examInfo` sebagai prop (data dari `getExamInfo`)

#### `ResultPage.jsx`
- Menampilkan hasil setelah ujian selesai (`GET /api/exam/result/:sessionId`)
- Rincian skor: TWK, TIU, TKP, Total SKD
- Nilai integrasi SKD-SKB (jika sudah diisi admin)
- Jumlah pelanggaran yang tercatat

#### `MonitorPage.jsx`
- Halaman fullscreen untuk admin (tanpa sidebar AdminLayout)
- Menerima `monitoring_snapshot` awal dari server saat join room WebSocket
- Update realtime via `session_live_update` dan `violation_live_update`
- Menampilkan tabel: nama peserta, soal ke-berapa, jumlah terjawab, pelanggaran, status (online/offline/selesai)

#### `AdminLayout.jsx`
- Sidebar navigasi untuk panel admin
- Menu: Dashboard, Kelola Tryout, Kelola Pengguna
- Menggunakan `Outlet` dari React Router untuk render child routes

#### `ExamManager.jsx`
- CRUD tryout (Buat, Edit, Hapus)
- Tombol Toggle Aktif/Nonaktif (memanggil `PATCH /toggle`)
- Link ke QuestionManager, Leaderboard, MonitorPage

#### `QuestionManager.jsx`
- CRUD soal per tryout
- Import soal massal dari file Excel (drag & drop / file picker)
- Validasi dan preview soal sebelum disimpan

#### `UserList.jsx`
- Tabel daftar semua pengguna
- Tambah/Edit/Hapus pengguna (admin only untuk operasi write)
- Filter berdasarkan role

#### `Leaderboard.jsx`
- Peringkat peserta yang sudah menyelesaikan tryout
- Kolom: Nama, TWK, TIU, TKP, Total SKD, SKB, Nilai Akhir, Pelanggaran
- Input skor SKB per peserta (admin) untuk menghitung nilai integrasi

---

## 8. Alur Kerja Sistem (Flow)

### Alur Login & Autentikasi
```
Pengguna → POST /api/auth/login
         → Verifikasi email + bcrypt compare password
         → JWT dibuat (payload: userId, role, expire 7 hari)
         → Token disimpan di localStorage (catalyst_token)
         → Data user disimpan di localStorage (catalyst_user)
         → Setiap request berikutnya: Header "Authorization: Bearer <token>"
         → auth.middleware.js verifikasi token + inject req.user
```

### Alur Peserta Mengikuti Ujian
```
1. Dashboard: GET /api/exam/active → tampil daftar tryout aktif
   → Klik "Mulai Tryout" → navigate ke /exam/:examId

2. Cek Info Ujian: GET /api/exam/info/:examId
   → Tidak membuat sesi — hanya mengambil info ujian
   → Return: { id, judul_tryout, durasi_menit, waktu_mulai, waktu_selesai,
               jumlah_soal, isExpired, isNotStarted }
   → Jika isExpired = true  → fase 'expired' → tampilkan ExpiredModal (blokir akses)
   → Jika isExpired = false → fase 'ready'   → tampilkan ReadyModal (konfirmasi kesiapan)
   → Jika error jaringan   → fase 'error'   → tampilkan card error + retry

3. Konfirmasi Siap (ReadyModal)
   → Peserta melihat info ujian + daftar aturan + countdown waktu tersisa
   → Klik "Saya Siap, Mulai!" → lanjut ke langkah 4
   → Klik "Kembali" → kembali ke dashboard (tidak ada sesi yang dibuat)

4. Start Exam: POST /api/exam/start { examId }
   → Cek tryout aktif (waktu_mulai ≤ now ≤ waktu_selesai)
   → Cek sesi ONGOING yang sudah ada (re-entry jika koneksi terputus)
   → Jika sesi ONGOING tapi waktu habis → auto-submit dan kembalikan pesan
   → Ambil semua soal, acak urutan (Fisher-Yates)
   → Acak opsi jawaban tiap soal, simpan peta huruf (urutan_opsi)
   → Buat ExamSession baru dengan urutan_soal + urutan_opsi tersimpan
   → Return: { session, remainingMs }
   → Timer countdown dimulai di frontend

5. Load Soal: GET /api/exam/questions/:examId
   → Rekonstruksi urutan soal dari sesi
   → Kembalikan soal dalam urutan acak + opsi diacak sesuai peta
   → kunci_jawaban TIDAK dikirim ke client

6. Jawab Soal: PATCH /api/exam/save-answer { sessionId, questionId, jawaban }
   → Optimistic update di Zustand store (UI langsung update)
   → Simpan jawaban ke kolom jawaban_peserta (JSON) di DB

7. Kumpulkan: POST /api/exam/finish { sessionId }
   → Dapat dipicu manual (klik tombol) atau otomatis (remainingMs = 0)
   → Tombol submit di-disabled jika remainingMs ≤ 0
   → Panggil submitAndScore(sessionId):
     a. Ambil semua soal dengan kunci asli
     b. Decode jawaban peserta: huruf acak → huruf asli (via urutan_opsi)
     c. Hitung skor TWK (5/0), TIU (5/0), TKP (tiered poin)
     d. Hitung nilai integrasi SKD (formula BKN)
     e. Update status SUBMITTED + simpan skor

8. Hasil: GET /api/exam/result/:sessionId
   → Tampilkan rincian skor + nilai integrasi
```

### Alur Anti-Cheat (Tab Switching & Window Blur)
```
ExamPage.jsx → listener 1: document.addEventListener('visibilitychange')
             → jika document.hidden === true:
               → Socket.io emit: 'tab_violation' { sessionId }

ExamPage.jsx → listener 2: window.addEventListener('blur')
             → setTimeout 200ms → jika document.hidden masih true:
               → Socket.io emit: 'tab_violation' { sessionId }

socket.handler.js → event 'tab_violation':
  → Debounce: abaikan jika < 2 detik dari pelanggaran sebelumnya (per sessionId)
  → prisma.examSession.update: jumlah_pelanggaran + 1
  → Cek: jika status === 'SUBMITTED' → abaikan (tidak catat log)
  → prisma.violationLog.create: catat timestamp + nomor urut + jenis 'TAB_SWITCHED'
  → Update liveSessionStore[sessionId].jumlah_pelanggaran
  → emit ke peserta (session room): 'violation_warning' { total, message }
  → emit ke admin room: 'violation_live_update' { sessionId, jumlah_pelanggaran,
                                                   nama, examId, timestamp }

ExamPage.jsx → terima 'violation_warning':
  → incrementViolation(total) → set violationCount + showViolationModal = true
  → Tampilkan ViolationModal (popup peringatan)
```

### Alur Real-Time Monitoring Admin
```
MonitorPage → socket.emit: 'admin_join_monitoring' { examId }
            → server join room `monitor:${examId}`
            → server emit 'monitoring_snapshot': semua sesi dari DB + status live store

Peserta → socket.emit: 'join_session' { sessionId }
        → server load sesi dari DB (nama, totalAnswered, jumlah_pelanggaran)
        → server update liveSessionStore[sessionId].connected = true
        → server emit 'session_live_update' ke room `monitor:${examId}`

Peserta pindah soal → socket.emit: 'peserta_question_update' { sessionId, questionIndex, totalAnswered }
                    → server update liveSessionStore
                    → server emit 'session_live_update'

Peserta disconnect → server: liveSessionStore[sessionId].connected = false
                   → server emit 'session_live_update' (status offline)
```

---

## 9. Fitur Lengkap Sistem

### Untuk Admin
- [x] Login dengan akun admin
- [x] Dashboard statistik (jumlah tryout, soal, pengguna)
- [x] Buat/Edit/Hapus tryout
- [x] Toggle aktif/nonaktif tryout secara instan (+1 jam buffer saat aktivasi)
- [x] Tambah/Edit/Hapus soal per tryout
- [x] Import soal massal dari file Excel (.xlsx/.xls)
- [x] Monitoring peserta live (real-time via WebSocket)
- [x] Lihat peringkat peserta (leaderboard)
- [x] Lihat log pelanggaran per peserta
- [x] Input skor SKB untuk hitung nilai integrasi SKD-SKB
- [x] CRUD pengguna (tambah/edit/hapus Peserta dan Tutor)
- [x] Proteksi: tidak dapat menghapus akun sendiri

### Untuk Tutor
- [x] Semua fitur Admin kecuali:
  - ❌ Tidak bisa membuat/mengubah/menghapus pengguna
  - ✅ Bisa melihat daftar pengguna

### Untuk Peserta
- [x] Login/Register akun baru
- [x] Melihat daftar tryout yang aktif
- [x] **Modal konfirmasi kesiapan** sebelum memulai ujian (info ujian + aturan + countdown)
- [x] Memulai ujian (soal dan pilihan jawaban diacak unik per sesi)
- [x] Navigasi bebas antar soal (maju/mundur + grid nomor soal)
- [x] Simpan jawaban secara otomatis (per soal, optimistic update)
- [x] Lanjutkan ujian jika koneksi terputus (resume sesi ONGOING)
- [x] Timer countdown akurat yang mulai berjalan setelah konfirmasi siap
- [x] Auto-submit saat waktu habis
- [x] **Blokir akses ujian** jika waktu sudah lewat (ExpiredModal)
- [x] Tombol kumpul jawaban ter-disable saat waktu habis
- [x] Melihat hasil ujian setelah selesai (skor + nilai integrasi)

---

## 10. Sistem Keamanan & Anti-Cheat

### Autentikasi
- Semua endpoint dilindungi JWT (kecuali `/login` dan `/register`)
- Token expire 7 hari; jika invalid → redirect ke login
- Password di-hash dengan **bcrypt** (cost factor 12)

### Proteksi Data Soal
- **`kunci_jawaban` tidak pernah dikirim ke client** saat peserta mengambil soal
- Kunci jawaban hanya digunakan di server saat proses scoring (`submitAndScore`)
- Soal diambil dengan `select` eksplisit yang mengecualikan kunci dari response

### Pengacakan Soal & Pilihan
- Urutan soal diacak per sesi menggunakan **Fisher-Yates shuffle**
- Pilihan jawaban tiap soal diacak dengan **peta huruf tersimpan di DB** (`urutan_opsi`)
- Peta ini digunakan saat scoring untuk mendecode jawaban peserta kembali ke huruf asli
- Setiap peserta mendapat **urutan yang berbeda** untuk ujian yang sama
- Jika peserta reload/disconnect, urutan tetap sama (konsistensi dijamin dari DB)

### Anti-Cheat Tab Switching & Window Blur
- Frontend mendeteksi **dua event**: `document.visibilitychange` + `window.blur`
- Setiap kali peserta berpindah tab/window → event dikirim ke server via Socket.io
- **Debounce 2 detik** di server (`violationDebounce` map) untuk mencegah double-count
- Jika status sesi sudah `SUBMITTED`, pelanggaran tidak dicatat (tolak event)
- Setiap pelanggaran dicatat di `violation_logs` dengan timestamp dan nomor urut
- Peserta menerima popup peringatan dengan nomor urut pelanggaran
- Admin melihat update pelanggaran secara real-time di MonitorPage (termasuk `timestamp`)

### Role-Based Access Control (RBAC)
- 3 level akses: ADMIN > TUTOR > PESERTA
- Middleware berlapis: `requireAuth` + `requireAdmin` + `requireAdminOnly`
- Operasi write pengguna hanya boleh dilakukan ADMIN
- Peserta tidak bisa mengakses endpoint admin
- Frontend route guard (`PrivateRoute`) dengan `adminOnly` prop

---

## 11. Sistem Penilaian (Scoring Engine)

### Aturan Penilaian SKD (sesuai standar BKN)

| Kategori | Benar | Salah/Tidak Dijawab | Catatan |
|----------|-------|----------------------|---------|
| **TWK** (Tes Wawasan Kebangsaan) | +5 | 0 | Tidak ada pengurangan |
| **TIU** (Tes Intelegensia Umum) | +5 | 0 | Tidak ada pengurangan |
| **TKP** (Tes Karakteristik Pribadi) | poin tiered | 0 (jika tidak dijawab) | Poin per opsi berbeda (1-5), diambil dari field `poin` di DB |

### Alur Scoring
```javascript
// 1. Ambil jawaban peserta (masih huruf acak)
const userAnswerRaw = jawaban[questionId];  // misal: "C" (huruf acak)

// 2. Decode huruf acak → huruf asli
const mapping = urutan_opsi[questionId];   // { "C": "A", "A": "D", ... }
const userAnswer = (mapping && mapping[userAnswerRaw])
  ? mapping[userAnswerRaw]  // "A" (huruf asli)
  : userAnswerRaw;          // fallback: pakai nilai mentah

// 3. Hitung skor berdasarkan kategori
if (kategori === 'TWK') → benar: +5, salah: +0
if (kategori === 'TIU') → benar: +5, salah: +0
if (kategori === 'TKP') → ambil `poin` dari opsi asli yang dipilih (fallback: 1)
```

### Formula Nilai Integrasi SKD-SKB (Formula BKN Resmi)
```
Nilai Integrasi SKD = (total_skor_SKD / maks_SKD) × 40
Nilai Integrasi SKB = (skor_SKB / maks_SKB) × 60
Total Nilai Akhir   = Nilai Integrasi SKD + Nilai Integrasi SKB
```

**Nilai default:**
- `maks_SKD` = 550 (dapat disesuaikan admin via `PATCH /api/exam/skb/:sessionId`)
- `maks_SKB` = 100 (dapat disesuaikan admin)
- `skor_SKB` = 0 sampai admin menginput setelah ujian

**Contoh:**
```
total_skor = 375, maks_skd = 550, skor_skb = 75, maks_skb = 100

Integrasi SKD = (375 / 550) × 40 = 27.2727
Integrasi SKB = (75  / 100) × 60 = 45.0000
Total Nilai   = 27.2727 + 45.0000 = 72.2727
```

---

## 12. WebSocket & Real-Time Monitoring

### Rooms (Kamar WebSocket)
| Room | Format | Siapa yang Join |
|------|--------|-----------------|
| Session room | `sessionId` (UUID) | Peserta |
| Monitor room | `monitor:{examId}` | Admin |

### Events dari Client ke Server
| Event | Pengirim | Payload | Fungsi |
|-------|----------|---------|--------|
| `join_session` | Peserta | `{ sessionId }` | Masuk ke room sesi, load data dari DB, update liveStore |
| `peserta_question_update` | Peserta | `{ sessionId, questionIndex, totalAnswered }` | Update posisi soal di liveStore |
| `admin_join_monitoring` | Admin | `{ examId }` | Masuk ke monitor room, terima snapshot semua sesi |
| `tab_violation` | Peserta | `{ sessionId }` | Catat pelanggaran tab switching (dengan debounce 2 detik) |

### Events dari Server ke Client
| Event | Penerima | Payload | Fungsi |
|-------|----------|---------|--------|
| `session_live_update` | Admin (monitor room) | Data sesi lengkap dari liveStore | Update status peserta real-time |
| `monitoring_snapshot` | Admin (saat join) | `{ examId, sessions[] }` | Snapshot awal semua sesi dari DB + liveStore |
| `violation_warning` | Peserta (session room) | `{ total, message }` | Popup peringatan ke peserta |
| `violation_live_update` | Admin (monitor room) | `{ sessionId, jumlah_pelanggaran, nama, examId, timestamp }` | Update counter pelanggaran ke admin |

### In-Memory Live Session Store
Server menyimpan status real-time peserta di memori (`liveSessionStore`):
```javascript
{
  [sessionId]: {
    sessionId,
    examId,
    userId,
    nama,
    questionIndex,         // soal ke berapa (0-indexed)
    totalAnswered,         // berapa soal sudah dijawab
    jumlah_pelanggaran,
    status,                // ONGOING / SUBMITTED
    connected,             // true = online, false = disconnect
    lastSeen               // timestamp terakhir aktif (Date.now())
  }
}
```

**Lifecycle liveSessionStore:**
- **Diisi** saat `join_session` (load dari DB + update `connected: true`)
- **Diupdate** saat `peserta_question_update` (posisi soal baru)
- **Diupdate** saat `tab_violation` (counter pelanggaran)
- **Connected false** saat `disconnect` event
- **Status SUBMITTED** saat `removeFromLiveStore()` dipanggil (setelah ujian selesai)

---

## 13. API Reference

### Auth Routes (`/api/auth`)
```
POST   /api/auth/register          Daftar akun baru (nama, email, password)
POST   /api/auth/login             Login, mendapat JWT
GET    /api/auth/me                Info user dari token (requireAuth)
```

### Admin Routes (`/api/admin`) — Butuh role ADMIN/TUTOR
```
# Tryout
GET    /api/admin/exams                       Semua tryout + count soal & sesi
GET    /api/admin/exams/:id                   Detail tryout + soal-soalnya
POST   /api/admin/exams                       Buat tryout baru { judul_tryout, durasi_menit }
PUT    /api/admin/exams/:id                   Edit tryout { judul_tryout?, durasi_menit? }
DELETE /api/admin/exams/:id                   Hapus tryout (cascade)
PATCH  /api/admin/exams/:id/toggle            Aktifkan/nonaktifkan tryout

# Soal
GET    /api/admin/exams/:examId/questions             Semua soal
POST   /api/admin/exams/:examId/questions             Tambah soal
PUT    /api/admin/exams/:examId/questions/:questionId Edit soal
DELETE /api/admin/exams/:examId/questions/:questionId Hapus soal
POST   /api/admin/exams/:examId/questions/import      Import dari Excel (multipart/form-data)

# Laporan
GET    /api/admin/leaderboard/:examId         Peringkat peserta (status SUBMITTED)
GET    /api/admin/violations/:examId          Log pelanggaran per sesi
GET    /api/admin/sessions/:examId            Semua sesi ujian (untuk monitoring)

# Pengguna (write: ADMIN only)
GET    /api/admin/users                       Semua pengguna (terurut nama)
POST   /api/admin/users                       Buat pengguna { nama_lengkap, email, password, role? }
PUT    /api/admin/users/:id                   Edit pengguna { nama_lengkap?, email?, role?, password? }
DELETE /api/admin/users/:id                   Hapus pengguna (cascade manual via raw SQL)
```

### Exam Routes (`/api/exam`) — Butuh login
```
GET    /api/exam/active              Daftar tryout aktif saat ini
GET    /api/exam/info/:examId        Info ujian (tanpa membuat sesi)
POST   /api/exam/start               Mulai ujian { examId } / resume sesi ONGOING
GET    /api/exam/questions/:examId   Ambil soal dalam urutan sesi (tanpa kunci)
PATCH  /api/exam/save-answer         Simpan jawaban { sessionId, questionId, jawaban }
POST   /api/exam/finish              Kumpulkan + scoring { sessionId }
GET    /api/exam/result/:sessionId   Hasil ujian (hanya SUBMITTED)
PATCH  /api/exam/skb/:sessionId      Input skor SKB { skor_skb, maks_skb?, maks_skd? }
```

#### `GET /api/exam/info/:examId` — Detail Response
```json
{
  "id": "uuid",
  "judul_tryout": "Tryout SKD CPNS 2026",
  "durasi_menit": 90,
  "waktu_mulai": "2026-08-04T00:00:00.000Z",
  "waktu_selesai": "2026-08-04T23:59:00.000Z",
  "jumlah_soal": 110,
  "isExpired": false,
  "isNotStarted": false
}
```

#### `POST /api/exam/start` — Detail Response (sesi baru)
```json
{
  "message": "Ujian dimulai.",
  "session": { "id": "uuid", "status": "ONGOING", ... },
  "remainingMs": 5400000
}
```

#### `POST /api/exam/finish` — Detail Response
```json
{
  "message": "Jawaban berhasil dikumpulkan.",
  "result": { "id": "uuid", "status": "SUBMITTED", "skor_twk": 50, "skor_tiu": 35, "skor_tkp": 120, "total_skor": 205, ... }
}
```

---

## 14. Cara Menjalankan Sistem

### Prasyarat
- Node.js (v18+)
- PostgreSQL (v14+)
- npm

### Langkah Setup

#### 1. Konfigurasi Database
Buat database PostgreSQL, lalu buat file `backend/.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/catalyst_cbt"
JWT_SECRET="ganti-dengan-secret-acak-yang-kuat"
JWT_EXPIRES_IN="7d"
PORT=5000
```

#### 2. Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Jalankan Migrasi & Seed Database
```powershell
cd backend
npx prisma migrate dev     # Buat tabel dari schema.prisma
npx prisma generate        # Generate Prisma client
node prisma/seed.js        # Isi data awal (4 akun + 1 tryout + 9 soal)
```

#### 4. Jalankan Aplikasi

**Cara 1 — Menggunakan start.ps1 (otomatis):**
```powershell
# Dari folder projek akhir
.\start.ps1
```

**Cara 2 — Manual (dua terminal):**
```powershell
# Terminal 1: Backend
cd backend
npm run dev       # node --watch src/index.js (hot-reload)

# Terminal 2: Frontend
cd frontend
npm run dev       # vite dev server
```

#### 5. Akses Aplikasi
| Layanan | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000 |
| **Health Check** | http://localhost:5000/api/health |
| **Prisma Studio** | `npx prisma studio` (port 5555) |

---

## 15. Akun Default & Seed Data

Setelah menjalankan `node prisma/seed.js`:

### Akun Default
| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | admin@catalyst.id | admin123 |
| **TUTOR** | tutor@catalyst.id | tutor123 |
| **PESERTA** | budi@test.id | peserta123 |
| **PESERTA** | dandi@mail.com | peserta123 |

### Data Awal
- **1 Tryout aktif**: "Tryout SKD CPNS 2026 — Batch 1" (durasi 90 menit, `waktu_selesai = now + 90 menit + 1 jam buffer`)
- **9 Soal contoh**:
  - TWK: 3 soal (Pancasila, UUD 1945, Bhinneka Tunggal Ika)
  - TIU: 3 soal (aljabar, antonim, deret angka)
  - TKP: 3 soal (skenario sikap kerja)

### Script NPM Backend
```powershell
npm run dev      # Jalankan dengan hot-reload (node --watch)
npm run start    # Jalankan production (node src/index.js)
npm run migrate  # Migrasi database (npx prisma migrate dev)
npm run generate # Generate Prisma client
npm run studio   # Buka Prisma Studio (GUI database, port 5555)
```

---

## 16. Catatan Teknis Penting

> **Prisma v7 + Driver Adapter**
> Sistem menggunakan Prisma v7 dengan `@prisma/adapter-pg` (driver adapter pattern). Kolom yang ditambahkan ke schema *setelah* generate client (seperti kolom integrasi SKD-SKB) mungkin tidak dikenali oleh generated client. Oleh karena itu, query untuk kolom tersebut menggunakan `pgQuery()` (raw SQL via `pg` pool) sebagai fallback.

> **Dual Query Strategy**
> Sistem menggunakan dua cara query secara bersamaan:
> - **Prisma ORM** — untuk CRUD standar yang sudah dikenali schema
> - **`pgQuery()` raw SQL** — untuk kolom integrasi SKD-SKB dan operasi cascade manual (`deleteUser`)

> **Keamanan Produksi**
> Sebelum deployment produksi:
> - Ganti `JWT_SECRET` dengan string random yang kuat (min 32 karakter)
> - Gunakan HTTPS
> - Konfigurasi CORS untuk domain produksi (bukan `localhost:5173`)
> - Gunakan variabel environment yang aman (bukan `.env` yang ter-commit)

> **Pengacakan Soal — Konsistensi Sesi**
> Urutan soal dan opsi jawaban dikunci per sesi saat `startExam`. Jika peserta reload/disconnect, mereka mendapatkan **urutan yang sama** karena `urutan_soal` dan `urutan_opsi` tersimpan di database. Ini memastikan konsistensi dan mencegah manipulasi urutan soal.

> **Zustand Functional Update pada Timer**
> `setRemainingMs` di Zustand store mendukung dua bentuk pemanggilan:
> - `setRemainingMs(3600000)` — set nilai langsung
> - `setRemainingMs(prev => prev - 1000)` — functional update
>
> Ini diperlukan karena timer menggunakan `setInterval` yang rentan terhadap stale closure. Zustand **tidak** otomatis memanggil fungsi seperti React's `setState`; implementasi eksplisit diperlukan di dalam action store.

> **Backend Restart Diperlukan Setelah Perubahan Kode**
> Backend menggunakan `node --watch` yang secara teori auto-reload saat file berubah. Namun dalam praktiknya, **restart manual direkomendasikan** setelah menambahkan route atau controller baru. Gunakan `Stop-Process -Name node -Force` di PowerShell lalu jalankan ulang `npm run dev`.

> **Fase State Machine di ExamPage**
> `ExamPage` menggunakan state machine eksplisit (`phase`) bukan boolean flags. Ini mencegah kondisi race antara fetch info ujian, konfirmasi peserta, dan pembuatan sesi. Urutan fase yang benar: `loading → (error | expired | ready) → exam`.

> **Anti-Cheat Dual Event**
> Sistem menggunakan **dua event listener** untuk deteksi tab switching:
> 1. `visibilitychange` — event utama (paling andal di semua browser)
> 2. `window.blur` + 200ms delay — fallback untuk kasus tertentu (popup, download dialog)
>
> Kedua event mengarah ke Socket.io emit yang sama (`tab_violation`). Debounce 2 detik di server mencegah double-count.

> **Toggle Tryout — Buffer 1 Jam**
> Saat admin mengaktifkan tryout via `PATCH /toggle`, sistem menambahkan buffer **+1 jam** di atas durasi asli: `waktu_selesai = now + durasi_menit + 60 menit`. Buffer ini memberi ruang bagi peserta yang bergabung sedikit terlambat. Buffer tidak berlaku saat tryout dibuat pertama kali via `POST /api/admin/exams`.

---

## 17. Riwayat Perubahan

### v1.2.0 — 4 Agustus 2026

#### 📝 Pembaruan Dokumentasi
- Dokumentasi diperbarui penuh untuk mencerminkan kondisi kode terkini
- Ditambahkan detail `dismissViolationModal` action di Zustand store
- Ditambahkan `express-validator`, `cors`, `tsx`, `typescript` ke tabel dependensi
- Ditambahkan detail dual event listener anti-cheat (`visibilitychange` + `window.blur`)
- Ditambahkan penjelasan buffer +1 jam pada `toggleExamActive`
- Ditambahkan detail safeguard `deleteUser` (anti self-deletion)
- Ditambahkan kolom `Default` pada tabel skema `exam_sessions`
- Ditambahkan lifecycle `liveSessionStore` secara detail
- Ditambahkan field `timestamp` pada payload `violation_live_update`
- Ditambahkan section `main.ts` dan `counter.ts` (file TypeScript unused) di struktur direktori
- Ditambahkan `isNotStarted` pada penjelasan response `getExamInfo`
- Ditambahkan detail response contoh untuk `POST /exam/start` dan `POST /exam/finish`

---

### v1.1.0 — 16 Juli 2026

#### 🐛 Perbaikan Bug

| # | Bug | Root Cause | Solusi |
|---|-----|------------|--------|
| 1 | Timer peserta menampilkan `NaN:NaN` | `formatTime()` tidak memvalidasi tipe data; `remainingMs` bisa `null`/`undefined` dari API | Tambah guard: `const safe = typeof ms === 'number' && isFinite(ms) ? ms : 0` |
| 2 | Timer tidak berjalan setelah ujian dimulai | `setRemainingMs` di Zustand store tidak mendukung functional update — memanggil `set({ remainingMs: fn })` sehingga `remainingMs` berisi fungsi, bukan angka | Ubah action menjadi `set(state => ({ remainingMs: typeof updater === 'function' ? updater(state.remainingMs) : updater }))` |
| 3 | `useEffect` timer tidak re-run saat `remainingMs` pertama kali diisi | Dependency array `[session?.id, remainingMs > 0]` tidak berubah karena boolean `true → true` | Perbaiki logic guard dan dependency — clear interval lama di awal setiap effect run |

#### ✨ Fitur Baru

**ReadyModal** (`frontend/src/components/ReadyModal.jsx`)
- Modal konfirmasi premium sebelum peserta masuk ke room ujian
- Menampilkan info ujian: judul, durasi, jumlah soal, kategori
- Countdown waktu tersisa hingga ujian berakhir (real-time)
- Daftar aturan ujian yang harus dipatuhi
- Tombol **"Saya Siap, Mulai!"** dan **"Kembali ke Dashboard"**
- Tombol disabled otomatis jika waktu sudah habis atau sedang loading

**ExpiredModal** (`frontend/src/components/ExpiredModal.jsx`)
- Modal blokir penuh ketika waktu ujian sudah lewat
- Menampilkan pesan informatif + waktu berakhirnya ujian
- Tidak ada opsi untuk masuk ke ujian atau submit jawaban

**Endpoint `GET /api/exam/info/:examId`** (backend)
- Mengambil info ujian tanpa membuat sesi (pre-flight check)
- Mengembalikan flag `isExpired` dan `isNotStarted`
- Digunakan oleh frontend untuk menentukan fase tampilan

**ExamPage State Machine**
- Refactor `ExamPage.jsx` dari alur sekuensial menjadi state machine eksplisit
- 5 fase: `loading`, `error`, `expired`, `ready`, `exam`
- Fase `error` menampilkan card dengan tombol **"Coba Lagi"** (retry `getExamInfo`)
- Sesi ujian **tidak dibuat** sampai peserta mengklik konfirmasi di ReadyModal

**examStore — Penambahan State & Action**
- State baru: `examInfo` — menyimpan info ujian dari endpoint `/info`
- Action baru: `getExamInfo(examId)` — fetch info ujian tanpa membuat sesi
- `resetExam` kini juga mereset `examInfo` ke `null`

---

*Dokumentasi diperbarui: 4 Agustus 2026.*
