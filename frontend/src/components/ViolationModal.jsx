// ViolationModal — anti-cheat warning overlay
export default function ViolationModal({ count, onDismiss }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)' }}/>

      {/* Modal */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 16px', borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid rgba(246,70,93,.3)' }}>
        {/* Warning stripe */}
        <div style={{ background: 'var(--trading-down)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Peringatan Kecurangan!</h2>
            <p className="font-number" style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 2 }}>Pelanggaran ke-{count} dicatat</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: 'var(--surface-card)', padding: '20px 24px' }}>
          <p style={{ color: 'var(--body)', fontSize: 13, lineHeight: 1.6 }}>
            Sistem mendeteksi Anda meninggalkan halaman ujian. Pelanggaran ini telah dicatat ke dalam log server. Harap kembali fokus pada ujian Anda.
          </p>

          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(246,70,93,.08)', border: '1px solid rgba(246,70,93,.2)' }}>
            <p className="font-number" style={{ fontSize: 12, color: 'var(--trading-down)', fontWeight: 500 }}>
              ⚠️ Total pelanggaran: <strong>{count}</strong>
            </p>
          </div>

          <button id="dismiss-violation-modal" onClick={onDismiss}
            className="btn-primary" style={{ width: '100%', marginTop: 18 }}>
            Saya Mengerti, Kembali ke Ujian
          </button>
        </div>
      </div>
    </div>
  );
}
