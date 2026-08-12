import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Format milliseconds ke HH:MM:SS */
function fmtMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}j ${m.toString().padStart(2,'0')}m ${sec.toString().padStart(2,'0')}d`;
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

const RULES = [
  { icon: '🔒', text: 'Jangan berpindah tab atau meminimize jendela — pelanggaran tercatat otomatis' },
  { icon: '💾', text: 'Jawaban tersimpan otomatis setiap kali Anda memilih opsi' },
  { icon: '⏱️', text: 'Waktu terus berjalan sejak Anda menekan "Mulai" — tidak dapat dijeda' },
  { icon: '⚠️', text: 'Saat waktu habis, jawaban langsung dikumpulkan secara otomatis' },
];

export default function ReadyModal({ examInfo, onStart, isStarting }) {
  const navigate = useNavigate();
  const [msLeft, setMsLeft] = useState(
    Math.max(0, new Date(examInfo.waktu_selesai) - Date.now())
  );

  /* Countdown waktu sisa ujian di modal */
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, new Date(examInfo.waktu_selesai) - Date.now());
      setMsLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [examInfo.waktu_selesai]);

  const selesaiStr = new Date(examInfo.waktu_selesai).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    /* Backdrop */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn .25s ease',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 500,
        background: 'var(--surface-card)',
        border: '1px solid var(--hairline-dark)',
        borderRadius: 'var(--r-xl, 16px)',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
      }}>

        {/* Top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--primary), #f59e0b)' }} />

        {/* Header */}
        <div style={{ padding: '28px 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--r-md)',
              background: 'rgba(252,213,53,.12)', border: '1px solid rgba(252,213,53,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                Konfirmasi Memulai Ujian
              </p>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-dark)', lineHeight: 1.3 }}>
                {examInfo.judul_tryout}
              </h2>
            </div>
          </div>

          {/* Exam stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Durasi', val: `${examInfo.durasi_menit} menit` },
              { label: 'Jumlah Soal', val: `${examInfo.jumlah_soal} soal` },
              { label: 'Kategori', val: 'TWK · TIU · TKP' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface-elevated)', borderRadius: 'var(--r-md)',
                padding: '10px 12px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</p>
                <p className="font-number" style={{ fontSize: 12, fontWeight: 700, color: 'var(--body)' }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Time remaining badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(252,213,53,.06)', border: '1px solid rgba(252,213,53,.15)',
            borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Ujian berakhir: <span style={{ color: 'var(--body)', fontWeight: 500 }}>{selesaiStr}</span></span>
            </div>
            <span className="font-number" style={{
              fontSize: 13, fontWeight: 700,
              color: msLeft < 5 * 60 * 1000 ? 'var(--trading-down)' : 'var(--primary)',
            }}>
              {fmtMs(msLeft)} tersisa
            </span>
          </div>

          {/* Rules */}
          <div style={{
            background: 'var(--surface-elevated)', borderRadius: 'var(--r-md)',
            padding: '14px 16px', marginBottom: 24,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Aturan Ujian
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RULES.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--body)', lineHeight: 1.5 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              id="ready-back-btn"
              onClick={() => navigate('/dashboard')}
              disabled={isStarting}
              className="btn-secondary"
              style={{ flex: 1, height: 44, fontSize: 14 }}
            >
              Kembali
            </button>
            <button
              id="ready-start-btn"
              onClick={onStart}
              disabled={isStarting || msLeft <= 0}
              className="btn-primary"
              style={{ flex: 2, height: 44, fontSize: 14, fontWeight: 700, position: 'relative', overflow: 'hidden' }}
            >
              {isStarting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,.2)', borderTopColor: 'rgba(0,0,0,.7)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                  Mempersiapkan...
                </span>
              ) : msLeft <= 0 ? 'Waktu Telah Habis' : '✓ Saya Siap, Mulai!'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
