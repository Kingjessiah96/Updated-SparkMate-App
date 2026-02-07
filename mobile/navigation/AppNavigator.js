import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/constants';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import SmashOrPassScreen from '../screens/SmashOrPassScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WinksScreen from '../screens/WinksScreen';
import WhoLikedMeScreen from '../screens/WhoLikedMeScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import AdminScreen from '../screens/AdminScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_COLORS = {
  Nearby: '#FF0000',
  Smash: '#FF8C00',
  Winks: '#FFD700',
  DMs: '#0066FF',
  Profile: '#9400D3',
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: TAB_COLORS[route.name],
      tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarIcon: ({ focused }) => {
        let iconName;
        if (route.name === 'Nearby') iconName = focused ? 'location' : 'location-outline';
        else if (route.name === 'Smash') iconName = focused ? 'flame' : 'flame-outline';
        else if (route.name === 'Winks') iconName = focused ? 'heart-circle' : 'heart-circle-outline';
        else if (route.name === 'DMs') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={24} color={focused ? TAB_COLORS[route.name] : 'rgba(255,255,255,0.5)'} />;
      },
    })}
  >
    <Tab.Screen name="Nearby" component={DiscoveryScreen} />
    <Tab.Screen name="Smash" component={SmashOrPassScreen} />
    <Tab.Screen name="Winks" component={WinksScreen} options={{ tabBarLabel: 'Activity' }} />
    <Tab.Screen name="DMs" component={MatchesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { token, profile, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : !profile ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="WhoLikedMe" component={WhoLikedMeScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
