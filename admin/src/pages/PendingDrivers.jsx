import { useEffect, useState } from 'react';
import api from '../api';

export default function PendingDrivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/admin/drivers/pending');
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveDriver = async (id) => {
    try {
      await api.post(`/admin/drivers/${id}/approve`);
      setDrivers(drivers.filter(d => d.id !== id));
    } catch (err) {
      alert('Fail: ' + err.message);
    }
  };

  const rejectDriver = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await api.post(`/admin/drivers/${id}/reject`, { reason });
      setDrivers(drivers.filter(d => d.id !== id));
    } catch (err) {
      alert('Fail: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Pending Driver Approvals</h2>
      {drivers.length === 0 ? <p>No pending drivers.</p> : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {drivers.map(d => (
            <div key={d.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <h3>{d.user?.name} ({d.user?.phone})</h3>
              <p>Vehicle: {d.vehicleMake} {d.vehicleModel} - {d.vehicleColor}</p>
              <p>Plate: {d.plateNumber} | Licence: {d.licenceNumber}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => approveDriver(d.id)} style={{ background: 'green', color: 'white', padding: '8px' }}>Approve</button>
                <button onClick={() => rejectDriver(d.id)} style={{ background: 'red', color: 'white', padding: '8px' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
