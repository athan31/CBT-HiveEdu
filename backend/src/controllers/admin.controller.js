const { prisma, pgQuery } = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// ──────────────────────────────────────────────
// EXAM CRUD
// ──────────────────────────────────────────────

// GET /api/admin/exams
const getAllExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { waktu_mulai: 'desc' },
      include: { _count: { select: { questions: true, sessions: true } } },
    });
    return res.status(200).json(exams);
  } catch (error) {
    console.error('getAllExams error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/admin/exams/:id
const getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });
    return res.status(200).json(exam);
  } catch (error) {
    console.error('getExamById error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// POST /api/admin/exams
const createExam = async (req, res) => {
  const { judul_tryout, durasi_menit } = req.body;
  if (!judul_tryout || !durasi_menit) {
    return res.status(400).json({ message: 'Judul tryout dan durasi wajib diisi.' });
  }
  try {
    const waktu_mulai  = new Date();
    const waktu_selesai = new Date(waktu_mulai.getTime() + parseInt(durasi_menit) * 60 * 1000);

    const exam = await prisma.exam.create({
      data: {
        judul_tryout,
        durasi_menit : parseInt(durasi_menit),
        waktu_mulai,
        waktu_selesai,
      },
    });
    return res.status(201).json({ message: 'Tryout berhasil dibuat.', exam });
  } catch (error) {
    console.error('createExam error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PUT /api/admin/exams/:id
const updateExam = async (req, res) => {
  const { id } = req.params;
  const { judul_tryout, durasi_menit } = req.body;
  try {
    // Jika durasi berubah, recalculate waktu_selesai dari waktu_mulai yang sudah ada
    let extraData = {};
    if (durasi_menit) {
      const existing = await prisma.exam.findUnique({ where: { id }, select: { waktu_mulai: true } });
      if (existing) {
        const mulai   = existing.waktu_mulai;
        extraData.waktu_selesai = new Date(mulai.getTime() + parseInt(durasi_menit) * 60 * 1000);
      }
    }
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(judul_tryout && { judul_tryout }),
        ...(durasi_menit && { durasi_menit: parseInt(durasi_menit) }),
        ...extraData,
      },
    });
    return res.status(200).json({ message: 'Tryout berhasil diperbarui.', exam });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Tryout tidak ditemukan.' });
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// DELETE /api/admin/exams/:id
const deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({ where: { id } });
    return res.status(200).json({ message: 'Tryout berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Tryout tidak ditemukan.' });
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ──────────────────────────────────────────────
// QUESTION CRUD
// ──────────────────────────────────────────────

// GET /api/admin/exams/:examId/questions
const getQuestions = async (req, res) => {
  const { examId } = req.params;
  try {
    const questions = await prisma.question.findMany({ where: { exam_id: examId } });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// POST /api/admin/exams/:examId/questions
const createQuestion = async (req, res) => {
  const { examId } = req.params;
  const { kategori, teks_soal, opsi_jawaban, kunci_jawaban } = req.body;

  if (!kategori || !teks_soal || !opsi_jawaban || !kunci_jawaban) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  // Validate opsi_jawaban is array with required format
  if (!Array.isArray(opsi_jawaban) || opsi_jawaban.length < 2) {
    return res.status(400).json({ message: 'opsi_jawaban harus berupa array minimal 2 elemen.' });
  }
  for (const opsi of opsi_jawaban) {
    if (!opsi.huruf || typeof opsi.teks !== 'string') {
      return res.status(400).json({ message: 'Setiap opsi harus memiliki field huruf dan teks.' });
    }
  }

  const validKategori = ['TWK', 'TIU', 'TKP'];
  if (!validKategori.includes(kategori)) {
    return res.status(400).json({ message: 'Kategori harus TWK, TIU, atau TKP.' });
  }

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });

    const question = await prisma.question.create({
      data: { exam_id: examId, kategori, teks_soal, opsi_jawaban, kunci_jawaban: kunci_jawaban.toUpperCase() },
    });
    return res.status(201).json({ message: 'Soal berhasil ditambahkan.', question });
  } catch (error) {
    console.error('createQuestion error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PUT /api/admin/exams/:examId/questions/:questionId
const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { kategori, teks_soal, opsi_jawaban, kunci_jawaban } = req.body;
  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(kategori && { kategori }),
        ...(teks_soal && { teks_soal }),
        ...(opsi_jawaban && { opsi_jawaban }),
        ...(kunci_jawaban && { kunci_jawaban: kunci_jawaban.toUpperCase() }),
      },
    });
    return res.status(200).json({ message: 'Soal berhasil diperbarui.', question });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Soal tidak ditemukan.' });
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// DELETE /api/admin/exams/:examId/questions/:questionId
const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  try {
    await prisma.question.delete({ where: { id: questionId } });
    return res.status(200).json({ message: 'Soal berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Soal tidak ditemukan.' });
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ──────────────────────────────────────────────
// LEADERBOARD & VIOLATIONS
// ──────────────────────────────────────────────

// GET /api/admin/leaderboard/:examId
const getLeaderboard = async (req, res) => {
  const { examId } = req.params;
  try {
    const { rows } = await pgQuery(
      `SELECT es.id, es.user_id, es.status, es.jumlah_pelanggaran,
              es.skor_twk, es.skor_tiu, es.skor_tkp, es.total_skor,
              es.skor_skb, es.maks_skb, es.maks_skd,
              es.nilai_integrasi_skd, es.nilai_integrasi_skb, es.total_nilai_akhir,
              u.nama_lengkap, u.email
       FROM exam_sessions es
       JOIN users u ON u.id = es.user_id
       WHERE es.exam_id = $1
         AND es.status = 'SUBMITTED'
       ORDER BY es.total_nilai_akhir DESC, es.total_skor DESC`,
      [examId]
    );

    // Reshape: embed user object agar kompatibel dengan frontend
    const sessions = rows.map(s => ({
      id                  : s.id,
      user_id             : s.user_id,
      status              : s.status,
      jumlah_pelanggaran  : s.jumlah_pelanggaran,
      skor_twk            : s.skor_twk,
      skor_tiu            : s.skor_tiu,
      skor_tkp            : s.skor_tkp,
      total_skor          : s.total_skor,
      skor_skb            : s.skor_skb,
      nilai_integrasi_skd : s.nilai_integrasi_skd,
      nilai_integrasi_skb : s.nilai_integrasi_skb,
      total_nilai_akhir   : s.total_nilai_akhir,
      user                : { nama_lengkap: s.nama_lengkap, email: s.email },
    }));

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/admin/violations/:examId
const getViolationLogs = async (req, res) => {
  const { examId } = req.params;
  try {
    const sessions = await prisma.examSession.findMany({
      where: { exam_id: examId },
      include: {
        user: { select: { nama_lengkap: true, email: true } },
        violations: { orderBy: { waktu_pelanggaran: 'asc' } },
      },
    });
    const result = sessions
      .filter(s => s.violations.length > 0)
      .map(s => ({
        session_id: s.id,
        user: s.user,
        jumlah_pelanggaran: s.jumlah_pelanggaran,
        violations: s.violations,
      }));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nama_lengkap: true, email: true, role: true },
      orderBy: { nama_lengkap: 'asc' },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// POST /api/admin/users — Admin creates PESERTA or TUTOR account
const createUser = async (req, res) => {
  const { nama_lengkap, email, password, role } = req.body;
  if (!nama_lengkap || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }
  const validRole = ['PESERTA', 'TUTOR'].includes(role) ? role : 'PESERTA';
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email sudah terdaftar.' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { nama_lengkap, email, password: hashed, role: validRole },
    });
    return res.status(201).json({
      message: 'Pengguna berhasil dibuat.',
      user: { id: user.id, nama_lengkap: user.nama_lengkap, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PUT /api/admin/users/:id — Admin updates user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama_lengkap, email, role, password } = req.body;
  try {
    // Prevent editing other ADMINs (optional safeguard)
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    // Check email uniqueness if changed
    if (email && email !== target.email) {
      const dup = await prisma.user.findUnique({ where: { email } });
      if (dup) return res.status(409).json({ message: 'Email sudah digunakan pengguna lain.' });
    }

    const data = {};
    if (nama_lengkap) data.nama_lengkap = nama_lengkap;
    if (email) data.email = email;
    if (role && ['PESERTA', 'TUTOR', 'ADMIN'].includes(role)) data.role = role;
    if (password && password.trim()) data.password = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({ where: { id }, data });
    return res.status(200).json({
      message: 'Pengguna berhasil diperbarui.',
      user: { id: updated.id, nama_lengkap: updated.nama_lengkap, email: updated.email, role: updated.role },
    });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// DELETE /api/admin/users/:id — Admin deletes user (cascade sessions)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent self-deletion
    if (id === req.user.id) return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri.' });
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PATCH /api/admin/exams/:id/toggle
// Aktifkan / nonaktifkan tryout secara instan
const toggleExamActive = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });

    const now = new Date();
    const isCurrentlyActive = now >= exam.waktu_mulai && now <= exam.waktu_selesai;

    let data;
    if (isCurrentlyActive) {
      // Nonaktifkan: set waktu_selesai ke masa lalu
      data = { waktu_selesai: new Date(now.getTime() - 1000) };
    } else {
      // Aktifkan: mulai sekarang, selesai sesuai durasi
      const mulai   = now;
      const selesai = new Date(now.getTime() + exam.durasi_menit * 60 * 1000 + 60 * 60 * 1000); // +1 jam buffer
      data = { waktu_mulai: mulai, waktu_selesai: selesai };
    }

    const updated = await prisma.exam.update({ where: { id }, data });
    return res.status(200).json({
      message: isCurrentlyActive ? 'Tryout berhasil dinonaktifkan.' : 'Tryout berhasil diaktifkan.',
      active: !isCurrentlyActive,
      exam: updated,
    });
  } catch (error) {
    console.error('toggleExamActive error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/admin/sessions/:examId
// Semua sesi ujian untuk satu exam (untuk monitoring room)
const getExamSessions = async (req, res) => {
  const { examId } = req.params;
  try {
    const { rows } = await pgQuery(
      `SELECT es.id, es.user_id, es.status, es.jumlah_pelanggaran,
              es.jawaban_peserta, es.waktu_mulai,
              es.skor_twk, es.skor_tiu, es.skor_tkp, es.total_skor,
              es.nilai_integrasi_skd, es.total_nilai_akhir,
              u.nama_lengkap, u.email
       FROM exam_sessions es
       JOIN users u ON u.id = es.user_id
       WHERE es.exam_id = $1
       ORDER BY es.status ASC, u.nama_lengkap ASC`,
      [examId]
    );

    const sessions = rows.map((s, idx) => ({
      deviceNo          : idx + 1,
      sessionId         : s.id,
      userId            : s.user_id,
      nama              : s.nama_lengkap,
      email             : s.email,
      status            : s.status,
      jumlah_pelanggaran: s.jumlah_pelanggaran,
      totalAnswered     : Object.keys(s.jawaban_peserta || {}).length,
      waktu_mulai       : s.waktu_mulai,
      skor_twk          : s.skor_twk,
      skor_tiu          : s.skor_tiu,
      skor_tkp          : s.skor_tkp,
      total_skor        : s.total_skor,
      total_nilai_akhir : s.total_nilai_akhir,
    }));

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('getExamSessions error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = {
  getAllExams, getExamById, createExam, updateExam, deleteExam,
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getLeaderboard, getViolationLogs, getAllUsers, createUser, updateUser, deleteUser,
  toggleExamActive, getExamSessions,
};
