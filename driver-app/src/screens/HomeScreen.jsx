import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Switch
} from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Queenstown demo coords
  const DRIVER_COORDS = { lat: -31.8976, lng: 26.8770 };

  const toggleOnline = async (val) => {
    setLoading(true);
    try {
      await api.post('/drivers/status', { online: val, ...DRIVER_COORDS });
      setIsOnline(val);
      if (val) {
        pollRequests();
        intervalRef.current = setInterval(pollRequests, 5000);
      } else {
        clearInterval(intervalRef.current);
        setRequests([]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not update status');
    } finally {
      setLoading(false);
    }
  };

  const pollRequests = async () => {
    try {
      const res = await api.get('/drivers/requests');
      setRequests(res.data);
    } catch {}
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const acceptRide = async (rideId) => {
    try {
      await api.post(`/rides/${rideId}/accept`);
      clearInterval(intervalRef.current);
      navigation.navigate('Ride', { rideId });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to accept ride');
    }
  };

  const declineRide = (rideId) => {
    setRequests(prev => prev.filter(r => r.id !== rideId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SwiftRide Driver</Text>
          <Text style={styles.headerSub}>{user?.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Earnings')} style={styles.earningsBtn}>
            <Text style={styles.earningsBtnText}>💰 Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleCard}>
        <Text style={styles.toggleLabel}>{isOnline ? '🟢 You are ONLINE' : '⚫ You are OFFLINE'}</Text>
        {loading ? (
          <ActivityIndicator color="#4cc9f0" />
        ) : (
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: '#555', true: '#4cc9f0' }}
            thumbColor="#fff"
          />
        )}
      </View>

      {isOnline && (
        <>
          <Text style={styles.sectionTitle}>Incoming Ride Requests</Text>
          <FlatList
            data={requests}
            keyExtractor={r => r.id}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Waiting for ride requests...</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <Text style={styles.passengerName}>{item.passenger?.name}</Text>
                <Text style={styles.cardRow}>📍 {item.pickupAddress}</Text>
                <Text style={styles.cardRow}>🏁 {item.dropoffAddress}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.fare}>R {item.fareAmount?.toFixed(2)}</Text>
                  <Text style={styles.dist}>{item.distanceKm?.toFixed(1)} km</Text>
                  <Text style={styles.method}>{item.paymentMethod}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptRide(item.id)}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => declineRide(item.id)}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#aaa' },
  headerRight: { alignItems: 'flex-end', gap: 8 },
  earningsBtn: { backgroundColor: '#2a2a3e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  earningsBtnText: { color: '#4cc9f0', fontSize: 13 },
  logout: { color: '#ff6b6b', fontSize: 13 },
  toggleCard: {
    backgroundColor: '#2a2a3e', borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
  },
  toggleLabel: { fontSize: 18, color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#aaa', marginBottom: 12 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#555', fontSize: 15 },
  requestCard: { backgroundColor: '#2a2a3e', borderRadius: 16, padding: 16, marginBottom: 12 },
  passengerName: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  cardRow: { fontSize: 13, color: '#bbb', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 12 },
  fare: { color: '#4cc9f0', fontWeight: 'bold', fontSize: 16 },
  dist: { color: '#aaa', fontSize: 14 },
  method: { color: '#aaa', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#4cc9f0', borderRadius: 10, padding: 12, alignItems: 'center' },
  acceptBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 15 },
  declineBtn: { flex: 1, backgroundColor: '#333', borderRadius: 10, padding: 12, alignItems: 'center' },
  declineBtnText: { color: '#aaa', fontWeight: 'bold', fontSize: 15 },
});
