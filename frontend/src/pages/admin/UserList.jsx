import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['PESERTA', 'TUTOR'];
const ROLE_BADGE = { ADMIN: 'badge-yellow', TUTOR: 'badge-down', PESERTA: 'badge-up' };

const emptyForm = () => ({ nama_lengkap: '', email: '', password: '', role: 'PESERTA' });

// ── Custom Delete Confirmation Modal (with password verification) ──
function DeleteConfirmModal({ user, onConfirm, onCancel, deleting }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [pwError, setPwError]   = useState('');

  // Reset state whenever the modal opens for a new target
  useEffect(() => {
    if (user) { setPassword(''); setPwError(''); setShowPw(false); }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) { setPwError('Password tidak boleh kosong.'); return; }
    setPwError('');
    onConfirm(password);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={!deleting ? onCancel : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }}/>
      <div className="animate-fade-up" style={{
        position: 'relative', background: 'var(--surface-card)',
        border: '1px solid rgba(246,70,93,.25)',
        borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 440,
        margin: '0 16px', padding: 28,
        boxShadow: '0 24px 64px rgba(0,0,0,.6)',
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--trading-down)" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>
          Konfirmasi Hapus Pengguna
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>
          Anda akan menghapus akun:
        </p>
        <div style={{
          background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)',
          padding: '10px 14px', marginBottom: 12,
          border: '1px solid var(--hairline-dark)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)' }}>{user.nama_lengkap}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--trading-down)', marginBottom: 18, lineHeight: 1.5 }}>
          ⚠️ Semua data sesi ujian peserta ini akan ikut terhapus secara permanen.
        </p>

        {/* Password gate */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>
              🔒 Masukkan password akun Anda untuk konfirmasi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="delete-user-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); if (pwError) setPwError(''); }}
                placeholder="Password Anda..."
                autoFocus
                disabled={deleting}
                className="input-dark"
                style={{ borderRadius: 'var(--r-md)', paddingRight: 40, width: '100%', boxSizing: 'border-box',
                  borderColor: pwError ? 'var(--trading-down)' : undefined }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                {showPw
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                  : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                }
              </button>
            </div>
            {pwError && (
              <p style={{ fontSize: 11, color: 'var(--trading-down)', marginTop: 5 }}>⚠️ {pwError}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onCancel} disabled={deleting}
              className="btn-secondary" style={{ flex: 1 }}>Batal</button>
            <button id="confirm-delete-btn" type="submit" disabled={deleting || !password.trim()}
              style={{
                flex: 1, height: 40, border: 'none', borderRadius: 'var(--r-md)',
                background: (deleting || !password.trim()) ? 'rgba(246,70,93,.4)' : 'var(--trading-down)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: (deleting || !password.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .15s',
              }}>
              {deleting ? (
                <><span style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)',
                  borderTop: '2px solid #fff', borderRadius: '50%',
                  animation: 'spin .7s linear infinite', display: 'inline-block',
                }}/> Memverifikasi...</>
              ) : 'Ya, Hapus'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────

export default function UserList() {
  const currentUser = JSON.parse(localStorage.getItem('catalyst_user') || '{}');
  const isAdmin = currentUser.role === 'ADMIN';

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);   // { id, nama_lengkap, email }
  const [deleting, setDeleting]     = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Gagal memuat peserta.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (u) => { setEditingId(u.id); setForm({ nama_lengkap: u.nama_lengkap, email: u.email, password: '', role: u.role }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const payload = { nama_lengkap: form.nama_lengkap, email: form.email, role: form.role };
        if (form.password.trim()) payload.password = form.password;
        await api.put(`/admin/users/${editingId}`, payload);
        toast.success('Pengguna diperbarui.');
      } else {
        await api.post('/admin/users', form);
        toast.success('Pengguna berhasil dibuat.');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan.');
    } finally { setSaving(false); }
  };

  const openDeleteConfirm = (u) => {
    if (u.id === currentUser.id) return toast.error('Tidak dapat menghapus akun sendiri.');
    setDeleteTarget(u);
  };

  const handleDelete = async (password) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Step 1: verify password
      await api.post('/auth/verify-password', { password });
      // Step 2: perform delete
      await api.delete(`/admin/users/${deleteTarget.id}`);
      toast.success(`Pengguna "${deleteTarget.nama_lengkap}" berhasil dihapus.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus. Coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleStats = {
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    TUTOR: users.filter(u => u.role === 'TUTOR').length,
    PESERTA: users.filter(u => u.role === 'PESERTA').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>Manajemen Pengguna</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {isAdmin ? 'Kelola akun peserta dan tutor.' : 'Daftar semua pengguna (read-only).'}
          </p>
        </div>
        {isAdmin && (
          <button id="create-user-btn" onClick={openCreate} className="btn-primary" style={{ gap: 6 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Tambah Pengguna
          </button>
        )}
      </div>

      {/* Stats + Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge-yellow">Admin: {roleStats.ADMIN}</span>
          <span className="badge-down">Tutor: {roleStats.TUTOR}</span>
          <span className="badge-up">Peserta: {roleStats.PESERTA}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', padding: '2px 8px' }}>Total: {users.length}</span>
        </div>
        <input
          type="text" placeholder="Cari nama, email, atau role..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-dark" style={{ maxWidth: 260, height: 36, fontSize: 12, borderRadius: 'var(--r-md)' }}
        />
      </div>

      {/* Tutor info banner */}
      {!isAdmin && (
        <div style={{
          background: 'rgba(252,213,53,.06)', border: '1px solid rgba(252,213,53,.15)',
          borderRadius: 'var(--r-lg)', padding: '10px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--primary)',
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Anda memiliki akses <strong>read-only</strong>. Hubungi Admin untuk mengelola pengguna.</span>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            {search ? 'Tidak ada hasil yang cocok.' : 'Belum ada pengguna.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hairline-dark)' }}>
                {['#', 'Nama Lengkap', 'Email', 'Role', ...(isAdmin ? ['Aksi'] : [])].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--hairline-dark)' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="font-number" style={{ padding: '10px 16px', color: 'var(--muted)', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: u.role === 'ADMIN' ? 'var(--primary)' : u.role === 'TUTOR' ? 'var(--trading-down)' : 'var(--trading-up)',
                      }}>{u.nama_lengkap?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500, color: 'var(--on-dark)' }}>{u.nama_lengkap}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--body)' }}>{u.email}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className={ROLE_BADGE[u.role] || 'badge-yellow'} style={{ fontSize: 11 }}>{u.role}</span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '10px 16px' }}>
                      {u.id === currentUser.id ? (
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>Anda</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => openEdit(u)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--info)', transition: 'color .15s' }}>
                            Edit
                          </button>
                          <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                          <button id={`delete-user-${u.id}`} onClick={() => openDeleteConfirm(u)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--trading-down)', transition: 'color .15s' }}
                            onMouseEnter={e => e.target.style.opacity = '.7'}
                            onMouseLeave={e => e.target.style.opacity = '1'}>
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Create/Edit ────────────────────────────────── */}
      {/* ── Delete Confirm Modal ────────────────────────────────── */}
      <DeleteConfirmModal
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />

      {showModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
          <div className="animate-fade-up" style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 480, margin: '0 16px', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 4 }}>
              {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              {editingId ? 'Perbarui data pengguna. Kosongkan password jika tidak ingin mengubahnya.' : 'Buat akun peserta atau tutor baru.'}
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Nama */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Nama Lengkap</label>
                <input id="user-name" type="text" required value={form.nama_lengkap}
                  onChange={e => setForm({ ...form, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Email</label>
                <input id="user-email" type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>
                  Password {editingId && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(kosongkan jika tidak diubah)</span>}
                </label>
                <input id="user-password" type="password" {...(!editingId ? { required: true } : {})} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? '••••••••' : 'Min. 6 karakter'}
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 8 }}>Role</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLES.map(r => (
                    <button type="button" key={r} onClick={() => setForm({ ...form, role: r })}
                      style={{
                        padding: '8px 20px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
                        border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                        background: form.role === r ? (r === 'TUTOR' ? 'var(--trading-down)' : 'var(--trading-up)') : 'var(--surface-elevated)',
                        color: form.role === r ? '#fff' : 'var(--body)',
                        borderColor: form.role === r ? (r === 'TUTOR' ? 'var(--trading-down)' : 'var(--trading-up)') : 'var(--hairline-dark)',
                      }}>
                      {r === 'TUTOR' ? '🎓 Tutor' : '👤 Peserta'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  {form.role === 'TUTOR'
                    ? '🎓 Tutor dapat mengelola tryout & soal, tetapi hanya read-only untuk data peserta.'
                    : '👤 Peserta hanya dapat mengerjakan ujian.'}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button id="save-user" type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
