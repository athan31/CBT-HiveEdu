import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama_lengkap:'', email:'', password:'', konfirmasi:'' });
  const [loading, setLoading] = useState(false);
  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi) return toast.error('Password tidak cocok.');
    if (form.password.length < 6) return toast.error('Password minimal 6 karakter.');
    setLoading(true);
    try {
      await api.post('/auth/register', { nama_lengkap: form.nama_lengkap, email: form.email, password: form.password });
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal.');
    } finally { setLoading(false); }
  };

  const fields = [
    { id:'reg-nama',    field:'nama_lengkap', label:'Nama Lengkap',      type:'text',     ph:'Nama sesuai KTP' },
    { id:'reg-email',   field:'email',        label:'Email',             type:'email',    ph:'nama@email.com' },
    { id:'reg-pass',    field:'password',     label:'Password',          type:'password', ph:'Minimal 6 karakter' },
    { id:'reg-confirm', field:'konfirmasi',   label:'Konfirmasi Password', type:'password', ph:'Ulangi password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--canvas-dark)' }}>
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: 'var(--primary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--on-primary)">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0z"/>
            </svg>
          </div>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>CATALYST CBT</span>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>Daftar Akun</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Buat akun peserta baru</p>

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--muted-strong)', marginBottom:6 }}>
                  {f.label}
                </label>
                <input id={f.id} type={f.type} required
                  value={form[f.field]} onChange={set(f.field)} placeholder={f.ph}
                  className="input-dark" style={{ borderRadius:'var(--r-md)' }}/>
                {f.field === 'konfirmasi' && form.konfirmasi && (
                  <p style={{ fontSize: 11, marginTop: 4,
                    color: form.password === form.konfirmasi ? 'var(--trading-up)' : 'var(--trading-down)' }}>
                    {form.password === form.konfirmasi ? '✓ Password cocok' : '✗ Password tidak cocok'}
                  </p>
                )}
              </div>
            ))}

            <button id="reg-submit" type="submit" disabled={loading}
              className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
              {loading
                ? <><span className="w-4 h-4 border-2 rounded-full animate-spin inline-block"
                    style={{ borderColor:'var(--on-primary)', borderTopColor:'transparent' }}/> Mendaftar...</>
                : 'Buat Akun'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:20 }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Masuk</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--muted)', marginTop:16 }}>
          © 2026 PT Karya Edukasi · Catalyst CBT Engine
        </p>
      </div>
    </div>
  );
}
