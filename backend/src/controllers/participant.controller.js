const { prisma, pgQuery } = require('../lib/prisma');

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

    // Create new session
    const session = await prisma.examSession.create({
      data: { user_id: userId, exam_id: examId, waktu_mulai: now },
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

    const questions = await prisma.question.findMany({
      where: { exam_id: examId },
      select: {
        id: true,
        kategori: true,
        teks_soal: true,
        opsi_jawaban: true,
        // kunci_jawaban is intentionally OMITTED for security
      },
    });

    return res.status(200).json({
      session: {
        id: session.id,
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

  for (const q of questions) {
    const userAnswer = jawaban[q.id];
    if (!userAnswer) continue;

    if (q.kategori === 'TKP') {
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
  getResult, getActiveExams, updateSkorSkb,
};
