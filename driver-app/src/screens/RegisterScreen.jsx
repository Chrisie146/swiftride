import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ profileStatus }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    licenceNumber: '', vehicleMake: '', vehicleModel: '', vehicleColor: '', plateNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(form).some(v => !v.trim())) {
      return Alert.alert('Error', 'All fields are required');
    }
    setLoading(true);
    try {
      const res = await api.post('/drivers/register', form);
      await login(res.data.token, res.data.user);
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted || profileStatus === 'pending') {
    return (
      <View style={styles.pendingContainer}>
        <Text style={styles.pendingIcon}>⏳</Text>
        <Text style={styles.pendingTitle}>Application Submitted</Text>
        <Text style={styles.pendingText}>
          You'll be notified once your application is approved by the SwiftRide team.
        </Text>
      </View>
    );
  }

  const fields = [
    { key: 'licenceNumber', label: 'Licence Number', placeholder: 'e.g. 12345678' },
    { key: 'vehicleMake', label: 'Vehicle Make', placeholder: 'e.g. Toyota' },
    { key: 'vehicleModel', label: 'Vehicle Model', placeholder: 'e.g. Corolla' },
    { key: 'vehicleColor', label: 'Vehicle Color', placeholder: 'e.g. White' },
    { key: 'plateNumber', label: 'Plate Number', placeholder: 'e.g. EC 123 GP' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Driver Registration</Text>
      <Text style={styles.subtitle}>Tell us about you and your vehicle</Text>

      {fields.map(({ key, label, placeholder }) => (
        <View key={key} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#555"
            value={form[key]}
            onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.btnText}>Submit Application</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#aaa', marginBottom: 30 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 14,
    fontSize: 15, backgroundColor: '#2a2a3e', color: '#fff'
  },
  btn: { backgroundColor: '#4cc9f0', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  pendingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#1a1a2e' },
  pendingIcon: { fontSize: 60, marginBottom: 20 },
  pendingTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  pendingText: { fontSize: 15, color: '#aaa', textAlign: 'center', lineHeight: 22 },
});
