import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function OtpScreen({ route, navigation }) {
  const { userId, phone } = route.params;
  const { login } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (text, index) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    if (text && index < 5) refs.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) return Alert.alert('Error', 'Enter all 6 digits');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, code });
      await login(res.data.token, res.data.user);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/auth/request-otp', { phone });
      setCountdown(30);
      Alert.alert('OTP Resent', 'A new code has been sent');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>6-digit code sent to your phone</Text>

      <View style={styles.codeRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={r => refs.current[i] = r}
            style={styles.digitInput}
            keyboardType="number-pad"
            maxLength={1}
            value={d}
            onChangeText={t => handleChange(t, i)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={countdown > 0} style={styles.resend}>
        <Text style={{ color: countdown > 0 ? '#aaa' : '#FF6B35' }}>
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  digitInput: {
    width: 48, height: 56, borderWidth: 2, borderColor: '#ddd', borderRadius: 10,
    textAlign: 'center', fontSize: 22, fontWeight: 'bold', backgroundColor: '#f9f9f9'
  },
  btn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resend: { alignItems: 'center' },
});
