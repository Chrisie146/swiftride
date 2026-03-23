import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import api from './src/api';
import PhoneScreen from './src/screens/PhoneScreen';
import OtpScreen from './src/screens/OtpScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RideScreen from './src/screens/RideScreen';
import EarningsScreen from './src/screens/EarningsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { token, user, loading } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      setProfileStatus(null);
      return;
    }

    if (user.role !== 'DRIVER') {
      setProfileStatus('new');
      return;
    }

    setProfileLoading(true);
    api.get('/drivers/profile')
      .then((res) => {
        setProfileStatus(res.data.status === 'APPROVED' ? 'approved' : 'pending');
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 404) setProfileStatus('new');
        else setProfileStatus('pending');
      })
      .finally(() => setProfileLoading(false));
  }, [token, user]);

  if (loading || (token && profileLoading)) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}><ActivityIndicator size="large" color="#4cc9f0" /></View>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Phone" component={PhoneScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        </>
      ) : profileStatus === 'new' || profileStatus === 'pending' ? (
        <Stack.Screen name="Register">
          {(props) => <RegisterScreen {...props} profileStatus={profileStatus} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Ride" component={RideScreen} />
          <Stack.Screen name="Earnings" component={EarningsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
