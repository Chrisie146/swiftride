import { useEffect, useState } from 'react';
import api from '../api';
import { badge } from '../theme';

const FILTERS = ['', 'COMPLETED', 'REQUESTED', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'CANCELLED'];
const FILTER_LABELS = { '': 'All', COMPLETED: 'Completed', REQUESTED: 'Requested', ACCEPTED: 'Accepted', ENROUTE: 'En Route', ARRIVED: 'Arrived', CANCELLED: 'Cancelled' };

export default function AllRides() {
  const [rides, setRides] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchRides(); }, [statusFilter]);

  const fetchRides = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/rides${query}`);
      setRides(res.data);
    } catch (err) { console.error(err); }
  };

  const Badge = ({ status }) => {
    const b = badge[status] || { bg: '#F5F5F4', text: '#57534E' };
    return (
      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: b.bg, color: b.text }}>
        {status}
      </span>
    );
  };

  const PayBadge = ({ method }) => (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: '#F5F5F4', color: '#57534E' }}>
      {method}
    </span>
  );

  return (
    <div>
      <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px', marginBottom: '24px' }}>All Rides</div>

      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E7E5E4', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #F5F5F4' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{rides.length} rides</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: statusFilter === f ? 600 : 500, border: statusFilter === f ? '1px solid #FED7C3' : '1px solid transparent', color: statusFilter === f ? '#FF6B35' : '#78716C', background: statusFilter === f ? '#FFF0EB' : 'transparent', fontFamily: 'inherit', cursor: 'pointer' }}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 70px 80px 85px 90px', padding: '8px 18px', fontSize: '10.5px', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4' }}>
          <div>Passenger</div><div>Driver</div><div>Route</div><div>Fare</div><div>Payment</div><div>Status</div><div>Time</div>
        </div>

        {rides.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A29E', fontSize: '13px' }}>No rides found.</div>
        ) : (
          rides.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 70px 80px 85px 90px', padding: '11px 18px', fontSize: '12.5px', alignItems: 'center', borderBottom: '1px solid #FAFAF9', color: '#44403C' }}>
              <div style={{ fontWeight: 600, color: '#1C1917' }}>{r.passenger?.name || r.passenger?.phone}</div>
              <div style={{ color: '#78716C' }}>{r.driver?.name || <span style={{ color: '#A8A29E' }}>—</span>}</div>
              <div style={{ color: '#A8A29E', fontSize: '11.5px' }}>{r.pickupAddress} → {r.dropoffAddress}</div>
              <div style={{ fontWeight: 600, color: '#1C1917' }}>R {r.fareAmount?.toFixed(2) || '—'}</div>
              <div><PayBadge method={r.paymentMethod} /></div>
              <div><Badge status={r.status} /></div>
              <div style={{ color: '#A8A29E', fontSize: '11px' }}>{new Date(r.requestedAt).toLocaleString('en-ZA')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
