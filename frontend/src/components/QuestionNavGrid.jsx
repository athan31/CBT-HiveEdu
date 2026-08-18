// QuestionNavGrid — sticky navigation panel for exam questions
export default function QuestionNavGrid({ questions, answers, currentIndex, onNavigate }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Navigasi Soal</h3>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 'var(--r-sm)', background: 'var(--primary)' }}/>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Aktif</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 'var(--r-sm)', background: 'var(--trading-up)' }}/>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Dijawab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 'var(--r-sm)', background: 'var(--surface-elevated)' }}/>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Belum</span>
        </div>
      </div>

      {/* Grid kartu navigasi soal (1 .. N) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        maxHeight: 360,
        overflowY: 'auto',
        paddingRight: 2,
        marginBottom: 14,
      }}>
        {questions.map((q, index) => {
          const answered = !!answers[q.id];
          const current = index === currentIndex;
          let bg = 'var(--surface-elevated)';
          let color = 'var(--body)';
          let border = '1px solid transparent';
          if (current) {
            bg = 'var(--primary)'; color = 'var(--on-primary)'; border = '1px solid var(--primary)';
          } else if (answered) {
            bg = 'var(--trading-up)'; color = '#fff';
          }
          return (
            <button
              key={q.id || index}
              id={`nav-q-${index + 1}`}
              onClick={() => onNavigate(index)}
              style={{
                height: 32,
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all .15s',
                background: bg,
                color,
                border,
              }}
              onMouseEnter={e => { if (!current && !answered) { e.currentTarget.style.background = 'var(--hairline-dark)'; } }}
              onMouseLeave={e => { if (!current && !answered) { e.currentTarget.style.background = 'var(--surface-elevated)'; } }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

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

