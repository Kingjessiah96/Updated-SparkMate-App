import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
