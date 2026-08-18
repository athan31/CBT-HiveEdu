const { prisma } = require('../lib/prisma');
const XLSX = require('xlsx');
const multer = require('multer');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx / .xls) yang diizinkan.'));
    }
  },
}).single('file');

// Fisher-Yates Shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── GET /api/admin/bank-soal ──────────────────────────────────────────────────
const getCentralQuestions = async (req, res) => {
  try {
    const { search, kategori, scope, examId } = req.query;

    const where = {};

    // Filter kategori
    if (kategori && ['TWK', 'TIU', 'TKP'].includes(kategori.toUpperCase())) {
      where.kategori = kategori.toUpperCase();
    }

    // Filter scope
    if (scope === 'central') {
      where.exam_id = null;
    } else if (scope === 'assigned') {
      where.exam_id = { not: null };
    } else if (examId) {
      where.exam_id = examId;
    }

    // Filter search text
    if (search && search.trim()) {
      where.teks_soal = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const [questions, allCounts] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { id: 'desc' },
        include: { exam: { select: { id: true, judul_tryout: true } } },
      }),
      prisma.question.groupBy({
        by: ['kategori'],
        _count: { id: true },
      }),
    ]);

    const counts = { TWK: 0, TIU: 0, TKP: 0, total: 0, central: 0 };
    allCounts.forEach(c => {
      counts[c.kategori] = c._count.id;
      counts.total += c._count.id;
    });

    const centralCount = await prisma.question.count({ where: { exam_id: null } });
    counts.central = centralCount;

    return res.status(200).json({
      questions,
      counts,
      totalMatching: questions.length,
    });
  } catch (error) {
    console.error('getCentralQuestions error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memuat Bank Soal Central.' });
  }
};

// ── POST /api/admin/bank-soal ─────────────────────────────────────────────────
const createCentralQuestion = async (req, res) => {
  const { kategori, teks_soal, opsi_jawaban, kunci_jawaban, exam_id, tags } = req.body;

  if (!kategori || !teks_soal || !opsi_jawaban || !kunci_jawaban) {
    return res.status(400).json({ message: 'Kategori, teks soal, opsi jawaban, dan kunci jawaban wajib diisi.' });
  }

  if (!Array.isArray(opsi_jawaban) || opsi_jawaban.length < 2) {
    return res.status(400).json({ message: 'Opsi jawaban harus berupa array minimal 2 opsi.' });
  }

  const validKategori = ['TWK', 'TIU', 'TKP'];
  if (!validKategori.includes(kategori)) {
    return res.status(400).json({ message: 'Kategori harus TWK, TIU, atau TKP.' });
  }

  try {
    const question = await prisma.question.create({
      data: {
        kategori,
        teks_soal,
        opsi_jawaban,
        kunci_jawaban: kunci_jawaban.toUpperCase(),
        exam_id: exam_id || null,
        tags: tags || '',
      },
      include: { exam: { select: { id: true, judul_tryout: true } } },
    });

    return res.status(201).json({ message: 'Soal berhasil ditambahkan ke Bank Soal Central.', question });
  } catch (error) {
    console.error('createCentralQuestion error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ── PUT /api/admin/bank-soal/:id ──────────────────────────────────────────────
const updateCentralQuestion = async (req, res) => {
  const { id } = req.params;
  const { kategori, teks_soal, opsi_jawaban, kunci_jawaban, exam_id, tags } = req.body;

  try {
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(kategori && { kategori }),
        ...(teks_soal && { teks_soal }),
        ...(opsi_jawaban && { opsi_jawaban }),
        ...(kunci_jawaban && { kunci_jawaban: kunci_jawaban.toUpperCase() }),
        ...(exam_id !== undefined && { exam_id: exam_id || null }),
        ...(tags !== undefined && { tags }),
      },
      include: { exam: { select: { id: true, judul_tryout: true } } },
    });

    return res.status(200).json({ message: 'Soal berhasil diperbarui.', question });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Soal tidak ditemukan.' });
    console.error('updateCentralQuestion error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ── DELETE /api/admin/bank-soal/:id ───────────────────────────────────────────
const deleteCentralQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.question.delete({ where: { id } });
    return res.status(200).json({ message: 'Soal berhasil dihapus dari Bank Soal.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Soal tidak ditemukan.' });
    console.error('deleteCentralQuestion error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ── POST /api/admin/bank-soal/distribute ───────────────────────────────────────
// Menyalin/mendistribusikan soal dari Bank Soal Pusat ke Paket Tryout Tertentu
const distributeToExam = async (req, res) => {
  const { targetExamId, questionIds, randomSample } = req.body;

  if (!targetExamId) {
    return res.status(400).json({ message: 'targetExamId wajib diisi.' });
  }

  try {
    const targetExam = await prisma.exam.findUnique({ where: { id: targetExamId } });
    if (!targetExam) {
      return res.status(404).json({ message: 'Tryout tujuan tidak ditemukan.' });
    }

    let questionsToCopy = [];

    // Mode A: Berdasarkan ID soal spesifik yang dipilih
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      questionsToCopy = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
    }
    // Mode B: Random sampling per kategori dari Bank Soal Pusat
    else if (randomSample && typeof randomSample === 'object') {
      const { twk = 0, tiu = 0, tkp = 0 } = randomSample;

      const [allTwk, allTiu, allTkp] = await Promise.all([
        twk > 0 ? prisma.question.findMany({ where: { kategori: 'TWK' } }) : [],
        tiu > 0 ? prisma.question.findMany({ where: { kategori: 'TIU' } }) : [],
        tkp > 0 ? prisma.question.findMany({ where: { kategori: 'TKP' } }) : [],
      ]);

      const pickedTwk = shuffleArray(allTwk).slice(0, parseInt(twk));
      const pickedTiu = shuffleArray(allTiu).slice(0, parseInt(tiu));
      const pickedTkp = shuffleArray(allTkp).slice(0, parseInt(tkp));

      questionsToCopy = [...pickedTwk, ...pickedTiu, ...pickedTkp];
    } else {
      return res.status(400).json({ message: 'Pilih soal spesifik atau tentukan jumlah sampling per kategori.' });
    }

    if (questionsToCopy.length === 0) {
      return res.status(400).json({ message: 'Tidak ada soal yang dapat disalin.' });
    }

    // Insert salinan soal ke target tryout
    const created = await prisma.question.createMany({
      data: questionsToCopy.map(q => ({
        exam_id       : targetExamId,
        kategori      : q.kategori,
        teks_soal     : q.teks_soal,
        opsi_jawaban  : q.opsi_jawaban,
        kunci_jawaban : q.kunci_jawaban,
        tags          : q.tags || 'Distribusi Bank Pusat',
      })),
    });

    return res.status(201).json({
      message: `Berhasil mendistribusikan ${created.count} soal ke tryout "${targetExam.judul_tryout}".`,
      count: created.count,
      targetExam: { id: targetExam.id, judul_tryout: targetExam.judul_tryout },
    });
  } catch (error) {
    console.error('distributeToExam error:', error);
    return res.status(500).json({ message: 'Gagal mendistribusikan soal ke tryout.' });
  }
};

// ── POST /api/admin/bank-soal/import ──────────────────────────────────────────
// Import Excel langsung ke Bank Soal Pusat (exam_id null atau opsional)
const importCentralExcel = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'File Excel wajib diunggah.' });

    const targetExamId = req.body.exam_id || null;

    try {
      const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (rows.length < 2) return res.status(400).json({ message: 'File Excel kosong.' });

      const headers = rows[0].map(h => String(h ?? '').toLowerCase().trim());
      const findIdx = (names) => {
        for (const n of names) {
          const i = headers.indexOf(n);
          if (i !== -1) return i;
        }
        return -1;
      };

      const idx = {
        kategori  : findIdx(['kategori', 'category', 'tipe']),
        teks_soal : findIdx(['teks soal', 'soal', 'pertanyaan', 'question', 'teks_soal']),
        pil_a     : findIdx(['pilihan a', 'a', 'opsi a']),
        pil_b     : findIdx(['pilihan b', 'b', 'opsi b']),
        pil_c     : findIdx(['pilihan c', 'c', 'opsi c']),
        pil_d     : findIdx(['pilihan d', 'd', 'opsi d']),
        pil_e     : findIdx(['pilihan e', 'e', 'opsi e']),
        poin_a    : findIdx(['poin a', 'bobot a', 'nilai a']),
        poin_b    : findIdx(['poin b', 'bobot b', 'nilai b']),
        poin_c    : findIdx(['poin c', 'bobot c', 'nilai c']),
        poin_d    : findIdx(['poin d', 'bobot d', 'nilai d']),
        poin_e    : findIdx(['poin e', 'bobot e', 'nilai e']),
        kunci     : findIdx(['kunci jawaban', 'kunci', 'jawaban benar', 'answer']),
      };

      if (idx.kategori === -1 || idx.teks_soal === -1 || idx.kunci === -1 || idx.pil_a === -1) {
        return res.status(400).json({ message: 'Format kolom header Excel tidak sesuai template.' });
      }

      const questions = [];
      const errors = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 1;
        if (!row.some(cell => String(cell ?? '').trim() !== '')) continue;

        const kategori  = String(row[idx.kategori] ?? '').trim().toUpperCase();
        const teks_soal = String(row[idx.teks_soal] ?? '').trim();
        const kunci     = String(row[idx.kunci] ?? '').trim().toUpperCase();

        if (!['TWK', 'TIU', 'TKP'].includes(kategori) || !teks_soal || !['A','B','C','D','E'].includes(kunci)) {
          errors.push(`Baris ${rowNum}: Data tidak valid (Kategori: ${kategori}, Kunci: ${kunci}).`);
          continue;
        }

        const pilihanRaw = [
          { huruf: 'A', col: idx.pil_a, pCol: idx.poin_a },
          { huruf: 'B', col: idx.pil_b, pCol: idx.poin_b },
          { huruf: 'C', col: idx.pil_c, pCol: idx.poin_c },
          { huruf: 'D', col: idx.pil_d, pCol: idx.poin_d },
          { huruf: 'E', col: idx.pil_e, pCol: idx.poin_e },
        ];

        const opsi_jawaban = [];
        for (const p of pilihanRaw) {
          if (p.col === -1) continue;
          const teks = String(row[p.col] ?? '').trim();
          if (!teks) continue;
          const poin = p.pCol !== -1 && row[p.pCol] !== '' ? parseInt(row[p.pCol]) || 1 : (kategori === 'TKP' ? 1 : 0);
          opsi_jawaban.push({ huruf: p.huruf, teks, poin });
        }

        if (opsi_jawaban.length < 4 || !opsi_jawaban.find(o => o.huruf === kunci)) {
          errors.push(`Baris ${rowNum}: Pilihan kurang atau kunci tidak ditemukan.`);
          continue;
        }

        questions.push({
          kategori,
          teks_soal,
          opsi_jawaban,
          kunci_jawaban: kunci,
          exam_id: targetExamId,
          tags: 'Import Central Excel',
        });
      }

      if (questions.length === 0) {
        return res.status(400).json({ message: 'Tidak ada soal valid dalam file.', errors });
      }

      const created = await prisma.question.createMany({ data: questions });

      return res.status(201).json({
        message: `Berhasil mengimpor ${created.count} soal ke Bank Soal Central.`,
        imported: created.count,
        skipped: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (parseErr) {
      console.error('importCentralExcel error:', parseErr);
      return res.status(400).json({ message: parseErr.message || 'Gagal membaca file Excel.' });
    }
  });
};

module.exports = {
  getCentralQuestions,
  createCentralQuestion,
  updateCentralQuestion,
  deleteCentralQuestion,
  distributeToExam,
  importCentralExcel,
};
