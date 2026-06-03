import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { judul_tryout: '', durasi_menit: 90 };

export default function ExamManager() {
  const navigate = useNavigate();
  const [exams, setExams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const fetchExams = () => {
    setLoading(true);
    api.get('/admin/exams')
      .then(res => setExams(res.data))
      .catch(() => toast.error('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchExams(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (exam) => { setEditingId(exam.id); setForm({ judul_tryout: exam.judul_tryout, durasi_menit: exam.durasi_menit }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { judul_tryout: form.judul_tryout, durasi_menit: parseInt(form.durasi_menit) };
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

  const now = new Date();
  const fmtDt = d => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  // Action link style
  const aLink = (color = 'var(--muted)') => ({
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color,
    textDecoration: 'none', transition: 'color .15s', padding: '2px 0',
  });

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
                {['Judul Tryout', 'Durasi', 'Soal', 'Peserta', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => {
                const isActive = new Date(exam.waktu_mulai) <= now && new Date(exam.waktu_selesai) >= now;
                return (
                  <tr key={exam.id} style={{ borderBottom: i < exams.length - 1 ? '1px solid var(--hairline-dark)' : 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--on-dark)' }}>{exam.judul_tryout}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDt(exam.waktu_mulai)} – {fmtDt(exam.waktu_selesai)}</p>
                    </td>
                    <td className="font-number" style={{ padding: '12px 16px', color: 'var(--body)' }}>{exam.durasi_menit} menit</td>
                    <td className="font-number" style={{ padding: '12px 16px', color: 'var(--body)' }}>{exam._count?.questions || 0}</td>
                    <td className="font-number" style={{ padding: '12px 16px', color: 'var(--body)' }}>{exam._count?.sessions || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={isActive ? 'badge-up' : 'badge-yellow'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate(`/admin/exams/${exam.id}/questions`)} style={aLink('var(--info)')}>Soal</button>
                        <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                        <button onClick={() => navigate(`/admin/monitor/${exam.id}`)} style={aLink('var(--trading-up)')}>Monitor</button>
                        <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                        <button onClick={() => navigate(`/admin/exams/${exam.id}/leaderboard`)} style={aLink('var(--primary)')}>Ranking</button>
                        <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                        <button onClick={() => openEdit(exam)} style={aLink()}>Edit</button>
                        <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                        <button id={`toggle-exam-${exam.id}`} onClick={() => handleToggle(exam)}
                          style={{ ...aLink(isActive ? 'var(--trading-down)' : 'var(--trading-up)'), fontWeight: 600 }}>
                          {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                        <button onClick={() => handleDelete(exam.id, exam.judul_tryout)} style={aLink('var(--trading-down)')}>Hapus</button>
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
