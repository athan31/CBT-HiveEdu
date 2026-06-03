import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const W_OPEN      = 220;  // lebar sidebar terbuka (px)
const W_COLLAPSED = 56;   // lebar sidebar tertutup — icon only (px)

const NAV = [
  {
    to: '/admin', label: 'Dashboard', exact: true,
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  },
  {
    to: '/admin/exams', label: 'Manajemen Tryout',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  },
  {
    to: '/admin/users', label: 'Data Peserta',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem('catalyst_user') || '{}');

  const [expanded, setExpanded] = useState(true);  // desktop sidebar state
  const [drawer, setDrawer]     = useState(false);  // mobile drawer state

  useEffect(() => { if (!['ADMIN', 'TUTOR'].includes(user.role)) navigate('/dashboard'); }, []);

  const logout   = () => { localStorage.clear(); navigate('/login'); };
  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);
  const curLabel = NAV.find(n => isActive(n.to, n.exact))?.label || 'Dashboard';

  // Responsive: on small screens sidebar is always a drawer (don't use expanded state)
  const sidebarW = expanded ? W_OPEN : W_COLLAPSED;

  // ── Reusable nav link renderer ───────────────────────────
  const NavLink = ({ item, collapsed, onClick }) => {
    const act = isActive(item.to, item.exact);
    return (
      <Link
        to={item.to}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 10,
          padding: collapsed ? '10px 0' : '9px 12px',
          borderRadius: 'var(--r-md)',
          fontSize: 13,
          fontWeight: act ? 600 : 400,
          color: act ? 'var(--on-dark)' : 'var(--muted)',
          background: act ? 'var(--surface-elevated)' : 'transparent',
          textDecoration: 'none',
          transition: 'background .15s, color .15s',
          borderLeft: act ? '2px solid var(--primary)' : '2px solid transparent',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!act) { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--body)'; }}}
        onMouseLeave={e => { if (!act) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
      >
        <span style={{ color: act ? 'var(--primary)' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
        {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
      </Link>
    );
  };

  return (
    // Outer wrapper — simple flex row, full viewport
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--canvas-dark)' }}>

      {/* ══════════════════════════════════════════════════════
          DESKTOP SIDEBAR — inline in flex flow (NOT fixed/absolute)
          Width animates via CSS transition → content shifts automatically
      ══════════════════════════════════════════════════════ */}
      <aside
        style={{
          width: sidebarW,
          minWidth: sidebarW,        /* prevent flex from shrinking it */
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          flexShrink: 0,
          background: 'var(--canvas-dark)',
          borderRight: '1px solid var(--hairline-dark)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)',
          zIndex: 10,
        }}
        // Hide on mobile (we use the drawer instead)
        className="hidden lg:flex"
      >
        {/* ── Brand + toggle button ─────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          height: 56, flexShrink: 0, padding: expanded ? '0 10px 0 16px' : '0',
          borderBottom: '1px solid var(--hairline-dark)',
          overflow: 'hidden',
          transition: 'padding .22s',
        }}>
          {expanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
              <div style={{ width: 26, height: 26, background: 'var(--primary)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--on-primary)">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0z"/>
                </svg>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>CATALYST CBT</p>
                <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{user.role === 'TUTOR' ? 'Tutor Panel' : 'Admin Panel'}</p>
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            id="sidebar-toggle"
            onClick={() => setExpanded(v => !v)}
            title={expanded ? 'Tutup sidebar' : 'Buka sidebar'}
            style={{
              width: 32, height: 32, flexShrink: 0,
              borderRadius: 'var(--r-md)',
              background: 'transparent',
              border: '1px solid var(--hairline-dark)',
              cursor: 'pointer', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--on-dark)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            {expanded
              ? /* chevron-left */
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              : /* chevron-right */
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            }
          </button>
        </div>

        {/* Section label */}
        {expanded
          ? <div style={{ padding: '14px 20px 6px' }}><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Menu</p></div>
          : <div style={{ height: 12 }}/>
        }

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => <NavLink key={item.to} item={item} collapsed={!expanded}/>)}
        </nav>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--hairline-dark)', margin: '4px 8px' }}/>

        {/* User + logout */}
        <div style={{ padding: expanded ? '10px 12px 14px' : '10px 4px 14px' }}>
          {expanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                {user.nama_lengkap?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nama_lengkap}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>{user.role === 'TUTOR' ? 'Tutor' : 'Administrator'}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                {user.nama_lengkap?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          )}
          <button onClick={logout} title="Keluar"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-start' : 'center',
              gap: expanded ? 8 : 0, padding: '7px 8px', borderRadius: 'var(--r-md)',
              background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,70,93,.1)'; e.currentTarget.style.color = 'var(--trading-down)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            {expanded && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER (fixed, z-50)
      ══════════════════════════════════════════════════════ */}
      <>
        {drawer && (
          <div onClick={() => setDrawer(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.7)' }}
            className="lg:hidden"
          />
        )}
        <aside className="lg:hidden" style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 60,
          width: W_OPEN,
          background: 'var(--canvas-dark)',
          borderRight: '1px solid var(--hairline-dark)',
          display: 'flex', flexDirection: 'column',
          transform: drawer ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .22s cubic-bezier(.4,0,.2,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, padding: '0 16px', borderBottom: '1px solid var(--hairline-dark)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, background: 'var(--primary)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--on-primary)"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0z"/></svg>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>CATALYST CBT</p>
            </div>
            <button onClick={() => setDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ padding: '14px 20px 6px' }}><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Menu</p></div>
          <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map(item => <NavLink key={item.to} item={item} collapsed={false} onClick={() => setDrawer(false)}/>)}
          </nav>
          <div style={{ borderTop: '1px solid var(--hairline-dark)', margin: '4px 8px' }}/>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{user.nama_lengkap?.[0]?.toUpperCase() || 'A'}</div>
              <div><p style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-dark)' }}>{user.nama_lengkap}</p><p style={{ fontSize: 10, color: 'var(--muted)' }}>{user.role === 'TUTOR' ? 'Tutor' : 'Administrator'}</p></div>
            </div>
            <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Keluar
            </button>
          </div>
        </aside>
      </>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT — flex: 1, auto fills remaining space
          Desktop: expands/contracts as sidebar animates
          Mobile: full width
      ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, overflow: 'auto' }}>

        {/* Top bar — desktop */}
        <header style={{
          height: 56, background: 'var(--canvas-dark)',
          borderBottom: '1px solid var(--hairline-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
        }}>
          {/* Mobile: hamburger button */}
          <button
            onClick={() => setDrawer(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, marginRight: 8 }}
            className="lg:hidden"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Admin</span>
            <span style={{ color: 'var(--muted)' }}>/</span>
            <span style={{ color: 'var(--body)', fontWeight: 600 }}>{curLabel}</span>
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
              {user.nama_lengkap?.[0]?.toUpperCase() || 'A'}
            </div>
            <span style={{ fontSize: 13, color: 'var(--body)' }} className="hidden sm:inline">{user.nama_lengkap}</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowX: 'hidden' }}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
