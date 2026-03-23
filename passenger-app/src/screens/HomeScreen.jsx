import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PAYMENT_METHODS = ['CASH', 'CARD', 'SNAPSCAN'];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [fareData, setFareData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Queenstown, EC coordinates for demo
  const DEMO_COORDS = {
    pickupLat: -31.8976, pickupLng: 26.8770,
    dropoffLat: -31.9010, dropoffLng: 26.8823,
  };

  const handleEstimate = async () => {
    if (!pickup.trim() || !dropoff.trim()) return Alert.alert('Error', 'Enter pickup and dropoff addresses');
    setLoading(true);
    try {
      const res = await api.post('/rides/estimate', DEMO_COORDS);
      setFareData(res.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to estimate fare');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!fareData) return Alert.alert('Error', 'Please estimate fare first');
    setLoading(true);
    try {
      const res = await api.post('/rides/request', {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        ...DEMO_COORDS,
        paymentMethod,
      });
      navigation.navigate('Tracking', { rideId: res.data.id });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to request ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Where to?</Text>

      <TextInput
        style={styles.input}
        placeholder="📍 Pickup address"
        value={pickup}
        onChangeText={setPickup}
      />
      <TextInput
        style={styles.input}
        placeholder="🏁 Drop-off address"
        value={dropoff}
        onChangeText={setDropoff}
      />

      <Text style={styles.sectionTitle}>Payment method</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.payPill, paymentMethod === m && styles.payPillActive]}
            onPress={() => setPaymentMethod(m)}
          >
            <Text style={[styles.payPillText, paymentMethod === m && styles.payPillTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.estimateBtn} onPress={handleEstimate} disabled={loading}>
        <Text style={styles.estimateBtnText}>Estimate Fare</Text>
      </TouchableOpacity>

      {fareData && (
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>
          <View style={styles.fareRow}><Text>Distance</Text><Text>{fareData.distanceKm} km</Text></View>
          <View style={styles.fareRow}><Text>Base fare</Text><Text>R 15.00</Text></View>
          <View style={styles.fareRow}><Text>Per km</Text><Text>R {(fareData.distanceKm * 4.5).toFixed(2)}</Text></View>
          <View style={[styles.fareRow, styles.fareTotal]}>
            <Text style={styles.fareTotalText}>Total</Text>
            <Text style={styles.fareTotalText}>R {fareData.fareAmount?.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.requestBtn} onPress={handleRequest} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.requestBtnText}>Request Ride 🚗</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('History')}>
        <Text style={styles.historyLinkText}>View Ride History →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  logoutText: { color: '#FF6B35', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15,
    fontSize: 15, marginBottom: 12, backgroundColor: '#f9f9f9'
  },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  payPill: { flex: 1, padding: 12, borderRadius: 24, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  payPillActive: { borderColor: '#FF6B35', backgroundColor: '#FFF0EB' },
  payPillText: { fontSize: 13, color: '#666' },
  payPillTextActive: { color: '#FF6B35', fontWeight: 'bold' },
  estimateBtn: { backgroundColor: '#333', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  estimateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  fareCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 20, marginBottom: 20 },
  fareTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  fareTotal: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8, paddingTop: 12 },
  fareTotalText: { fontWeight: 'bold', fontSize: 16 },
  requestBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  requestBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  historyLink: { alignItems: 'center', marginTop: 10 },
  historyLinkText: { color: '#FF6B35', fontSize: 14 },
});
