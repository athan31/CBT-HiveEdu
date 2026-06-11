import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import useExamStore from '../store/examStore';
import ViolationModal from '../components/ViolationModal';
import QuestionNavGrid from '../components/QuestionNavGrid';
import toast from 'react-hot-toast';

function formatTime(ms) {
  if (ms <= 0) return '00:00:00';
  const t = Math.floor(ms / 1000);
  return `${Math.floor(t/3600).toString().padStart(2,'0')}:${Math.floor((t%3600)/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;
}

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const {
    session, questions, currentIndex, answers, remainingMs,
    violationCount, showViolationModal,
    startExam, loadQuestions, saveAnswer, finishExam,
    setCurrentIndex, setRemainingMs, incrementViolation,
    dismissViolationModal, resetExam, isLoading, isSubmitting,
  } = useExamStore();

  useEffect(() => {
    const boot = async () => {
      const r = await startExam(examId);
      if (!r.success) { toast.error(r.error); navigate('/dashboard'); return; }
      await loadQuestions(examId);
    };
    boot();
    return () => resetExam();
  }, [examId]);

  useEffect(() => {
    if (!session?.id) return;
    const socket = io(window.location.origin); socketRef.current = socket;
    socket.on('connect', () => { socket.emit('join_session', { sessionId: session.id }); });
    socket.on('violation_warning', ({ total }) => { incrementViolation(total); });
    const emit = () => { if (socket.connected) socket.emit('tab_violation', { sessionId: session.id }); };
    const onVis = () => { if (document.hidden) emit(); };
    const onBlur = () => { setTimeout(() => { if (document.hidden) emit(); }, 200); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', onBlur); socket.disconnect(); };
  }, [session?.id]);

  useEffect(() => {
    if (!socketRef.current?.connected || !session?.id) return;
    socketRef.current.emit('peserta_question_update', { sessionId: session.id, questionIndex: currentIndex, totalAnswered: Object.keys(answers).length });
  }, [currentIndex, Object.keys(answers).length]);

  useEffect(() => {
    if (remainingMs <= 0 || !session) return;
    timerRef.current = setInterval(() => {
      setRemainingMs(p => { if (p <= 1000) { clearInterval(timerRef.current); handleAutoFinish(); return 0; } return p - 1000; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.id, remainingMs > 0]);

  const handleAutoFinish = useCallback(async () => {
    toast.loading('Waktu habis!');
    const r = await finishExam();
    if (r.success) navigate(`/result/${session.id}`);
  }, [session?.id]);

  const handleSubmit = async () => {
    const a = Object.keys(answers).length, t = questions.length;
    if (a < t && !window.confirm(`Baru ${a}/${t} soal terjawab. Yakin?`)) return;
    const r = await finishExam();
    if (r.success) navigate(`/result/${session?.id}`); else toast.error(r.error);
  };

  const isWarn = remainingMs > 0 && remainingMs < 10 * 60 * 1000;

  if (isLoading || !session || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)', margin: '0 auto 16px' }}/>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Memuat soal ujian...</p>
        </div>
      </div>
    );
  }

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
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 18,
            background: isWarn ? 'var(--primary)' : 'var(--surface-elevated)',
            color: isWarn ? 'var(--on-primary)' : 'var(--on-dark)',
            border: `1px solid ${isWarn ? 'var(--primary)' : 'var(--hairline-dark)'}`,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {formatTime(remainingMs)}
          </div>

          <button id="submit-exam" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary" style={{ flexShrink: 0, fontSize: 13 }}>
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
