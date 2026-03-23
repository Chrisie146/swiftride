import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../api';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) return Alert.alert('Error', 'Please enter your phone number');
    setLoading(true);
    try {
      const body = { phone: phone.trim() };
      if (name.trim()) body.name = name.trim();
      const res = await api.post('/auth/request-otp', body);
      navigation.navigate('Otp', { userId: res.data.userId, phone: phone.trim() });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP';
      // If backend says name is required, prompt the user
      if (msg.includes('Name is required')) {
        Alert.alert('Name required', 'Looks like you\'re new! Please enter your name.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🚗 SwiftRide</Text>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>We'll send you an OTP to verify</Text>

        <TextInput
          style={styles.input}
          placeholder="082 123 4567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
        />

        <TextInput
          style={styles.input}
          placeholder="Your name (required for new users)"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15,
    fontSize: 16, marginBottom: 16, backgroundColor: '#f9f9f9'
  },
  btn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
