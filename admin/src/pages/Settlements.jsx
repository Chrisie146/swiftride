import { useEffect, useState } from 'react';
import api from '../api';

export default function Settlements() {
  const [data, setData] = useState([]);

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/admin/settlements').catch(() => ({ data: [] }));
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const markSettled = async (driverId) => {
    try {
      await api.post(`/admin/commission/${driverId}/settle`);
      setData(prev => prev.filter(d => d.driverId !== driverId));
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div>
      <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px', marginBottom: '24px' }}>Settlements</div>
      {data.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '40px', textAlign: 'center', border: '1px solid #E7E5E4', color: '#A8A29E', fontSize: '14px' }}>
          No drivers owe cash commission currently.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map(d => (
            <div key={d.driverId} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>{d.driverName}</div>
                <div style={{ fontSize: '12px', color: '#A8A29E', marginBottom: '8px' }}>{d.driverPhone}</div>
                <div style={{ fontSize: '12px', color: '#57534E' }}>{d.unsettledRidesCount} unsettled ride{d.unsettledRidesCount !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#DC2626', letterSpacing: '-0.4px', marginBottom: '10px' }}>
                  R {d.totalOwed.toFixed(2)}
                </div>
                <button
                  onClick={() => markSettled(d.driverId)}
                  style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  Mark Settled
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
