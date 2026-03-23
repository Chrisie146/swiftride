import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../api';

export default function RideScreen({ route, navigation }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState(null);

  useEffect(() => {
    fetchRide();
  }, []);

  const fetchRide = async () => {
    try {
      const res = await api.get(`/rides/${rideId}`);
      setRide(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load ride');
    } finally {
      setLoading(false);
    }
  };

  const handleArrived = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${rideId}/arrived`);
      fetchRide();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${rideId}/complete`);
      const updatedRide = await api.get(`/rides/${rideId}`);
      setRide(updatedRide.data);
      setEarningsSummary({
        fare: updatedRide.data.fareAmount,
        commission: updatedRide.data.commissionAmt,
        earned: updatedRide.data.driverEarning,
        method: updatedRide.data.paymentMethod,
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !ride) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4cc9f0" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Ride</Text>

      <View style={styles.rideCard}>
        <Text style={styles.passengerName}>{ride.passenger?.name}</Text>
        <Text style={styles.cardRow}>📍 {ride.pickupAddress}</Text>
        <Text style={styles.cardRow}>🏁 {ride.dropoffAddress}</Text>
        <Text style={styles.fareText}>R {ride.fareAmount?.toFixed(2)} • {ride.paymentMethod}</Text>
      </View>

      {earningsSummary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>✅ Ride Complete!</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Fare</Text><Text style={styles.summaryVal}>R {earningsSummary.fare?.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Commission (15%)</Text><Text style={{ color: '#ff6b6b' }}>- R {earningsSummary.commission?.toFixed(2)}</Text></View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>You Earned</Text>
            <Text style={styles.summaryTotalVal}>R {earningsSummary.earned?.toFixed(2)}</Text>
          </View>
          {earningsSummary.method === 'CASH' && (
            <Text style={styles.cashNote}>⚠️ Collect full R {earningsSummary.fare?.toFixed(2)} in cash. R {earningsSummary.commission?.toFixed(2)} commission is owed to SwiftRide weekly.</Text>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.replace('Home')}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          {ride.status === 'ACCEPTED' && (
            <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.arrivedBtnText}>I've Arrived</Text>}
            </TouchableOpacity>
          )}
          {ride.status === 'ARRIVED' && (
            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.completeBtnText}>Complete Ride</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  rideCard: { backgroundColor: '#2a2a3e', borderRadius: 16, padding: 20, marginBottom: 24 },
  passengerName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  cardRow: { fontSize: 14, color: '#bbb', marginBottom: 6 },
  fareText: { fontSize: 18, fontWeight: 'bold', color: '#4cc9f0', marginTop: 8 },
  actions: { gap: 16 },
  arrivedBtn: { backgroundColor: '#4cc9f0', borderRadius: 14, padding: 18, alignItems: 'center' },
  arrivedBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 17 },
  completeBtn: { backgroundColor: '#38b000', borderRadius: 14, padding: 18, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  summaryCard: { backgroundColor: '#2a2a3e', borderRadius: 16, padding: 20 },
  summaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#4cc9f0', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { color: '#aaa', fontSize: 14 },
  summaryVal: { color: '#fff', fontSize: 14 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#444', marginTop: 8, paddingTop: 12 },
  summaryTotalLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  summaryTotalVal: { color: '#4cc9f0', fontSize: 20, fontWeight: 'bold' },
  cashNote: { color: '#f4c430', fontSize: 13, marginTop: 14, lineHeight: 20 },
  doneBtn: { backgroundColor: '#4cc9f0', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
});
