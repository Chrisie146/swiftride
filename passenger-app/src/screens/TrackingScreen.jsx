import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import api from '../api';

const STATUS_STEPS = ['REQUESTED', 'ACCEPTED', 'ENROUTE', 'ARRIVED'];
const STATUS_LABELS = {
  REQUESTED: 'Finding your driver...',
  ACCEPTED: 'Driver is on the way!',
  ENROUTE: 'Driver is heading to your pickup',
  ARRIVED: 'Your driver has arrived!',
  COMPLETED: 'Ride completed! 🎉',
  CANCELLED: 'Ride was cancelled',
};

export default function TrackingScreen({ route, navigation }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchRide();
    intervalRef.current = setInterval(fetchRide, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchRide = async () => {
    try {
      const res = await api.get(`/rides/${rideId}`);
      setRide(res.data);
      if (['COMPLETED', 'CANCELLED'].includes(res.data.status)) {
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          try {
            await api.post(`/rides/${rideId}/cancel`);
            navigation.replace('Home');
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Cannot cancel');
          }
        }
      }
    ]);
  };

  if (loading || !ride) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  const currentStep = STATUS_STEPS.indexOf(ride.status);

  return (
    <View style={styles.container}>
      <Text style={styles.statusLabel}>{STATUS_LABELS[ride.status] || ride.status}</Text>

      {/* Progress bar */}
      {!['COMPLETED', 'CANCELLED'].includes(ride.status) && (
        <View style={styles.progressContainer}>
          {STATUS_STEPS.map((step, i) => (
            <View key={step} style={styles.progressItem}>
              <View style={[styles.dot, i <= currentStep && styles.dotActive]} />
              {i < STATUS_STEPS.length - 1 && (
                <View style={[styles.line, i < currentStep && styles.lineActive]} />
              )}
              <Text style={styles.stepText}>{step === 'ENROUTE' ? 'En Route' : step.charAt(0) + step.slice(1).toLowerCase()}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.rideCard}>
        <Text style={styles.cardTitle}>Your Ride</Text>
        <Text style={styles.cardRow}>📍 {ride.pickupAddress}</Text>
        <Text style={styles.cardRow}>🏁 {ride.dropoffAddress}</Text>
        <Text style={styles.cardRow}>💳 {ride.paymentMethod}</Text>
        <Text style={styles.fareText}>R {ride.fareAmount?.toFixed(2)}</Text>
      </View>

      {ride.driver && ride.driver.driverProfile && (
        <View style={styles.driverCard}>
          <Text style={styles.cardTitle}>Your Driver</Text>
          <Text style={styles.driverName}>{ride.driver.name}</Text>
          <Text style={styles.cardRow}>{ride.driver.driverProfile.vehicleMake} {ride.driver.driverProfile.vehicleModel} • {ride.driver.driverProfile.vehicleColor}</Text>
          <Text style={styles.plateText}>{ride.driver.driverProfile.plateNumber}</Text>
          <Text style={styles.star}>⭐ {ride.driver.driverProfile.rating?.toFixed(1)}</Text>
        </View>
      )}

      {['REQUESTED', 'ACCEPTED'].includes(ride.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}

      {ride.status === 'COMPLETED' && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.replace('Home')}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  statusLabel: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#FF6B35' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  progressItem: { alignItems: 'center', flex: 1 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ddd', marginBottom: 4 },
  dotActive: { backgroundColor: '#FF6B35' },
  line: { height: 3, width: '100%', backgroundColor: '#ddd', position: 'absolute', top: 7, left: '50%' },
  lineActive: { backgroundColor: '#FF6B35' },
  stepText: { fontSize: 10, color: '#999', marginTop: 4 },
  rideCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 20, marginBottom: 16 },
  driverCard: { backgroundColor: '#FFF0EB', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 10 },
  cardRow: { fontSize: 14, marginBottom: 6, color: '#444' },
  fareText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 8 },
  driverName: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  plateText: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  star: { fontSize: 16, marginTop: 6 },
  cancelBtn: { backgroundColor: '#dc3545', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 'auto' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  doneBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 'auto' },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
