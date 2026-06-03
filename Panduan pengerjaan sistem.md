# 🤖 MASTER DEVELOPMENT GUIDE & AI PROMPT: CATALYST CBT ENGINE

## 📌 INSTRUKSI UTAMA UNTUK AI AGENT
Anda adalah Senior Fullstack & Database Engineer. Tugas Anda adalah mengimplementasikan sistem Catalyst CBT Engine. 
**ATURAN MUTLAK (HARD CONSTRAINTS):**
1. **Dilarang Halusinasi Tech Stack:** Hanya gunakan Node.js, Express, Socket.io, Prisma ORM, PostgreSQL, React, Zustand, dan Tailwind CSS.
2. **Dilarang Merubah Skema:** Gunakan skema *database* persis seperti yang tertulis di dokumen ini.
3. **Pola Kerja:** Anda harus bekerja secara berurutan (*Sequential*). Selesaikan Phase 1, minta saya untuk *testing*, dan tunggu aba-aba saya sebelum lanjut ke Phase 2.

## 🗄️ 1. DATABASE SCHEMA DETAIL (POSTGRESQL + PRISMA)
Berikut adalah arsitektur data relasional wajib. Setiap relasi harus menggunakan `onDelete: Cascade`.

1. **`User` Table:** * `id` (String/UUID, PK), `nama_lengkap` (String), `email` (String, Unique), `password` (String, Hashed), `role` (Enum: 'ADMIN', 'PESERTA').
2. **`Exam` Table:**
   * `id` (String/UUID, PK), `judul_tryout` (String), `durasi_menit` (Int), `waktu_mulai` (DateTime), `waktu_selesai` (DateTime). *(Catatan: Tidak ada field max_pelanggaran).*
3. **`Question` Table:**
   * `id` (String/UUID, PK), `exam_id` (UUID, FK), `kategori` (Enum: 'TWK', 'TIU', 'TKP'), `teks_soal` (Text).
   * `opsi_jawaban` (JsonB): Array of objects. Contoh format wajib: `[{"huruf":"A", "teks":"...", "poin":5}, {"huruf":"B", "teks":"...", "poin":0}]`.
   * `kunci_jawaban` (String): (Contoh: "A"). 
   * **⚠️ CRITICAL SECURITY:** Nilai `kunci_jawaban` mutlak harus dihapus (di-omit) dari *response payload* ketika Endpoint dipanggil oleh *User* dengan role 'PESERTA'.
4. **`ExamSession` Table:**
   * `id` (String/UUID, PK), `user_id` (UUID, FK), `exam_id` (UUID, FK), `waktu_mulai` (DateTime), `status` (Enum: 'ONGOING', 'SUBMITTED').
   * `skor_twk` (Int, default 0), `skor_tiu` (Int, default 0), `skor_tkp` (Int, default 0), `total_skor` (Int, default 0).
   * `jumlah_pelanggaran` (Int, default 0).
   * `jawaban_peserta` (JsonB): Untuk menyimpan progres jawaban (Contoh: `{"question_id_1": "A", "question_id_2": "C"}`).
5. **`ViolationLog` Table:**
   * `id` (String/UUID, PK), `session_id` (UUID, FK), `waktu_pelanggaran` (DateTime, default now), `jenis_pelanggaran` (String: "TAB_SWITCHED"), `peringatan_ke` (Int).

## 🧠 2. CORE LOGIC & ANTI-CHEAT ENGINE
1. **Asynchronous Saving:** Saat peserta memilih opsi A, B, C, D, atau E di *frontend*, React (via Zustand) harus segera memperbarui *state* lokal, DAN mengirimkan permintaan `PATCH /api/exam/save-answer` ke *backend* tanpa menunggu peserta menekan tombol 'Submit Akhir'. Ini mencegah kehilangan data jika mati lampu.
2. **Anti-Cheat Mechanics (Tanpa Force Submit):**
   * *Frontend (React):* Gunakan `useEffect` dengan *event listener* `visibilitychange`. Jika `document.hidden === true`, eksekusi `socket.emit('tab_violation', { sessionId })`.
   * *Backend (Node/Socket.io):* Terima *event*, `UPDATE ExamSession SET jumlah_pelanggaran = jumlah_pelanggaran + 1`, lalu `INSERT INTO ViolationLog`.
   * *Backend (Node/Socket.io):* Emit balik `socket.emit('violation_warning', { total: newTotal })` ke *frontend*.
   * *Frontend (React):* Tangkap *event* peringatan, lalu *render* *Modal/Pop-up* berlatar belakang merah/oranye di tengah layar. Ujian tidak dihentikan.
3. **Scoring Engine:** Dijalankan di *backend* saat `POST /api/exam/finish`. Server mencocokkan `jawaban_peserta` (JSONB) dengan `kunci_jawaban` dan poin pada tabel `Question`.

## 🛤️ 3. DEVELOPMENT ROADMAP (PHASED EXECUTION)

* **PHASE 1: Foundation.** Inisiasi Node.js, konfigurasikan `prisma/schema.prisma`, jalankan migrasi database, dan buat struktur folder (Controllers, Routes, Middlewares). *Testing: Pastikan tabel terbuat di PostgreSQL.*
* **PHASE 2: Auth & Guard.** Buat register/login dengan `bcrypt` dan `jsonwebtoken`. Buat *middleware* `requireAuth` dan `requireAdmin`. *Testing: Berikan contoh payload JSON untuk diuji di Postman.*
* **PHASE 3: Admin API.** Buat fungsi CRUD lengkap untuk `Exam` dan `Question`. Buat logika validasi untuk memastikan data `opsi_jawaban` berformat array JSON yang benar.
* **PHASE 4: Participant Flow.** Buat fungsi `startExam`, `getQuestions` (tanpa kunci jawaban), `saveAnswer` (JSONB update), dan `finishExam` (Kalkulasi skor otomatis).
* **PHASE 5: Real-time Anti-Cheat.** Integrasikan Socket.io di Express. Buat *event handlers* untuk mencatat pelanggaran tab dan melakukan *broadcast* peringatan.
* **PHASE 6: Frontend Integration.** Bangun UI menggunakan React.js, hubungkan Zustand untuk manajemen sesi, buat UI ujian yang responsif menggunakan Tailwind, dan integrasikan Socket.io-client.