// prisma/seed.js — Seed data dasar Catalyst CBT Engine
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/lib/prisma');

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. USERS ──────────────────────────────────────────────
  const adminPw  = await bcrypt.hash('admin123', 12);
  const tutorPw  = await bcrypt.hash('tutor123', 12);
  const pesertaPw = await bcrypt.hash('peserta123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@catalyst.id' },
    update: {},
    create: { nama_lengkap: 'Admin Catalyst', email: 'admin@catalyst.id', password: adminPw, role: 'ADMIN' },
  });
  console.log(`  ✅ Admin : ${admin.email} (password: admin123)`);

  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@catalyst.id' },
    update: {},
    create: { nama_lengkap: 'Tutor Demo', email: 'tutor@catalyst.id', password: tutorPw, role: 'TUTOR' },
  });
  console.log(`  ✅ Tutor : ${tutor.email} (password: tutor123)`);

  const peserta1 = await prisma.user.upsert({
    where: { email: 'budi@test.id' },
    update: {},
    create: { nama_lengkap: 'Budi Santoso', email: 'budi@test.id', password: pesertaPw, role: 'PESERTA' },
  });
  console.log(`  ✅ Peserta: ${peserta1.email} (password: peserta123)`);

  const peserta2 = await prisma.user.upsert({
    where: { email: 'dandi@mail.com' },
    update: {},
    create: { nama_lengkap: 'Dandi Serang', email: 'dandi@mail.com', password: pesertaPw, role: 'PESERTA' },
  });
  console.log(`  ✅ Peserta: ${peserta2.email} (password: peserta123)`);

  // ── 2. EXAM (Tryout Aktif) ────────────────────────────────
  const now = new Date();
  const durasiMenit = 90;
  const waktuSelesai = new Date(now.getTime() + durasiMenit * 60 * 1000 + 60 * 60 * 1000); // +1 jam buffer

  const exam = await prisma.exam.create({
    data: {
      judul_tryout: 'Tryout SKD CPNS 2026 — Batch 1',
      durasi_menit: durasiMenit,
      waktu_mulai: now,
      waktu_selesai: waktuSelesai,
    },
  });
  console.log(`\n  📋 Tryout: "${exam.judul_tryout}" (${durasiMenit} menit, aktif)`);

  // ── 3. QUESTIONS ──────────────────────────────────────────
  const soalData = [
    // TWK
    { kategori: 'TWK', teks_soal: 'Pancasila terdiri dari berapa sila?', kunci_jawaban: 'A',
      opsi_jawaban: [
        { huruf: 'A', teks: '5 sila' },
        { huruf: 'B', teks: '4 sila' },
        { huruf: 'C', teks: '6 sila' },
        { huruf: 'D', teks: '7 sila' },
        { huruf: 'E', teks: '3 sila' },
      ]},
    { kategori: 'TWK', teks_soal: 'UUD 1945 disahkan pada tanggal?', kunci_jawaban: 'B',
      opsi_jawaban: [
        { huruf: 'A', teks: '1 Juni 1945' },
        { huruf: 'B', teks: '18 Agustus 1945' },
        { huruf: 'C', teks: '17 Agustus 1945' },
        { huruf: 'D', teks: '22 Juni 1945' },
        { huruf: 'E', teks: '29 Mei 1945' },
      ]},
    { kategori: 'TWK', teks_soal: 'Semboyan Bhinneka Tunggal Ika berasal dari kitab?', kunci_jawaban: 'C',
      opsi_jawaban: [
        { huruf: 'A', teks: 'Negarakertagama' },
        { huruf: 'B', teks: 'Pararaton' },
        { huruf: 'C', teks: 'Sutasoma' },
        { huruf: 'D', teks: 'Arjunawiwaha' },
        { huruf: 'E', teks: 'Baratayudha' },
      ]},

    // TIU
    { kategori: 'TIU', teks_soal: 'Jika 2x + 4 = 10, maka x adalah...', kunci_jawaban: 'B',
      opsi_jawaban: [
        { huruf: 'A', teks: '2' },
        { huruf: 'B', teks: '3' },
        { huruf: 'C', teks: '4' },
        { huruf: 'D', teks: '5' },
        { huruf: 'E', teks: '6' },
      ]},
    { kategori: 'TIU', teks_soal: 'Antonim dari kata "LABIL" adalah...', kunci_jawaban: 'A',
      opsi_jawaban: [
        { huruf: 'A', teks: 'Stabil' },
        { huruf: 'B', teks: 'Rapuh' },
        { huruf: 'C', teks: 'Goyah' },
        { huruf: 'D', teks: 'Lemah' },
        { huruf: 'E', teks: 'Ragu' },
      ]},
    { kategori: 'TIU', teks_soal: 'Deret: 2, 6, 18, 54, ...? Angka selanjutnya adalah...', kunci_jawaban: 'D',
      opsi_jawaban: [
        { huruf: 'A', teks: '108' },
        { huruf: 'B', teks: '110' },
        { huruf: 'C', teks: '148' },
        { huruf: 'D', teks: '162' },
        { huruf: 'E', teks: '216' },
      ]},

    // TKP
    { kategori: 'TKP', teks_soal: 'Saat rekan kerja membuat kesalahan, Anda...', kunci_jawaban: 'D',
      opsi_jawaban: [
        { huruf: 'A', teks: 'Membiarkannya belajar sendiri' },
        { huruf: 'B', teks: 'Melaporkan ke atasan segera' },
        { huruf: 'C', teks: 'Menegurnya di depan umum' },
        { huruf: 'D', teks: 'Membantu memperbaiki secara pribadi' },
        { huruf: 'E', teks: 'Mengabaikan karena bukan urusan Anda' },
      ]},
    { kategori: 'TKP', teks_soal: 'Atasan memberikan tugas di luar keahlian Anda. Sikap Anda...', kunci_jawaban: 'A',
      opsi_jawaban: [
        { huruf: 'A', teks: 'Menerima dan berusaha belajar mengerjakannya' },
        { huruf: 'B', teks: 'Menolak karena bukan bidang Anda' },
        { huruf: 'C', teks: 'Meminta rekan lain menggantikan' },
        { huruf: 'D', teks: 'Mengerjakan seadanya' },
        { huruf: 'E', teks: 'Komplain ke HRD' },
      ]},
    { kategori: 'TKP', teks_soal: 'Jika ada konflik antar divisi, langkah pertama Anda...', kunci_jawaban: 'B',
      opsi_jawaban: [
        { huruf: 'A', teks: 'Memihak divisi sendiri' },
        { huruf: 'B', teks: 'Mendengarkan kedua belah pihak secara objektif' },
        { huruf: 'C', teks: 'Melaporkan ke atasan tanpa berusaha mediasi' },
        { huruf: 'D', teks: 'Tidak ikut campur' },
        { huruf: 'E', teks: 'Menyerahkan sepenuhnya ke HRD' },
      ]},
  ];

  for (const soal of soalData) {
    await prisma.question.create({
      data: { exam_id: exam.id, ...soal },
    });
  }
  console.log(`  📝 ${soalData.length} soal ditambahkan (TWK: 3, TIU: 3, TKP: 3)`);

  console.log('\n✨ Seeding selesai!\n');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  Akun Login:                              ║');
  console.log('║  Admin  : admin@catalyst.id / admin123    ║');
  console.log('║  Tutor  : tutor@catalyst.id / tutor123    ║');
  console.log('║  Peserta: budi@test.id      / peserta123  ║');
  console.log('║  Peserta: dandi@mail.com    / peserta123  ║');
  console.log('╚═══════════════════════════════════════════╝');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => process.exit(0));
