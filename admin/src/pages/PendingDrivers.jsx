import { useEffect, useState } from 'react';
import api from '../api';

function DriverCard({ driver, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const handleConfirmReject = async () => {
    if (!reason.trim()) return;
    await onReject(driver.id, reason);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '18px', border: '1px solid #E7E5E4' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>{driver.user?.name}</div>
      <div style={{ fontSize: '11.5px', color: '#A8A29E', marginBottom: '14px' }}>{driver.user?.phone}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {[
          ['Licence', driver.licenceNumber],
          ['Plate', driver.plateNumber],
          ['Vehicle', `${driver.vehicleMake} ${driver.vehicleModel}`],
          ['Colour', `${driver.vehicleColor}`],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '10px', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 500, marginBottom: '1px' }}>{label}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: '14px' }}>
        {rejecting ? (
          <>
            <textarea
              rows={2}
              placeholder="Reason for rejection..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', background: '#FAFAF9', border: '1.5px solid #E7E5E4', borderRadius: '9px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', marginBottom: '10px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleConfirmReject} style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', padding: '9px', fontSize: '12px', fontWeight: 600, color: '#DC2626', fontFamily: 'inherit' }}>
                Confirm Reject
              </button>
              <span onClick={() => { setRejecting(false); setReason(''); }} style={{ fontSize: '12px', color: '#A8A29E', cursor: 'pointer', paddingLeft: '4px' }}>Cancel</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onApprove(driver.id)} style={{ flex: 1, background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
              Approve
            </button>
            <button onClick={() => setRejecting(true)} style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', padding: '9px', fontSize: '12px', fontWeight: 600, color: '#DC2626', fontFamily: 'inherit' }}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PendingDrivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/admin/drivers/pending');
      setDrivers(res.data);
    } catch (err) { console.error(err); }
  };

  const approveDriver = async (id) => {
    try {
      await api.post(`/admin/drivers/${id}/approve`);
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const rejectDriver = async (id, reason) => {
    try {
      await api.post(`/admin/drivers/${id}/reject`, { reason });
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px' }}>Pending Drivers</div>
        <div style={{ fontSize: '12px', color: '#A8A29E' }}>{drivers.length} application{drivers.length !== 1 ? 's' : ''}</div>
      </div>
      {drivers.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '40px', textAlign: 'center', border: '1px solid #E7E5E4', color: '#A8A29E', fontSize: '14px' }}>
          No pending applications.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {drivers.map(d => <DriverCard key={d.id} driver={d} onApprove={approveDriver} onReject={rejectDriver} />)}
        </div>
      )}
    </div>
  );
}
