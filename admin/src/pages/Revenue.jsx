import { useEffect, useState } from 'react';
import api from '../api';

export default function Revenue() {
  const [data, setData] = useState(null);

  useEffect(() => { fetchRevenue(); }, []);

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/admin/revenue');
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px' }}>Revenue</div>
        <div style={{ fontSize: '12px', color: '#A8A29E' }}>{today}</div>
      </div>

      {!data ? (
        <div style={{ color: '#A8A29E', fontSize: '14px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#E7E5E4', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E7E5E4' }}>
          {[
            { label: "Today's Commission", value: `R ${data.todayCommission.toFixed(2)}`, sub: null },
            { label: 'This Week', value: `R ${data.weekCommission.toFixed(2)}`, sub: null },
            { label: 'Cash Pending', value: `R ${data.cashPending.toFixed(2)}`, sub: data.cashWarning ? 'Exceeds R500 limit' : null, warn: data.cashWarning },
            { label: 'Completed Rides', value: data.totalCompletedRides, sub: 'all time' },
          ].map(({ label, value, sub, warn }, i) => (
            <div key={i} style={{ background: '#fff', padding: '16px 18px' }}>
              <div style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: warn ? '#DC2626' : '#1C1917', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
              {sub && <div style={{ fontSize: '11px', color: warn ? '#DC2626' : '#A8A29E', fontWeight: 500, marginTop: '4px' }}>{sub}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
