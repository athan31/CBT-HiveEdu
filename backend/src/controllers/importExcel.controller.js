const multer = require('multer');
const XLSX = require('xlsx');

// Multer: simpan di memory buffer (tidak ke disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',                                           // .xls
      'application/octet-stream',                                           // fallback
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx / .xls) yang diizinkan.'));
    }
  },
}).single('file');

// ── Nama kolom yang diterima (fleksibel, case-insensitive) ─────────────────
const COL_MAP = {
  kategori    : ['kategori', 'category', 'tipe'],
  teks_soal   : ['teks soal', 'soal', 'pertanyaan', 'question', 'teks_soal'],
  pil_a       : ['pilihan a', 'a', 'opsi a'],
  pil_b       : ['pilihan b', 'b', 'opsi b'],
  pil_c       : ['pilihan c', 'c', 'opsi c'],
  pil_d       : ['pilihan d', 'd', 'opsi d'],
  pil_e       : ['pilihan e', 'e', 'opsi e'],
  poin_a      : ['poin a', 'bobot a', 'nilai a'],
  poin_b      : ['poin b', 'bobot b', 'nilai b'],
  poin_c      : ['poin c', 'bobot c', 'nilai c'],
  poin_d      : ['poin d', 'bobot d', 'nilai d'],
  poin_e      : ['poin e', 'bobot e', 'nilai e'],
  kunci       : ['kunci jawaban', 'kunci', 'jawaban benar', 'answer'],
};

function findCol(headers, aliases) {
  const h = headers.map(x => String(x ?? '').toLowerCase().trim());
  for (const alias of aliases) {
    const idx = h.indexOf(alias.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // Konversi ke array of arrays (termasuk baris header)
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (rows.length < 2) throw new Error('Sheet kosong atau tidak ada data.');

  const headers = rows[0];

  // Temukan kolom
  const idx = {
    kategori  : findCol(headers, COL_MAP.kategori),
    teks_soal : findCol(headers, COL_MAP.teks_soal),
    pil_a     : findCol(headers, COL_MAP.pil_a),
    pil_b     : findCol(headers, COL_MAP.pil_b),
    pil_c     : findCol(headers, COL_MAP.pil_c),
    pil_d     : findCol(headers, COL_MAP.pil_d),
    pil_e     : findCol(headers, COL_MAP.pil_e),
    poin_a    : findCol(headers, COL_MAP.poin_a),
    poin_b    : findCol(headers, COL_MAP.poin_b),
    poin_c    : findCol(headers, COL_MAP.poin_c),
    poin_d    : findCol(headers, COL_MAP.poin_d),
    poin_e    : findCol(headers, COL_MAP.poin_e),
    kunci     : findCol(headers, COL_MAP.kunci),
  };

  if (idx.kategori === -1) throw new Error('Kolom "Kategori" tidak ditemukan di header Excel.');
  if (idx.teks_soal === -1) throw new Error('Kolom "Teks Soal" tidak ditemukan di header Excel.');
  if (idx.kunci === -1) throw new Error('Kolom "Kunci Jawaban" tidak ditemukan di header Excel.');
  if (idx.pil_a === -1 || idx.pil_b === -1 || idx.pil_c === -1 || idx.pil_d === -1) {
    throw new Error('Kolom Pilihan A, B, C, D wajib ada di header Excel.');
  }

  const questions = [];
  const errors = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Skip baris kosong
    const hasContent = row.some(cell => String(cell ?? '').trim() !== '');
    if (!hasContent) continue;

    const kategori   = String(row[idx.kategori] ?? '').trim().toUpperCase();
    const teks_soal  = String(row[idx.teks_soal] ?? '').trim();
    const kunci      = String(row[idx.kunci] ?? '').trim().toUpperCase();

    // Validasi
    if (!['TWK', 'TIU', 'TKP'].includes(kategori)) {
      errors.push(`Baris ${rowNum}: Kategori "${kategori}" tidak valid (harus TWK/TIU/TKP).`);
      continue;
    }
    if (!teks_soal) {
      errors.push(`Baris ${rowNum}: Teks soal kosong.`);
      continue;
    }
    if (!['A','B','C','D','E'].includes(kunci)) {
      errors.push(`Baris ${rowNum}: Kunci jawaban "${kunci}" tidak valid (harus A/B/C/D/E).`);
      continue;
    }

    // Buat opsi jawaban
    const pilihanRaw = [
      { huruf: 'A', colIdx: idx.pil_a, poinIdx: idx.poin_a },
      { huruf: 'B', colIdx: idx.pil_b, poinIdx: idx.poin_b },
      { huruf: 'C', colIdx: idx.pil_c, poinIdx: idx.poin_c },
      { huruf: 'D', colIdx: idx.pil_d, poinIdx: idx.poin_d },
      { huruf: 'E', colIdx: idx.pil_e, poinIdx: idx.poin_e },
    ];

    const opsi_jawaban = [];
    for (const { huruf, colIdx, poinIdx } of pilihanRaw) {
      if (colIdx === -1) continue; // Pilihan E opsional
      const teks = String(row[colIdx] ?? '').trim();
      if (!teks) {
        // A-D wajib ada (E opsional)
        if (huruf !== 'E') {
          errors.push(`Baris ${rowNum}: Pilihan ${huruf} kosong.`);
        }
        continue;
      }
      const poin = poinIdx !== -1 && row[poinIdx] !== ''
        ? parseInt(row[poinIdx]) || 1
        : (kategori === 'TKP' ? 1 : 0); // default poin TKP=1, lain=0

      opsi_jawaban.push({ huruf, teks, poin });
    }

    if (opsi_jawaban.length < 4) {
      errors.push(`Baris ${rowNum}: Minimal 4 pilihan jawaban (A-D) harus diisi.`);
      continue;
    }

    // Pastikan kunci ada di opsi yang tersedia
    if (!opsi_jawaban.find(o => o.huruf === kunci)) {
      errors.push(`Baris ${rowNum}: Kunci "${kunci}" tidak ada dalam opsi jawaban.`);
      continue;
    }

    questions.push({ kategori, teks_soal, opsi_jawaban, kunci_jawaban: kunci });
  }

  return { questions, errors };
}

// ── Controller: POST /api/admin/exams/:examId/questions/import ─────────────
const importQuestionsExcel = async (req, res) => {
  const { examId } = req.params;
  const { prisma } = require('../lib/prisma');

  // Cek apakah exam ada
  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return res.status(404).json({ message: 'Tryout tidak ditemukan.' });
  } catch {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }

  // Handle multer upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'File Excel wajib diunggah.' });
    }

    try {
      const { questions, errors } = parseExcel(req.file.buffer);

      if (questions.length === 0) {
        return res.status(400).json({
          message: 'Tidak ada soal valid yang dapat diimpor.',
          errors,
        });
      }

      // Bulk insert via Prisma
      const created = await prisma.question.createMany({
        data: questions.map(q => ({
          exam_id       : examId,
          kategori      : q.kategori,
          teks_soal     : q.teks_soal,
          opsi_jawaban  : q.opsi_jawaban,
          kunci_jawaban : q.kunci_jawaban,
        })),
      });

      return res.status(201).json({
        message   : `Berhasil mengimpor ${created.count} soal dari Excel.`,
        imported  : created.count,
        skipped   : errors.length,
        errors    : errors.length > 0 ? errors : undefined,
      });
    } catch (parseErr) {
      console.error('importQuestionsExcel error:', parseErr);
      return res.status(400).json({
        message: parseErr.message || 'Gagal membaca file Excel. Pastikan format sesuai template.',
      });
    }
  });
};

module.exports = { importQuestionsExcel, uploadMiddleware: upload };
