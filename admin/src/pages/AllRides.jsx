import { useEffect, useState } from 'react';
import api from '../api';
import { colors, badge } from '../theme';

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
    const b = badge[status] || { bg: colors.gray100, text: colors.gray600 };
    return (
      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: b.bg, color: b.text }}>
        {status}
      </span>
    );
  };

  const PayBadge = ({ method }) => (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: colors.gray100, color: colors.gray600 }}>
      {method}
    </span>
  );

  return (
    <div>
      <div style={{ fontSize: '19px', fontWeight: 700, color: colors.gray900, letterSpacing: '-0.3px', marginBottom: '24px' }}>All Rides</div>

      <div style={{ background: colors.white, borderRadius: '10px', border: `1px solid ${colors.gray200}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${colors.gray100}` }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.gray900 }}>{rides.length} rides</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: statusFilter === f ? 600 : 500, border: statusFilter === f ? `1px solid ${colors.orange100}` : '1px solid transparent', color: statusFilter === f ? colors.orange500 : colors.gray600, background: statusFilter === f ? colors.orange50 : 'transparent', fontFamily: 'inherit', cursor: 'pointer' }}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 70px 80px 85px 90px', padding: '8px 18px', fontSize: '10.5px', fontWeight: 600, color: colors.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', background: colors.warmBg, borderBottom: `1px solid ${colors.gray100}` }}>
          <div>Passenger</div><div>Driver</div><div>Route</div><div>Fare</div><div>Payment</div><div>Status</div><div>Time</div>
        </div>

        {rides.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: colors.gray400, fontSize: '13px' }}>No rides found.</div>
        ) : (
          rides.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 70px 80px 85px 90px', padding: '11px 18px', fontSize: '12.5px', alignItems: 'center', borderBottom: `1px solid ${colors.warmBg}`, color: colors.gray700 }}>
              <div style={{ fontWeight: 600, color: colors.gray900 }}>{r.passenger?.name || r.passenger?.phone}</div>
              <div style={{ color: colors.gray600 }}>{r.driver?.name || <span style={{ color: colors.gray400 }}>—</span>}</div>
              <div style={{ color: colors.gray400, fontSize: '11.5px' }}>{r.pickupAddress} → {r.dropoffAddress}</div>
              <div style={{ fontWeight: 600, color: colors.gray900 }}>R {r.fareAmount?.toFixed(2) || '—'}</div>
              <div><PayBadge method={r.paymentMethod} /></div>
              <div><Badge status={r.status} /></div>
              <div style={{ color: colors.gray400, fontSize: '11px' }}>{new Date(r.requestedAt).toLocaleString('en-ZA')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
