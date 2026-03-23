import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PendingDrivers from './pages/PendingDrivers';
import AllRides from './pages/AllRides';
import Revenue from './pages/Revenue';
import Settlements from './pages/Settlements';
import { parseJwt } from './api';

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
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '250px', background: '#343a40', color: '#fff', padding: '20px' }}>
        <h2 style={{ color: '#fff' }}>SwiftRide Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Revenue Overview</Link>
          <Link to="/drivers/pending" style={{ color: '#fff', textDecoration: 'none' }}>Pending Drivers</Link>
          <Link to="/rides" style={{ color: '#fff', textDecoration: 'none' }}>All Rides</Link>
          <Link to="/settlements" style={{ color: '#fff', textDecoration: 'none' }}>Settlements</Link>
          <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '10px', cursor: 'pointer' }}>Logout</button>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '40px', background: '#f8f9fa' }}>
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
