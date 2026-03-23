import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { parseJwt } from '../api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/request-otp', { phone, name: 'Admin' });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      alert('Fail: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', { userId, code: otp });
      const { token } = res.data;
      const payload = parseJwt(token);
      if (!payload || payload.role !== 'ADMIN') {
        alert('Access denied: this account does not have admin privileges.');
        return;
      }
      localStorage.setItem('adminToken', token);
      navigate('/');
    } catch (err) {
      alert('Fail: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>SwiftRide Admin</h1>
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="tel"
            placeholder="082 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ padding: '8px', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ padding: '8px', fontSize: '16px', letterSpacing: '4px', textAlign: 'center' }}
          />
          <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Verify OTP</button>
        </form>
      )}
    </div>
  );
}
