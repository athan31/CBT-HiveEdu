import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function TimeBar({ mulai, selesai }) {
  const total   = new Date(selesai) - new Date(mulai);
  const elapsed = Date.now() - new Date(mulai);
  const pct     = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const mntLeft = Math.max(0, Math.round((new Date(selesai) - Date.now()) / 60000));
  const hLeft   = Math.floor(mntLeft / 60);
  const mLeft   = mntLeft % 60;
  const timeStr = hLeft > 0 ? `${hLeft}j ${mLeft}m tersisa` : `${mLeft} menit tersisa`;
  const color   = pct > 75 ? 'var(--trading-down)' : pct > 50 ? 'var(--primary)' : 'var(--trading-up)';

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--muted)', marginBottom:6 }}>
        <span style={{ textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Waktu tersisa</span>
        <span className="font-number" style={{ color }}>{timeStr}</span>
      </div>
      <div style={{ height:3, background:'var(--surface-elevated)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${100-pct}%`, background:color, borderRadius:99, transition:'width 1s linear' }}/>
      </div>
    </div>
  );
}

function ExamCard({ exam, onStart }) {
  const fmtEnd = new Date(exam.waktu_selesai)
    .toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Yellow top bar */}
      <div style={{ height:3, background:'var(--primary)' }}/>
      <div style={{ padding:24, flex:1, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'var(--on-dark)', lineHeight:1.3, flex:1 }}>{exam.judul_tryout}</h2>
          <span className="badge-up" style={{ flexShrink:0, whiteSpace:'nowrap' }}>● Aktif</span>
        </div>

        {/* Stats row — markets-row style */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { label:'Durasi', val:`${exam.durasi_menit}m` },
            { label:'Soal',   val:`${exam._count?.questions ?? 0}` },
            { label:'Selesai', val: fmtEnd },
          ].map(s => (
            <div key={s.label} style={{
              background:'var(--surface-elevated)', borderRadius:'var(--r-md)', padding:'10px 12px'
            }}>
              <p style={{ fontSize:10, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{s.label}</p>
              <p className="font-number" style={{ fontSize:13, fontWeight:600, color:'var(--body)' }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Category badges */}
        <div style={{ display:'flex', gap:6 }}>
          {['TWK','TIU','TKP'].map(k => (
            <span key={k} className="badge-yellow" style={{ fontSize:11 }}>{k}</span>
          ))}
        </div>

        {/* Time bar */}
        <TimeBar mulai={exam.waktu_mulai} selesai={exam.waktu_selesai}/>

        {/* CTA */}
        <button id={`start-exam-${exam.id}`} onClick={onStart}
          className="btn-primary" style={{ width:'100%', marginTop:'auto' }}>
          Mulai Tryout
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('catalyst_user') || '{}');
  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exam/active')
      .then(r => setExams(r.data))
      .catch(() => toast.error('Gagal memuat tryout.'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };
  const hour   = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div style={{ minHeight:'100vh', background:'var(--canvas-dark)' }}>

      {/* ══ TOP NAV — top-nav-dark (64px, canvas-dark) ═════════ */}
      <header style={{
        height:64, background:'var(--canvas-dark)',
        borderBottom:'1px solid var(--hairline-dark)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 24px', position:'sticky', top:0, zIndex:20,
      }}>
        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, background:'var(--primary)', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--on-primary)">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0z"/>
            </svg>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--primary)', letterSpacing:'-0.02em' }}>CATALYST CBT</span>
          <span style={{ fontSize:11, color:'var(--muted)', marginLeft:4 }}>Simulasi Ujian CPNS</span>
        </div>

        {/* Right: user + logout */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {/* User pill */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'var(--surface-card)',
            border:'1px solid var(--hairline-dark)',
            borderRadius:'var(--r-lg)', padding:'6px 12px 6px 8px',
          }}>
            <div style={{
              width:24, height:24, borderRadius:'50%', background:'var(--surface-elevated)',
              border:'1px solid var(--hairline-dark)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:700, color:'var(--primary)', flexShrink:0
            }}>{user.nama_lengkap?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize:13, fontWeight:500, color:'var(--body)' }}>{user.nama_lengkap}</span>
            <span className="badge-yellow" style={{ fontSize:10 }}>Peserta</span>
          </div>

          {/* Logout */}
          <button onClick={logout} className="btn-secondary" style={{ height:36, padding:'0 16px', fontSize:13 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight:4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Keluar
          </button>
        </div>
      </header>

      {/* ══ MAIN ═══════════════════════════════════════════════ */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>

        {/* Greeting */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>{greeting},</p>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--on-dark)' }}>{user.nama_lengkap}</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>
            {loading ? 'Memuat daftar tryout...'
              : exams.length > 0 ? `${exams.length} paket tryout tersedia untuk dikerjakan.`
              : 'Tidak ada tryout aktif saat ini.'}
          </p>
        </div>

        {/* Info bar — funds-safu-band style */}
        <div style={{
          background:'var(--surface-card)', border:'1px solid var(--hairline-dark)',
          borderLeft:'3px solid var(--primary)',
          borderRadius:'var(--r-lg)', padding:'12px 16px',
          display:'flex', alignItems:'center', gap:12, marginBottom:28,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p style={{ fontSize:13, color:'var(--body)' }}>
            <strong style={{ color:'var(--on-dark)' }}>Perhatian:</strong> Jawaban tersimpan otomatis setiap kali Anda menjawab.
            Hindari berpindah tab — sistem memantau aktivitas secara real-time.
          </p>
        </div>

        {/* Exam grid */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor:'var(--surface-elevated)', borderTopColor:'var(--primary)' }}/>
          </div>
        ) : exams.length === 0 ? (
          <div className="card" style={{ padding:'60px 24px', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:600, color:'var(--on-dark)', marginBottom:8 }}>Tidak ada tryout aktif</p>
            <p style={{ fontSize:13, color:'var(--muted)' }}>Silakan periksa kembali nanti atau hubungi pengawas.</p>
            <button onClick={() => window.location.reload()} className="btn-secondary"
              style={{ margin:'20px auto 0', display:'flex' }}>
              Refresh
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
            {exams.map(exam => (
              <ExamCard key={exam.id} exam={exam} onStart={() => navigate(`/exam/${exam.id}`)}/>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer — footer-light style on dark (Binance-style inversion) */}
      <footer style={{
        background:'var(--surface-soft)', borderTop:'1px solid var(--hairline-light)',
        padding:'24px', marginTop:40, textAlign:'center'
      }}>
        <p style={{ fontSize:12, color:'var(--muted)' }}>
          © 2026 PT Karya Edukasi · Catalyst CBT Engine · Penilaian SKD & SKB sesuai regulasi BKN
        </p>
      </footer>
    </div>
  );
}
