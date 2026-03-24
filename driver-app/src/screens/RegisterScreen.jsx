import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, shadow } from '../theme';

const FIELDS = [
  { key: 'licenceNumber', label: 'Licence Number', placeholder: 'e.g. 12345678' },
  { key: 'vehicleMake',   label: 'Vehicle Make',   placeholder: 'e.g. Toyota' },
  { key: 'vehicleModel',  label: 'Vehicle Model',  placeholder: 'e.g. Corolla' },
  { key: 'vehicleColor',  label: 'Vehicle Colour', placeholder: 'e.g. White' },
  { key: 'plateNumber',   label: 'Plate Number',   placeholder: 'e.g. EC 123 GP' },
];

export default function RegisterScreen({ profileStatus }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ licenceNumber: '', vehicleMake: '', vehicleModel: '', vehicleColor: '', plateNumber: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async () => {
    if (Object.values(form).some(v => !v.trim())) return Alert.alert('Error', 'All fields are required');
    setLoading(true);
    try {
      const res = await api.post('/drivers/register', form);
      await login(res.data.token, res.data.user);
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (submitted || profileStatus === 'pending') {
    return (
      <View style={styles.pendingContainer}>
        <View style={styles.pendingIcon} />
        <Text style={styles.pendingTitle}>Application Submitted</Text>
        <Text style={styles.pendingText}>
          Your application is under review. You'll be notified once the SwiftRide team approves your account.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Driver Registration</Text>
      <Text style={styles.subtitle}>Tell us about you and your vehicle</Text>
      {FIELDS.map(({ key, label, placeholder }) => (
        <View key={key} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={[styles.input, focused === key && styles.inputFocused]}
            placeholder={placeholder} placeholderTextColor={colors.gray250}
            value={form[key]} onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
            onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Application</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, letterSpacing: -0.4, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.gray400, marginBottom: 28 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 15, color: colors.gray900 },
  inputFocused: { borderColor: colors.orange500 },
  btn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  pendingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: colors.warmBg },
  pendingIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.warningBg, marginBottom: 20 },
  pendingTitle: { fontSize: 22, fontWeight: '800', color: colors.gray900, marginBottom: 12, letterSpacing: -0.3 },
  pendingText: { fontSize: 14, color: colors.gray400, textAlign: 'center', lineHeight: 22 },
});
