import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function OtpScreen({ route, navigation }) {
  const { userId, phone } = route.params;
  const { login } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [focused, setFocused] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (text, index) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    if (text && index < 5) { refs.current[index + 1]?.focus(); setFocused(index + 1); }
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
      setDigits(['', '', '', '', '', '']);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  const allFilled = digits.every(d => d !== '');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Enter the{'\n'}6-digit code</Text>
      <Text style={styles.sub}>Sent to <Text style={styles.subBold}>{phone}</Text> via SMS</Text>

      <View style={styles.digitRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={r => refs.current[i] = r}
            style={[styles.digit, d ? styles.digitFilled : focused === i ? styles.digitCursor : null]}
            keyboardType="number-pad" maxLength={1} value={d}
            onChangeText={t => handleChange(t, i)}
            onFocus={() => setFocused(i)}
          />
        ))}
      </View>

      <TouchableOpacity onPress={handleResend} disabled={countdown > 0} style={styles.resendRow}>
        <Text style={styles.resendText}>
          Didn't get it?{' '}
          <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0 ? `Resend in 0:${String(countdown).padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, !allFilled && styles.btnDisabled]}
        onPress={handleVerify} disabled={loading || !allFilled}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg, padding: 24 },
  backBtn: { paddingTop: 14, marginBottom: 0 },
  backText: { fontSize: 13, color: colors.gray400, fontWeight: '500' },
  heading: { fontSize: 28, fontWeight: '800', color: colors.gray900, letterSpacing: -0.4, marginTop: 28, lineHeight: 34 },
  sub: { fontSize: 13, color: colors.gray400, marginTop: 6, marginBottom: 32, lineHeight: 20 },
  subBold: { color: colors.gray600, fontWeight: '600' },
  digitRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  digit: { flex: 1, height: 56, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray250, borderRadius: 12, textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.gray900 },
  digitFilled: { borderColor: colors.orange500, backgroundColor: colors.orange50, color: colors.orange500 },
  digitCursor: { borderColor: colors.orange500 },
  resendRow: { alignItems: 'center', marginBottom: 28 },
  resendText: { fontSize: 12.5, color: colors.gray400 },
  resendLink: { color: colors.orange500, fontWeight: '600' },
  resendDisabled: { color: colors.gray400 },
  btn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: colors.gray250 },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
