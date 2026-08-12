import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--canvas-dark)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP APP BAR ─────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'var(--canvas-dark)',
        borderBottom: '1px solid var(--hairline-dark)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--r-sm)',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--on-primary)">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Hanken Grotesk', 'Inter', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            CBT Exam Pro
          </span>
        </div>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--on-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
            Support
          </a>
          <Link to="/register" style={{
            fontSize: 14, fontWeight: 700, color: 'var(--primary)',
            textDecoration: 'none', padding: '6px 16px',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--r-lg)',
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,213,53,.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Register
          </Link>
        </div>
      </header>

      {/* ── MAIN BODY (split screen) ─────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', paddingTop: 64 }}>

        {/* LEFT — Hero / Brand */}
        <section style={{
          width: '50%', minHeight: 'calc(100vh - 64px)',
          background: '#0c0e10',
          padding: '64px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
          className="login-left-panel">

          {/* Decorative glow */}
          <div style={{
            position: 'absolute', top: '-96px', left: '-96px',
            width: 384, height: 384, borderRadius: '50%',
            background: 'rgba(252,213,53,0.05)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 10, maxWidth: 520 }}>
            {/* Verified badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', marginBottom: 24,
              borderRadius: 'var(--r-pill)',
              background: 'rgba(252,213,53,0.08)',
              border: '1px solid rgba(252,213,53,0.2)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Sistem Terverifikasi BKN
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Hanken Grotesk', 'Inter', sans-serif",
              fontSize: 42, fontWeight: 800, lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--on-dark)',
              marginBottom: 20,
            }}>
              PLATFORM UJIAN{' '}
              <span style={{ color: 'var(--primary)' }}>SIMULASI CPNS</span>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
              Sistem CBT dengan proktoring digital real-time. Kalkulasi skor SKD &amp; SKB
              sesuai regulasi BKN terbaru untuk menjamin akurasi kelulusan Anda.
            </p>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  ),
                  title: 'SKD + SKB (Sistem Penilaian)',
                  desc: 'Algoritma penilaian presisi sesuai kisi-kisi resmi.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  ),
                  title: 'Real-time (Anti-cheat)',
                  desc: 'Pemantauan aktivitas peserta secara instan & aman.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
                    </svg>
                  ),
                  title: '100% (Berbasis Server)',
                  desc: 'Infrastruktur cloud yang stabil dengan uptime 99.9%.',
                },
              ].map((f) => (
                <div key={f.title} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--hairline-dark)',
                  background: 'var(--surface-card)',
                  transition: 'border-color .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(252,213,53,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hairline-dark)'}>
                  <div style={{
                    flexShrink: 0, width: 36, height: 36,
                    borderRadius: 'var(--r-lg)',
                    background: 'rgba(252,213,53,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 3 }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT — Login Form */}
        <section style={{
          width: '50%', minHeight: 'calc(100vh - 64px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px',
          background: 'var(--canvas-dark)',
          position: 'relative',
        }}>
          {/* Subtle mesh gradients */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(at 0% 0%, rgba(252,213,53,0.04) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(252,213,53,0.04) 0px, transparent 50%)',
          }} />

          <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }} className="animate-fade-up">
            {/* Mobile brand */}
            <div className="login-mobile-brand" style={{ display: 'none', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--on-primary)">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>CBT Exam Pro</span>
            </div>

            {/* Glass card */}
            <div style={{
              background: 'rgba(30,35,41,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: '40px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: "'Hanken Grotesk', 'Inter', sans-serif",
                  fontSize: 28, fontWeight: 700, color: 'var(--on-dark)',
                  marginBottom: 8, lineHeight: 1.2,
                }}>
                  Masuk
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Gunakan akun yang telah terdaftar untuk memulai ujian.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 8 }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--muted)', pointerEvents: 'none',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="input-dark"
                      style={{ paddingLeft: 40, height: 48, borderRadius: 'var(--r-lg)', fontSize: 14 }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-strong)' }}>
                      Kata Sandi
                    </label>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      Lupa sandi?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--muted)', pointerEvents: 'none',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="input-dark"
                      style={{ paddingLeft: 40, paddingRight: 44, height: 48, borderRadius: 'var(--r-lg)', fontSize: 14 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', padding: 4, transition: 'color .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                    >
                      {showPass ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-1.274 4.057-5.064 7-9 7-3.936 0-7.726-2.943-9-7 1.274-4.057 5.064-7 9-7 3.936 0 7.726 2.943 9 7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', height: 50,
                    background: loading ? 'var(--primary-disabled)' : 'var(--primary)',
                    color: loading ? 'var(--muted)' : 'var(--on-primary)',
                    border: 'none', borderRadius: 'var(--r-lg)',
                    fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background .15s, transform .1s',
                    boxShadow: '0 4px 24px rgba(252,213,53,0.15)',
                    marginBottom: 20,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-active)'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)'; }}
                  onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff', borderRadius: '50%',
                        animation: 'spin .7s linear infinite', display: 'inline-block',
                      }} />
                      Memproses...
                    </>
                  ) : 'Masuk'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>atau</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Register link */}
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                Belum punya akun?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                  Daftar Sekarang
                </Link>
              </p>

              {/* Security footer inside card */}
              <div style={{
                marginTop: 28, paddingTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  Data aman. Jawaban tersimpan di server terenkripsi.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        padding: '16px 24px',
        borderTop: '1px solid var(--hairline-dark)',
        background: '#0c0e10',
      }}>
        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--on-dark)' }}>
          Catalyst CBT Engine
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          © 2026 PT Karya Edukasi · Catalyst CBT Engine. Secure Assessment Environment.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'System Requirements'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.target.style.color = 'var(--on-dark)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
              {l}
            </a>
          ))}
        </div>
      </footer>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-mobile-brand { display: flex !important; }
          section:last-of-type { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
