import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Leaderboard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [skbModal, setSkbModal] = useState(null);
  const [skorSkbInput, setSkorSkbInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get(`/admin/leaderboard/${examId}`), api.get(`/admin/exams/${examId}`)])
      .then(([l, e]) => { setData(l.data); setExamTitle(e.data.judul_tryout); })
      .catch(() => toast.error('Gagal memuat.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [examId]);

  const handleInputSkb = async (e) => {
    e.preventDefault();
    if (!skbModal) return;
    const n = parseFloat(skorSkbInput);
    if (isNaN(n) || n < 0 || n > 100) return toast.error('Skor SKB 0–100.');
    setSaving(true);
    try {
      await api.patch(`/exam/skb/${skbModal.sessionId}`, { skor_skb: n });
      toast.success('Disimpan.'); setSkbModal(null); setSkorSkbInput(''); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal.'); }
    finally { setSaving(false); }
  };

  const medalColors = ['var(--primary)', 'var(--muted)', '#CD7F32'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button onClick={() => navigate('/admin/exams')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>Papan Peringkat</h1>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 26, marginBottom: 4 }}>{examTitle}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 26, marginBottom: 20 }}>
        Klik <strong style={{ color: 'var(--primary)' }}>"Input SKB"</strong> untuk menginput skor SKB.
      </p>

      {/* Formula */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--body)' }}>
        <span>📐 <strong style={{ color: 'var(--primary)' }}>Formula:</strong></span>
        <span className="font-number">(SKD / 550) × 40 + (SKB / 100) × 60</span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Belum ada data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hairline-dark)' }}>
                  {['#', 'Peserta', 'TWK', 'TIU', 'TKP', 'SKD', 'SKB', 'NI SKD', 'NI SKB', 'Nilai Akhir', '⚠', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const skbOk = (row.skor_skb ?? 0) > 0;
                  return (
                    <tr key={row.id}
                      style={{ borderBottom: '1px solid var(--hairline-dark)', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="font-number" style={{ padding: '10px 12px', fontSize: 16, fontWeight: 700, color: medalColors[i] || 'var(--muted)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <p style={{ fontWeight: 500, color: 'var(--on-dark)', fontSize: 13 }}>{row.user?.nama_lengkap}</p>
                        <p style={{ fontSize: 11, color: 'var(--muted)' }}>{row.user?.email}</p>
                      </td>
                      <td className="font-number" style={{ padding: '10px 12px', color: 'var(--body)' }}>{row.skor_twk}</td>
                      <td className="font-number" style={{ padding: '10px 12px', color: 'var(--body)' }}>{row.skor_tiu}</td>
                      <td className="font-number" style={{ padding: '10px 12px', color: 'var(--body)' }}>{row.skor_tkp}</td>
                      <td className="font-number" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>{row.total_skor}</td>
                      <td className="font-number" style={{ padding: '10px 12px', color: skbOk ? 'var(--trading-up)' : 'var(--muted)' }}>{skbOk ? row.skor_skb : '—'}</td>
                      <td className="font-number" style={{ padding: '10px 12px', fontSize: 11, color: 'var(--info)' }}>{(row.nilai_integrasi_skd ?? 0).toFixed(4)}</td>
                      <td className="font-number" style={{ padding: '10px 12px', fontSize: 11, color: 'var(--trading-up)' }}>{skbOk ? (row.nilai_integrasi_skb ?? 0).toFixed(4) : '0.0000'}</td>
                      <td className="font-number" style={{ padding: '10px 12px', fontWeight: 700, fontSize: 14, color: 'var(--on-dark)' }}>{(row.total_nilai_akhir ?? 0).toFixed(4)}</td>
                      <td className="font-number" style={{ padding: '10px 12px', color: row.jumlah_pelanggaran > 0 ? 'var(--trading-down)' : 'var(--muted)' }}>{row.jumlah_pelanggaran}x</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => { setSkbModal({ sessionId: row.id, nama: row.user?.nama_lengkap, totalSkor: row.total_skor }); setSkorSkbInput(row.skor_skb || ''); }}
                          className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px', height: 28 }}>
                          {skbOk ? 'Edit SKB' : 'Input SKB'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal SKB */}
      {skbModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setSkbModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
          <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 420, margin: '0 16px', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 4 }}>Input Skor SKB</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Peserta: <strong style={{ color: 'var(--on-dark)' }}>{skbModal.nama}</strong></p>

            <div className="font-number" style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: '10px 14px', marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
              <p style={{ color: 'var(--muted)' }}>SKD: <span style={{ color: 'var(--info)', fontWeight: 600 }}>({skbModal.totalSkor}/550)×40 = {((skbModal.totalSkor / 550) * 40).toFixed(4)}</span></p>
              <p style={{ color: 'var(--muted)' }}>SKB: <span style={{ color: 'var(--trading-up)', fontWeight: 600 }}>({skorSkbInput || '?'}/100)×60 = {skorSkbInput ? (((parseFloat(skorSkbInput) || 0) / 100) * 60).toFixed(4) : '?'}</span></p>
              <div style={{ borderTop: '1px solid var(--hairline-dark)', marginTop: 4, paddingTop: 4 }}>
                <p style={{ color: 'var(--on-dark)', fontWeight: 700 }}>Total = {skorSkbInput ? (((skbModal.totalSkor / 550) * 40) + (((parseFloat(skorSkbInput) || 0) / 100) * 60)).toFixed(4) : '—'}</p>
              </div>
            </div>

            <form onSubmit={handleInputSkb}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Skor SKB <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(0–100)</span></label>
                <input id="skb-input" type="number" min="0" max="100" step="0.01" required autoFocus value={skorSkbInput}
                  onChange={e => setSkorSkbInput(e.target.value)} placeholder="Masukkan skor SKB..."
                  className="input-dark font-number" style={{ borderRadius: 'var(--r-md)' }}/>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setSkbModal(null)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button id="save-skb" type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : 'Simpan & Hitung'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
