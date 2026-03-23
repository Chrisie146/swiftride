import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../api';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) return Alert.alert('Error', 'Please enter your phone number');
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', { phone: phone.trim(), name: 'Driver' });
      navigation.navigate('Otp', { userId: res.data.userId });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🚖</Text>
        <Text style={styles.title}>SwiftRide Driver</Text>
        <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="082 123 4567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
        />
        <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 15,
    fontSize: 18, marginBottom: 20, backgroundColor: '#2a2a3e', color: '#fff'
  },
  btn: { backgroundColor: '#4cc9f0', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#1a1a2e', fontSize: 16, fontWeight: 'bold' },
});
