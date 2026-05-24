import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/',               label: 'Dashboard',       icon: '📊' },
  { to: '/activos',        label: 'Activos',          icon: '💻' },
  { to: '/mantenimientos', label: 'Mantenimientos',   icon: '🔧' },
  { to: '/usuarios',       label: 'Usuarios',         icon: '👥' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0f1e33', display: 'flex',
        flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#1d6fa4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🖥️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>SGAT</div>
              <div style={{ color: '#7b93ae', fontSize: 11 }}>Activos Tecnológicos</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', textDecoration: 'none',
                background: isActive ? 'rgba(29,111,164,0.22)' : 'transparent',
                borderLeft: isActive ? '3px solid #1d6fa4' : '3px solid transparent',
                color: isActive ? '#6bb8e8' : '#9fb3c8',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all .15s',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#1d6fa4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 600,
            }}>
              {user?.nombre?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#cdd8e3', fontSize: 13, fontWeight: 500 }}>
                {user?.nombre?.split(' ')[0]}
              </div>
              <div style={{ color: '#5a7a94', fontSize: 11, textTransform: 'capitalize' }}>
                {user?.rol}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', borderRadius: 7,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9fb3c8', cursor: 'pointer', fontSize: 13,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
