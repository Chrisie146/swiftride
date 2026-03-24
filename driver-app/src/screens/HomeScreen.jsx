import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, shadow } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const DRIVER_COORDS = { lat: -31.8976, lng: 26.8770 };

  const toggleOnline = async (val) => {
    setLoading(true);
    try {
      await api.post('/drivers/status', { online: val, ...DRIVER_COORDS });
      setIsOnline(val);
      if (val) { pollRequests(); intervalRef.current = setInterval(pollRequests, 5000); }
      else { clearInterval(intervalRef.current); setRequests([]); }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not update status');
    } finally { setLoading(false); }
  };

  const pollRequests = async () => {
    try { const res = await api.get('/drivers/requests'); setRequests(res.data); } catch {}
  };

  useEffect(() => { return () => clearInterval(intervalRef.current); }, []);

  const acceptRide = async (rideId) => {
    try {
      await api.post(`/rides/${rideId}/accept`);
      clearInterval(intervalRef.current);
      navigation.navigate('Ride', { rideId });
    } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed to accept ride'); }
  };

  const declineRide = (rideId) => setRequests(prev => prev.filter(r => r.id !== rideId));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.driverName}>{user?.name}</Text>
          <Text style={styles.driverRole}>Driver</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.earningsBtn} onPress={() => navigation.navigate('Earnings')}>
            <Text style={styles.earningsBtnText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}><Text style={styles.logoutText}>Sign out</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.toggleStatus}>{isOnline ? 'Online' : 'Offline'}</Text>
          <Text style={styles.toggleSub}>{isOnline ? 'Accepting rides' : 'Not visible to passengers'}</Text>
        </View>
        {loading ? <ActivityIndicator color={colors.orange500} /> : (
          <TouchableOpacity onPress={() => toggleOnline(!isOnline)} style={[styles.togglePill, isOnline && styles.togglePillOn]}>
            <View style={[styles.toggleThumb, isOnline && styles.toggleThumbOn]} />
          </TouchableOpacity>
        )}
      </View>

      {isOnline && (
        <>
          <Text style={styles.sectionLabel}>RIDE REQUESTS</Text>
          <FlatList
            data={requests}
            keyExtractor={r => r.id}
            ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Waiting for ride requests...</Text></View>}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <Text style={styles.passengerName}>{item.passenger?.name}</Text>
                <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.gray900 }]} /><Text style={styles.routeText}>{item.pickupAddress}</Text></View>
                <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.orange500 }]} /><Text style={styles.routeText}>{item.dropoffAddress}</Text></View>
                <View style={styles.chips}>
                  <View style={styles.chipOrange}><Text style={styles.chipOrangeText}>R {item.fareAmount?.toFixed(2)}</Text></View>
                  <View style={styles.chipGray}><Text style={styles.chipGrayText}>{item.distanceKm?.toFixed(1)} km</Text></View>
                  <View style={styles.chipGray}><Text style={styles.chipGrayText}>{item.paymentMethod}</Text></View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptRide(item.id)}><Text style={styles.acceptBtnText}>Accept</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => declineRide(item.id)}><Text style={styles.declineBtnText}>Decline</Text></TouchableOpacity>
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
  container: { flex: 1, backgroundColor: colors.warmBg, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  driverName: { fontSize: 20, fontWeight: '800', color: colors.gray900, letterSpacing: -0.3 },
  driverRole: { fontSize: 12, color: colors.gray400 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  earningsBtn: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  earningsBtnText: { fontSize: 12, fontWeight: '600', color: colors.gray700 },
  logoutText: { fontSize: 12, color: colors.gray400 },
  toggleCard: { backgroundColor: colors.white, borderRadius: 14, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, ...shadow.card },
  toggleStatus: { fontSize: 17, fontWeight: '700', color: colors.gray900, letterSpacing: -0.2 },
  toggleSub: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  togglePill: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.gray200, justifyContent: 'center', paddingHorizontal: 3 },
  togglePillOn: { backgroundColor: colors.orange500 },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  emptyText: { fontSize: 14, color: colors.gray250 },
  requestCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12, ...shadow.card },
  passengerName: { fontSize: 15, fontWeight: '700', color: colors.gray900, marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  routeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, flexShrink: 0 },
  routeText: { fontSize: 12.5, color: colors.gray600, flex: 1 },
  chips: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  chipOrange: { backgroundColor: colors.orange50, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  chipOrangeText: { fontSize: 12, fontWeight: '700', color: colors.orange600 },
  chipGray: { backgroundColor: colors.gray100, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  chipGrayText: { fontSize: 12, fontWeight: '600', color: colors.gray600 },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: { flex: 2, backgroundColor: colors.orange500, borderRadius: 9, padding: 12, alignItems: 'center' },
  acceptBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  declineBtn: { flex: 1, backgroundColor: colors.gray100, borderRadius: 9, padding: 12, alignItems: 'center' },
  declineBtnText: { color: colors.gray600, fontWeight: '600', fontSize: 14 },
});
