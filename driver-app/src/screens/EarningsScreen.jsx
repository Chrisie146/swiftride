import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api';

export default function EarningsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drivers/earnings')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4cc9f0" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Earnings</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Earnings</Text>
          <Text style={styles.cardValue}>R {data.todayEarnings.toFixed(2)}</Text>
          <Text style={styles.cardSub}>{data.todayRides} rides</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>This Week</Text>
          <Text style={styles.cardValue}>R {data.weekEarnings.toFixed(2)}</Text>
        </View>

        <View style={[styles.card, data.cashOwed > 0 ? styles.warningCard : styles.okCard]}>
          <Text style={styles.cardLabel}>Cash Owed to SwiftRide</Text>
          <Text style={[styles.cardValue, { color: data.cashOwed > 0 ? '#ff6b6b' : '#4cc9f0' }]}>
            R {data.cashOwed.toFixed(2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rating</Text>
          <Text style={styles.cardValue}>⭐ {data.rating.toFixed(1)}</Text>
          <Text style={styles.cardSub}>{data.totalRides} total rides</Text>
        </View>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>💳 Cash Commission Policy</Text>
        <Text style={styles.noteText}>
          Cash commission must be settled weekly via EFT or SnapScan.
          Contact SwiftRide admin for payment details.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  grid: { gap: 16 },
  card: { backgroundColor: '#2a2a3e', borderRadius: 16, padding: 20 },
  warningCard: { borderWidth: 1, borderColor: '#ff6b6b' },
  okCard: { borderWidth: 1, borderColor: '#2a2a3e' },
  cardLabel: { fontSize: 13, color: '#aaa', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  cardSub: { fontSize: 13, color: '#555', marginTop: 4 },
  noteCard: { backgroundColor: '#2a2a3e', borderRadius: 16, padding: 20, marginTop: 24, borderLeftWidth: 4, borderLeftColor: '#f4c430' },
  noteTitle: { fontSize: 15, fontWeight: 'bold', color: '#f4c430', marginBottom: 8 },
  noteText: { fontSize: 13, color: '#aaa', lineHeight: 20 },
});
