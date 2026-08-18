import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import toast from 'react-hot-toast';

const KATEGORIS = ['TWK', 'TIU', 'TKP'];
const HURUF = ['A', 'B', 'C', 'D', 'E'];
const katBadge = { TWK: 'badge-yellow', TIU: 'badge-up', TKP: 'badge-down' };

const emptyForm = () => ({
  kategori: 'TWK',
  teks_soal: '',
  kunci_jawaban: 'A',
  exam_id: '',
  tags: '',
  opsi_jawaban: HURUF.map(h => ({ huruf: h, teks: '', poin: 1 })),
});

// ── Download Template Excel ──────────────────────────────────────────────────
function downloadTemplate() {
  const header = ['Kategori', 'Teks Soal', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Pilihan E', 'Poin A', 'Poin B', 'Poin C', 'Poin D', 'Poin E', 'Kunci Jawaban'];
  const examples = [
    ['TWK', 'Pancasila disahkan pada sidang PPKI tanggal...', '17 Agustus 1945', '18 Agustus 1945', '1 Juni 1945', '22 Juni 1945', '29 Mei 1945', '', '', '', '', '', 'B'],
    ['TIU', 'Semua mahasiswa rajin belajar. Sebagian mahasiswa suka olahraga. Kesimpulannya...', 'Sebagian mahasiswa yang rajin belajar suka olahraga', 'Semua yang suka olahraga rajin belajar', 'Mahasiswa yang tidak suka olahraga tidak rajin', 'Tidak dapat ditarik kesimpulan', 'Semua mahasiswa rajin dan suka olahraga', '', '', '', '', '', 'A'],
    ['TKP', 'Saat terjadi kendala sistem dalam pelayanan publik, sikap Anda adalah...', 'Meminta masyarakat bersabar', 'Melaporkan ke atasan dan mencari solusi darurat manual', 'Menutup loket sementara waktu', 'Mengabaikan karena masalah teknis IT', 'Menyuruh rekan lain menangani', '2', '5', '1', '1', '3', 'B'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([header, ...examples]);
  ws['!cols'] = [12, 45, 25, 25, 25, 25, 25, 8, 8, 8, 8, 8, 12].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BankSoalPusat');
  XLSX.writeFile(wb, 'Template_Bank_Soal_Central.xlsx');
}

// ── Modal Import Excel ───────────────────────────────────────────────────────
function ImportModal({ onClose, onSuccess, exams }) {
  const fileRef = useRef(null);
  const [targetExam, setTargetExam] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (rows.length < 2) { toast.error('Sheet kosong.'); return; }
        const headers = rows[0].map(h => String(h).toLowerCase().trim());
        const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));
        setPreview({ rows: dataRows.slice(0, 15), headers, total: dataRows.length, fileName: file.name });
      } catch { toast.error('Gagal membaca file Excel.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!fileRef.current?.files[0]) return toast.error('Pilih file terlebih dahulu.');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    if (targetExam) fd.append('exam_id', targetExam);

    try {
      const res = await api.post('/admin/bank-soal/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      if (res.data.errors?.length) res.data.errors.forEach(e => toast.error(e, { duration: 6000 }));
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor soal.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
      <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 720, margin: '0 16px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>📥 Import Excel ke Bank Soal Pusat</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Upload file .xlsx untuk memasukkan bank soal secara massal</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Download template */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-lg)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>📥 Download Template Format Excel</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Gunakan template resmi agar format kolom otomatis terbaca oleh sistem</p>
            </div>
            <button onClick={downloadTemplate} className="btn-primary" style={{ fontSize: 12, height: 32, padding: '0 14px' }}>Download</button>
          </div>

          {/* Opsi link langsung ke tryout */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>
              Target Penyimpanan (Opsional)
            </label>
            <select
              value={targetExam}
              onChange={e => setTargetExam(e.target.value)}
              className="input-dark"
              style={{ borderRadius: 'var(--r-md)', height: 38 }}
            >
              <option value="">🏢 Simpan di Bank Soal Pusat (Umum / Standalone)</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>📋 Langsung tautkan ke: {e.judul_tryout}</option>
              ))}
            </select>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) parseFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed', borderRadius: 'var(--r-xl)', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
              borderColor: dragOver ? 'var(--primary)' : 'var(--hairline-dark)',
              background: dragOver ? 'rgba(252,213,53,.05)' : 'transparent',
            }}>
            <p style={{ fontSize: 26, marginBottom: 6 }}>📂</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--body)' }}>Klik atau drag & drop file Excel di sini</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Format .xlsx / .xls, maksimal 10MB</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => parseFile(e.target.files[0])}/>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--body)', marginBottom: 8 }}>
                Preview: <span style={{ color: 'var(--primary)' }}>{preview.fileName}</span> ({preview.total} baris terdeteksi)
              </p>
              <div style={{ overflowX: 'auto', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-lg)' }}>
                <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--hairline-dark)' }}>
                      {preview.headers.map((h, i) => (
                        <th key={i} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: '1px solid var(--hairline-dark)' }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: '6px 10px', color: 'var(--body)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline-dark)', display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
          <button onClick={handleUpload} disabled={uploading || !preview} className="btn-primary" style={{ flex: 1 }}>
            {uploading ? 'Mengimpor...' : `Import ${preview ? preview.total + ' Soal' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Distribusi ke Tryout ───────────────────────────────────────────────
function DistributeModal({ selectedIds, onClose, onSuccess, exams }) {
  const [targetExamId, setTargetExamId] = useState(exams[0]?.id || '');
  const [mode, setMode] = useState(selectedIds.length > 0 ? 'selected' : 'random');
  const [twk, setTwk] = useState(10);
  const [tiu, setTiu] = useState(10);
  const [tkp, setTkp] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetExamId) return toast.error('Pilih tryout tujuan.');
    setSubmitting(true);
    try {
      const payload = { targetExamId };
      if (mode === 'selected') {
        if (selectedIds.length === 0) return toast.error('Belum ada soal yang dipilih.');
        payload.questionIds = selectedIds;
      } else {
        payload.randomSample = { twk: parseInt(twk) || 0, tiu: parseInt(tiu) || 0, tkp: parseInt(tkp) || 0 };
      }

      const res = await api.post('/admin/bank-soal/distribute', payload);
      toast.success(res.data.message);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendistribusikan soal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
      <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 480, margin: '0 16px', padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>
          📤 Salin / Distribusikan Soal ke Tryout
        </h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
          Pilih paket tryout target untuk menerima salinan soal dari Bank Pusat.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>
              Pilih Tryout Tujuan
            </label>
            <select
              value={targetExamId}
              onChange={e => setTargetExamId(e.target.value)}
              className="input-dark"
              style={{ borderRadius: 'var(--r-md)', height: 40 }}
              required
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>📋 {e.judul_tryout} ({e._count?.questions || 0} soal saat ini)</option>
              ))}
            </select>
          </div>

          {/* Mode pemilihan */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 8 }}>
              Metode Distribusi
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setMode('selected')}
                disabled={selectedIds.length === 0}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600,
                  border: '1px solid', cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                  background: mode === 'selected' ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: mode === 'selected' ? 'var(--on-primary)' : 'var(--body)',
                  borderColor: mode === 'selected' ? 'var(--primary)' : 'var(--hairline-dark)',
                  opacity: selectedIds.length === 0 ? 0.5 : 1,
                }}
              >
                ✓ {selectedIds.length} Soal Terpilih
              </button>
              <button
                type="button"
                onClick={() => setMode('random')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer',
                  background: mode === 'random' ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: mode === 'random' ? 'var(--on-primary)' : 'var(--body)',
                  borderColor: mode === 'random' ? 'var(--primary)' : 'var(--hairline-dark)',
                }}
              >
                🎲 Sampling Acak Kategori
              </button>
            </div>
          </div>

          {/* Detail mode random */}
          {mode === 'random' && (
            <div style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: 14, border: '1px solid var(--hairline-dark)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Jumlah Soal per Kategori (Acak dari Bank Pusat):
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-strong)', display: 'block', marginBottom: 4 }}>TWK</label>
                  <input type="number" min="0" value={twk} onChange={e => setTwk(e.target.value)} className="input-dark font-number" style={{ textAlign: 'center', height: 36 }}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-strong)', display: 'block', marginBottom: 4 }}>TIU</label>
                  <input type="number" min="0" value={tiu} onChange={e => setTiu(e.target.value)} className="input-dark font-number" style={{ textAlign: 'center', height: 36 }}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-strong)', display: 'block', marginBottom: 4 }}>TKP</label>
                  <input type="number" min="0" value={tkp} onChange={e => setTkp(e.target.value)} className="input-dark font-number" style={{ textAlign: 'center', height: 36 }}/>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 8 }}>
                Total: {(parseInt(twk) || 0) + (parseInt(tiu) || 0) + (parseInt(tkp) || 0)} soal acak akan disalin.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>
              {submitting ? 'Menyalin...' : 'Salin ke Tryout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Halaman Utama Bank Soal Central ───────────────────────────────────────────
export default function CentralQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [counts, setCounts] = useState({ TWK: 0, TIU: 0, TKP: 0, total: 0, central: 0 });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('ALL');
  const [scope, setScope] = useState('all'); // 'all' | 'central' | 'assigned'

  // Modals & form
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDistribute, setShowDistribute] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  // Selection for bulk distribution
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (kategori !== 'ALL') params.append('kategori', kategori);
    if (scope !== 'all') params.append('scope', scope);

    Promise.allSettled([
      api.get(`/admin/bank-soal?${params.toString()}`),
      api.get('/admin/exams'),
    ])
      .then(([qRes, eRes]) => {
        if (qRes.status === 'fulfilled' && qRes.value?.data) {
          setQuestions(qRes.value.data.questions || []);
          setCounts(qRes.value.data.counts || { TWK: 0, TIU: 0, TKP: 0, total: 0, central: 0 });
        } else {
          console.error('Error fetching bank-soal:', qRes.reason);
          toast.error(qRes.reason?.response?.data?.message || 'Gagal memuat data Bank Soal.');
        }

        if (eRes.status === 'fulfilled' && Array.isArray(eRes.value?.data)) {
          setExams(eRes.value.data);
        }
      })
      .catch((err) => {
        console.error('fetchData error:', err);
        toast.error('Gagal memuat data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [kategori, scope]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowCreate(true);
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({
      kategori: q.kategori,
      teks_soal: q.teks_soal,
      kunci_jawaban: q.kunci_jawaban,
      exam_id: q.exam_id || '',
      tags: q.tags || '',
      opsi_jawaban: q.opsi_jawaban || HURUF.map(h => ({ huruf: h, teks: '', poin: 1 })),
    });
    setShowCreate(true);
  };

  const updateOpsi = (i, field, val) => {
    const u = [...form.opsi_jawaban];
    u[i] = { ...u[i], [field]: val };
    setForm({ ...form, opsi_jawaban: u });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/bank-soal/${editingId}`, form);
        toast.success('Soal berhasil diperbarui.');
      } else {
        await api.post('/admin/bank-soal', form);
        toast.success('Soal berhasil disimpan ke Bank Pusat.');
      }
      setShowCreate(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan soal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, teks) => {
    if (!window.confirm(`Hapus soal "${teks.substring(0, 40)}..." dari Bank Soal?`)) return;
    try {
      await api.delete(`/admin/bank-soal/${id}`);
      toast.success('Soal berhasil dihapus.');
      setSelectedIds(prev => prev.filter(x => x !== id));
      fetchData();
    } catch {
      toast.error('Gagal menghapus soal.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>🏛️ Bank Soal Central</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Pusat penyimpanan & manajemen seluruh butir soal (TWK, TIU, TKP) yang dapat didistribusikan ke berbagai tryout.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button id="btn-distribute-open" onClick={() => setShowDistribute(true)} className="btn-secondary" style={{ gap: 6, fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            Salin ke Tryout {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
          <button id="btn-import-central-open" onClick={() => setShowImport(true)} className="btn-secondary" style={{ gap: 6, fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
            Import Excel
          </button>
          <button id="btn-add-central-question" onClick={openCreate} className="btn-primary" style={{ gap: 6, fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Tambah Soal Baru
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Bank Soal</p>
          <p className="font-number" style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>{counts.total}</p>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TWK</p>
          <p className="font-number" style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>{counts.TWK}</p>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TIU</p>
          <p className="font-number" style={{ fontSize: 24, fontWeight: 700, color: 'var(--trading-up)', marginTop: 4 }}>{counts.TIU}</p>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TKP</p>
          <p className="font-number" style={{ fontSize: 24, fontWeight: 700, color: 'var(--info)', marginTop: 4 }}>{counts.TKP}</p>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pusat (Standalone)</p>
          <p className="font-number" style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-dark)', marginTop: 4 }}>{counts.central}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <input
              id="search-question-input"
              type="text"
              placeholder="Cari teks soal atau kata kunci..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark"
              style={{ borderRadius: 'var(--r-md)', height: 36, fontSize: 13 }}
            />
            <button type="submit" className="btn-secondary" style={{ height: 36, fontSize: 12, padding: '0 16px' }}>
              Cari
            </button>
          </form>

          {/* Kategori Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'TWK', 'TIU', 'TKP'].map(k => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                  background: kategori === k ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: kategori === k ? 'var(--on-primary)' : 'var(--body)',
                  borderColor: kategori === k ? 'var(--primary)' : 'var(--hairline-dark)',
                }}
              >
                {k === 'ALL' ? 'Semua Kategori' : k}
              </button>
            ))}
          </div>

          {/* Scope Select */}
          <select
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="input-dark"
            style={{ borderRadius: 'var(--r-md)', height: 36, fontSize: 12, width: 'auto', minWidth: 180 }}
          >
            <option value="all">🌐 Seluruh Bank Soal</option>
            <option value="central">🏛️ Khusus Bank Pusat (Unassigned)</option>
            <option value="assigned">📋 Khusus Terkait Tryout</option>
          </select>
        </div>
      </div>

      {/* Question Table & Selection Info */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Selection status bar */}
        {selectedIds.length > 0 && (
          <div style={{ background: 'rgba(252,213,53,.1)', borderBottom: '1px solid rgba(252,213,53,.2)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
              ✓ {selectedIds.length} soal dipilih untuk didistribusikan
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDistribute(true)} className="btn-primary" style={{ height: 28, fontSize: 11, padding: '0 12px' }}>
                Salin ke Tryout
              </button>
              <button onClick={() => setSelectedIds([])} className="btn-secondary" style={{ height: 28, fontSize: 11, padding: '0 10px' }}>
                Batal Pilih
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
          </div>
        ) : questions.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-dark)' }}>Belum ada soal pada filter ini.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Klik "Tambah Soal Baru" atau "Import Excel" untuk mengisi Bank Soal Central.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--hairline-dark)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--surface-card)' }}>
              <div style={{ width: 36 }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === questions.length && questions.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div style={{ width: 90 }}>Kategori</div>
              <div style={{ flex: 1, minWidth: 0 }}>Teks Soal & Opsi Jawaban</div>
              <div style={{ width: 140, textAlign: 'left' }}>Lokasi / Tryout</div>
              <div style={{ width: 100, textAlign: 'right' }}>Aksi</div>
            </div>

            {/* List items */}
            {questions.map((q, idx) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', padding: '14px 16px',
                    borderBottom: idx < questions.length - 1 ? '1px solid var(--hairline-dark)' : 'none',
                    background: isSelected ? 'rgba(252,213,53,.04)' : 'transparent',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 36, paddingTop: 2 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(q.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ width: 90 }}>
                    <span className={katBadge[q.kategori] || 'badge-yellow'}>{q.kategori}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-dark)', lineHeight: 1.5, marginBottom: 6 }}>
                      {q.teks_soal}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted)' }}>
                      <span>Kunci: <strong style={{ color: 'var(--primary)' }}>{q.kunci_jawaban}</strong></span>
                      <span>• {q.opsi_jawaban?.length || 0} pilihan</span>
                      {q.tags && <span style={{ background: 'var(--surface-elevated)', padding: '1px 6px', borderRadius: 4 }}>🏷️ {q.tags}</span>}
                    </div>
                  </div>
                  <div style={{ width: 140, fontSize: 12 }}>
                    {q.exam ? (
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>Terkait Tryout:</span>
                        <span style={{ color: 'var(--info)', fontWeight: 500 }}>{q.exam.judul_tryout}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--trading-up)', fontSize: 11, fontWeight: 600 }}>🏛️ Bank Pusat</span>
                    )}
                  </div>
                  <div style={{ width: 100, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => openEdit(q)} className="btn-ghost" style={{ fontSize: 12, padding: '2px 6px', color: 'var(--muted)' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(q.id, q.teks_soal)} className="btn-ghost" style={{ fontSize: 12, padding: '2px 6px', color: 'var(--trading-down)' }}>
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Tambah / Edit Soal Central ─────────────────────────────── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowCreate(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
          <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 640, margin: '0 16px', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 18 }}>
              {editingId ? 'Edit Soal Bank Central' : 'Tambah Soal ke Bank Central'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Kategori & Target Tryout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>Kategori SKD</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {KATEGORIS.map(k => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setForm({ ...form, kategori: k })}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                          background: form.kategori === k ? 'var(--primary)' : 'var(--surface-elevated)',
                          color: form.kategori === k ? 'var(--on-primary)' : 'var(--body)',
                          borderColor: form.kategori === k ? 'var(--primary)' : 'var(--hairline-dark)',
                        }}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>Penyimpanan</label>
                  <select
                    value={form.exam_id}
                    onChange={e => setForm({ ...form, exam_id: e.target.value })}
                    className="input-dark"
                    style={{ borderRadius: 'var(--r-md)', height: 36, fontSize: 12 }}
                  >
                    <option value="">🏛️ Bank Soal Pusat (Umum)</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>📋 {e.judul_tryout}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags / Topik */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>Tag / Sub-Topik (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasionalisme, Silogisme, Pelayanan Publik"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="input-dark"
                  style={{ borderRadius: 'var(--r-md)', height: 36 }}
                />
              </div>

              {/* Teks Soal */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>Teks Pertanyaan Soal</label>
                <textarea
                  required
                  rows={4}
                  value={form.teks_soal}
                  onChange={e => setForm({ ...form, teks_soal: e.target.value })}
                  placeholder="Tuliskan butir soal di sini..."
                  className="input-dark"
                  style={{ height: 'auto', resize: 'none', borderRadius: 'var(--r-md)' }}
                />
              </div>

              {/* Opsi Jawaban */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 8 }}>Pilihan Jawaban (A-E)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.opsi_jawaban.map((opsi, i) => (
                    <div key={opsi.huruf} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                        {opsi.huruf}
                      </span>
                      <input
                        type="text"
                        required
                        value={opsi.teks}
                        onChange={e => updateOpsi(i, 'teks', e.target.value)}
                        placeholder={`Teks opsi ${opsi.huruf}`}
                        className="input-dark"
                        style={{ flex: 1, borderRadius: 'var(--r-md)', height: 36 }}
                      />
                      {form.kategori === 'TKP' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Poin:</span>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={opsi.poin || 1}
                            onChange={e => updateOpsi(i, 'poin', parseInt(e.target.value))}
                            className="input-dark font-number"
                            style={{ width: 52, textAlign: 'center', borderRadius: 'var(--r-md)', height: 36 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kunci Jawaban */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 6 }}>Kunci Jawaban Benar</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {HURUF.map(h => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setForm({ ...form, kunci_jawaban: h })}
                      style={{
                        width: 38, height: 38, borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700, border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                        background: form.kunci_jawaban === h ? 'var(--trading-up)' : 'var(--surface-elevated)',
                        color: form.kunci_jawaban === h ? '#fff' : 'var(--body)',
                        borderColor: form.kunci_jawaban === h ? 'var(--trading-up)' : 'var(--hairline-dark)',
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan ke Bank Pusat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={fetchData}
          exams={exams}
        />
      )}

      {/* Modal Distribusi Soal */}
      {showDistribute && (
        <DistributeModal
          selectedIds={selectedIds}
          onClose={() => setShowDistribute(false)}
          onSuccess={() => { setSelectedIds([]); fetchData(); }}
          exams={exams}
        />
      )}
    </div>
  );
}
