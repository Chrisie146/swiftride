import { useEffect, useState } from 'react';
import api from '../api';

export default function Revenue() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/admin/revenue');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Revenue Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3>Today's Commission</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R {data.todayCommission.toFixed(2)}</p>
        </div>
        
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3>This Week's Commission</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R {data.weekCommission.toFixed(2)}</p>
        </div>
        
        <div style={{ padding: '20px', background: data.cashPending > 0 ? '#ffeeba' : '#d4edda', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: data.cashWarning ? 'red' : 'inherit' }}>Cash Pending Collection</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: data.cashWarning ? 'red' : 'inherit' }}>
            R {data.cashPending.toFixed(2)}
          </p>
          {data.cashWarning && <small style={{ color: 'red', fontWeight: 'bold' }}>Exceeds R500 Limit!</small>}
        </div>

        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3>Total Completed Rides</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.totalCompletedRides}</p>
        </div>
      </div>
    </div>
  );
}
