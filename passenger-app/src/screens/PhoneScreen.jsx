import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../api';
import { colors } from '../theme';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

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
      if (msg.includes('Name is required')) {
        Alert.alert('Name required', "Looks like you're new! Please enter your name.");
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
        <View style={styles.logoArea}>
          <View style={styles.logoMark} />
          <Text style={styles.appName}>SwiftRide</Text>
          <Text style={styles.tagline}>Your ride, your town</Text>
        </View>

        <Text style={styles.fieldLabel}>Mobile number</Text>
        <TextInput
          style={[styles.input, focused === 'phone' && styles.inputFocused]}
          placeholder="082 123 4567" placeholderTextColor={colors.gray250}
          keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={15}
          onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
        />

        <Text style={styles.fieldLabel}>Your name</Text>
        <TextInput
          style={[styles.input, focused === 'name' && styles.inputFocused]}
          placeholder="Required for new users" placeholderTextColor={colors.gray250}
          value={name} onChangeText={setName} autoCapitalize="words"
          onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
        />

        <Text style={styles.hint}>We'll send a one-time code to verify your number.</Text>

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
  input: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '600', color: colors.gray900, marginBottom: 16 },
  inputFocused: { borderColor: colors.orange500 },
  hint: { fontSize: 12, color: colors.gray400, marginBottom: 24, lineHeight: 18 },
  btn: { backgroundColor: colors.orange500, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
