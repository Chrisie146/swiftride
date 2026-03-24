import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../api';
import { colors } from '../theme';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) return Alert.alert('Error', 'Please enter your phone number');
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', { phone: phone.trim(), name: 'Driver' });
      navigation.navigate('Otp', { userId: res.data.userId, phone: phone.trim() });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logoArea}>
          <View style={styles.logoMark} />
          <Text style={styles.appName}>SwiftRide Driver</Text>
          <Text style={styles.tagline}>Enter your phone number to continue</Text>
        </View>
        <Text style={styles.fieldLabel}>Mobile number</Text>
        <TextInput
          style={[styles.input, focused && styles.inputFocused]}
          placeholder="082 123 4567" placeholderTextColor={colors.gray250}
          keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={15}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Code</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmBg },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoMark: { width: 56, height: 56, backgroundColor: colors.orange500, borderRadius: 16, marginBottom: 14 },
  appName: { fontSize: 22, fontWeight: '800', color: colors.gray900, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.gray400, marginTop: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '600', color: colors.gray900, marginBottom: 24 },
  inputFocused: { borderColor: colors.orange500 },
  btn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
