# 📑 SYSTEM SPECIFICATIONS: CATALYST CBT ENGINE

## 🎯 1. Deskripsi Eksekutif Sistem
Catalyst CBT Engine adalah platform simulasi ujian daring berbasis web yang dirancang dengan arsitektur terkini untuk meniru perilaku dan ketatnya ujian Computer Assisted Test (CAT) seleksi CPNS. Nilai jual unik (*Unique Selling Proposition*) dari sistem ini adalah **Proactive Digital Proctoring**—sebuah mekanisme pengawasan mandiri yang membaca aktivitas *event* peramban pengguna (berbasis *Visibility API*) dan memberikan intervensi teguran secara *real-time* via komunikasi WebSockets tanpa memerlukan akses perangkat keras kamera (*webcam*).

## 👥 2. Matriks Hak Akses (Role Matrix)

### A. Role: ADMIN (Pihak PT Karya Edukasi)
* **Manajemen Bank Soal:** Memasukkan teks soal, gambar (opsional via URL/Base64), opsi pilihan ganda (A-E), beserta penentuan kunci jawaban.
* **Pengaturan Bobot (Khusus TKP):** Menentukan bobot nilai spesifik (1, 2, 3, 4, 5) untuk setiap opsi jawaban pada soal berkategori Tes Karakteristik Pribadi (TKP).
* **Manajemen Tryout:** Menjadwalkan ujian (waktu mulai & selesai), mengatur durasi (*countdown timer*).
* **Monitoring & Laporan:** Melihat papan peringkat (Leaderboard) skor total (TIU, TWK, TKP) peserta, dan mengakses **Log Pelanggaran** untuk melihat daftar peserta yang mencoba melakukan kecurangan (pindah *tab*), lengkap dengan jam kejadian (*timestamp*).

### B. Role: PESERTA (Siswa Tryout)
* **Akses Ujian:** Mengakses paket ujian yang berstatus 'Aktif' berdasarkan rentang waktu.
* **Workspace Ujian:** Menjawab soal melalui antarmuka yang bersih. Melakukan navigasi acak (melompat antar nomor soal) menggunakan Grid Navigasi.
* **Real-time Feedback:** Menerima notifikasi *pop-up* peringatan instan (tanpa perlu memuat ulang halaman) jika terdeteksi membuka aplikasi/tab lain saat ujian berlangsung.

## 🔄 3. Alur Kerja Ujian (Exam Lifecycle)
1. **Inisiasi (Start):** Peserta menekan tombol "Mulai". Sistem *Backend* mencatat waktu mulai (waktu server) ke dalam tabel `ExamSession` dan mengatur status menjadi `ONGOING`.
2. **Sinkronisasi Waktu:** Sisa waktu ujian dihitung berdasarkan (Durasi Ujian - Selisih Waktu Sekarang dengan Waktu Mulai di Server). Ini mencegah peserta memanipulasi *timer* menggunakan fitur inspeksi browser (*Inspect Element*).
3. **Penyimpanan Terdistribusi:** Setiap kali peserta menekan sebuah pilihan jawaban, API `PATCH` dieksekusi secara latar belakang (*background fetch/axios*) ke *database* PostgreSQL.
4. **Mekanisme Peringatan (Socket.io):**
   * *Trigger:* Peserta menekan `Alt+Tab`, membuka jendela baru, atau me-*minimize* browser.
   * *Action:* Klien memancarkan sinyal `tab_violation`. Server mencatatnya secara asinkron ke tabel `ViolationLog`. Server membalas dengan sinyal `violation_warning`.
   * *Result:* Layar peserta tertutup oleh *Modal Alert* berwarna merah/oranye dan harus diklik "Saya Mengerti" untuk bisa melanjutkan ujian.
5. **Terminasi & Kalkulasi (Finish):** Ujian berakhir karena peserta menekan tombol "Kumpul Jawaban" atau waktu *timer* habis. Sistem mencocokkan JSON `jawaban_peserta` dengan data asli di *database*, menghitung skor berdasarkan aturan SKD CPNS, mengubah status menjadi `SUBMITTED`, dan membekukan seluruh modifikasi data.

## 🛡️ 4. Spesifikasi Keamanan (Non-Functional Requirements)
* **No Key Leakage:** Kunci jawaban dijaga mutlak di tingkat *Controller Backend*. Modul pengirim data soal API tidak akan pernah melakukan *query* atau mengirim variabel `kunci_jawaban` ke *browser* peserta.
* **ACID Compliance:** Penggunaan PostgreSQL dengan ORM Prisma menjamin bahwa proses pencatatan skor di akhir ujian berjalan secara atomik (tidak ada data setengah jadi jika server tiba-tiba *down*).
* **Resilience:** Jika peserta kehilangan koneksi internet atau tidak sengaja menutup *browser*, mereka dapat *login* kembali. Selama waktu ujian (*timer*) server belum habis, mereka akan diarahkan kembali ke soal terakhir lengkap dengan jawaban-jawaban yang sudah diisi sebelumnya (berkat penyimpanan JSONB Asynchronous).