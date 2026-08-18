import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { judul_tryout: '', durasi_menit: 90, total_soal_dikerjakan: '' };

export default function ExamManager() {
  const navigate = useNavigate();
  const [exams, setExams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // exam.id or null
  const dropdownRef                 = useRef({});

  const fetchExams = () => {
    setLoading(true);
    api.get('/admin/exams')
      .then(res => setExams(res.data))
      .catch(() => toast.error('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchExams(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      judul_tryout: exam.judul_tryout,
      durasi_menit: exam.durasi_menit,
      total_soal_dikerjakan: exam.total_soal_dikerjakan > 0 ? exam.total_soal_dikerjakan : '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        judul_tryout: form.judul_tryout,
        durasi_menit: parseInt(form.durasi_menit),
        total_soal_dikerjakan: form.total_soal_dikerjakan ? parseInt(form.total_soal_dikerjakan) : 0,
      };
      if (editingId) { await api.put(`/admin/exams/${editingId}`, payload); toast.success('Tryout diperbarui.'); }
      else           { await api.post('/admin/exams', payload);             toast.success('Tryout dibuat.'); }
      setShowModal(false); fetchExams();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus tryout "${title}"? Semua soal dan sesi akan ikut terhapus.`)) return;
    try { await api.delete(`/admin/exams/${id}`); toast.success('Dihapus.'); fetchExams(); }
    catch { toast.error('Gagal menghapus.'); }
  };

  const handleToggle = async (exam) => {
    const now = new Date();
    const isActive = new Date(exam.waktu_mulai) <= now && new Date(exam.waktu_selesai) >= now;
    if (!window.confirm(`${isActive ? 'Nonaktifkan' : 'Aktifkan'} tryout "${exam.judul_tryout}"?`)) return;
    try {
      const res = await api.patch(`/admin/exams/${exam.id}/toggle`);
      toast.success(res.data.message);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, ...res.data.exam } : e));
    } catch { toast.error('Gagal mengubah status.'); }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      const open = Object.values(dropdownRef.current).find(el => el && el.contains(e.target));
      if (!open) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const now = new Date();
  const fmtDt = d => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  // Dropdown menu item style
  const menuItemBase = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', transition: 'background .12s, color .12s' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>Manajemen Tryout</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Buat, edit, dan hapus paket ujian.</p>
        </div>
        <button id="create-exam-btn" onClick={openCreate} className="btn-primary" style={{ gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Buat Tryout
        </button>
      </div>

      {/* Table card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
          </div>
        ) : exams.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Belum ada tryout. Buat yang pertama!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hairline-dark)' }}>
                {['Judul Tryout', 'Durasi', 'Distribusi Soal', 'Peserta', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => {
                const isActive = new Date(exam.waktu_mulai) <= now && new Date(exam.waktu_selesai) >= now;
                const totalBank = exam._count?.questions || 0;
                const isDynamic = exam.total_soal_dikerjakan > 0 && exam.total_soal_dikerjakan < totalBank;
                return (
                  <tr key={exam.id} style={{ borderBottom: i < exams.length - 1 ? '1px solid var(--hairline-dark)' : 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--on-dark)' }}>{exam.judul_tryout}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDt(exam.waktu_mulai)} – {fmtDt(exam.waktu_selesai)}</p>
                    </td>
                    <td className="font-number" style={{ padding: '12px 16px', color: 'var(--body)' }}>{exam.durasi_menit} menit</td>
                    <td style={{ padding: '12px 16px' }}>
                      <p className="font-number" style={{ color: 'var(--on-dark)', fontWeight: 600 }}>
                        {exam.total_soal_dikerjakan > 0 ? `${exam.total_soal_dikerjakan} soal dikerjakan` : `${totalBank} soal`}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        Bank Soal: {totalBank} soal {isDynamic ? '(Acak Dinamis)' : ''}
                      </p>
                    </td>
                    <td className="font-number" style={{ padding: '12px 16px', color: 'var(--body)' }}>{exam._count?.sessions || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={isActive ? 'badge-up' : 'badge-yellow'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', position: 'relative' }}>
                      <div ref={el => dropdownRef.current[exam.id] = el} style={{ position: 'relative', display: 'inline-block' }}>
                        {/* Trigger */}
                        <button
                          id={`action-btn-${exam.id}`}
                          onClick={() => setOpenDropdown(openDropdown === exam.id ? null : exam.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline-dark)', background: openDropdown === exam.id ? 'var(--surface-elevated)' : 'transparent', color: 'var(--body)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background .15s, border-color .15s', userSelect: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background = openDropdown === exam.id ? 'var(--surface-elevated)' : 'transparent'}
                        >
                          Aksi
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ transition: 'transform .2s', transform: openDropdown === exam.id ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </button>

                        {/* Dropdown panel */}
                        {openDropdown === exam.id && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 180, background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-lg)', boxShadow: '0 8px 24px rgba(0,0,0,.35)', zIndex: 100, overflow: 'hidden', animation: 'fadeSlideDown .15s ease' }}>
                            {/* Soal */}
                            <button style={{ ...menuItemBase, color: 'var(--info)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); navigate(`/admin/exams/${exam.id}/questions`); }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                              Kelola Bank Soal
                            </button>
                            {/* Monitor */}
                            <button style={{ ...menuItemBase, color: 'var(--trading-up)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); navigate(`/admin/monitor/${exam.id}`); }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                              Monitor
                            </button>
                            {/* Ranking */}
                            <button style={{ ...menuItemBase, color: 'var(--primary)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); navigate(`/admin/exams/${exam.id}/leaderboard`); }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                              Ranking
                            </button>
                            {/* Divider */}
                            <div style={{ height: 1, background: 'var(--hairline-dark)', margin: '4px 0' }}/>
                            {/* Edit */}
                            <button style={{ ...menuItemBase, color: 'var(--muted-strong)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); openEdit(exam); }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              Edit
                            </button>
                            {/* Toggle aktif */}
                            <button id={`toggle-exam-${exam.id}`}
                              style={{ ...menuItemBase, color: isActive ? 'var(--trading-down)' : 'var(--trading-up)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); handleToggle(exam); }}>
                              {isActive
                                ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                                : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                              {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            {/* Divider */}
                            <div style={{ height: 1, background: 'var(--hairline-dark)', margin: '4px 0' }}/>
                            {/* Hapus */}
                            <button style={{ ...menuItemBase, color: 'var(--trading-down)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.12)'; }}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => { setOpenDropdown(null); handleDelete(exam.id, exam.judul_tryout); }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Buat/Edit Tryout ──────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
          <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 460, margin: '0 16px', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 20 }}>
              {editingId ? 'Edit Tryout' : 'Buat Tryout Baru'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Judul Tryout</label>
                <input id="exam-title" type="text" required value={form.judul_tryout}
                  onChange={e => setForm({ ...form, judul_tryout: e.target.value })}
                  placeholder="Contoh: Tryout SKD CPNS Batch 1"
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Durasi (menit)</label>
                <input id="exam-duration" type="number" required min="1" value={form.durasi_menit}
                  onChange={e => setForm({ ...form, durasi_menit: e.target.value })}
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)' }}>Jumlah Soal Dikerjakan (Acak Dinamis)</label>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Opsional</span>
                </div>
                <input id="exam-total-questions" type="number" min="1" value={form.total_soal_dikerjakan}
                  onChange={e => setForm({ ...form, total_soal_dikerjakan: e.target.value })}
                  placeholder="Contoh: 50 (kosongkan jika kerjakan semua bank soal)"
                  className="input-dark" style={{ borderRadius: 'var(--r-md)' }}/>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  Jika diisi (misal: 50), sistem akan memilih 50 soal acak unik per peserta dari total bank soal yang tersedia.
                </p>
              </div>
              {/* Preview */}
              {form.durasi_menit > 0 && (
                <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-lg)', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--body)' }}>
                  ⏱ Ujian dimulai <strong style={{ color: 'var(--primary)' }}>sekarang</strong> dan berakhir pukul{' '}
                  <strong className="font-number" style={{ color: 'var(--primary)' }}>
                    {new Date(Date.now() + parseInt(form.durasi_menit || 0) * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </strong>{' '}
                  ({form.durasi_menit} menit)
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button id="save-exam" type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Tryout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
