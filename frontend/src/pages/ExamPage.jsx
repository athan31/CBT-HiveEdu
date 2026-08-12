import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import useExamStore from '../store/examStore';
import ViolationModal from '../components/ViolationModal';
import QuestionNavGrid from '../components/QuestionNavGrid';
import ReadyModal from '../components/ReadyModal';
import ExpiredModal from '../components/ExpiredModal';
import toast from 'react-hot-toast';

function formatTime(ms) {
  const safe = typeof ms === 'number' && isFinite(ms) ? ms : 0;
  if (safe <= 0) return '00:00:00';
  const t = Math.floor(safe / 1000);
  return `${Math.floor(t/3600).toString().padStart(2,'0')}:${Math.floor((t%3600)/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;
}

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Fase halaman: 'loading' | 'error' | 'expired' | 'ready' | 'exam'
  const [phase, setPhase] = useState('loading');
  const [isStarting, setIsStarting] = useState(false);
  const [initError, setInitError] = useState('');

  const {
    session, examInfo, questions, currentIndex, answers, remainingMs,
    violationCount, showViolationModal,
    getExamInfo, startExam, loadQuestions, saveAnswer, finishExam,
    setCurrentIndex, setRemainingMs, incrementViolation,
    dismissViolationModal, resetExam, isLoading, isSubmitting,
  } = useExamStore();

  /* ── 1. Mount: ambil info ujian dulu, jangan langsung start ── */
  useEffect(() => {
    const init = async () => {
      const r = await getExamInfo(examId);
      if (!r.success) {
        setInitError(r.error);
        setPhase('error');
        return;
      }
      // Tentukan fase awal berdasarkan status waktu
      if (r.data.isExpired) {
        setPhase('expired');
      } else {
        setPhase('ready');
      }
    };
    init();
    return () => resetExam();
  }, [examId]);

  /* ── 2. Handler: peserta klik "Saya Siap" ── */
  const handleReady = async () => {
    setIsStarting(true);
    try {
      // Cek sekali lagi apakah waktu belum habis
      const now = new Date();
      if (examInfo && now > new Date(examInfo.waktu_selesai)) {
        setPhase('expired');
        return;
      }

      const r = await startExam(examId);
      if (!r.success) {
        // Backend menolak (waktu habis, sudah submit, dll)
        if (r.error?.includes('habis') || r.error?.includes('aktif')) {
          setPhase('expired');
        } else {
          toast.error(r.error);
          navigate('/dashboard');
        }
        return;
      }
      await loadQuestions(examId);
      setPhase('exam');
    } finally {
      setIsStarting(false);
    }
  };

  /* ── 3. Socket: hanya aktif saat ujian berlangsung ── */
  useEffect(() => {
    if (!session?.id || phase !== 'exam') return;
    const socket = io('http://localhost:5000'); socketRef.current = socket;
    socket.on('connect', () => { socket.emit('join_session', { sessionId: session.id }); });
    socket.on('violation_warning', ({ total }) => { incrementViolation(total); });
    const emit = () => { if (socket.connected) socket.emit('tab_violation', { sessionId: session.id }); };
    const onVis = () => { if (document.hidden) emit(); };
    const onBlur = () => { setTimeout(() => { if (document.hidden) emit(); }, 200); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      socket.disconnect();
    };
  }, [session?.id, phase]);

  /* ── 4. Progress socket ── */
  useEffect(() => {
    if (!socketRef.current?.connected || !session?.id) return;
    socketRef.current.emit('peserta_question_update', {
      sessionId: session.id,
      questionIndex: currentIndex,
      totalAnswered: Object.keys(answers).length,
    });
  }, [currentIndex, Object.keys(answers).length]);

  /* ── 5. Timer countdown ── */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const ms = typeof remainingMs === 'number' && isFinite(remainingMs) ? remainingMs : 0;
    if (!session?.id || ms <= 0) return;

    timerRef.current = setInterval(() => {
      setRemainingMs(prev => {
        const current = typeof prev === 'number' && isFinite(prev) ? prev : 0;
        if (current <= 1000) {
          clearInterval(timerRef.current);
          handleAutoFinish();
          return 0;
        }
        return current - 1000;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, remainingMs > 0]);

  /* ── 6. Auto-finish ketika waktu habis ── */
  const handleAutoFinish = useCallback(async () => {
    toast.loading('Waktu habis! Jawaban dikumpulkan...');
    const r = await finishExam();
    if (r.success) navigate(`/result/${session.id}`);
  }, [session?.id]);

  /* ── 7. Submit manual ── */
  const handleSubmit = async () => {
    // Blokir submit jika waktu sudah habis
    if (remainingMs <= 0) {
      toast.error('Waktu ujian telah habis.');
      return;
    }
    const a = Object.keys(answers).length, t = questions.length;
    if (a < t && !window.confirm(`Baru ${a}/${t} soal terjawab. Yakin ingin mengumpulkan?`)) return;
    const r = await finishExam();
    if (r.success) navigate(`/result/${session?.id}`); else toast.error(r.error);
  };

  const isWarn = remainingMs > 0 && remainingMs < 10 * 60 * 1000;

  /* ════════ RENDER per fase ════════ */

  // Fase loading awal (sebelum info ujian datang)
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)', margin: '0 auto 16px' }}/>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Memeriksa status ujian...</p>
        </div>
      </div>
    );
  }

  // Fase error saat memuat info ujian
  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)',
          borderRadius: 'var(--r-xl, 16px)', padding: '36px 28px',
          boxShadow: '0 16px 40px rgba(0,0,0,.4)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--trading-down,#f6465d)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 10 }}>Gagal Memuat Ujian</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>{initError}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>Pastikan server berjalan dan koneksi internet stabil.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              style={{ flex: 1, height: 40, fontSize: 13 }}
            >
              Kembali
            </button>
            <button
              onClick={() => { setPhase('loading'); setInitError(''); getExamInfo(examId).then(r => { if (!r.success) { setInitError(r.error); setPhase('error'); } else { setPhase(r.data.isExpired ? 'expired' : 'ready'); } }); }}
              className="btn-primary"
              style={{ flex: 1, height: 40, fontSize: 13 }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Fase waktu habis
  if (phase === 'expired') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)' }}>
        <ExpiredModal examInfo={examInfo} />
      </div>
    );
  }

  // Fase konfirmasi siap (belum klik "Mulai")
  if (phase === 'ready') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)' }}>
        <ReadyModal examInfo={examInfo} onStart={handleReady} isStarting={isStarting} />
      </div>
    );
  }

  // Fase loading soal (setelah klik "Siap", menunggu data soal)
  if (isLoading || !session || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)', margin: '0 auto 16px' }}/>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Memuat soal ujian...</p>
        </div>
      </div>
    );
  }

  /* ── Fase ujian berjalan ── */
  const cq = questions[currentIndex];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)' }}>
      {showViolationModal && <ViolationModal count={violationCount} onDismiss={dismissViolationModal}/>}

      {/* Top bar */}
      <header style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--hairline-dark)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--on-primary)"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0z"/></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)' }}>Catalyst CBT</span>
          </div>

          {/* Timer */}
          <div className="font-number" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 18,
            background: isWarn ? 'var(--primary)' : 'var(--surface-elevated)',
            color: isWarn ? 'var(--on-primary)' : 'var(--on-dark)',
            border: `1px solid ${isWarn ? 'var(--primary)' : 'var(--hairline-dark)'}`,
            transition: 'all .3s',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {formatTime(remainingMs)}
          </div>

          <button
            id="submit-exam"
            onClick={handleSubmit}
            disabled={isSubmitting || remainingMs <= 0}
            className="btn-primary"
            style={{ flexShrink: 0, fontSize: 13 }}
          >
            {isSubmitting ? 'Mengumpulkan...' : 'Kumpul Jawaban'}
          </button>
        </div>
        {/* Progress */}
        <div style={{ height: 2, background: 'var(--surface-elevated)' }}>
          <div style={{ height: '100%', background: 'var(--primary)', transition: 'width .3s', width: `${(Object.keys(answers).length / questions.length) * 100}%` }}/>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', gap: 20 }}>
        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="badge-yellow">{cq.kategori}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Soal {currentIndex + 1} dari {questions.length}</span>
            </div>
            <p style={{ color: 'var(--on-dark)', fontSize: 15, lineHeight: 1.6, fontWeight: 500, marginBottom: 24 }}>{cq.teks_soal}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cq.opsi_jawaban.map(opsi => {
                const sel = answers[cq.id] === opsi.huruf;
                return (
                  <button key={opsi.huruf} id={`option-${opsi.huruf}`} onClick={() => saveAnswer(cq.id, opsi.huruf)}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                      borderRadius: 'var(--r-lg)', border: '1px solid', transition: 'all .15s', cursor: 'pointer',
                      background: sel ? 'rgba(252,213,53,.08)' : 'transparent',
                      borderColor: sel ? 'var(--primary)' : 'var(--hairline-dark)',
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.borderColor = 'var(--muted)'; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--hairline-dark)'; } }}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                      background: sel ? 'var(--primary)' : 'var(--surface-elevated)',
                      color: sel ? 'var(--on-primary)' : 'var(--body)',
                    }}>{opsi.huruf}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 3, color: sel ? 'var(--primary)' : 'var(--body)' }}>{opsi.teks}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <button id="prev-question" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
              className="btn-secondary" style={{ opacity: currentIndex === 0 ? .4 : 1 }}>← Sebelumnya</button>
            <button id="next-question" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1}
              className="btn-secondary" style={{ opacity: currentIndex === questions.length - 1 ? .4 : 1 }}>Selanjutnya →</button>
          </div>
        </main>

        <aside className="hidden lg:block" style={{ width: 220, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <QuestionNavGrid questions={questions} answers={answers} currentIndex={currentIndex} onNavigate={setCurrentIndex}/>
            {violationCount > 0 && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'rgba(246,70,93,.08)', border: '1px solid rgba(246,70,93,.2)' }}>
                <p style={{ fontSize: 12, color: 'var(--trading-down)', fontWeight: 500 }}>⚠️ Pelanggaran: {violationCount}x</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
