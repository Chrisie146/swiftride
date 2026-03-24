import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, shadow } from '../theme';

const PAYMENT_METHODS = ['CASH', 'CARD', 'SNAPSCAN'];
const PM_LABELS = { CASH: 'Cash', CARD: 'Card', SNAPSCAN: 'SnapScan' };

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [fareData, setFareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const DEMO_COORDS = { pickupLat: -31.8976, pickupLng: 26.8770, dropoffLat: -31.9010, dropoffLng: 26.8823 };

  const handleEstimate = async () => {
    if (!pickup.trim() || !dropoff.trim()) return Alert.alert('Error', 'Enter pickup and dropoff addresses');
    setLoading(true);
    try {
      const res = await api.post('/rides/estimate', DEMO_COORDS);
      setFareData(res.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to estimate fare');
    } finally { setLoading(false); }
  };

  const handleRequest = async () => {
    if (!fareData) return Alert.alert('Error', 'Please estimate fare first');
    setLoading(true);
    try {
      const res = await api.post('/rides/request', { pickupAddress: pickup, dropoffAddress: dropoff, ...DEMO_COORDS, paymentMethod });
      navigation.navigate('Tracking', { rideId: res.data.id });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to request ride');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Where to, {user?.name?.split(' ')[0]}?</Text>
          <Text style={styles.location}>Queenstown, Eastern Cape</Text>
        </View>
        <TouchableOpacity onPress={logout}><Text style={styles.logoutText}>Sign out</Text></TouchableOpacity>
      </View>

      <View style={styles.bookingCard}>
        <View style={styles.addrRow}>
          <View style={styles.dotBlack} />
          <View style={styles.addrLine}>
            <Text style={styles.addrLabel}>PICKUP</Text>
            <TextInput style={styles.addrInput} placeholder="Enter pickup address" placeholderTextColor={colors.gray250} value={pickup} onChangeText={setPickup} onFocus={() => setFocused('pickup')} onBlur={() => setFocused(null)} />
          </View>
        </View>
        <View style={styles.hairline} />
        <View style={styles.addrRow}>
          <View style={styles.dotOrange} />
          <View style={styles.addrLine}>
            <Text style={styles.addrLabel}>DROP-OFF</Text>
            <TextInput style={styles.addrInput} placeholder="Where are you going?" placeholderTextColor={colors.gray250} value={dropoff} onChangeText={setDropoff} onFocus={() => setFocused('dropoff')} onBlur={() => setFocused(null)} />
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>PAYMENT</Text>
      <View style={styles.payRow}>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity key={m} style={[styles.payPill, paymentMethod === m && styles.payPillActive]} onPress={() => setPaymentMethod(m)}>
            <Text style={[styles.payPillText, paymentMethod === m && styles.payPillTextActive]}>{PM_LABELS[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.estimateBtn} onPress={handleEstimate} disabled={loading}>
        <Text style={styles.estimateBtnText}>Estimate Fare</Text>
      </TouchableOpacity>

      {fareData && (
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Distance</Text><Text style={styles.fareVal}>{fareData.distanceKm} km</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Base fare</Text><Text style={styles.fareVal}>R 15.00</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Per km (× {fareData.distanceKm})</Text><Text style={styles.fareVal}>R {(fareData.distanceKm * 4.5).toFixed(2)}</Text></View>
          <View style={styles.fareTotal}>
            <Text style={styles.fareTotalText}>Total</Text>
            <Text style={styles.fareTotalText}>R {fareData.fareAmount?.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.requestBtn} onPress={handleRequest} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.requestBtnText}>Request Ride</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('History')}>
        <Text style={styles.historyLinkText}>View ride history →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.gray900, letterSpacing: -0.4 },
  location: { fontSize: 13, color: colors.gray400, marginTop: 2 },
  logoutText: { fontSize: 13, color: colors.gray400, marginTop: 4 },
  bookingCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow.card },
  addrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  dotBlack: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray900, marginTop: 16, flexShrink: 0 },
  dotOrange: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange500, marginTop: 16, flexShrink: 0 },
  addrLine: { flex: 1 },
  addrLabel: { fontSize: 10, color: colors.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  addrInput: { fontSize: 14, color: colors.gray900, fontWeight: '500', paddingVertical: 2 },
  hairline: { height: 1, backgroundColor: colors.gray100, marginLeft: 18 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  payPill: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1.5, borderColor: colors.gray200, alignItems: 'center' },
  payPillActive: { borderColor: colors.orange500, backgroundColor: colors.orange50 },
  payPillText: { fontSize: 13, color: colors.gray400, fontWeight: '600' },
  payPillTextActive: { color: colors.orange500 },
  estimateBtn: { backgroundColor: colors.orange50, borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.orange100 },
  estimateBtnText: { color: colors.orange500, fontWeight: '700', fontSize: 15 },
  fareCard: { backgroundColor: colors.warmBg, borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.orange100 },
  fareTitle: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 12 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  fareKey: { fontSize: 13, color: colors.gray600 },
  fareVal: { fontSize: 13, color: colors.gray700, fontWeight: '500' },
  fareTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.orange100 },
  fareTotalText: { fontWeight: '700', fontSize: 17, color: colors.gray900 },
  requestBtn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 14 },
  requestBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  historyLink: { alignItems: 'center', marginTop: 8, paddingVertical: 12 },
  historyLinkText: { color: colors.orange500, fontSize: 14, fontWeight: '500' },
});
