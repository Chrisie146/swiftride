import { useEffect, useState } from 'react';
import api from '../api';

export default function AllRides() {
  const [rides, setRides] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRides();
  }, [statusFilter]);

  const fetchRides = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/rides${query}`);
      setRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'orange';
      case 'ACCEPTED': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div>
      <h2>All Rides</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Filter Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="ENROUTE">ENROUTE</option>
          <option value="ARRIVED">ARRIVED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '8px' }}>Passenger</th>
            <th style={{ padding: '8px' }}>Driver</th>
            <th style={{ padding: '8px' }}>Route</th>
            <th style={{ padding: '8px' }}>Fare</th>
            <th style={{ padding: '8px' }}>Payment</th>
            <th style={{ padding: '8px' }}>Status</th>
            <th style={{ padding: '8px' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {rides.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{r.passenger?.name || r.passenger?.phone}</td>
              <td style={{ padding: '8px' }}>{r.driver?.name || '-'}</td>
              <td style={{ padding: '8px' }}>{r.pickupAddress} &rarr; {r.dropoffAddress}</td>
              <td style={{ padding: '8px' }}>R {r.fareAmount?.toFixed(2) || '-'}</td>
              <td style={{ padding: '8px' }}>{r.paymentMethod}</td>
              <td style={{ padding: '8px' }}>
                <span style={{ 
                  background: getStatusColor(r.status), 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {r.status}
                </span>
              </td>
              <td style={{ padding: '8px' }}>{new Date(r.requestedAt).toLocaleString('en-ZA')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
