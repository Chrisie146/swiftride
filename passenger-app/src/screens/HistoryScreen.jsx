import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api';

export default function HistoryScreen() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rides/history')
      .then(r => setRides(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride History</Text>
      <FlatList
        data={rides}
        keyExtractor={r => r.id}
        ListEmptyComponent={<Text style={styles.empty}>No completed rides yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{new Date(item.completedAt).toLocaleString('en-ZA')}</Text>
            <Text style={styles.route}>{item.pickupAddress} → {item.dropoffAddress}</Text>
            <View style={styles.row}>
              <Text style={styles.fare}>R {item.fareAmount?.toFixed(2)}</Text>
              <Text style={styles.badge}>{item.paymentMethod}</Text>
            </View>
            {item.driver && <Text style={styles.driver}>Driver: {item.driver.name}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 14, padding: 16, marginBottom: 12 },
  date: { fontSize: 12, color: '#999', marginBottom: 6 },
  route: { fontSize: 14, color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fare: { fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#FF6B35', color: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
  driver: { fontSize: 12, color: '#666', marginTop: 6 },
});
