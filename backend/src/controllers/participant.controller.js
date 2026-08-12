const { prisma, pgQuery } = require('../lib/prisma');

// ── Fisher-Yates Shuffle ──────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Mengacak opsi jawaban suatu soal dan mengembalikan:
 * - shuffledOptions  : array opsi dengan huruf baru (A, B, C, …) sesuai urutan acak
 * - optionMapping    : { hurufBaru: hurufAsli }  — untuk decoding jawaban peserta
 * - newKunci         : huruf baru yang menjadi kunci jawaban
 */
function shuffleOptions(opsiJawaban, kunciJawabanAsli) {
  const hurufUrutan = ['A', 'B', 'C', 'D', 'E'];
  const shuffledIdx = shuffleArray([...Array(opsiJawaban.length).keys()]);

  const shuffledOptions = shuffledIdx.map((origIdx, newIdx) => ({
    huruf: hurufUrutan[newIdx],
    teks : opsiJawaban[origIdx].teks,
    poin : opsiJawaban[origIdx].poin ?? null,
    // simpan huruf asli untuk keperluan mapping
    _hurufAsli: opsiJawaban[origIdx].huruf,
  }));

  // Bangun peta: hurufBaru → hurufAsli
  const optionMapping = {};
  shuffledOptions.forEach(o => { optionMapping[o.huruf] = o._hurufAsli; });

  // Cari huruf baru yang menjadi kunci
  const newKunci = shuffledOptions.find(o => o._hurufAsli === kunciJawabanAsli)?.huruf || kunciJawabanAsli;

  // Hapus _hurufAsli sebelum dikirim ke client
  const cleanOptions = shuffledOptions.map(({ _hurufAsli, ...rest }) => rest);

  return { shuffledOptions: cleanOptions, optionMapping, newKunci };
}

// POST /api/exam/start
const startExam = async (req, res) => {
  const { examId } = req.body;
  const userId = req.user.id;

  if (!examId) return res.status(400).json({ message: 'examId wajib diisi.' });

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });

    const now = new Date();
    if (now < exam.waktu_mulai || now > exam.waktu_selesai) {
      return res.status(403).json({ message: 'Tryout ini sedang tidak aktif.' });
    }

    // Check existing ONGOING session (resilience: allow re-entry)
    const existingSession = await prisma.examSession.findFirst({
      where: { user_id: userId, exam_id: examId, status: 'ONGOING' },
    });

    if (existingSession) {
      const elapsedMs = now.getTime() - existingSession.waktu_mulai.getTime();
      const durasiMs = exam.durasi_menit * 60 * 1000;
      const remainingMs = durasiMs - elapsedMs;

      if (remainingMs <= 0) {
        await submitAndScore(existingSession.id);
        return res.status(200).json({ message: 'Waktu ujian telah habis. Jawaban dikumpulkan otomatis.' });
      }

      return res.status(200).json({
        message: 'Sesi ujian ditemukan. Melanjutkan ujian.',
        session: existingSession,
        remainingMs,
      });
    }

    // Check already submitted
    const submittedSession = await prisma.examSession.findFirst({
      where: { user_id: userId, exam_id: examId, status: 'SUBMITTED' },
    });
    if (submittedSession) {
      return res.status(409).json({ message: 'Anda sudah pernah mengumpulkan jawaban untuk tryout ini.' });
    }

    // Create new session with shuffled question order
    // 1. Ambil semua ID soal
    const allQuestions = await prisma.question.findMany({
      where: { exam_id: examId },
      select: { id: true, opsi_jawaban: true, kunci_jawaban: true },
    });

    // 2. Acak urutan soal (Fisher-Yates)
    const urutan_soal = shuffleArray(allQuestions.map(q => q.id));

    // 3. Acak opsi jawaban per soal, simpan peta huruf
    //    urutan_opsi = { questionId: { hurufBaru: hurufAsli } }
    const urutan_opsi = {};
    for (const q of allQuestions) {
      const { optionMapping } = shuffleOptions(q.opsi_jawaban, q.kunci_jawaban);
      urutan_opsi[q.id] = optionMapping;
    }

    const session = await prisma.examSession.create({
      data: { user_id: userId, exam_id: examId, waktu_mulai: now, urutan_soal, urutan_opsi },
    });

    const remainingMs = exam.durasi_menit * 60 * 1000;
    return res.status(201).json({ message: 'Ujian dimulai.', session, remainingMs });
  } catch (error) {
    console.error('startExam error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/exam/questions/:examId  — NO kunci_jawaban in response
const getQuestions = async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.examSession.findFirst({
      where: { user_id: userId, exam_id: examId, status: 'ONGOING' },
    });
    if (!session) {
      return res.status(403).json({ message: 'Anda belum memulai ujian ini atau sesi sudah berakhir.' });
    }

    // Ambil semua soal dengan kunci (hanya untuk keperluan shuffle opsi, tidak dikirim ke client)
    const rawQuestions = await prisma.question.findMany({
      where: { exam_id: examId },
      select: {
        id: true,
        kategori: true,
        teks_soal: true,
        opsi_jawaban: true,
        kunci_jawaban: true, // dipakai untuk re-build opsi diacak, tidak dikirim ke client
      },
    });

    // Bangun map untuk lookup cepat
    const questionMap = {};
    rawQuestions.forEach(q => { questionMap[q.id] = q; });

    // Gunakan urutan soal yang sudah dikunci saat sesi dibuat
    const urutanSoal  = Array.isArray(session.urutan_soal) ? session.urutan_soal : [];
    const urutanOpsi  = session.urutan_opsi || {};

    // Susun soal sesuai urutan terkunci, dengan opsi diacak sesuai peta yang tersimpan
    const orderedIds = urutanSoal.length > 0 ? urutanSoal : rawQuestions.map(q => q.id);

    const questions = orderedIds.map(qid => {
      const q = questionMap[qid];
      if (!q) return null;

      // Rekonstruksi opsi diacak dari peta yang tersimpan di DB
      const mapping = urutanOpsi[qid]; // { hurufBaru: hurufAsli }
      let shuffledOpts;
      if (mapping) {
        const hurufUrutan = ['A', 'B', 'C', 'D', 'E'];
        shuffledOpts = hurufUrutan
          .filter(h => mapping[h])            // hanya huruf yang ada dalam mapping
          .map(hurufBaru => {
            const hurufAsli  = mapping[hurufBaru];
            const opsiAsli   = q.opsi_jawaban.find(o => o.huruf === hurufAsli);
            return {
              huruf: hurufBaru,
              teks : opsiAsli?.teks ?? '',
              poin : opsiAsli?.poin ?? null,
            };
          });
      } else {
        // Fallback: opsi asli tanpa acak
        shuffledOpts = q.opsi_jawaban.map(({ huruf, teks, poin }) => ({ huruf, teks, poin }));
      }

      return {
        id      : q.id,
        kategori: q.kategori,
        teks_soal: q.teks_soal,
        opsi_jawaban: shuffledOpts,
        // kunci_jawaban TIDAK dikirim ke client
      };
    }).filter(Boolean);

    return res.status(200).json({
      session: {
        id: session.id,
        status: session.status,
        waktu_mulai: session.waktu_mulai,
        jawaban_peserta: session.jawaban_peserta,
        jumlah_pelanggaran: session.jumlah_pelanggaran,
      },
      questions,
    });
  } catch (error) {
    console.error('getQuestions error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PATCH /api/exam/save-answer
const saveAnswer = async (req, res) => {
  const { sessionId, questionId, jawaban } = req.body;
  const userId = req.user.id;

  if (!sessionId || !questionId || !jawaban) {
    return res.status(400).json({ message: 'sessionId, questionId, dan jawaban wajib diisi.' });
  }

  try {
    const session = await prisma.examSession.findFirst({
      where: { id: sessionId, user_id: userId, status: 'ONGOING' },
    });
    if (!session) {
      return res.status(403).json({ message: 'Sesi tidak valid atau sudah berakhir.' });
    }

    const currentAnswers = session.jawaban_peserta || {};
    const updatedAnswers = { ...currentAnswers, [questionId]: jawaban.toUpperCase() };

    await prisma.examSession.update({
      where: { id: sessionId },
      data: { jawaban_peserta: updatedAnswers },
    });

    return res.status(200).json({ message: 'Jawaban tersimpan.' });
  } catch (error) {
    console.error('saveAnswer error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// POST /api/exam/finish
const finishExam = async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  if (!sessionId) return res.status(400).json({ message: 'sessionId wajib diisi.' });

  try {
    const session = await prisma.examSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });
    if (!session) return res.status(404).json({ message: 'Sesi tidak ditemukan.' });
    if (session.status === 'SUBMITTED') {
      return res.status(409).json({ message: 'Jawaban sudah pernah dikumpulkan.' });
    }

    const result = await submitAndScore(sessionId);
    return res.status(200).json({ message: 'Jawaban berhasil dikumpulkan.', result });
  } catch (error) {
    console.error('finishExam error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/exam/result/:sessionId
const getResult = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  try {
    // Gunakan raw SQL agar dapat kolom integrasi + info exam
    const { rows } = await pgQuery(
      `SELECT es.*,
              e.judul_tryout
       FROM exam_sessions es
       JOIN exams e ON e.id = es.exam_id
       WHERE es.id = $1
         AND es.user_id = $2
         AND es.status = 'SUBMITTED'`,
      [sessionId, userId]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Hasil ujian tidak ditemukan.' });

    // Reshape agar mirip dengan Prisma include
    const row = rows[0];
    const result = {
      ...row,
      exam: { judul_tryout: row.judul_tryout },
    };
    delete result.judul_tryout;

    return res.status(200).json(result);
  } catch (error) {
    console.error('getResult error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/exam/active
const getActiveExams = async (req, res) => {
  const now = new Date();
  try {
    const exams = await prisma.exam.findMany({
      where: { waktu_mulai: { lte: now }, waktu_selesai: { gte: now } },
      include: { _count: { select: { questions: true } } },
    });
    return res.status(200).json(exams);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/exam/info/:examId — Info ujian tanpa membuat session
const getExamInfo = async (req, res) => {
  const { examId } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { questions: true } } },
    });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });

    const now = new Date();
    const isExpired = now > exam.waktu_selesai;
    const isNotStarted = now < exam.waktu_mulai;

    return res.status(200).json({
      id: exam.id,
      judul_tryout: exam.judul_tryout,
      durasi_menit: exam.durasi_menit,
      waktu_mulai: exam.waktu_mulai,
      waktu_selesai: exam.waktu_selesai,
      jumlah_soal: exam._count.questions,
      isExpired,
      isNotStarted,
    });
  } catch (error) {
    console.error('getExamInfo error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ── Integrasi Helper ─────────────────────────────────────────────────────────
// Formula BKN resmi:
//   Nilai Integrasi SKD = (total_skor / maks_skd) * 40   → bobot 40%
//   Nilai Integrasi SKB = (skor_skb   / maks_skb ) * 60   → bobot 60%
//   Total Nilai Akhir   = Integrasi SKD + Integrasi SKB
function hitungIntegrasi(totalSkorSkd, maksSkd, skorSkb, maksSkb) {
  const mSkd = (maksSkd > 0) ? maksSkd : 550;
  const mSkb = (maksSkb > 0) ? maksSkb : 100;
  const round4 = (n) => Math.round(n * 10000) / 10000;

  const nilai_integrasi_skd = round4((totalSkorSkd / mSkd) * 40);
  const nilai_integrasi_skb = round4((skorSkb       / mSkb) * 60);
  const total_nilai_akhir   = round4(nilai_integrasi_skd + nilai_integrasi_skb);

  return { nilai_integrasi_skd, nilai_integrasi_skb, total_nilai_akhir };
}

// ── Scoring Engine (Internal) ─────────────────────────────────────────────────
// TWK: benar=5, salah=0
// TIU: benar=5, salah=0
// TKP: poin dari opsi pilihan (minimal 1), tidak menjawab=0
async function submitAndScore(sessionId) {
  const session   = await prisma.examSession.findUnique({ where: { id: sessionId } });
  const questions = await prisma.question.findMany({ where: { exam_id: session.exam_id } });

  const jawaban = session.jawaban_peserta || {};
  let skor_twk = 0, skor_tiu = 0, skor_tkp = 0;

  // Ambil peta urutan opsi dari sesi (hurufBaru → hurufAsli)
  const urutanOpsi = session.urutan_opsi || {};

  for (const q of questions) {
    const userAnswerRaw = jawaban[q.id];  // huruf yang dipilih peserta (mungkin huruf acak)
    if (!userAnswerRaw) continue;

    // Decode: ubah huruf acak → huruf asli menggunakan peta yang tersimpan
    const mapping = urutanOpsi[q.id];    // { hurufBaru: hurufAsli }
    const userAnswer = (mapping && mapping[userAnswerRaw]) ? mapping[userAnswerRaw] : userAnswerRaw;

    if (q.kategori === 'TKP') {
      // Cari opsi asli berdasarkan huruf asli
      const opsiDipilih = q.opsi_jawaban.find(o => o.huruf === userAnswer);
      skor_tkp += opsiDipilih ? (opsiDipilih.poin || 1) : 1;
    } else if (q.kategori === 'TWK') {
      if (userAnswer === q.kunci_jawaban) skor_twk += 5;
    } else if (q.kategori === 'TIU') {
      if (userAnswer === q.kunci_jawaban) skor_tiu += 5;
    }
  }

  const total_skor = skor_twk + skor_tiu + skor_tkp;

  // Hitung integrasi SKD otomatis. SKB default 0 sampai admin input.
  // Gunakan maks_skd=550 dan skor_skb=0 sebagai default (kolom baru).
  const integrasi = hitungIntegrasi(total_skor, 550, 0, 100);

  // Step 1: Update kolom yang dikenali Prisma (status, skor, jawaban)
  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'SUBMITTED', skor_twk, skor_tiu, skor_tkp, total_skor },
  });

  // Step 2: Update kolom integrasi via raw SQL (Prisma v7 client engine limitation)
  await pgQuery(
    `UPDATE exam_sessions
     SET nilai_integrasi_skd = $1,
         nilai_integrasi_skb = $2,
         total_nilai_akhir   = $3
     WHERE id = $4`,
    [integrasi.nilai_integrasi_skd, integrasi.nilai_integrasi_skb, integrasi.total_nilai_akhir, sessionId]
  );

  // Ambil data lengkap via raw SQL untuk response
  const { rows } = await pgQuery('SELECT * FROM exam_sessions WHERE id = $1', [sessionId]);
  return rows[0];
}

// PATCH /api/exam/skb/:sessionId — Admin menginput skor SKB → recalculate integrasi
const updateSkorSkb = async (req, res) => {
  const { sessionId } = req.params;
  const { skor_skb, maks_skb = 100, maks_skd = 550 } = req.body;

  if (skor_skb === undefined || skor_skb === null) {
    return res.status(400).json({ message: 'skor_skb wajib diisi.' });
  }

  const numSkorSkb = parseFloat(skor_skb);
  const numMaksSkb = parseFloat(maks_skb);
  const numMaksSkd = parseFloat(maks_skd);

  if (isNaN(numSkorSkb)) return res.status(400).json({ message: 'skor_skb harus berupa angka.' });
  if (numSkorSkb < 0)    return res.status(400).json({ message: 'skor_skb tidak boleh negatif.' });
  if (numSkorSkb > numMaksSkb) {
    return res.status(400).json({
      message: `skor_skb (${numSkorSkb}) tidak boleh melebihi maks_skb (${numMaksSkb}).`,
    });
  }

  try {
    // Baca session via raw SQL agar dapat kolom integrasi
    const sessionRes = await pgQuery('SELECT * FROM exam_sessions WHERE id = $1', [sessionId]);
    const session = sessionRes.rows[0];
    if (!session)                          return res.status(404).json({ message: 'Sesi tidak ditemukan.' });
    if (session.status !== 'SUBMITTED')    return res.status(400).json({ message: 'Skor SKB hanya bisa diinput setelah ujian selesai.' });

    const integrasi = hitungIntegrasi(session.total_skor, numMaksSkd, numSkorSkb, numMaksSkb);

    // Update via raw SQL
    await pgQuery(
      `UPDATE exam_sessions
       SET skor_skb            = $1,
           maks_skb            = $2,
           maks_skd            = $3,
           nilai_integrasi_skd = $4,
           nilai_integrasi_skb = $5,
           total_nilai_akhir   = $6
       WHERE id = $7`,
      [numSkorSkb, numMaksSkb, numMaksSkd,
       integrasi.nilai_integrasi_skd, integrasi.nilai_integrasi_skb, integrasi.total_nilai_akhir,
       sessionId]
    );

    // Ambil data terbaru + user
    const updatedRes = await pgQuery(
      `SELECT es.*, u.nama_lengkap, u.email
       FROM exam_sessions es
       JOIN users u ON u.id = es.user_id
       WHERE es.id = $1`,
      [sessionId]
    );
    const updated = updatedRes.rows[0];

    return res.status(200).json({
      message: 'Skor SKB berhasil diperbarui. Nilai integrasi telah dihitung ulang.',
      detail: {
        formulaSkd  : `(${session.total_skor} / ${numMaksSkd}) x 40 = ${integrasi.nilai_integrasi_skd}`,
        formulaSkb  : `(${numSkorSkb} / ${numMaksSkb}) x 60 = ${integrasi.nilai_integrasi_skb}`,
        formulaTotal: `${integrasi.nilai_integrasi_skd} + ${integrasi.nilai_integrasi_skb} = ${integrasi.total_nilai_akhir}`,
      },
      session: updated,
    });
  } catch (error) {
    console.error('updateSkorSkb error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = {
  startExam, getQuestions, saveAnswer, finishExam,
  getResult, getActiveExams, getExamInfo, updateSkorSkb,
};
