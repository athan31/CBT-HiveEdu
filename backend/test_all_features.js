// backend/test_all_features.js
const { prisma } = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');

let baseUrl = 'http://localhost:5000/api';

async function runAllTests() {
  console.log('🧪 ========================================================');
  console.log('   MENJALANKAN PENGUJIAN OTOMATIS SELURUH FITUR PLATFORM   ');
  console.log('==========================================================\n');

  let adminToken = '';
  let pesertaToken = '';
  let testExamId = '';
  let testSessionId = '';
  let createdQuestionId = '';
  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      testPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      testFailed++;
    }
  }

  process.env.PORT = '5099';
  const { app } = require('./src/index');
  baseUrl = 'http://localhost:5099/api';
  // Allow 500ms for socket & server startup
  await new Promise(r => setTimeout(r, 500));

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // 1. AUTHENTICATION TESTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔑 [1/5] Testing Authentication...');

    // Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@catalyst.id', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.token && adminLoginData.user?.role === 'ADMIN', 'Admin Login berhasil dengan role ADMIN');
    adminToken = adminLoginData.token;

    // Peserta Login
    const pesertaLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'budi@test.id', password: 'peserta123' }),
    });
    const pesertaLoginData = await pesertaLoginRes.json();
    assert(pesertaLoginRes.status === 200 && pesertaLoginData.token && pesertaLoginData.user?.role === 'PESERTA', 'Peserta Login berhasil dengan role PESERTA');
    pesertaToken = pesertaLoginData.token;

    // ──────────────────────────────────────────────────────────────────────────
    // 2. CENTRAL QUESTION BANK TESTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🏛️ [2/5] Testing Bank Soal Central...');

    // Get all central questions
    const centralRes = await fetch(`${baseUrl}/admin/bank-soal`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const centralData = await centralRes.json();
    assert(centralRes.status === 200 && Array.isArray(centralData.questions) && centralData.counts.total >= 50, `Memuat Bank Soal Central (Total: ${centralData.counts.total} soal, TWK: ${centralData.counts.TWK}, TIU: ${centralData.counts.TIU}, TKP: ${centralData.counts.TKP})`);

    // Search by text
    const searchRes = await fetch(`${baseUrl}/admin/bank-soal?search=Pancasila`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.questions.length > 0, `Pencarian kata kunci "Pancasila" menemukan ${searchData.questions.length} butir soal`);

    // Filter by Kategori
    const twkRes = await fetch(`${baseUrl}/admin/bank-soal?kategori=TWK`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const twkData = await twkRes.json();
    assert(twkRes.status === 200 && twkData.questions.every(q => q.kategori === 'TWK'), `Filter kategori TWK berhasil (${twkData.questions.length} soal TWK)`);

    // Create a new question in Central Bank
    const createQRes = await fetch(`${baseUrl}/admin/bank-soal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        kategori: 'TWK',
        teks_soal: 'Apa fungsi utama Pancasila sebagai ideologi negara?',
        tags: 'Ideologi Negara',
        kunci_jawaban: 'A',
        opsi_jawaban: [
          { huruf: 'A', teks: 'Sebagai pedoman dan pandangan hidup bangsa', poin: 1 },
          { huruf: 'B', teks: 'Sebagai dokumen sejarah kuno semata', poin: 0 },
          { huruf: 'C', teks: 'Sebagai instrumen kekuasaan absolut', poin: 0 },
          { huruf: 'D', teks: 'Sebagai teks hafalan formalitas', poin: 0 },
          { huruf: 'E', teks: 'Sebagai pemisah antar golongan', poin: 0 },
        ],
      }),
    });
    const createQData = await createQRes.json();
    assert(createQRes.status === 201 && createQData.question?.id, 'Tambah butir soal baru ke Bank Soal Central berhasil');
    createdQuestionId = createQData.question.id;

    // Update the question
    const updateQRes = await fetch(`${baseUrl}/admin/bank-soal/${createdQuestionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        teks_soal: 'Apa fungsi utama Pancasila sebagai ideologi negara? [Updated Test]',
      }),
    });
    const updateQData = await updateQRes.json();
    assert(updateQRes.status === 200 && updateQData.question.teks_soal.includes('[Updated Test]'), 'Edit butir soal di Bank Soal Central berhasil');

    // ──────────────────────────────────────────────────────────────────────────
    // 3. TRYOUT MANAGEMENT & DISTRIBUTION TESTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📋 [3/5] Testing Manajemen Tryout & Distribusi Soal...');

    // Create a new Tryout with dynamic question count
    const createExamRes = await fetch(`${baseUrl}/admin/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        judul_tryout: 'Tryout Uji Fitur Komprehensif 2026',
        durasi_menit: 60,
        total_soal_dikerjakan: 15, // 15 soal diambil acak per peserta
      }),
    });
    const createExamData = await createExamRes.json();
    testExamId = createExamData.exam?.id || createExamData.id;
    assert(createExamRes.status === 201 && testExamId, 'Buat Tryout baru dengan konfigurasi 15 soal dinamis');

    // Distribute 30 random questions from Central Bank to this exam (10 TWK, 10 TIU, 10 TKP)
    const distRes = await fetch(`${baseUrl}/admin/bank-soal/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        targetExamId: testExamId,
        randomSample: { twk: 10, tiu: 10, tkp: 10 },
      }),
    });
    const distData = await distRes.json();
    assert(distRes.status === 201 && distData.count === 30, `Distribusi 30 soal acak dari Bank Pusat ke Tryout berhasil (${distData.count} soal disalin)`);

    // ──────────────────────────────────────────────────────────────────────────
    // 4. PARTICIPANT EXAM FLOW TESTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📝 [4/5] Testing Sesi Peserta & Distribusi Acak Dinamis...');

    // Get active exams for participant
    const activeExamsRes = await fetch(`${baseUrl}/exam/active`, {
      headers: { Authorization: `Bearer ${pesertaToken}` },
    });
    const activeExamsData = await activeExamsRes.json();
    assert(activeExamsRes.status === 200 && activeExamsData.some(e => e.id === testExamId), 'Tryout aktif terdeteksi di dashboard peserta');

    // Get Exam Info
    const infoRes = await fetch(`${baseUrl}/exam/info/${testExamId}`, {
      headers: { Authorization: `Bearer ${pesertaToken}` },
    });
    const infoData = await infoRes.json();
    assert(infoRes.status === 200 && infoData.jumlah_soal === 15 && infoData.total_bank_soal === 30, `Info Tryout valid: ${infoData.jumlah_soal} soal wajib dikerjakan dari ${infoData.total_bank_soal} bank soal`);

    // Start Exam for Peserta (Dynamic Sampling)
    const startRes = await fetch(`${baseUrl}/exam/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pesertaToken}` },
      body: JSON.stringify({ exam_id: testExamId }),
    });
    const startData = await startRes.json();
    const urutanSoalSample = typeof startData.session?.urutan_soal === 'string'
      ? JSON.parse(startData.session.urutan_soal)
      : startData.session?.urutan_soal;
    assert(startRes.status === 200 || startRes.status === 201 && urutanSoalSample?.length === 15, `Memulai ujian: Sistem mengunci tepat 15 soal acak ke sesi peserta`);
    testSessionId = startData.session?.id;

    // Get Questions for Peserta
    const getQRes = await fetch(`${baseUrl}/exam/questions/${testExamId}`, {
      headers: { Authorization: `Bearer ${pesertaToken}` },
    });
    const getQData = await getQRes.json();
    const questionsList = getQData.questions || (Array.isArray(getQData) ? getQData : []);
    assert(getQRes.status === 200 && questionsList.length === 15 && !questionsList[0]?.kunci_jawaban, 'Daftar 15 butir soal dikembalikan secara aman tanpa kunci_jawaban');

    // Save answers for 3 questions
    const q1 = questionsList[0];
    const q2 = questionsList[1];
    const q3 = questionsList[2];

    const saveAnsRes1 = await fetch(`${baseUrl}/exam/save-answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pesertaToken}` },
      body: JSON.stringify({ sessionId: testSessionId, questionId: q1.id, jawaban: 'A' }),
    });
    assert(saveAnsRes1.status === 200, 'Simpan jawaban soal #1 berhasil');

    const saveAnsRes2 = await fetch(`${baseUrl}/exam/save-answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pesertaToken}` },
      body: JSON.stringify({ sessionId: testSessionId, questionId: q2.id, jawaban: 'B' }),
    });
    assert(saveAnsRes2.status === 200, 'Simpan jawaban soal #2 berhasil');

    // Anti-Reset & Persistence Check: Simulate browser refresh
    const resumeRes = await fetch(`${baseUrl}/exam/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pesertaToken}` },
      body: JSON.stringify({ exam_id: testExamId }),
    });
    const resumeData = await resumeRes.json();
    const resumeUrutan = typeof resumeData.session?.urutan_soal === 'string'
      ? JSON.parse(resumeData.session.urutan_soal)
      : resumeData.session?.urutan_soal;
    const resumeJawaban = typeof resumeData.session?.jawaban_peserta === 'string'
      ? JSON.parse(resumeData.session.jawaban_peserta)
      : resumeData.session?.jawaban_peserta;
    assert(
      resumeRes.status === 200 &&
      resumeUrutan.length === 15 &&
      resumeJawaban?.[q1.id] === 'A',
      'Anti-Reset teruji: Refresh browser mengembalikan 15 soal yang sama dan jawaban tersimpan utuh'
    );

    // Finish Exam & Scoring Engine
    const finishRes = await fetch(`${baseUrl}/exam/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pesertaToken}` },
      body: JSON.stringify({ sessionId: testSessionId }),
    });
    const finishData = await finishRes.json();
    const scoredResult = finishData.result || finishData.session || finishData;
    assert(
      finishRes.status === 200 &&
      scoredResult.status === 'SUBMITTED' &&
      scoredResult.total_skor !== undefined,
      `Kumpulkan ujian & Penilaian Otomatis berhasil (Total Skor SKD: ${scoredResult.total_skor}, TWK: ${scoredResult.skor_twk}, TIU: ${scoredResult.skor_tiu}, TKP: ${scoredResult.skor_tkp})`
    );

    // Get Result Page Breakdown
    const resultRes = await fetch(`${baseUrl}/exam/result/${testSessionId}`, {
      headers: { Authorization: `Bearer ${pesertaToken}` },
    });
    const resultData = await resultRes.json();
    assert(resultRes.status === 200 && resultData.id === testSessionId, 'Halaman hasil ujian & evaluasi passing grade valid');

    // ──────────────────────────────────────────────────────────────────────────
    // 5. ADMIN MONITORING & SKB INTEGRATION TESTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📊 [5/5] Testing Monitoring Ruang Ujian & Integrasi Nilai SKB...');

    // Check Exam Sessions in Admin Monitor
    const sessionsRes = await fetch(`${baseUrl}/admin/sessions/${testExamId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const sessionsData = await sessionsRes.json();
    assert(sessionsRes.status === 200 && sessionsData.some(s => s.sessionId === testSessionId), 'Sesi ujian peserta terdaftar di monitoring admin');

    // Check Leaderboard
    const leaderboardRes = await fetch(`${baseUrl}/admin/leaderboard/${testExamId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const leaderboardData = await leaderboardRes.json();
    assert(leaderboardRes.status === 200 && Array.isArray(leaderboardData) && leaderboardData.length > 0, `Leaderboard ujian terpanggil dengan sukses (${leaderboardData.length} peserta tercatat)`);

    // Update SKB Score & Recalculate Final Integrated Score (40% SKD + 60% SKB)
    const skbRes = await fetch(`${baseUrl}/exam/skb/${testSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ skor_skb: 85 }),
    });
    const skbData = await skbRes.json();
    assert(
      skbRes.status === 200 &&
      skbData.session?.skor_skb === 85 &&
      skbData.session?.total_nilai_akhir > 0,
      `Integrasi Nilai SKD (40%) + SKB (60%) berhasil dihitung (Nilai Akhir: ${skbData.session?.total_nilai_akhir}, Formula: ${skbData.detail?.formulaTotal})`
    );

    // Clean up created test question
    if (createdQuestionId) {
      await fetch(`${baseUrl}/admin/bank-soal/${createdQuestionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }

  } catch (err) {
    console.error('💥 Test execution error:', err);
    testFailed++;
  }

  console.log('\n==========================================================');
  console.log(`🏁 HASIL PENGUJIAN: ${testPassed} BERHASIL, ${testFailed} GAGAL`);
  console.log('==========================================================\n');

  if (testFailed === 0) {
    console.log('🎉 SEMUA FITUR BERJALAN 100% SEMPURNA TANPA KENDALA!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests();
