// backend/prisma/seed_50_questions.js
const { prisma } = require('../src/lib/prisma');

const QUESTIONS_DATA = [
  // ══════════════════════════════════════════════════════════════════════════════
  // TWK (20 Soal)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    kategori: 'TWK',
    tags: 'Pancasila & Ideologi',
    teks_soal: 'Pancasila sebagai ideologi terbuka memiliki dimensi fleksibilitas, yang artinya adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Nilai-nilai Pancasila dapat diubah sesuai kehendak penguasa yang memimpin.', poin: 0 },
      { huruf: 'B', teks: 'Pancasila memuat cita-cita universal tanpa batas nilai moral.', poin: 0 },
      { huruf: 'C', teks: 'Pancasila mampu berkembang dan menyesuaikan diri dengan dinamika perkembangan zaman tanpa mengubah nilai dasarnya.', poin: 1 },
      { huruf: 'D', teks: 'Pancasila menerima seluruh ideologi asing secara bebas tanpa filter budaya.', poin: 0 },
      { huruf: 'E', teks: 'Pancasila bersifat kaku dan doktriner bagi seluruh warga negara.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'UUD 1945 & Konstitusi',
    teks_soal: 'Menurut Pasal 1 ayat (2) UUD NRI Tahun 1945 setelah amandemen, kedaulatan berada di tangan...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Presiden dan dilaksanakan sepenuhnya oleh kabinet kementerian.', poin: 0 },
      { huruf: 'B', teks: 'Majelis Permusyawaratan Rakyat (MPR) seutuhnya.', poin: 0 },
      { huruf: 'C', teks: 'Dewan Perwakilan Rakyat (DPR) sebagai wakil rakyat terpilih.', poin: 0 },
      { huruf: 'D', teks: 'Rakyat dan dilaksanakan menurut Undang-Undang Dasar.', poin: 1 },
      { huruf: 'E', teks: 'Mahkamah Konstitusi sebagai pengawal konstitusi tertinggi.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Bhinneka Tunggal Ika',
    teks_soal: 'Semboyan Bhinneka Tunggal Ika tercantum dalam lambang negara Garuda Pancasila dan diambil dari Kitab Sutasoma karya...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mpu Prapanca', poin: 0 },
      { huruf: 'B', teks: 'Mpu Tantular', poin: 1 },
      { huruf: 'C', teks: 'Mpu Sedah', poin: 0 },
      { huruf: 'D', teks: 'Mpu Panuluh', poin: 0 },
      { huruf: 'E', teks: 'Mpu Walmiki', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Bela Negara',
    teks_soal: 'Salah satu bentuk penerapan nilai dasar Bela Negara "Cinta Tanah Air" dalam kehidupan sehari-hari ASN adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Menggunakan dan memprioritaskan produk-produk buatan dalam negeri (UMKM lokal).', poin: 1 },
      { huruf: 'B', teks: 'Membeli barang impor bermerek untuk menunjukkan prestise.', poin: 0 },
      { huruf: 'C', teks: 'Menolak bekerjasama dengan bangsa asing dalam bidang apapun.', poin: 0 },
      { huruf: 'D', teks: 'Menghindari kegiatan sosial di lingkungan masyarakat.', poin: 0 },
      { huruf: 'E', teks: 'Membatasi diri hanya bergaul dengan orang yang satu suku daerah.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Sejarah Perjuangan',
    teks_soal: 'Peristiwa Rengasdengklok yang terjadi pada tanggal 16 Agustus 1945 dilatarbelakangi oleh perbedaan pendapat antara golongan muda dan golongan tua mengenai...',
    kunci_jawaban: 'E',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Penetapan teks naskah proklamasi yang akan ditandatangani.', poin: 0 },
      { huruf: 'B', teks: 'Penyusunan kabinet pertama Republik Indonesia.', poin: 0 },
      { huruf: 'C', teks: 'Pemilihan lokasi pembacaan proklamasi kemerdekaan.', poin: 0 },
      { huruf: 'D', teks: 'Hubungan diplomasi militer dengan tentara sekutu.', poin: 0 },
      { huruf: 'E', teks: 'Waktu dan mekanisme pelaksanaan proklamasi kemerdekaan tanpa campur tangan PPKI/Jepang.', poin: 1 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Integritas & Anti Korupsi',
    teks_soal: 'Sikap seorang ASN yang menolak pemberian tiket pesawat liburan dari rekanan vendor pemenang tender proyek pengadaan mencerminkan integritas dalam menghindari...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Pemerasan jabatan', poin: 0 },
      { huruf: 'B', teks: 'Gratifikasi ilegal yang berpotensi suap', poin: 1 },
      { huruf: 'C', teks: 'Penyalahgunaan wewenang administrasi', poin: 0 },
      { huruf: 'D', teks: 'Kerugian keuangan negara langsung', poin: 0 },
      { huruf: 'E', teks: 'Benturan tugas kedinasan internal', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Lembaga Negara',
    teks_soal: 'Lembaga negara yang memiliki kewenangan memutus sengketa hasil pemilihan umum dan menguji undang-undang terhadap UUD 1945 adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mahkamah Agung (MA)', poin: 0 },
      { huruf: 'B', teks: 'Komisi Yudisial (KY)', poin: 0 },
      { huruf: 'C', teks: 'Mahkamah Konstitusi (MK)', poin: 1 },
      { huruf: 'D', teks: 'Badan Pengawas Pemilu (Bawaslu)', poin: 0 },
      { huruf: 'E', teks: 'Dewan Perwakilan Daerah (DPD)', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Bahasa Indonesia',
    teks_soal: 'Penulisan kata serapan yang baku dan benar menurut pedoman EYD Edisi V adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Karier, Analisis, Standardisasi', poin: 1 },
      { huruf: 'B', teks: 'Karir, Analisa, Standarisasi', poin: 0 },
      { huruf: 'C', teks: 'Karir, Analisis, Standardisasi', poin: 0 },
      { huruf: 'D', teks: 'Karier, Analisa, Standarisasi', poin: 0 },
      { huruf: 'E', teks: 'Karier, Analisa, Standardisasi', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Tata Perundang-undangan',
    teks_soal: 'Berdasarkan UU No. 12 Tahun 2011, tata urutan hierarki peraturan perundang-undangan yang tepat di bawah UUD 1945 adalah...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Peraturan Pemerintah (PP)', poin: 0 },
      { huruf: 'B', teks: 'Ketetapan Majelis Permusyawaratan Rakyat (TAP MPR)', poin: 1 },
      { huruf: 'C', teks: 'Undang-Undang / Perppu', poin: 0 },
      { huruf: 'D', teks: 'Peraturan Presiden (Perpres)', poin: 0 },
      { huruf: 'E', teks: 'Peraturan Daerah Provinsi (Perda Provinsi)', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Pancasila Sila Ke-4',
    teks_soal: 'Mengutamakan musyawarah untuk mufakat dalam mengambil keputusan untuk kepentingan bersama merupakan butir pengamalan Pancasila sila ke-...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Sila Pertama', poin: 0 },
      { huruf: 'B', teks: 'Sila Kedua', poin: 0 },
      { huruf: 'C', teks: 'Sila Ketiga', poin: 0 },
      { huruf: 'D', teks: 'Sila Keempat', poin: 1 },
      { huruf: 'E', teks: 'Sila Kelima', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Hubungan Internasional',
    teks_soal: 'Prinsip politik luar negeri Indonesia yang "Bebas dan Aktif" pertama kali dicetuskan oleh Drs. Mohammad Hatta dalam pidato berjudul...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Indonesia Menggugat', poin: 0 },
      { huruf: 'B', teks: 'Mencapai Indonesia Merdeka', poin: 0 },
      { huruf: 'C', teks: 'Mendayung Antara Dua Karang', poin: 1 },
      { huruf: 'D', teks: 'Menuju Indonesia Baru', poin: 0 },
      { huruf: 'E', teks: 'Manifesto Politik 1925', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'NKRI & Pertahanan',
    teks_soal: 'Sistem pertahanan dan keamanan yang melibatkan segenap warga negara, wilayah, dan sumber daya nasional lainnya disebut...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Sistem Pertahanan dan Keamanan Rakyat Semesta (Sishankamrata)', poin: 1 },
      { huruf: 'B', teks: 'Sistem Militer Komando Teritorial', poin: 0 },
      { huruf: 'C', teks: 'Sistem Pertahanan Maritim Terpadu', poin: 0 },
      { huruf: 'D', teks: 'Sistem Keamanan Sipil Terkoordinasi', poin: 0 },
      { huruf: 'E', teks: 'Sistem Bela Negara Wajib Militer', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'HAM Konstitusional',
    teks_soal: 'Pasal dalam UUD 1945 yang mengatur bahwa setiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan adalah...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Pasal 26 ayat (1)', poin: 0 },
      { huruf: 'B', teks: 'Pasal 27 ayat (2)', poin: 1 },
      { huruf: 'C', teks: 'Pasal 28 ayat (1)', poin: 0 },
      { huruf: 'D', teks: 'Pasal 29 ayat (2)', poin: 0 },
      { huruf: 'E', teks: 'Pasal 31 ayat (1)', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Sejarah Organisasi',
    teks_soal: 'Organisasi pergerakan nasional pertama di Indonesia yang didirikan pada tanggal 20 Mei 1908 dan menjadi tonggak Hari Kebangkitan Nasional adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Budi Utomo', poin: 1 },
      { huruf: 'B', teks: 'Sarekat Dagang Islam', poin: 0 },
      { huruf: 'C', teks: 'Indische Partij', poin: 0 },
      { huruf: 'D', teks: 'Perhimpunan Indonesia', poin: 0 },
      { huruf: 'E', teks: 'Partai Nasional Indonesia', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Pancasila Sila Ke-5',
    teks_soal: 'Suka menghargai hasil karya orang lain yang bermanfaat bagi kemajuan dan kesejahteraan bersama adalah butir pengamalan dari sila...',
    kunci_jawaban: 'E',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Ketuhanan Yang Maha Esa', poin: 0 },
      { huruf: 'B', teks: 'Kemanusiaan yang adil dan beradab', poin: 0 },
      { huruf: 'C', teks: 'Persatuan Indonesia', poin: 0 },
      { huruf: 'D', teks: 'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan', poin: 0 },
      { huruf: 'E', teks: 'Keadilan sosial bagi seluruh rakyat Indonesia', poin: 1 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Deklarasi Djuanda',
    teks_soal: 'Deklarasi Djuanda yang dicetuskan pada tanggal 13 Desember 1957 memiliki arti penting bagi kedaulatan NKRI, yaitu...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Pengakuan internasional atas mata uang rupiah.', poin: 0 },
      { huruf: 'B', teks: 'Menyatakan bahwa laut di antara dan di dalam kepulauan Indonesia menjadi satu kesatuan wilayah kedaulatan mutlak NKRI.', poin: 1 },
      { huruf: 'C', teks: 'Penyatuan wilayah Irian Barat ke dalam pangkuan ibu pertiwi.', poin: 0 },
      { huruf: 'D', teks: 'Pembentukan pakta pertahanan bersama negara Asia Tenggara.', poin: 0 },
      { huruf: 'E', teks: 'Penetapan batas zona ekonomi eksklusif 200 mil laut pertama.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'BPUPKI & Dasar Negara',
    teks_soal: 'Tokoh bangsa yang mengusulkan lima dasar negara: Persatuan, Kekeluargaan, Keseimbangan lahir batin, Musyawarah, dan Keadilan rakyat pada sidang BPUPKI tanggal 31 Mei 1945 adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mr. Muhammad Yamin', poin: 0 },
      { huruf: 'B', teks: 'Ir. Soekarno', poin: 0 },
      { huruf: 'C', teks: 'Prof. Dr. Soepomo', poin: 1 },
      { huruf: 'D', teks: 'Drs. Mohammad Hatta', poin: 0 },
      { huruf: 'E', teks: 'KH. Wahid Hasyim', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Otonomi Daerah',
    teks_soal: 'Urusan pemerintahan yang sepenuhnya tetap menjadi kewenangan pemerintah pusat (absolut) dan tidak diserahkan ke daerah otonom antara lain meliputi...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Politik luar negeri, pertahanan, keamanan, yustisi, moneter/fiskal nasional, dan agama.', poin: 1 },
      { huruf: 'B', teks: 'Pendidikan dasar, kesehatan, lingkungan hidup, dan transportasi umum.', poin: 0 },
      { huruf: 'C', teks: 'Pariwisata daerah, perikanan darat, dan perdagangan lokal.', poin: 0 },
      { huruf: 'D', teks: 'Pertanian, tata ruang kota, dan kebudayaan daerah.', poin: 0 },
      { huruf: 'E', teks: 'Ketenagakerjaan lokal dan perizinan usaha kecil.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Piagam Jakarta',
    teks_soal: 'Perubahan rumusan sila pertama dari "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya" menjadi "Ketuhanan Yang Maha Esa" diputuskan demi menjaga...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Pengakuan dari pihak tentara sekutu.', poin: 0 },
      { huruf: 'B', teks: 'Persatuan dan keutuhan bangsa Indonesia yang majemuk dari Sabang sampai Merauke.', poin: 1 },
      { huruf: 'C', teks: 'Stabilitas ekonomi pasca proklamasi.', poin: 0 },
      { huruf: 'D', teks: 'Dukungan militer dari negara-negara tetangga.', poin: 0 },
      { huruf: 'E', teks: 'Kelancaran sidang kabinet perdana.', poin: 0 },
    ],
  },
  {
    kategori: 'TWK',
    tags: 'Wawasan Nusantara',
    teks_soal: 'Wawasan Nusantara berfungsi sebagai pedoman, motivasi, dan rambu-rambu dalam...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Menghadapi persaingan perdagangan internasional semata.', poin: 0 },
      { huruf: 'B', teks: 'Mengembangkan kekuatan persenjataan militer offensif.', poin: 0 },
      { huruf: 'C', teks: 'Menghapus otonomi daerah menjadi sentralistik kembali.', poin: 0 },
      { huruf: 'D', teks: 'Penyelenggaraan negara serta penentuan kebijakan bagi seluruh rakyat Indonesia demi menjaga keutuhan NKRI.', poin: 1 },
      { huruf: 'E', teks: 'Mengendalikan partai politik agar seragam.', poin: 0 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIU (20 Soal)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    kategori: 'TIU',
    tags: 'Sinonim (Persamaan Kata)',
    teks_soal: 'EKSKAVASI = ...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Pengangkutan', poin: 0 },
      { huruf: 'B', teks: 'Penggalian', poin: 1 },
      { huruf: 'C', teks: 'Penyelamatan', poin: 0 },
      { huruf: 'D', teks: 'Penimbunan', poin: 0 },
      { huruf: 'E', teks: 'Pengeringan', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Antonim (Lawan Kata)',
    teks_soal: 'NOMADEN >< ...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Berpindah-pindah', poin: 0 },
      { huruf: 'B', teks: 'Berkelana', poin: 0 },
      { huruf: 'C', teks: 'Menjelajah', poin: 0 },
      { huruf: 'D', teks: 'Menetap', poin: 1 },
      { huruf: 'E', teks: 'Mengembara', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Analogi Kata',
    teks_soal: 'KENDARAAN : BENSIN = MANUSIA : ...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Rumah', poin: 0 },
      { huruf: 'B', teks: 'Sepatu', poin: 0 },
      { huruf: 'C', teks: 'Makanan', poin: 1 },
      { huruf: 'D', teks: 'Pakaian', poin: 0 },
      { huruf: 'E', teks: 'Kendaraan', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Deret Angka',
    teks_soal: 'Tentukan suku berikutnya dari deret: 3, 7, 15, 31, 63, ...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: '127', poin: 1 },
      { huruf: 'B', teks: '126', poin: 0 },
      { huruf: 'C', teks: '125', poin: 0 },
      { huruf: 'D', teks: '128', poin: 0 },
      { huruf: 'E', teks: '130', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Deret Huruf',
    teks_soal: 'Tentukan huruf selanjutnya dari deret: B, D, G, K, P, ...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'S', poin: 0 },
      { huruf: 'B', teks: 'T', poin: 0 },
      { huruf: 'C', teks: 'U', poin: 0 },
      { huruf: 'D', teks: 'V', poin: 1 },
      { huruf: 'E', teks: 'W', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Aljabar & Persamaan',
    teks_soal: 'Jika 3x + 7 = 28, berapakah nilai dari 2x - 3 ?',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: '9', poin: 0 },
      { huruf: 'B', teks: '11', poin: 1 },
      { huruf: 'C', teks: '13', poin: 0 },
      { huruf: 'D', teks: '15', poin: 0 },
      { huruf: 'E', teks: '17', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Aritmatika Sosial',
    teks_soal: 'Seorang pedagang membeli barang seharga Rp 400.000 dan menjualnya kembali dengan keuntungan 15%. Berapakah harga penjualan barang tersebut?',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Rp 440.000', poin: 0 },
      { huruf: 'B', teks: 'Rp 450.000', poin: 0 },
      { huruf: 'C', teks: 'Rp 460.000', poin: 1 },
      { huruf: 'D', teks: 'Rp 470.000', poin: 0 },
      { huruf: 'E', teks: 'Rp 480.000', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Kecepatan & Waktu',
    teks_soal: 'Sebuah mobil menempuh jarak 180 km dalam waktu 2 jam 30 menit. Berapakah kecepatan rata-rata mobil tersebut?',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: '68 km/jam', poin: 0 },
      { huruf: 'B', teks: '72 km/jam', poin: 1 },
      { huruf: 'C', teks: '75 km/jam', poin: 0 },
      { huruf: 'D', teks: '80 km/jam', poin: 0 },
      { huruf: 'E', teks: '85 km/jam', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Perbandingan Berbalik Nilai',
    teks_soal: 'Sebuah proyek pembangunan jembatan dapat diselesaikan oleh 15 orang pekerja dalam waktu 20 hari. Jika proyek ingin diselesaikan dalam 12 hari, berapa tambahan pekerja yang dibutuhkan?',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: '10 orang', poin: 1 },
      { huruf: 'B', teks: '15 orang', poin: 0 },
      { huruf: 'C', teks: '25 orang', poin: 0 },
      { huruf: 'D', teks: '8 orang', poin: 0 },
      { huruf: 'E', teks: '12 orang', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Statistika & Rata-rata',
    teks_soal: 'Nilai rata-rata ulangan 9 siswa adalah 78. Jika nilai Budi digabungkan, nilai rata-rata menjadi 80. Berapakah nilai ulangan Budi?',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: '88', poin: 0 },
      { huruf: 'B', teks: '92', poin: 0 },
      { huruf: 'C', teks: '95', poin: 0 },
      { huruf: 'D', teks: '98', poin: 1 },
      { huruf: 'E', teks: '100', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Silogisme Logika',
    teks_soal: 'Premis 1: Semua Pegawai Negeri Sipil mengenakan seragam pada hari Senin.\nPremis 2: Sebagian orang yang berada di aula kantor bukan Pegawai Negeri Sipil.\nKesimpulan yang paling tepat adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Semua orang di aula kantor mengenakan seragam pada hari Senin.', poin: 0 },
      { huruf: 'B', teks: 'Semua orang yang mengenakan seragam adalah Pegawai Negeri Sipil.', poin: 0 },
      { huruf: 'C', teks: 'Sebagian orang di aula kantor tidak mengenakan seragam Pegawai Negeri Sipil pada hari Senin.', poin: 1 },
      { huruf: 'D', teks: 'Tidak ada orang di aula kantor yang mengenakan seragam pada hari Senin.', poin: 0 },
      { huruf: 'E', teks: 'Semua yang tidak berseragam adalah Pegawai Negeri Sipil.', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Logika Silogisme Kuantor',
    teks_soal: 'Premis 1: Jika musim hujan tiba, maka debit air waduk meningkat.\nPremis 2: Jika debit air waduk meningkat, maka pintu air harus dibuka.\nFakta: Pintu air tidak dibuka.\nKesimpulan:',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Musim hujan telah tiba.', poin: 0 },
      { huruf: 'B', teks: 'Musim hujan belum tiba.', poin: 1 },
      { huruf: 'C', teks: 'Debit air waduk tetap meningkat.', poin: 0 },
      { huruf: 'D', teks: 'Waduk mengalami kebocoran.', poin: 0 },
      { huruf: 'E', teks: 'Pintu air rusak.', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Logika Analitis / Urutan',
    teks_soal: 'Lima orang (Andi, Budi, Citra, Dian, Eko) mengikuti lomba lari. Andi finis lebih dulu daripada Budi tetapi setelah Citra. Dian finis sebelum Citra, dan Eko finis setelah Budi. Siapakah yang menempati juara pertama?',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Andi', poin: 0 },
      { huruf: 'B', teks: 'Budi', poin: 0 },
      { huruf: 'C', teks: 'Citra', poin: 0 },
      { huruf: 'D', teks: 'Dian', poin: 1 },
      { huruf: 'E', teks: 'Eko', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Aritmatika Pecahan',
    teks_soal: 'Hitunglah nilai dari (3/4 + 1/2) : 5/8 = ...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: '1,5', poin: 0 },
      { huruf: 'B', teks: '1,8', poin: 0 },
      { huruf: 'C', teks: '2,0', poin: 1 },
      { huruf: 'D', teks: '2,2', poin: 0 },
      { huruf: 'E', teks: '2,5', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Hubungan X dan Y',
    teks_soal: 'Jika x = 16% dari 50, dan y = 50% dari 16, maka hubungan yang tepat antara x dan y adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'x > y', poin: 0 },
      { huruf: 'B', teks: 'x < y', poin: 0 },
      { huruf: 'C', teks: 'x = y', poin: 1 },
      { huruf: 'D', teks: '2x = 3y', poin: 0 },
      { huruf: 'E', teks: 'Hubungan x dan y tidak dapat ditentukan', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Geometri & Luas',
    teks_soal: 'Sebuah persegi panjang memiliki keliling 48 cm. Jika panjangnya 4 cm lebih dari lebarnya, berapakah luas persegi panjang tersebut?',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: '136 cm²', poin: 0 },
      { huruf: 'B', teks: '140 cm²', poin: 1 },
      { huruf: 'C', teks: '144 cm²', poin: 0 },
      { huruf: 'D', teks: '150 cm²', poin: 0 },
      { huruf: 'E', teks: '154 cm²', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Himpunan & Diagram Venn',
    teks_soal: 'Dari 40 orang mahasiswa, 25 orang gemar membaca buku, 20 orang gemar menulis, dan 5 orang tidak gemar keduanya. Berapa banyak mahasiswa yang gemar membaca buku sekaligus menulis?',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: '8 orang', poin: 0 },
      { huruf: 'B', teks: '10 orang', poin: 1 },
      { huruf: 'C', teks: '12 orang', poin: 0 },
      { huruf: 'D', teks: '15 orang', poin: 0 },
      { huruf: 'E', teks: '18 orang', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Pola Bilangan',
    teks_soal: 'Tentukan dua angka selanjutnya dari deret: 5, 8, 12, 17, 23, ..., ...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: '30, 38', poin: 1 },
      { huruf: 'B', teks: '29, 36', poin: 0 },
      { huruf: 'C', teks: '30, 37', poin: 0 },
      { huruf: 'D', teks: '31, 39', poin: 0 },
      { huruf: 'E', teks: '28, 35', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Analogi Hubungan',
    teks_soal: 'PADI : PETANI = PUISI : ...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Sutradara', poin: 0 },
      { huruf: 'B', teks: 'Komponis', poin: 0 },
      { huruf: 'C', teks: 'Pelukis', poin: 0 },
      { huruf: 'D', teks: 'Penyair', poin: 1 },
      { huruf: 'E', teks: 'Penerbit', poin: 0 },
    ],
  },
  {
    kategori: 'TIU',
    tags: 'Aritmatika Waktu Kerja',
    teks_soal: 'Pompa A dapat mengisi tangki air dalam 3 jam, sedangkan Pompa B dalam 6 jam. Jika kedua pompa digunakan bersamaan, berapa jam tangki air tersebut akan penuh?',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: '2 jam', poin: 1 },
      { huruf: 'B', teks: '2,5 jam', poin: 0 },
      { huruf: 'C', teks: '3 jam', poin: 0 },
      { huruf: 'D', teks: '4 jam', poin: 0 },
      { huruf: 'E', teks: '4,5 jam', poin: 0 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TKP (15 Soal dengan Poin Berjenjang 1 - 5)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    kategori: 'TKP',
    tags: 'Pelayanan Publik',
    teks_soal: 'Saat jam pelayanan kantor hampir berakhir, seorang warga lansia datang tergesa-gesa dengan dokumen yang kurang lengkap untuk mengurus surat penting. Sikap Anda sebagai petugas loket adalah...',
    kunci_jawaban: 'E',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Menolak dan memintanya pulang karena jam operasional pelayanan segera tutup.', poin: 1 },
      { huruf: 'B', teks: 'Meminta uang jasa lembur tambahan jika ingin berkasnya tetap diproses hari itu.', poin: 2 },
      { huruf: 'C', teks: 'Menyuruh warga lansia tersebut membaca persyaratan di dinding pengumuman.', poin: 3 },
      { huruf: 'D', teks: 'Meminta rekan lain menanganinya karena Anda sudah bersiap-siap pulang.', poin: 4 },
      { huruf: 'E', teks: 'Menyambut ramah, melayani dengan sabar, serta membantu memandu melengkapi kekurangan berkas secara jelas.', poin: 5 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Teknologi Informasi (TIK)',
    teks_soal: 'Instansi Anda baru saja menerapkan sistem aplikasi administrasi persuratan berbasis digital (e-office). Sebagian rekan senior merasa kesulitan mengoperasikannya. Sikap Anda adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mengabaikan kesulitan mereka dan fokus hanya pada pekerjaan sendiri.', poin: 2 },
      { huruf: 'B', teks: 'Menyarankan mereka kembali menggunakan sistem manual kertas saja.', poin: 1 },
      { huruf: 'C', teks: 'Mempelajari sistem aplikasi tersebut dengan mahir dan dengan senang hati membimbing rekan kerja yang membutuhkan bantuan.', poin: 5 },
      { huruf: 'D', teks: 'Mengerjakan seluruh tugas rekan senior tersebut tanpa mengajarkan caranya.', poin: 3 },
      { huruf: 'E', teks: 'Menunggu instruksi resmi dari pimpinan untuk membantu.', poin: 4 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Profesionalisme & Integritas',
    teks_soal: 'Seorang kerabat dekat Anda meminta bantuan agar berkas lamarannya diinstansi Anda dapat diloloskan secara khusus tanpa melalui prosedur verifikasi yang semestinya. Sikap Anda adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Menolak dengan sopan, menjelaskan prinsip transparansi seleksi, dan menyemangatinya mengikuti prosedur resmi secara jujur.', poin: 5 },
      { huruf: 'B', teks: 'Membantunya diam-diam karena rasa sungkan sebagai kerabat dekat.', poin: 1 },
      { huruf: 'C', teks: 'Meminta imbalan materi jika berkasnya berhasil diloloskan.', poin: 2 },
      { huruf: 'D', teks: 'Membiarkan berkasnya di meja tanpa menindaklanjutinya.', poin: 3 },
      { huruf: 'E', teks: 'Melemparkan tanggung jawab tersebut kepada rekan verifikator lain.', poin: 4 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Sosial Budaya',
    teks_soal: 'Anda dipindahtugaskan ke kantor cabang daerah terpencil dengan adat istiadat dan kebiasaan sosial yang sangat berbeda dari daerah asal Anda. Langkah awal yang Anda lakukan adalah...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mengurung diri di rumah dinas saat jam kerja selesai.', poin: 1 },
      { huruf: 'B', teks: 'Meminta masyarakat setempat mengikuti adat kebiasaan Anda.', poin: 2 },
      { huruf: 'C', teks: 'Hanya bergaul dengan pegawai yang berasal dari daerah yang sama.', poin: 3 },
      { huruf: 'D', teks: 'Bersikap terbuka, ramah, menghormati norma adat setempat, serta aktif berbaur dengan warga masyarakat.', poin: 5 },
      { huruf: 'E', teks: 'Mengajukan mutasi kembali ke kota besar secepatnya.', poin: 2 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Jejaring Kerja (Networking)',
    teks_soal: 'Dalam sebuah proyek lintas kementerian, tim dari instansi mitra memiliki ritme kerja yang lambat sehingga menghambat pencapaian target timeline proyek. Tindakan Anda adalah...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mengkritik dan memarahi tim mitra di media sosial.', poin: 1 },
      { huruf: 'B', teks: 'Mengajak tim mitra berdiskusi secara konstruktif untuk memetakan kendala dan mencari solusi sinkronisasi alur kerja bersama.', poin: 5 },
      { huruf: 'C', teks: 'Mengambil alih seluruh pekerjaan tanpa koordinasi.', poin: 3 },
      { huruf: 'D', teks: 'Membiarkan proyek terlambat agar instansi mitra yang disalahkan.', poin: 2 },
      { huruf: 'E', teks: 'Menunggu arahan atasan tanpa mengambil inisiatif komunikasi.', poin: 4 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Kerja Sama Tim',
    teks_soal: 'Rekan satu tim Anda tiba-tiba jatuh sakit saat mendekati batas waktu penyerahan laporan penting tahunan. Sikap Anda adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mengeluh karena beban kerja Anda menjadi bertambah.', poin: 2 },
      { huruf: 'B', teks: 'Menyerahkan laporan hanya bagian tugas Anda sendiri kepada atasan.', poin: 3 },
      { huruf: 'C', teks: 'Berkoordinasi dengan anggota tim lainnya untuk membagi dan menyelesaikan sisa tugas rekan yang sakit demi suksesnya tim.', poin: 5 },
      { huruf: 'D', teks: 'Menuntut rekan yang sakit tetap bekerja dari rumah.', poin: 1 },
      { huruf: 'E', teks: 'Meminta perpanjangan waktu kepada atasan tanpa berusaha menyelesaikan terlebih dahulu.', poin: 4 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Anti Radikalisme',
    teks_soal: 'Di grup pesan instan kantor, seorang pegawai membagikan konten narasi provokatif yang mengajak menolak konsensus kebangsaan dan membenci kelompok tertentu. Sikap Anda adalah...',
    kunci_jawaban: 'E',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Ikut menyebarkan pesan tersebut ke grup media sosial keluarga.', poin: 1 },
      { huruf: 'B', teks: 'Membiarkannya saja karena takut memicu pertengkaran.', poin: 3 },
      { huruf: 'C', teks: 'Langsung membalas dengan ujaran kebencian yang lebih keras.', poin: 2 },
      { huruf: 'D', teks: 'Keluar dari grup tanpa memberikan respon apapun.', poin: 4 },
      { huruf: 'E', teks: 'Mengingatkan secara santun bahwa konten tersebut melanggar etika ASN serta berkoordinasi dengan pimpinan jika terus berulang.', poin: 5 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Integritas & Akuntabilitas',
    teks_soal: 'Anda secara tidak sengaja menemukan kesalahan input dalam laporan rekapitulasi data anggaran yang telah Anda serahkan kepada atasan kemarin. Sikap Anda adalah...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mendiamkannya dengan harapan tidak ada orang yang menyadari kesalahan tersebut.', poin: 1 },
      { huruf: 'B', teks: 'Segera menghadap atasan, mengakui kekeliruan dengan jujur, dan menyerahkan data perbaikan yang sudah dikoreksi.', poin: 5 },
      { huruf: 'C', teks: 'Menyalahkan staf magang yang ikut membantu input data.', poin: 2 },
      { huruf: 'D', teks: 'Menunggu sampai atasan sendiri yang menemukan kesalahan tersebut.', poin: 3 },
      { huruf: 'E', teks: 'Mengubah file di server diam-diam tanpa memberitahu atasan.', poin: 4 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Manajemen Stres & Adaptasi',
    teks_soal: 'Pimpinan mendadak memberikan revisi besar terhadap draft kebijakan yang harus selesai dalam waktu 3 jam sebelum rapat koordinasi dimulai. Sikap Anda adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Tetap tenang, menyusun skala prioritas poin-poin revisi utama, dan fokus mengeksekusinya secara optimal.', poin: 5 },
      { huruf: 'B', teks: 'Marah-marah kepada rekan kerja karena instruksi yang mendadak.', poin: 1 },
      { huruf: 'C', teks: 'Menolak merevisi karena waktu yang diberikan tidak masuk akal.', poin: 2 },
      { huruf: 'D', teks: 'Mengerjakan secara asal-asalan tanpa membaca arahan revisi.', poin: 3 },
      { huruf: 'E', teks: 'Meninggalkan kantor untuk menenangkan pikiran.', poin: 1 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Pengembangan Diri',
    teks_soal: 'Kantor membuka kesempatan beasiswa pelatihan sertifikasi kompetensi keahlian di luar jam kerja resmi. Sikap Anda adalah...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Tidak berminat karena mengurangi waktu istirahat dan libur.', poin: 2 },
      { huruf: 'B', teks: 'Hanya mendaftar jika dijanjikan kenaikan gaji langsung.', poin: 3 },
      { huruf: 'C', teks: 'Menyarankan rekan lain saja yang ikut agar Anda tidak repot.', poin: 2 },
      { huruf: 'D', teks: 'Antusias mendaftar dan memanfaatkannya sebaik mungkin untuk meningkatkan kualitas kinerja dan profesionalisme kerja.', poin: 5 },
      { huruf: 'E', teks: 'Mendaftar sekadar untuk mendapatkan sertifikat tanpa niat belajar.', poin: 3 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Orientasi pada Pelayanan',
    teks_soal: 'Seorang warga penyandang disabilitas datang ke kantor pelayanan dan kesulitan menaiki tangga menuju loket lantai dua. Respon Anda yang berada di dekat tangga adalah...',
    kunci_jawaban: 'B',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Melihatnya dari kejauhan tanpa bergerak mendekat.', poin: 2 },
      { huruf: 'B', teks: 'Segera menghampiri, menawarkan bantuan mobilitas dengan tulus, atau berinisiatif memanggil petugas loket untuk melayani di lantai satu.', poin: 5 },
      { huruf: 'C', teks: 'Menyuruh petugas keamanan yang menolongnya.', poin: 3 },
      { huruf: 'D', teks: 'Menyarankan warga tersebut membawa pendamping lain kali.', poin: 2 },
      { huruf: 'E', teks: 'Melanjutkan berjalan karena sedang buru-buru makan siang.', poin: 1 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Inovasi & Kreativitas',
    teks_soal: 'Proses pencarian berkas arsip fisik di divisi Anda seringkali memakan waktu berjam-jam karena penataan yang belum rapi. Inisiatif yang Anda lakukan adalah...',
    kunci_jawaban: 'C',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Membiarkannya karena sudah menjadi kebiasaan lama kantor.', poin: 2 },
      { huruf: 'B', teks: 'Mengeluhkan lambatnya pencarian arsip kepada pimpinan setiap hari.', poin: 2 },
      { huruf: 'C', teks: 'Mengusulkan ide pengindeksan sistematis dan pembuatan database digital sederhana untuk mempermudah temu balik arsip cepat.', poin: 5 },
      { huruf: 'D', teks: 'Menyewa tenaga luar dengan biaya pribadi untuk merapikannya.', poin: 3 },
      { huruf: 'E', teks: 'Menolak mencari berkas jika diminta atasan.', poin: 1 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Kepemimpinan & Motivasi',
    teks_soal: 'Sebagai ketua tim, Anda melihat semangat rekan-rekan anggota tim mulai menurun akibat target kerja yang padat. Tindakan Anda adalah...',
    kunci_jawaban: 'E',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Memberikan sanksi dan ancaman pemotongan nilai kinerja.', poin: 2 },
      { huruf: 'B', teks: 'Membiarkan mereka menyelesaikan masalah motivasi masing-masing.', poin: 2 },
      { huruf: 'C', teks: 'Melaporkan kelemahan tim langsung kepada direktur utama.', poin: 1 },
      { huruf: 'D', teks: 'Mengurangi target kerja secara sepihak tanpa izin pimpinan.', poin: 3 },
      { huruf: 'E', teks: 'Mengadakan sesi diskusi santai, mengapresiasi progres kerja yang telah dicapai, serta memberikan dukungan moril dan solusi realistis.', poin: 5 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Pengambilan Keputusan',
    teks_soal: 'Terjadi situasi darurat kebocoran data di sistem pelayanan saat atasan sedang berada di luar jangkauan sinyal (penerbangan). Langkah Anda adalah...',
    kunci_jawaban: 'A',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Mengambil tindakan darurat sesuai SOP pencegahan ancaman keamanan data, berkoordinasi dengan tim teknis IT, dan segera melaporkan kronologi saat atasan aktif kembali.', poin: 5 },
      { huruf: 'B', teks: 'Menunggu sampai atasan mendarat dan memberikan perintah.', poin: 2 },
      { huruf: 'C', teks: 'Mematikan seluruh server instansi tanpa pemberitahuan.', poin: 3 },
      { huruf: 'D', teks: 'Menghindari tanggung jawab dan menyerahkan masalah ke vendor pihak ketiga.', poin: 2 },
      { huruf: 'E', teks: 'Menutup-nutupi insiden kebocoran tersebut.', poin: 1 },
    ],
  },
  {
    kategori: 'TKP',
    tags: 'Tanggung Jawab & Loyalitas',
    teks_soal: 'Setelah jam kerja usai dan hendak pulang, Anda menemukan pintu ruangan penyimpanan berkas rahasia belum terkunci dan lampu ruangan masih menyala. Sikap Anda adalah...',
    kunci_jawaban: 'D',
    opsi_jawaban: [
      { huruf: 'A', teks: 'Langsung pulang karena bukan tugas piket harian Anda.', poin: 2 },
      { huruf: 'B', teks: 'Memfoto ruangan dan membagikannya ke media sosial.', poin: 1 },
      { huruf: 'C', teks: 'Mencari siapa pegawai yang lalai untuk disalahkan.', poin: 3 },
      { huruf: 'D', teks: 'Mematikan lampu, memastikan keamanan ruangan, mengunci pintu dengan rapat, dan menginformasikan kepada petugas jaga / penanggung jawab ruangan.', poin: 5 },
      { huruf: 'E', teks: 'Membiarkannya terbuka dengan asumsi ada orang di dalam.', poin: 1 },
    ],
  },
];

async function seed50Questions() {
  console.log('🚀 Mulai memasukkan 55 butir soal ke Bank Soal Central...');

  // 1. Ambil atau buat tryout contoh
  let exam = await prisma.exam.findFirst({
    where: { judul_tryout: { contains: 'Tryout SKD CPNS 2026' } },
  });

  if (!exam) {
    const now = new Date();
    exam = await prisma.exam.create({
      data: {
        judul_tryout: 'Tryout SKD CPNS 2026 — Simulasi Akbar Nasional',
        durasi_menit: 90,
        total_soal_dikerjakan: 30, // 30 soal acak dari total bank soal
        waktu_mulai: now,
        waktu_selesai: new Date(now.getTime() + 90 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
    });
  }

  // 2. Bersihkan soal lama jika ada agar data rapi
  const countBefore = await prisma.question.count();
  console.log(`📊 Jumlah soal saat ini: ${countBefore}`);

  // 3. Masukkan 55 butir soal:
  // - Sebagian (35 soal) ke Central Master Bank (exam_id: null)
  // - Sebagian (20 soal) langsung ditautkan ke Tryout Aktif (exam_id: exam.id)
  let centralCount = 0;
  let examAttachedCount = 0;

  for (let i = 0; i < QUESTIONS_DATA.length; i++) {
    const item = QUESTIONS_DATA[i];
    // Masukkan sebagian ke Central Standalone (exam_id: null) dan sebagian ke Tryout
    const isAttachedToExam = i % 2 === 0; // bergantian agar dua-duanya terisi
    
    await prisma.question.create({
      data: {
        kategori: item.kategori,
        teks_soal: item.teks_soal,
        opsi_jawaban: item.opsi_jawaban,
        kunci_jawaban: item.kunci_jawaban,
        tags: item.tags || 'SKD CPNS',
        exam_id: isAttachedToExam ? exam.id : null,
      },
    });

    if (isAttachedToExam) examAttachedCount++;
    else centralCount++;
  }

  const countAfter = await prisma.question.count();
  const twkCount = await prisma.question.count({ where: { kategori: 'TWK' } });
  const tiuCount = await prisma.question.count({ where: { kategori: 'TIU' } });
  const tkpCount = await prisma.question.count({ where: { kategori: 'TKP' } });

  console.log(`\n✅ BERHASIL SEEDING BANK SOAL:`);
  console.log(`   • Total Soal di Database: ${countAfter} butir`);
  console.log(`   • Soal TWK: ${twkCount} butir`);
  console.log(`   • Soal TIU: ${tiuCount} butir`);
  console.log(`   • Soal TKP: ${tkpCount} butir`);
  console.log(`   • Khusus Bank Pusat (Standalone): ${centralCount} butir`);
  console.log(`   • Tertaut ke Tryout "${exam.judul_tryout}": ${examAttachedCount} butir`);
}

seed50Questions()
  .catch(e => { console.error('❌ Error seeding 50 questions:', e); process.exit(1); })
  .finally(() => process.exit(0));
