import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('catalyst_token', res.data.token);
      localStorage.setItem('catalyst_user', JSON.stringify(res.data.user));
      toast.success('Selamat datang!');
      navigate(['ADMIN', 'TUTOR'].includes(res.data.user.role) ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal.');
    } finally { setLoading(false); }
  };

  return (
    /* canvas-dark background */
    <div className="min-h-screen flex" style={{ background: 'var(--canvas-dark)' }}>

      {/* ── LEFT: Brand hero (dark) ─────────────────────────── */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between px-16 py-12 relative overflow-hidden"
        style={{ background: 'var(--canvas-dark)', borderRight: '1px solid var(--hairline-dark)' }}>

        {/* Subtle yellow glow */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(252,213,53,0.06) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}/>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 flex items-center justify-center rounded-sm"
            style={{ background: 'var(--primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--on-primary)">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            CATALYST CBT
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 style={{
            fontSize: 48, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.5px', color: 'var(--on-dark)', marginBottom: 16
          }}>
            PLATFORM UJIAN<br/>
            <span style={{ color: 'var(--primary)' }}>SIMULASI CPNS</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 380 }}>
            Sistem CBT dengan proktoring digital real-time. Kalkulasi skor SKD & SKB sesuai regulasi BKN.
          </p>

          {/* Stat callouts — stat-callout-card style */}
          <div className="flex gap-10 mt-10">
            {[
              { val: 'SKD + SKB', label: 'Sistem Penilaian' },
              { val: 'Real-time', label: 'Anti-cheat' },
              { val: '100%', label: 'Berbasis Server' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-number font-bold" style={{ fontSize: 22, color: 'var(--primary)', lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 12, color: 'var(--muted)', position: 'relative', zIndex: 10 }}>
          © 2026 PT Karya Edukasi · Catalyst CBT Engine
        </p>
      </div>

      {/* ── RIGHT: Login form (transactional → light surface) ─ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'var(--canvas-dark)' }}>
        <div className="w-full max-w-sm animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: 'var(--primary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--on-primary)">
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <span className="font-bold" style={{ color: 'var(--primary)', fontSize: 15 }}>CATALYST CBT</span>
          </div>

          {/* Form card */}
          <div className="card p-8">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>
              Masuk
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Gunakan akun yang telah terdaftar
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>
                  Email
                </label>
                <input id="email" type="email" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input id="password" type={showPass ? 'text' : 'password'} required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-dark" style={{ borderRadius: 'var(--r-md)', paddingRight: 44 }}/>
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4
                    }}>
                    {showPass
                      ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-1.274 4.057-5.064 7-9 7-3.936 0-7.726-2.943-9-7 1.274-4.057 5.064-7 9-7 3.936 0 7.726 2.943 9 7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button id="login-btn" type="submit" disabled={loading}
                className="btn-primary" style={{ width: '100%', marginBottom: 16 }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 rounded-full animate-spin inline-block" style={{ borderColor: 'var(--on-primary)', borderTopColor: 'transparent' }}/> Memproses...</>
                  : 'Masuk'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div className="divider" style={{ flex: 1 }}/>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>atau</span>
              <div className="divider" style={{ flex: 1 }}/>
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Daftar Sekarang
              </Link>
            </p>
          </div>

          {/* Trust note */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
            🔒 Data aman. Jawaban tersimpan di server terenkripsi.
          </p>
        </div>
      </div>
    </div>
  );
}
