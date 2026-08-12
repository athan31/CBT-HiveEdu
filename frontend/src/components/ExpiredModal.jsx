import { useNavigate } from 'react-router-dom';

export default function ExpiredModal({ examInfo }) {
  const navigate = useNavigate();

  const selesaiStr = examInfo?.waktu_selesai
    ? new Date(examInfo.waktu_selesai).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.80)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn .25s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--surface-card)',
        border: '1px solid rgba(246,70,93,.3)',
        borderRadius: 'var(--r-xl, 16px)',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
        textAlign: 'center',
      }}>
        {/* Red top bar */}
        <div style={{ height: 4, background: 'var(--trading-down, #f6465d)' }} />

        <div style={{ padding: '36px 32px' }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--trading-down, #f6465d)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 10 }}>
            Waktu Ujian Telah Berakhir
          </h2>

          {examInfo?.judul_tryout && (
            <p style={{ fontSize: 14, color: 'var(--body)', marginBottom: 6, fontWeight: 500 }}>
              {examInfo.judul_tryout}
            </p>
          )}

          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
            Sesi ujian ini telah ditutup pada <strong style={{ color: 'var(--body)' }}>{selesaiStr}</strong>.<br/>
            Anda tidak dapat lagi memasuki ruang ujian atau mengirimkan jawaban.
          </p>

          {/* Info box */}
          <div style={{
            background: 'rgba(246,70,93,.06)', border: '1px solid rgba(246,70,93,.15)',
            borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24,
          }}>
            <p style={{ fontSize: 12, color: 'var(--trading-down)', fontWeight: 500 }}>
              ⚠️ Hubungi pengawas ujian jika Anda merasa ini adalah kesalahan.
            </p>
          </div>

          <button
            id="expired-back-btn"
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
            style={{ width: '100%', height: 44, fontSize: 14, fontWeight: 700 }}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
