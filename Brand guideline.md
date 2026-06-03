# 🎨 BRAND IDENTITY & UI/UX GUIDELINES: CATALYST CBT ENGINE

## 1. Identitas Inti (Core Identity)
* **Nama Merek:** **Catalyst CBT Engine** (Gunakan nama ini pada *Title Bar*, *Meta Tags*, *Footer*, dan *Header* aplikasi).
* **Visi Desain:** Bersih, minim distraksi, cepat dimuat, dan memberikan kesan otoritatif namun ramah pengguna (mirip dengan standar aplikasi CAT BKN milik pemerintah).

## 2. Palet Warna (Color Palette)
Warna harus digunakan secara fungsional untuk mengarahkan fokus pengguna, bukan sekadar estetika.

* **Warna Primer (Brand & Layout):**
  * `Primary Dark` **(#0F172A - Slate 900):** Digunakan untuk latar belakang *Sidebar*, *Header* utama, dan teks judul utama (H1). Memberikan kesan stabil dan serius.
  * `Action Blue` **(#2563EB - Blue 600):** Warna interaktif utama. Digunakan untuk tombol *Submit*, tautan aktif, dan indikator *radio button* yang dipilih.
  * `Action Hover` **(#1D4ED8 - Blue 700):** Warna saat *Action Blue* di-hover atau ditekan.
* **Warna Status & Indikator (Feedback Colors):**
  * `Success` **(#10B981 - Emerald 500):** Digunakan pada nomor soal di *Grid Navigasi* yang **sudah dijawab**, dan notifikasi sukses.
  * `Warning` **(#F59E0B - Amber 500):** Warna mutlak untuk **Modal Peringatan Tab-Switching** dan *timer* ketika waktu tersisa kurang dari 10 menit.
  * `Danger/Error` **(#EF4444 - Red 500):** Digunakan untuk pesan *error* validasi, peringatan koneksi terputus, atau tombol pembatalan.
  * `Neutral` **(#94A3B8 - Slate 400):** Digunakan untuk soal yang **belum dijawab** pada *Grid Navigasi* dan teks sekunder.
* **Warna Latar Belakang (Surface/Background):**
  * `App Background` **(#F8FAFC - Slate 50):** Warna latar belakang utama seluruh halaman agar mata tidak cepat lelah (jangan gunakan putih murni #FFFFFF untuk *background* utama).
  * `Card/Canvas` **(#FFFFFF - White):** Digunakan untuk kontainer teks soal dan panel utama.

## 3. Tipografi (Typography Hierarchy)
* **Teks Umum & Soal (Sans-Serif):** Gunakan **Inter** atau **System Default (San Francisco/Roboto)**.
  * *Teks Soal:* Minimal 16px (1rem), Line-height 1.6 (Relaxed) agar mudah dibaca.
  * *Heading 1 (H1):* 24px, Font Weight 700 (Bold), warna `Primary Dark`.
  * *Body Text:* 14px, Font Weight 400 (Regular).
* **Angka & Timer (Monospace):** Gunakan **JetBrains Mono** atau **Fira Code**.
  * *Alasan:* Font *monospace* memastikan lebar setiap karakter angka sama (tabular lining), sehingga tampilan *timer* (misal: 01:24:59) tidak bergeser atau berkedip saat detik berubah.

## 4. Anatomi Komponen UI (UI Components)
* **Sudut & Radius:** Gunakan `rounded-md` (6px) atau `rounded-lg` (8px) standar Tailwind. Hindari sudut yang terlalu bulat (*pill-shaped*) agar tidak terlihat seperti aplikasi mainan.
* **Bayangan (Shadows):** Gunakan `shadow-sm` untuk elemen normal dan `shadow-md` untuk kartu (*Card*) soal. Untuk *Pop-up/Modal* peringatan, gunakan `shadow-2xl` dipadukan dengan *backdrop-blur* agar fokus peserta tertuju pada peringatan.
* **Grid Navigasi Soal:** Harus tetap terlihat (*sticky*) di sisi kanan layar (pada Desktop) agar peserta bisa dengan cepat melompat ke nomor soal tertentu tanpa harus *scroll* ke atas.
* **Responsive Design:** Pada perangkat *mobile*, Sidebar dan Grid Navigasi harus disembunyikan ke dalam *Hamburger Menu* (Off-canvas) untuk memaksimalkan area baca soal.

## 5. Nada Bahasa (Tone of Voice)
* **Gaya:** Instruktural, formal, tegas, dan tidak menggunakan jargon teknis.
* **Pesan Peringatan Kecurangan:** *"Peringatan! Sistem mendeteksi Anda meninggalkan halaman ujian. Pelanggaran ini telah dicatat ke dalam log server. Harap kembali fokus pada ujian Anda."*