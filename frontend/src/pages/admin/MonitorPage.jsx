import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import toast from 'react-hot-toast';

const getToken = () => localStorage.getItem('catalyst_token');

function getSeatStyle(s) {
  if (!s) return { bg:'var(--surface-elevated)', bdr:'var(--hairline-dark)', dot:'var(--muted)', txt:'Kosong' };
  if (s.status==='SUBMITTED') return { bg:'rgba(14,203,129,.08)', bdr:'rgba(14,203,129,.3)', dot:'var(--trading-up)', txt:'Selesai' };
  if (!s.connected) return { bg:'rgba(246,70,93,.08)', bdr:'rgba(246,70,93,.3)', dot:'var(--trading-down)', txt:'Terputus' };
  if (s.jumlah_pelanggaran>=3) return { bg:'rgba(252,213,53,.08)', bdr:'rgba(252,213,53,.3)', dot:'var(--primary)', txt:'Aktif ⚠' };
  return { bg:'rgba(59,130,246,.08)', bdr:'rgba(59,130,246,.3)', dot:'var(--info)', txt:'Aktif' };
}

function SeatCard({ session:se, deviceNo, totalQuestions, onClick }) {
  const st = getSeatStyle(se);
  const pct = totalQuestions>0 ? Math.round(((se?.totalAnswered??0)/totalQuestions)*100) : 0;
  return (
    <button onClick={()=>se&&onClick(se)} style={{ position:'relative', borderRadius:'var(--r-lg)', border:`1px solid ${st.bdr}`, background:st.bg, padding:12, textAlign:'left', transition:'all .15s', cursor:se?'pointer':'default', width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:9, fontWeight:700, color:'var(--muted)', letterSpacing:'0.1em' }}>DEVICE {deviceNo}</span>
        <span style={{ width:7, height:7, borderRadius:'50%', background:st.dot }}/>
      </div>
      {se ? (<>
        <p style={{ fontSize:12, fontWeight:600, color:'var(--on-dark)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{se.nama}</p>
        <p style={{ fontSize:10, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:8 }}>{se.email}</p>
        <div style={{ height:3, background:'var(--surface-elevated)', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
          <div style={{ height:'100%', width:`${pct}%`, background:st.dot, borderRadius:99, transition:'width .5s' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:10 }}>
          <span style={{ color:'var(--muted)' }}>{se.status==='SUBMITTED'?`SKD: ${se.total_skor}`:`${se.totalAnswered??0}/${totalQuestions}`}</span>
          {se.jumlah_pelanggaran>0 && <span className="font-number" style={{ background:'var(--trading-down)', color:'#fff', borderRadius:99, padding:'1px 6px', fontWeight:700, fontSize:10 }}>{se.jumlah_pelanggaran}⚠</span>}
        </div>
        <p style={{ fontSize:10, fontWeight:500, marginTop:4, color:st.dot }}>{st.txt}</p>
      </>) : <p style={{ fontSize:10, color:'var(--muted)', marginTop:16 }}>Belum ada peserta</p>}
    </button>
  );
}

function SessionDetailModal({ session:se, onClose }) {
  if (!se) return null;
  const st = getSeatStyle(se);
  const R = (l,v,c) => (<div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0' }}><span style={{ color:'var(--muted)' }}>{l}</span><span className="font-number" style={{ fontWeight:600, color:c||'var(--body)' }}>{v}</span></div>);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)' }}/>
      <div className="animate-fade-up" style={{ position:'relative', background:'var(--surface-card)', border:'1px solid var(--hairline-dark)', borderRadius:'var(--r-xl)', width:'100%', maxWidth:400, margin:'0 16px', padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:10, height:10, borderRadius:'50%', background:st.dot }}/><h2 style={{ fontSize:15, fontWeight:700, color:'var(--on-dark)' }}>{se.nama}</h2></div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)' }}>✕</button>
        </div>
        <p style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>{se.email}</p>
        <div style={{ borderTop:'1px solid var(--hairline-dark)', borderBottom:'1px solid var(--hairline-dark)', padding:'4px 0', marginBottom:12 }}>
          {R('Status',st.txt,st.dot)}
          {R('Pelanggaran',`${se.jumlah_pelanggaran}x`,se.jumlah_pelanggaran>0?'var(--trading-down)':'var(--trading-up)')}
          {R('Dijawab',se.totalAnswered)}
          {se.status!=='SUBMITTED'&&R('Di Soal',`No. ${(se.questionIndex??0)+1}`)}
          {R('Koneksi',se.connected?'🟢 Online':'🔴 Offline',se.connected?'var(--trading-up)':'var(--trading-down)')}
        </div>
        {se.status==='SUBMITTED' && (
          <div style={{ background:'var(--surface-elevated)', borderRadius:'var(--r-lg)', padding:14 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--primary)', marginBottom:8 }}>Hasil Ujian</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
              {[{l:'TWK',v:se.skor_twk},{l:'TIU',v:se.skor_tiu},{l:'TKP',v:se.skor_tkp}].map(x=>(
                <div key={x.l} style={{ background:'var(--surface-card)', borderRadius:'var(--r-md)', padding:8, textAlign:'center' }}>
                  <p style={{ fontSize:9, color:'var(--muted)' }}>{x.l}</p>
                  <p className="font-number" style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>{x.v}</p>
                </div>
              ))}
            </div>
            {R('Total SKD',se.total_skor,'var(--primary)')}
            {R('Nilai Akhir',(se.total_nilai_akhir??0).toFixed(4),'var(--on-dark)')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonitorPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const [exam,setExam]=useState(null); const [sessions,setSessions]=useState({}); const [totalQ,setTotalQ]=useState(0);
  const [sel,setSel]=useState(null); const [vFeed,setVFeed]=useState([]); const [loading,setLoading]=useState(true);
  const sockRef=useRef(null);

  const fetchInit = useCallback(async()=>{
    try{const[e,s,q]=await Promise.all([api.get(`/admin/exams/${examId}`),api.get(`/admin/sessions/${examId}`),api.get(`/admin/exams/${examId}/questions`)]);
    setExam(e.data);setTotalQ(q.data.length);const m={};s.data.forEach(x=>{m[x.sessionId]={...x,connected:false}});setSessions(m);}catch{toast.error('Gagal memuat.');}finally{setLoading(false);}
  },[examId]);

  const handleToggle=async()=>{try{const r=await api.patch(`/admin/exams/${examId}/toggle`);setExam(p=>({...p,...r.data.exam}));toast.success(r.data.message);}catch{toast.error('Gagal.');}};

  useEffect(()=>{fetchInit();
    const sk=io('http://localhost:5000',{auth:{token}});sockRef.current=sk;
    sk.on('connect',()=>sk.emit('admin_join_monitoring',{examId}));
    sk.on('monitoring_snapshot',({sessions:ss})=>{setSessions(p=>{const n={...p};ss.forEach(s=>{n[s.sessionId]={...(n[s.sessionId]||{}),...s}});return n;});});
    sk.on('session_live_update',d=>{setSessions(p=>({...p,[d.sessionId]:{...(p[d.sessionId]||{}),...d}}));});
    sk.on('violation_live_update',d=>{
      setSessions(p=>{if(!p[d.sessionId])return p;return{...p,[d.sessionId]:{...p[d.sessionId],jumlah_pelanggaran:d.jumlah_pelanggaran}};});
      setVFeed(p=>[{...d,id:Date.now()},...p].slice(0,20));
      setSel(p=>p?.sessionId===d.sessionId?{...p,jumlah_pelanggaran:d.jumlah_pelanggaran}:p);
      toast.error(`⚠️ ${d.nama} (${d.jumlah_pelanggaran}x)`,{duration:4000});
    });
    return()=>sk.disconnect();
  },[examId]);

  const list=Object.values(sessions);
  const oCnt=list.filter(s=>s.status==='ONGOING').length;
  const sCnt=list.filter(s=>s.status==='SUBMITTED').length;
  const vCnt=list.reduce((a,s)=>a+(s.jumlah_pelanggaran||0),0);
  const cCnt=list.filter(s=>s.connected&&s.status==='ONGOING').length;
  const now=new Date();
  const isAct=exam?now>=new Date(exam.waktu_mulai)&&now<=new Date(exam.waktu_selesai):false;
  const DC=Math.max(list.length,12);
  const devs=Array.from({length:DC},(_,i)=>({dn:i+1,se:list[i]||null}));
  const stats=[{l:'Sedang Ujian',v:oCnt,c:'var(--info)'},{l:'Online',v:cCnt,c:'var(--trading-up)'},{l:'Selesai',v:sCnt,c:'var(--muted-strong)'},{l:'Pelanggaran',v:vCnt,c:'var(--trading-down)'}];

  return (
    <div style={{ minHeight:'100vh', background:'var(--canvas-dark)' }}>
      <header style={{ background:'var(--canvas-dark)', borderBottom:'1px solid var(--hairline-dark)', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={()=>navigate('/admin/exams')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:13 }}>← Kembali</button>
            <div><h1 style={{ fontSize:14, fontWeight:700, color:'var(--on-dark)' }}>🖥 Monitor Ujian</h1><p style={{ fontSize:12, color:'var(--muted)' }}>{exam?.judul_tryout||'...'}</p></div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className={isAct?'badge-up':'badge-yellow'}>{isAct?'● AKTIF':'● NONAKTIF'}</span>
            <button id="btn-toggle-tryout" onClick={handleToggle} style={{ fontSize:12, padding:'6px 14px', borderRadius:'var(--r-md)', fontWeight:600, border:'none', cursor:'pointer', background:isAct?'var(--trading-down)':'var(--trading-up)', color:'#fff' }}>{isAct?'Nonaktifkan':'Aktifkan'}</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'20px 24px', display:'flex', gap:20 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {stats.map(x=>(<div key={x.l} className="card" style={{ padding:'14px 16px', textAlign:'center' }}><p className="font-number" style={{ fontSize:24, fontWeight:700, color:x.c, lineHeight:1, marginBottom:4 }}>{x.v}</p><p style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>{x.l}</p></div>))}
          </div>
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontSize:14, fontWeight:600, color:'var(--on-dark)' }}>Peta Kursi Peserta</h2>
              <div style={{ display:'flex', gap:12, fontSize:10, color:'var(--muted)' }}>
                {[{c:'var(--info)',l:'Aktif'},{c:'var(--primary)',l:'Warning'},{c:'var(--trading-down)',l:'Putus'},{c:'var(--trading-up)',l:'Selesai'}].map(x=>(<span key={x.l} style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:7, height:7, borderRadius:'50%', background:x.c }}/>{x.l}</span>))}
              </div>
            </div>
            <div style={{ width:'100%', background:'var(--surface-elevated)', textAlign:'center', padding:'6px 0', borderRadius:'var(--r-md)', fontSize:11, fontWeight:600, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:16 }}>PAPAN / PENGAWAS</div>
            {loading?(<div style={{ padding:'40px 0', display:'flex', justifyContent:'center' }}><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor:'var(--surface-elevated)', borderTopColor:'var(--primary)' }}/></div>):(
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>{devs.map(({dn,se})=>(<SeatCard key={dn} deviceNo={dn} session={se} totalQuestions={totalQ} onClick={setSel}/>))}</div>
            )}
          </div>
        </div>
        <div style={{ width:260, flexShrink:0 }}>
          <div className="card" style={{ padding:16, position:'sticky', top:80 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><span style={{ width:7, height:7, borderRadius:'50%', background:'var(--trading-down)' }} className="animate-pulse-yellow"/><h3 style={{ fontSize:13, fontWeight:600, color:'var(--on-dark)' }}>Live Pelanggaran</h3></div>
            {vFeed.length===0?(<div style={{ textAlign:'center', padding:'28px 0' }}><p style={{ fontSize:24, marginBottom:8 }}>🛡️</p><p style={{ fontSize:11, color:'var(--muted)' }}>Aman.</p></div>):(
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:'60vh', overflowY:'auto' }}>
                {vFeed.map(v=>(<div key={v.id} style={{ background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:'var(--r-md)', padding:'8px 10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}><p style={{ fontSize:11, fontWeight:600, color:'var(--trading-down)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.nama}</p><span className="font-number" style={{ fontSize:10, background:'var(--trading-down)', color:'#fff', borderRadius:99, padding:'0 5px', fontWeight:700 }}>{v.jumlah_pelanggaran}x</span></div>
                  <p style={{ fontSize:10, color:'var(--muted)' }}>{new Date(v.timestamp).toLocaleTimeString('id-ID')}</p>
                </div>))}
              </div>
            )}
            <button onClick={()=>navigate(`/admin/exams/${examId}/leaderboard`)} className="btn-secondary" style={{ width:'100%', marginTop:12, fontSize:12 }}>Leaderboard →</button>
          </div>
        </div>
      </div>
      {sel&&<SessionDetailModal session={sel} onClose={()=>setSel(null)}/>}
    </div>
  );
}
