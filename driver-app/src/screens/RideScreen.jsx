import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { colors, shadow } from '../theme';

export default function RideScreen({ route, navigation }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState(null);

  useEffect(() => { fetchRide(); }, []);

  const fetchRide = async () => {
    try { const res = await api.get(`/rides/${rideId}`); setRide(res.data); }
    catch { Alert.alert('Error', 'Failed to load ride'); }
    finally { setLoading(false); }
  };

  const handleArrived = async () => {
    setArrivedLoading(true);
    try { await api.post(`/rides/${rideId}/arrived`); await fetchRide(); }
    catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
    finally { setArrivedLoading(false); }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${rideId}/complete`);
      const updatedRide = await api.get(`/rides/${rideId}`);
      setRide(updatedRide.data);
      setEarningsSummary({ fare: updatedRide.data.fareAmount, commission: updatedRide.data.commissionAmt, earned: updatedRide.data.driverEarning, method: updatedRide.data.paymentMethod });
    } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  if (loading || !ride) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.orange500} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Active Ride</Text>

      <View style={styles.rideCard}>
        <Text style={styles.passengerName}>{ride.passenger?.name}</Text>
        <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.gray900 }]} /><Text style={styles.routeText}>{ride.pickupAddress}</Text></View>
        <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.orange500 }]} /><Text style={styles.routeText}>{ride.dropoffAddress}</Text></View>
        <View style={styles.fareRow}>
          <Text style={styles.fareAmt}>R {ride.fareAmount?.toFixed(2)}</Text>
          <View style={styles.payBadge}><Text style={styles.payBadgeText}>{ride.paymentMethod}</Text></View>
        </View>
      </View>

      {earningsSummary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ride Complete</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Fare collected</Text><Text style={styles.summaryVal}>R {earningsSummary.fare?.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Commission (15%)</Text><Text style={[styles.summaryVal, { color: colors.error }]}>− R {earningsSummary.commission?.toFixed(2)}</Text></View>
          <View style={styles.summaryTotal}><Text style={styles.summaryTotalKey}>You earned</Text><Text style={styles.summaryTotalVal}>R {earningsSummary.earned?.toFixed(2)}</Text></View>
          {earningsSummary.method === 'CASH' && (
            <View style={styles.cashNote}>
              <Text style={styles.cashNoteText}>Collect full R {earningsSummary.fare?.toFixed(2)} in cash. Commission of R {earningsSummary.commission?.toFixed(2)} is owed to SwiftRide weekly.</Text>
            </View>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.replace('Home')}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          {['ACCEPTED', 'ENROUTE'].includes(ride.status) && (
            <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived} disabled={arrivedLoading}>
              {arrivedLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.arrivedBtnText}>I've Arrived</Text>}
            </TouchableOpacity>
          )}
          {ride.status === 'ARRIVED' && (
            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.completeBtnText}>Complete Ride</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: colors.gray900, letterSpacing: -0.3, marginBottom: 16 },
  rideCard: { backgroundColor: colors.white, borderRadius: 14, padding: 18, marginBottom: 20, ...shadow.card },
  passengerName: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  routeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  routeText: { fontSize: 13, color: colors.gray600, flex: 1 },
  fareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  fareAmt: { fontSize: 22, fontWeight: '700', color: colors.gray900, letterSpacing: -0.4 },
  payBadge: { backgroundColor: colors.warningBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  payBadgeText: { fontSize: 11, fontWeight: '600', color: colors.warning },
  actions: { gap: 12 },
  arrivedBtn: { backgroundColor: colors.orange500, borderRadius: 14, padding: 18, alignItems: 'center' },
  arrivedBtnText: { color: colors.white, fontWeight: '700', fontSize: 17 },
  completeBtn: { backgroundColor: colors.success, borderRadius: 14, padding: 18, alignItems: 'center' },
  completeBtnText: { color: colors.white, fontWeight: '700', fontSize: 17 },
  summaryCard: { backgroundColor: colors.white, borderRadius: 14, padding: 20, ...shadow.card },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  summaryKey: { fontSize: 13, color: colors.gray600 },
  summaryVal: { fontSize: 13, color: colors.gray700, fontWeight: '500' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, marginTop: 4 },
  summaryTotalKey: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  summaryTotalVal: { fontSize: 22, fontWeight: '800', color: colors.orange500, letterSpacing: -0.4 },
  cashNote: { backgroundColor: colors.warningBg, borderRadius: 10, padding: 12, marginTop: 12 },
  cashNoteText: { fontSize: 12, color: colors.warning, lineHeight: 18 },
  doneBtn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  doneBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
