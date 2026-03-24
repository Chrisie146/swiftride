import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { colors, shadow } from '../theme';

export default function EarningsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drivers/earnings').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.orange500} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>THIS WEEK</Text>
        <Text style={styles.heroValue}>R {data.weekEarnings.toFixed(2)}</Text>
        <Text style={styles.heroSub}>{data.totalRides} total rides</Text>
      </View>

      <View style={styles.cellRow}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>TODAY</Text>
          <Text style={styles.cellValue}>R {data.todayEarnings.toFixed(2)}</Text>
          <Text style={styles.cellSub}>{data.todayRides} rides</Text>
        </View>
        <View style={[styles.cell, styles.cellMiddle]}>
          <Text style={styles.cellLabel}>RATING</Text>
          <Text style={styles.cellValue}>{data.rating.toFixed(1)}</Text>
          <Text style={styles.cellSub}>out of 5</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>CASH OWED</Text>
          <Text style={[styles.cellValue, data.cashOwed > 0 && styles.cellValueRed]}>R {data.cashOwed.toFixed(2)}</Text>
          <Text style={styles.cellSub}>to SwiftRide</Text>
        </View>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Cash commission must be settled weekly via EFT or SnapScan. Contact SwiftRide admin for payment details.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, letterSpacing: -0.4, marginBottom: 16 },
  heroCard: { backgroundColor: colors.orange500, borderRadius: 16, padding: 20, marginBottom: 12 },
  heroLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  heroValue: { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: -1, lineHeight: 40 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  cellRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cell: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, ...shadow.card },
  cellMiddle: {},
  cellLabel: { fontSize: 10, fontWeight: '600', color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  cellValue: { fontSize: 20, fontWeight: '700', color: colors.gray900, letterSpacing: -0.3 },
  cellValueRed: { color: colors.error },
  cellSub: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  noteCard: { backgroundColor: colors.warningBg, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#FEF08A' },
  noteText: { fontSize: 12, color: colors.warning, lineHeight: 19 },
});
