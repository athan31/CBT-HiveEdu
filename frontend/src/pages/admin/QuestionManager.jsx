import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import toast from 'react-hot-toast';

const KATEGORIS = ['TWK', 'TIU', 'TKP'];
const HURUF = ['A', 'B', 'C', 'D', 'E'];
const katBadge = { TWK: 'badge-yellow', TIU: 'badge-up', TKP: 'badge-down' };

const emptyForm = () => ({
  kategori: 'TWK', teks_soal: '', kunci_jawaban: 'A',
  opsi_jawaban: HURUF.map(h => ({ huruf: h, teks: '', poin: 1 })),
});

// ── Download template Excel ─────────────────────────────────────────────
function downloadTemplate() {
  const header = ['Kategori','Teks Soal','Pilihan A','Pilihan B','Pilihan C','Pilihan D','Pilihan E','Poin A','Poin B','Poin C','Poin D','Poin E','Kunci Jawaban'];
  const examples = [
    ['TWK','Pancasila terdiri dari berapa sila?','Lima sila','Empat sila','Enam sila','Tiga sila','Dua sila','','','','','','A'],
    ['TIU','Jika 2x + 4 = 10, maka x adalah...','2','3','4','5','6','','','','','','B'],
    ['TKP','Saat rekan kerja membuat kesalahan, Anda...','Menegur langsung','Melaporkan ke atasan','Membiarkan saja','Membantu memperbaiki','Mendiskusikan bersama','1','2','3','5','4','D'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([header, ...examples]);
  ws['!cols'] = [12,40,25,25,25,25,25,8,8,8,8,8,10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Soal');
  XLSX.writeFile(wb, 'Template_Import_Soal.xlsx');
}

// ── Modal Import Excel ───────────────────────────────────────────────────
function ImportModal({ examId, onClose, onSuccess }) {
  const fileRef = useRef(null);
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
        setPreview({ rows: dataRows.slice(0, 20), headers, total: dataRows.length, fileName: file.name });
      } catch { toast.error('Gagal membaca file Excel.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) parseFile(file); };

  const handleUpload = async () => {
    if (!fileRef.current?.files[0]) return toast.error('Pilih file terlebih dahulu.');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    try {
      const res = await api.post(`/admin/exams/${examId}/questions/import`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      if (res.data.errors?.length) res.data.errors.forEach(e => toast.error(e, { duration: 6000 }));
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor soal.');
      if (err.response?.data?.errors) err.response.data.errors.slice(0, 5).forEach(e => toast.error(e, { duration: 6000 }));
    } finally { setUploading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
      <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 720, margin: '0 16px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>📊 Import Soal dari Excel</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Upload file .xlsx dengan kolom sesuai template</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Download template */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-lg)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>📥 Download Template Excel</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Kolom: Kategori | Teks Soal | Pilihan A–E | Poin A–E (TKP) | Kunci Jawaban</p>
            </div>
            <button onClick={downloadTemplate} className="btn-primary" style={{ fontSize: 12, height: 32, padding: '0 14px' }}>Download</button>
          </div>

          {/* Format info */}
          <div style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: '12px 16px', fontSize: 12, color: 'var(--body)' }}>
            <p style={{ fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 8 }}>📋 Format Kolom:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
              <span>• <strong>Kategori</strong> — TWK / TIU / TKP</span>
              <span>• <strong>Pilihan A–D</strong> — wajib diisi</span>
              <span>• <strong>Teks Soal</strong> — teks pertanyaan</span>
              <span>• <strong>Pilihan E</strong> — opsional</span>
              <span>• <strong>Kunci Jawaban</strong> — A / B / C / D / E</span>
              <span>• <strong>Poin A–E</strong> — hanya untuk TKP (1–5)</span>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed', borderRadius: 'var(--r-xl)', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
              borderColor: dragOver ? 'var(--primary)' : 'var(--hairline-dark)',
              background: dragOver ? 'rgba(252,213,53,.05)' : 'transparent',
            }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>📂</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--body)' }}>Klik atau drag & drop file Excel di sini</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>.xlsx atau .xls, maks. 10MB</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => parseFile(e.target.files[0])}/>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--body)' }}>
                  Preview: <span style={{ color: 'var(--primary)' }}>{preview.fileName}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>({preview.total} baris)</span>
                </p>
                {preview.total > 20 && <span style={{ fontSize: 11, color: 'var(--primary)' }}>20 baris pertama</span>}
              </div>
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
                          <td key={ci} style={{ padding: '6px 10px', color: 'var(--body)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline-dark)', display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
          <button id="btn-import-excel" onClick={handleUpload} disabled={uploading || !preview}
            className="btn-primary" style={{ flex: 1 }}>
            {uploading ? 'Mengimpor...' : `Import ${preview ? preview.total + ' Soal' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama ───────────────────────────────────────────────────────
export default function QuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get(`/admin/exams/${examId}/questions`), api.get(`/admin/exams/${examId}`)])
      .then(([qRes, eRes]) => { setQuestions(qRes.data); setExamTitle(eRes.data.judul_tryout); })
      .catch(() => toast.error('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [examId]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (q) => { setEditingId(q.id); setForm({ kategori: q.kategori, teks_soal: q.teks_soal, kunci_jawaban: q.kunci_jawaban, opsi_jawaban: q.opsi_jawaban }); setShowModal(true); };
  const updateOpsi = (i, field, val) => { const u = [...form.opsi_jawaban]; u[i] = { ...u[i], [field]: val }; setForm({ ...form, opsi_jawaban: u }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) { await api.put(`/admin/exams/${examId}/questions/${editingId}`, form); toast.success('Soal diperbarui.'); }
      else           { await api.post(`/admin/exams/${examId}/questions`, form); toast.success('Soal ditambahkan.'); }
      setShowModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan soal.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus soal ini?')) return;
    try { await api.delete(`/admin/exams/${examId}/questions/${id}`); toast.success('Dihapus.'); fetchData(); }
    catch { toast.error('Gagal menghapus.'); }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button onClick={() => navigate('/admin/exams')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', transition: 'color .15s' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>Bank Soal</h1>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, marginLeft: 26 }}>{examTitle}</p>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {KATEGORIS.map(k => (
            <span key={k} className={katBadge[k]}>{k}: {questions.filter(q => q.kategori === k).length}</span>
          ))}
          <span className="badge-yellow">Total: {questions.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button id="btn-import-excel-open" onClick={() => setShowImport(true)} className="btn-secondary" style={{ fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
            Import Excel
          </button>
          <button id="add-question-btn" onClick={openCreate} className="btn-primary" style={{ fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Tambah Soal
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
          </div>
        ) : questions.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--body)' }}>Belum ada soal.</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Klik "Tambah Soal" atau "Import Excel" untuk mulai.</p>
          </div>
        ) : questions.map((q, idx) => (
          <div key={q.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className="font-number" style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>No. {idx + 1}</span>
                  <span className={katBadge[q.kategori]}>{q.kategori}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Kunci: <strong style={{ color: 'var(--primary)' }}>{q.kunci_jawaban}</strong></span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>• {q.opsi_jawaban?.length} pilihan</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.teks_soal}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => openEdit(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--muted)', transition: 'color .15s' }}>Edit</button>
                <span style={{ color: 'var(--hairline-dark)' }}>|</span>
                <button onClick={() => handleDelete(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--trading-down)', transition: 'color .15s' }}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal Tambah/Edit Soal ───────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}/>
          <div style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--hairline-dark)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 600, margin: '0 16px', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 20 }}>{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Kategori */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 8 }}>Kategori</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {KATEGORIS.map(k => (
                    <button type="button" key={k} onClick={() => setForm({ ...form, kategori: k })}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                        background: form.kategori === k ? 'var(--primary)' : 'var(--surface-elevated)',
                        color: form.kategori === k ? 'var(--on-primary)' : 'var(--body)',
                        borderColor: form.kategori === k ? 'var(--primary)' : 'var(--hairline-dark)',
                      }}>{k}</button>
                  ))}
                </div>
              </div>
              {/* Teks Soal */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 6 }}>Teks Soal</label>
                <textarea id="question-text" required rows={4} value={form.teks_soal}
                  onChange={e => setForm({ ...form, teks_soal: e.target.value })} placeholder="Tulis soal di sini..."
                  className="input-dark" style={{ height: 'auto', resize: 'none', borderRadius: 'var(--r-md)' }}/>
              </div>
              {/* Pilihan */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 8 }}>Pilihan Jawaban</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.opsi_jawaban.map((opsi, i) => (
                    <div key={opsi.huruf} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{opsi.huruf}</span>
                      <input type="text" required value={opsi.teks} onChange={e => updateOpsi(i, 'teks', e.target.value)}
                        placeholder={`Teks opsi ${opsi.huruf}`} className="input-dark" style={{ flex: 1, borderRadius: 'var(--r-md)' }}/>
                      {form.kategori === 'TKP' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Poin:</span>
                          <input type="number" min={1} max={5} value={opsi.poin || 1} onChange={e => updateOpsi(i, 'poin', parseInt(e.target.value))}
                            className="input-dark font-number" style={{ width: 56, textAlign: 'center', borderRadius: 'var(--r-md)' }}/>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Kunci */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-strong)', marginBottom: 8 }}>Kunci Jawaban</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {HURUF.map(h => (
                    <button type="button" key={h} onClick={() => setForm({ ...form, kunci_jawaban: h })}
                      style={{
                        width: 40, height: 40, borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700, border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                        background: form.kunci_jawaban === h ? 'var(--trading-up)' : 'var(--surface-elevated)',
                        color: form.kunci_jawaban === h ? '#fff' : 'var(--body)',
                        borderColor: form.kunci_jawaban === h ? 'var(--trading-up)' : 'var(--hairline-dark)',
                      }}>{h}</button>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button id="save-question" type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImport && <ImportModal examId={examId} onClose={() => setShowImport(false)} onSuccess={fetchData}/>}
    </div>
  );
}
