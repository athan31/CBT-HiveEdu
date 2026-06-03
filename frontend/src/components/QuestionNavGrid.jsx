// QuestionNavGrid — sticky navigation panel for exam questions
export default function QuestionNavGrid({ questions, answers, currentIndex, onNavigate }) {
  const categories = ['TWK', 'TIU', 'TKP'];

  return (
    <div className="card" style={{ padding: 14 }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Navigasi Soal</h3>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 'var(--r-sm)', background: 'var(--trading-up)' }}/>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Dijawab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 'var(--r-sm)', background: 'var(--surface-elevated)' }}/>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Belum</span>
        </div>
      </div>

      {/* Category groups */}
      {categories.map(cat => {
        const catQ = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.kategori === cat);
        if (catQ.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>{cat}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {catQ.map(q => {
                const answered = !!answers[q.id];
                const current = q.idx === currentIndex;
                let bg = 'var(--surface-elevated)';
                let color = 'var(--body)';
                let border = '1px solid transparent';
                if (current) {
                  bg = 'var(--primary)'; color = 'var(--on-primary)'; border = '1px solid var(--primary)';
                } else if (answered) {
                  bg = 'var(--trading-up)'; color = '#fff';
                }
                return (
                  <button key={q.id} id={`nav-q-${q.idx + 1}`} onClick={() => onNavigate(q.idx)}
                    style={{
                      width: 30, height: 30, borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all .15s',
                      background: bg, color, border,
                    }}
                    onMouseEnter={e => { if (!current && !answered) { e.currentTarget.style.background = 'var(--hairline-dark)'; } }}
                    onMouseLeave={e => { if (!current && !answered) { e.currentTarget.style.background = 'var(--surface-elevated)'; } }}
                  >{q.idx + 1}</button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div style={{ borderTop: '1px solid var(--hairline-dark)', paddingTop: 10, marginTop: 4 }}>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>
          Terjawab: <strong className="font-number" style={{ color: 'var(--trading-up)' }}>{Object.keys(answers).length}</strong>
          {' / '}
          <strong className="font-number">{questions.length}</strong> soal
        </p>
      </div>
    </div>
  );
}
