import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { colors, shadow } from '../theme';

const STATUS_STEPS = ['REQUESTED', 'ACCEPTED', 'ENROUTE', 'ARRIVED'];
const STEP_LABELS = ['Requested', 'Confirmed', 'En Route', 'Arrived'];

const STATUS_COPY = {
  REQUESTED: { title: 'Finding your driver', sub: 'Waiting for a driver to accept' },
  ACCEPTED:  { title: 'Driver confirmed', sub: 'Your driver is on the way' },
  ENROUTE:   { title: 'Driver on the way', sub: 'Heading to your pickup' },
  ARRIVED:   { title: 'Driver has arrived', sub: 'Your driver is waiting for you' },
  COMPLETED: { title: 'Ride completed', sub: 'Thanks for riding with SwiftRide' },
  CANCELLED: { title: 'Ride cancelled', sub: null },
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
      if (['COMPLETED', 'CANCELLED'].includes(res.data.status)) clearInterval(intervalRef.current);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await api.post(`/rides/${rideId}/cancel`);
          navigation.replace('Home');
        } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Cannot cancel'); }
      }},
    ]);
  };

  if (loading || !ride) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.orange500} />;

  const currentStep = STATUS_STEPS.indexOf(ride.status);
  const copy = STATUS_COPY[ride.status] || { title: ride.status, sub: null };
  const isActive = !['COMPLETED', 'CANCELLED'].includes(ride.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusCaption}>RIDE STATUS</Text>
        <Text style={styles.statusTitle}>{copy.title}</Text>
        {copy.sub && <Text style={styles.statusSub}>{copy.sub}</Text>}
      </View>

      {isActive && (
        <View style={styles.progressBar}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={styles.progStep}>
                <View style={[styles.progDot, i <= currentStep && styles.progDotActive, i === currentStep && styles.progDotCurrent]} />
                <Text style={[styles.progLabel, i <= currentStep && styles.progLabelActive]}>{STEP_LABELS[i]}</Text>
              </View>
              {i < STATUS_STEPS.length - 1 && <View style={[styles.progLine, i < currentStep && styles.progLineActive]} />}
            </React.Fragment>
          ))}
        </View>
      )}

      {ride.driver && ride.driver.driverProfile && (
        <View style={styles.driverCard}>
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ride.driver.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <Text style={styles.driverCar}>{ride.driver.driverProfile.vehicleMake} {ride.driver.driverProfile.vehicleModel} · {ride.driver.driverProfile.vehicleColor}</Text>
            </View>
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{ride.driver.driverProfile.plateNumber}</Text>
            </View>
          </View>
          <View style={styles.routeSummary}>
            <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.gray900 }]} /><Text style={styles.routeAddr}>{ride.pickupAddress}</Text></View>
            <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: colors.orange500 }]} /><Text style={styles.routeAddr}>{ride.dropoffAddress}</Text></View>
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  content: { paddingBottom: 32 },
  statusHeader: { backgroundColor: colors.orange500, padding: 20, paddingBottom: 28 },
  statusCaption: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.gray900, marginBottom: 4 },
  statusTitle: { fontSize: 26, fontWeight: '800', color: colors.white, letterSpacing: -0.4, lineHeight: 30 },
  statusSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  progressBar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 0 },
  progStep: { alignItems: 'center', gap: 4 },
  progDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gray200 },
  progDotActive: { backgroundColor: colors.orange500 },
  progDotCurrent: { shadowColor: colors.orange500, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 },
  progLabel: { fontSize: 9, color: colors.gray400, fontWeight: '500', textAlign: 'center', width: 52 },
  progLabelActive: { color: colors.orange500 },
  progLine: { flex: 1, height: 2, backgroundColor: colors.gray200, marginBottom: 14 },
  progLineActive: { backgroundColor: colors.orange500 },
  driverCard: { margin: 16, backgroundColor: colors.white, borderRadius: 14, padding: 14, ...shadow.card },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.orange500, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.white },
  driverName: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  driverCar: { fontSize: 12, color: colors.gray400, marginTop: 1 },
  plateBadge: { backgroundColor: colors.gray100, borderRadius: 6, padding: 6 },
  plateText: { fontSize: 12, fontWeight: '700', color: colors.gray700, letterSpacing: 0.5 },
  routeSummary: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  routeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, flexShrink: 0 },
  routeAddr: { fontSize: 12, color: colors.gray600, flex: 1 },
  cancelBtn: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: colors.gray200, alignItems: 'center' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: colors.gray400 },
  doneBtn: { marginHorizontal: 16, marginTop: 12, padding: 15, borderRadius: 12, backgroundColor: colors.orange500, alignItems: 'center' },
  doneBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
