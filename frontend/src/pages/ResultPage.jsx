import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function ScoreBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{label}</span>
        <span className="font-number" style={{ fontWeight: 600, color: 'var(--body)' }}>{value} / {max}</span>
      </div>
      <div style={{ height: 4, background: 'var(--surface-elevated)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, transition: 'width .7s', width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/exam/result/${sessionId}`)
      .then(res => setResult(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--surface-elevated)', borderTopColor: 'var(--primary)' }}/>
      </div>
    );
  }

  const skd = result?.total_skor ?? 0;
  const skb = result?.skor_skb ?? 0;
  const niSkd = result?.nilai_integrasi_skd ?? 0;
  const niSkb = result?.nilai_integrasi_skb ?? 0;
  const total = result?.total_nilai_akhir ?? 0;
  const skbOk = skb > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-dark)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--hairline-dark)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--on-primary)"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806z"/></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-dark)' }}>Catalyst CBT</span>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>← Kembali</button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>Hasil Tryout</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{result?.exam?.judul_tryout}</p>
        </div>

        {/* SKD Scores */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 'var(--r-sm)', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>S</span>
            Skor SKD
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { l: 'TWK', v: result?.skor_twk ?? 0, c: 'var(--info)' },
              { l: 'TIU', v: result?.skor_tiu ?? 0, c: 'var(--info)' },
              { l: 'TKP', v: result?.skor_tkp ?? 0, c: 'var(--info)' },
              { l: 'Total', v: skd, c: 'var(--primary)', big: true },
            ].map(({ l, v, c, big }) => (
              <div key={l} style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{l}</p>
                <p className="font-number" style={{ fontSize: big ? 26 : 22, fontWeight: 700, color: c }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ScoreBar label="TWK" value={result?.skor_twk ?? 0} max={150} color="var(--info)"/>
            <ScoreBar label="TIU" value={result?.skor_tiu ?? 0} max={175} color="var(--info)"/>
            <ScoreBar label="TKP" value={result?.skor_tkp ?? 0} max={225} color="var(--info)"/>
            <ScoreBar label="Total" value={skd} max={550} color="var(--primary)"/>
          </div>
        </div>

        {/* Integrasi */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 'var(--r-sm)', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--trading-up)' }}>∑</span>
            Nilai Integrasi SKD + SKB
          </h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Formula: (SKD/550)×40 + (SKB/100)×60</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>NI SKD (40%)</p>
              <p className="font-number" style={{ fontSize: 22, fontWeight: 700, color: 'var(--info)' }}>{niSkd.toFixed(4)}</p>
              <p className="font-number" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>({skd}/550)×40</p>
            </div>
            <div style={{ background: skbOk ? 'rgba(14,203,129,.06)' : 'var(--surface-elevated)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>NI SKB (60%)</p>
              <p className="font-number" style={{ fontSize: 22, fontWeight: 700, color: skbOk ? 'var(--trading-up)' : 'var(--muted)' }}>{niSkb.toFixed(4)}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{skbOk ? `(${skb}/100)×60` : 'Menunggu admin'}</p>
            </div>
            <div style={{ background: 'var(--primary)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--on-primary)', marginBottom: 4, opacity: .7 }}>Nilai Akhir</p>
              <p className="font-number" style={{ fontSize: 26, fontWeight: 700, color: 'var(--on-primary)' }}>{total.toFixed(4)}</p>
              <p style={{ fontSize: 10, color: 'var(--on-primary)', marginTop: 4, opacity: .6 }}>Maks: 100</p>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              <span>Total Nilai Akhir</span>
              <span className="font-number" style={{ fontWeight: 600 }}>{total.toFixed(2)} / 100</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-elevated)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, transition: 'width 1s', width: `${Math.min(total, 100)}%`, background: 'linear-gradient(to right, var(--info), var(--trading-up))' }}/>
            </div>
          </div>

          {!skbOk && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(252,213,53,.06)', border: '1px solid rgba(252,213,53,.2)' }}>
              <p style={{ fontSize: 12, color: 'var(--primary)' }}>⏳ <strong>SKB belum diinput.</strong> Nilai akhir otomatis diperbarui setelah admin input skor SKB.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 14 }}>Ringkasan Ujian</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Pelanggaran</span>
              <span className="font-number" style={{ fontWeight: 600, color: result?.jumlah_pelanggaran > 0 ? 'var(--trading-down)' : 'var(--body)' }}>{result?.jumlah_pelanggaran ?? 0} kali</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Waktu Mulai</span>
              <span style={{ color: 'var(--body)' }}>{result?.waktu_mulai ? new Date(result.waktu_mulai).toLocaleString('id-ID') : '-'}</span>
            </div>
          </div>
        </div>

        <button id="back-to-dashboard" onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%' }}>
          Kembali ke Dashboard
        </button>
      </main>
    </div>
  );
}
