import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ label, value, sub, loading, up }) => (
  <div className="card" style={{ padding:'20px 24px' }}>
    <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>{label}</p>
    <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
      <span className="font-number" style={{ fontSize:32, fontWeight:700, color:'var(--on-dark)', lineHeight:1 }}>
        {loading ? <span style={{ color:'var(--muted)' }}>—</span> : value}
      </span>
      {sub != null && !loading && (
        <span style={{ fontSize:13, fontWeight:600, color: up ? 'var(--trading-up)' : 'var(--muted)', marginBottom:2 }}>{sub}</span>
      )}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats]       = useState({ exams:0, users:0 });
  const [recentExams, setRecent] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/exams'), api.get('/admin/users')])
      .then(([e, u]) => {
        setRecent(e.data.slice(0, 5));
        setStats({ exams: e.data.length, users: u.data.length });
      }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const activeExams = recentExams.filter(e => new Date(e.waktu_mulai) <= now && new Date(e.waktu_selesai) >= now);
  const user = JSON.parse(localStorage.getItem('catalyst_user') || '{}');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  const fmtDate = d => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });

  const quickLinks = [
    { to:'/admin/exams', label:'Kelola Tryout',   note:'Buat & edit paket ujian',    icon:'📋' },
    { to:'/admin/users', label:'Data Peserta',     note:'Lihat semua pengguna',       icon:'👥' },
    { to:'/admin/exams', label:'Import Soal',      note:'Upload via Excel',           icon:'📊' },
    { to:'/admin/exams', label:'Leaderboard',      note:'Peringkat nilai integrasi',  icon:'🏆' },
  ];

  return (
    <div style={{ maxWidth:960 }}>

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>{greeting},</p>
        <h1 style={{ fontSize:24, fontWeight:700, color:'var(--on-dark)', lineHeight:1.2 }}>{user.nama_lengkap || 'Admin'}</h1>
        <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Ringkasan aktivitas platform hari ini.</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Total Tryout"  value={stats.exams}        loading={loading} />
        <StatCard label="Tryout Aktif"  value={activeExams.length} loading={loading} up={activeExams.length > 0} sub={activeExams.length > 0 ? 'aktif' : null} />
        <StatCard label="Total Peserta" value={stats.users}        loading={loading} />
      </div>

      {/* ── Quick links — cta-band-dark style ───────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
        {quickLinks.map(q => (
          <Link key={q.label} to={q.to} style={{ textDecoration:'none' }}>
            <div style={{
              background:'var(--surface-card)', borderRadius:'var(--r-xl)',
              border:'1px solid var(--hairline-dark)',
              padding:'16px 20px',
              transition:'border-color .15s, background .15s',
              cursor:'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--surface-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--hairline-dark)'; e.currentTarget.style.background='var(--surface-card)'; }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{q.icon}</div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--on-dark)', marginBottom:3 }}>{q.label}</p>
              <p style={{ fontSize:11, color:'var(--muted)' }}>{q.note}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent exams — markets-table-card style ────────── */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{
          padding:'16px 24px', borderBottom:'1px solid var(--hairline-dark)',
          display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'var(--on-dark)' }}>Tryout Terbaru</h2>
          <Link to="/admin/exams" style={{ fontSize:13, color:'var(--primary)', fontWeight:500, textDecoration:'none' }}>
            Lihat semua →
          </Link>
        </div>

        {/* Table header */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 80px 80px 80px 80px',
          padding:'10px 24px', borderBottom:'1px solid var(--hairline-dark)',
          gap:8,
        }}>
          {['Judul Tryout','Soal','Durasi','Dibuat','Status'].map(h => (
            <p key={h} style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</p>
          ))}
        </div>

        {/* Table rows — markets-row style */}
        {loading ? (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor:'var(--surface-elevated)', borderTopColor:'var(--primary)' }}/>
          </div>
        ) : recentExams.length === 0 ? (
          <div style={{ padding:'40px 24px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
            Belum ada tryout.{' '}
            <Link to="/admin/exams" style={{ color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>Buat sekarang →</Link>
          </div>
        ) : recentExams.map((exam, i) => {
          const isActive = new Date(exam.waktu_mulai) <= now && new Date(exam.waktu_selesai) >= now;
          return (
            <div key={exam.id} style={{
              display:'grid', gridTemplateColumns:'1fr 80px 80px 80px 80px',
              padding:'12px 24px', gap:8,
              borderBottom: i < recentExams.length - 1 ? '1px solid var(--hairline-dark)' : 'none',
              transition:'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <p style={{ fontSize:14, fontWeight:500, color:'var(--on-dark)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {exam.judul_tryout}
              </p>
              <p className="font-number" style={{ fontSize:13, color:'var(--body)' }}>{exam._count?.questions ?? 0}</p>
              <p className="font-number" style={{ fontSize:13, color:'var(--body)' }}>{exam.durasi_menit}m</p>
              <p style={{ fontSize:12, color:'var(--muted)' }}>{fmtDate(exam.waktu_mulai)}</p>
              <span className={isActive ? 'badge-up' : 'badge-yellow'} style={{ alignSelf:'center', width:'fit-content' }}>
                {isActive ? 'Aktif' : 'Selesai'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
