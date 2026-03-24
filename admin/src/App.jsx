import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PendingDrivers from './pages/PendingDrivers';
import AllRides from './pages/AllRides';
import Revenue from './pages/Revenue';
import Settlements from './pages/Settlements';
import { parseJwt } from './api';
import api from './api';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" />;
  const payload = parseJwt(token);
  if (!payload || payload.role !== 'ADMIN') {
    localStorage.removeItem('adminToken');
    return <Navigate to="/login" />;
  }
  return children;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/admin/drivers/pending')
      .then(r => setPendingCount(r.data.length))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItem = (to, label, count) => (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 10px', borderRadius: '7px', fontSize: '12.5px',
        color: isActive ? '#FF6B35' : '#A8A29E',
        background: isActive ? 'rgba(255,107,53,0.15)' : 'transparent',
        fontWeight: isActive ? 600 : 400,
        textDecoration: 'none', marginBottom: '1px',
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.8, flexShrink: 0 }} />
      {label}
      {count > 0 && (
        <span style={{ marginLeft: 'auto', background: 'rgba(255,107,53,0.2)', color: '#FF6B35', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </NavLink>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', background: '#1C1917', padding: '20px 12px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '4px 8px 20px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 24, height: 24, background: '#FF6B35', borderRadius: '6px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FAFAF9', letterSpacing: '-0.2px' }}>SwiftRide</div>
            <div style={{ fontSize: '10px', color: '#78716C' }}>Admin</div>
          </div>
        </div>

        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#57534E', fontWeight: 600, padding: '12px 8px 6px' }}>Overview</div>
        {navItem('/', 'Revenue')}
        {navItem('/rides', 'All Rides')}

        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#57534E', fontWeight: 600, padding: '12px 8px 6px' }}>Drivers</div>
        {navItem('/drivers/pending', 'Pending', pendingCount)}
        {navItem('/settlements', 'Settlements')}

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '7px', fontSize: '12px', color: '#78716C', background: 'none', border: 'none' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#78716C', flexShrink: 0 }} />
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, background: '#F5F5F4', padding: '28px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Revenue /></Layout></PrivateRoute>} />
        <Route path="/drivers/pending" element={<PrivateRoute><Layout><PendingDrivers /></Layout></PrivateRoute>} />
        <Route path="/rides" element={<PrivateRoute><Layout><AllRides /></Layout></PrivateRoute>} />
        <Route path="/settlements" element={<PrivateRoute><Layout><Settlements /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
