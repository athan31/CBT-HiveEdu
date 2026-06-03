const { prisma, pgQuery } = require('../lib/prisma');

// ── In-memory store: status sesi peserta yang sedang ujian ──────────────────
// Format: { [sessionId]: { examId, userId, nama, questionIndex, totalAnswered, connected, lastSeen } }
const liveSessionStore = {};

// ── Debounce map: hindari double-count pelanggaran dari event ganda ──────────
// Format: { [sessionId]: timestamp_last_violation }
const violationDebounce = {};

const initSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── PESERTA: Bergabung ke room sesi ujian ────────────────────────────────
    socket.on('join_session', async ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      console.log(`Socket ${socket.id} joined session: ${sessionId}`);

      // Tandai peserta sebagai online di store
      try {
        const sessionRes = await pgQuery(
          `SELECT es.*, u.nama_lengkap, e.judul_tryout, e.id AS exam_uuid
           FROM exam_sessions es
           JOIN users u ON u.id = es.user_id
           JOIN exams e ON e.id = es.exam_id
           WHERE es.id = $1`,
          [sessionId]
        );
        if (sessionRes.rows[0]) {
          const s = sessionRes.rows[0];
          const totalAnswered = Object.keys(s.jawaban_peserta || {}).length;
          liveSessionStore[sessionId] = {
            ...( liveSessionStore[sessionId] || {}),
            sessionId,
            examId        : s.exam_uuid,
            userId        : s.user_id,
            nama          : s.nama_lengkap,
            questionIndex : liveSessionStore[sessionId]?.questionIndex ?? 0,
            totalAnswered,
            jumlah_pelanggaran: s.jumlah_pelanggaran,
            status        : s.status,
            connected     : true,
            lastSeen      : Date.now(),
          };

          // Broadcast update ke admin room tryout tersebut
          io.to(`monitor:${s.exam_uuid}`).emit('session_live_update', liveSessionStore[sessionId]);
        }
      } catch (e) {
        console.error('join_session store error:', e);
      }
    });

    // ── PESERTA: Update posisi soal saat ini ─────────────────────────────────
    socket.on('peserta_question_update', ({ sessionId, questionIndex, totalAnswered }) => {
      if (!sessionId) return;
      if (liveSessionStore[sessionId]) {
        liveSessionStore[sessionId].questionIndex    = questionIndex;
        liveSessionStore[sessionId].totalAnswered    = totalAnswered;
        liveSessionStore[sessionId].lastSeen         = Date.now();
        liveSessionStore[sessionId].connected        = true;

        const examId = liveSessionStore[sessionId].examId;
        io.to(`monitor:${examId}`).emit('session_live_update', liveSessionStore[sessionId]);
      }
    });

    // ── ADMIN: Bergabung ke room monitoring untuk exam tertentu ──────────────
    socket.on('admin_join_monitoring', async ({ examId }) => {
      if (!examId) return;
      socket.join(`monitor:${examId}`);
      console.log(`Admin socket ${socket.id} joined monitoring room: monitor:${examId}`);

      // Kirim snapshot semua sesi aktif dari DB + live store
      try {
        const { rows } = await pgQuery(
          `SELECT es.id, es.user_id, es.status, es.jumlah_pelanggaran, es.jawaban_peserta,
                  es.skor_twk, es.skor_tiu, es.skor_tkp, es.total_skor,
                  es.nilai_integrasi_skd, es.total_nilai_akhir,
                  u.nama_lengkap, u.email
           FROM exam_sessions es
           JOIN users u ON u.id = es.user_id
           WHERE es.exam_id = $1
           ORDER BY es.status, u.nama_lengkap`,
          [examId]
        );

        const sessions = rows.map(s => ({
          sessionId            : s.id,
          userId               : s.user_id,
          examId,
          nama                 : s.nama_lengkap,
          email                : s.email,
          status               : s.status,
          jumlah_pelanggaran   : s.jumlah_pelanggaran,
          totalAnswered        : Object.keys(s.jawaban_peserta || {}).length,
          questionIndex        : liveSessionStore[s.id]?.questionIndex ?? 0,
          connected            : liveSessionStore[s.id]?.connected ?? false,
          lastSeen             : liveSessionStore[s.id]?.lastSeen ?? null,
          skor_twk             : s.skor_twk,
          skor_tiu             : s.skor_tiu,
          skor_tkp             : s.skor_tkp,
          total_skor           : s.total_skor,
          total_nilai_akhir    : s.total_nilai_akhir,
        }));

        socket.emit('monitoring_snapshot', { examId, sessions });
        console.log(`Sent snapshot of ${sessions.length} sessions to admin`);
      } catch (e) {
        console.error('admin_join_monitoring error:', e);
      }
    });

    // ── ANTI-CHEAT: Pelanggaran tab switching ────────────────────────────────
    socket.on('tab_violation', async ({ sessionId }) => {
      if (!sessionId) return;

      // Debounce: abaikan jika pelanggaran dari sesi yang sama < 2 detik yang lalu
      const now = Date.now();
      if (violationDebounce[sessionId] && (now - violationDebounce[sessionId]) < 2000) {
        console.log(`⏱ Violation debounced for session ${sessionId}`);
        return;
      }
      violationDebounce[sessionId] = now;

      try {
        const updatedSession = await prisma.examSession.update({
          where: { id: sessionId },
          data: { jumlah_pelanggaran: { increment: 1 } },
          select: { id: true, jumlah_pelanggaran: true, status: true, exam_id: true },
        });

        if (updatedSession.status === 'SUBMITTED') return;

        await prisma.violationLog.create({
          data: {
            session_id        : sessionId,
            jenis_pelanggaran : 'TAB_SWITCHED',
            peringatan_ke     : updatedSession.jumlah_pelanggaran,
          },
        });

        // Update live store
        if (liveSessionStore[sessionId]) {
          liveSessionStore[sessionId].jumlah_pelanggaran = updatedSession.jumlah_pelanggaran;
        }

        // Kirim peringatan ke peserta
        io.to(sessionId).emit('violation_warning', {
          total   : updatedSession.jumlah_pelanggaran,
          message : 'Peringatan! Sistem mendeteksi Anda meninggalkan halaman ujian. Pelanggaran ini telah dicatat.',
        });

        // Broadcast realtime ke admin monitoring room
        const liveData = liveSessionStore[sessionId] || { sessionId };
        io.to(`monitor:${updatedSession.exam_id}`).emit('violation_live_update', {
          sessionId,
          jumlah_pelanggaran : updatedSession.jumlah_pelanggaran,
          nama               : liveData.nama,
          examId             : updatedSession.exam_id,
          timestamp          : new Date().toISOString(),
        });

        console.log(`⚠️  Violation: session ${sessionId} — total: ${updatedSession.jumlah_pelanggaran}`);
      } catch (error) {
        console.error('tab_violation handler error:', error);
      }
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const sessionId = socket.data.sessionId;
      if (sessionId && liveSessionStore[sessionId]) {
        liveSessionStore[sessionId].connected = false;
        liveSessionStore[sessionId].lastSeen  = Date.now();

        const examId = liveSessionStore[sessionId].examId;
        io.to(`monitor:${examId}`).emit('session_live_update', liveSessionStore[sessionId]);
        console.log(`🔴 Peserta disconnected: ${sessionId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper: hapus session dari store saat selesai ujian
const removeFromLiveStore = (sessionId) => {
  if (liveSessionStore[sessionId]) {
    liveSessionStore[sessionId].status = 'SUBMITTED';
  }
};

module.exports = { initSocketHandler, removeFromLiveStore };
