// Base fare: R15.00
// Per km rate: R4.50
// Haversine formula
// Commission rate: 15%
const BASE_FARE = 15.00;
const PER_KM_RATE = 4.50;
const COMMISSION_RATE = 0.15;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function calculateFareAndCommission(distanceKm) {
  const baseFare = process.env.BASE_FARE ? parseFloat(process.env.BASE_FARE) : BASE_FARE;
  const perKmRate = process.env.PER_KM_RATE ? parseFloat(process.env.PER_KM_RATE) : PER_KM_RATE;
  const commissionRate = process.env.COMMISSION_RATE ? parseFloat(process.env.COMMISSION_RATE) : COMMISSION_RATE;
  
  let fare = baseFare + (distanceKm * perKmRate);
  fare = Math.round(fare * 100) / 100;
  
  let commission = fare * commissionRate;
  commission = Math.round(commission * 100) / 100;
  
  let driverEarning = fare - commission;
  driverEarning = Math.round(driverEarning * 100) / 100;
  
  return {
    fareAmount: fare,
    commissionAmt: commission,
    driverEarning: driverEarning
  };
}

module.exports = {
  calculateDistance,
  calculateFareAndCommission
};
