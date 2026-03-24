import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../api';
import { colors, shadow } from '../theme';

const PAY_BADGE = { CASH: { bg: colors.warningBg, text: colors.warning }, CARD: { bg: colors.infoBg, text: colors.info }, SNAPSCAN: { bg: colors.gray100, text: colors.gray600 } };

export default function HistoryScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rides/history').then(r => setRides(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.orange500} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride History</Text>
      <FlatList
        data={rides}
        keyExtractor={r => r.id}
        ListEmptyComponent={<Text style={styles.empty}>No completed rides yet.</Text>}
        renderItem={({ item }) => {
          const pb = PAY_BADGE[item.paymentMethod] || PAY_BADGE.CASH;
          return (
            <View style={styles.card}>
              <Text style={styles.date}>{new Date(item.completedAt).toLocaleString('en-ZA')}</Text>
              <Text style={styles.route}>{item.pickupAddress}</Text>
              <Text style={[styles.route, { color: colors.orange500, marginTop: 2 }]}>{item.dropoffAddress}</Text>
              <View style={styles.row}>
                <Text style={styles.fare}>R {item.fareAmount?.toFixed(2)}</Text>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <View style={[styles.badge, { backgroundColor: pb.bg }]}><Text style={[styles.badgeText, { color: pb.text }]}>{item.paymentMethod}</Text></View>
                  {item.driver && <Text style={styles.driver}>{item.driver.name}</Text>}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, letterSpacing: -0.4, marginBottom: 20 },
  empty: { textAlign: 'center', color: colors.gray400, marginTop: 40, fontSize: 14 },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 10, ...shadow.card },
  date: { fontSize: 11, color: colors.gray400, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  route: { fontSize: 13, color: colors.gray600, lineHeight: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  fare: { fontSize: 18, fontWeight: '700', color: colors.orange500 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10.5, fontWeight: '600' },
  driver: { fontSize: 12, color: colors.gray400 },
});
