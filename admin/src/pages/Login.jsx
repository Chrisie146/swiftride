import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { parseJwt } from '../api';

const inputStyle = (focused) => ({
  width: '100%', background: focused ? '#fff' : '#FAFAF9',
  border: `1.5px solid ${focused ? '#FF6B35' : '#E7E5E4'}`,
  borderRadius: '9px', padding: '12px 14px', fontSize: '15px',
  fontWeight: 500, color: '#1C1917', outline: 'none',
  boxShadow: focused ? '0 0 0 3px rgba(255,107,53,0.08)' : 'none',
  marginBottom: '20px', fontFamily: 'inherit',
});

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/request-otp', { phone, name: 'Admin' });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
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
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '380px', background: '#fff', borderRadius: '16px', padding: '40px 36px', border: '1px solid #E7E5E4', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '32px', background: '#FF6B35', borderRadius: '9px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', letterSpacing: '-0.3px' }}>SwiftRide</div>
            <div style={{ fontSize: '11px', color: '#A8A29E' }}>Admin Panel</div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.4px', marginBottom: '4px' }}>Sign in</div>
            <div style={{ fontSize: '13px', color: '#A8A29E', marginBottom: '28px' }}>Enter your registered number to receive an OTP.</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>Mobile number</div>
            <input
              type="tel" placeholder="082 123 4567" value={phone}
              onChange={e => setPhone(e.target.value)} required
              onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
              style={inputStyle(focusedField === 'phone')}
            />
            <button type="submit" style={{ width: '100%', background: '#FF6B35', border: 'none', borderRadius: '9px', padding: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
              Send OTP
            </button>
            <div style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center', marginTop: '16px' }}>Only registered admin accounts can sign in.</div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.4px', marginBottom: '4px' }}>Verify code</div>
            <div style={{ fontSize: '13px', color: '#A8A29E', marginBottom: '28px' }}>6-digit code sent to <strong style={{ color: '#57534E' }}>{phone}</strong></div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>One-time code</div>
            <input
              type="text" placeholder="______" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value)} required
              onFocus={() => setFocusedField('otp')} onBlur={() => setFocusedField(null)}
              style={{ ...inputStyle(focusedField === 'otp'), fontSize: '22px', letterSpacing: '6px', fontWeight: 700, textAlign: 'center' }}
            />
            <button type="submit" style={{ width: '100%', background: '#FF6B35', border: 'none', borderRadius: '9px', padding: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
              Verify & Sign in
            </button>
            <div style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center', marginTop: '16px' }}>
              Didn't receive it?{' '}
              <span style={{ color: '#FF6B35', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setStep(1); setOtp(''); }}>Resend</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
