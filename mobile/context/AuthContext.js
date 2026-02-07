import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    console.log('=== AuthContext: Loading stored auth ===');
    try {
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Stored token found:', storedToken ? 'YES' : 'NO');
      
      if (storedToken) {
        // Validate the token by trying to access a protected endpoint
        try {
          console.log('Validating token...');
          const response = await api.get('/profile/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          console.log('Token valid, profile found');
          setToken(storedToken);
          setProfile(response.data);
        } catch (error) {
          console.log('Token validation error:', error.response?.status, error.message);
          if (error.response?.status === 401) {
            // Token is invalid, clear it
            console.log('Token invalid (401), clearing...');
            await AsyncStorage.removeItem('token');
            setToken(null);
            setProfile(null);
          } else if (error.response?.status === 404) {
            // Token is valid but no profile yet
            console.log('Token valid but no profile (404)');
            setToken(storedToken);
            setProfile(null);
          } else {
            // Network error or other issue - clear token to be safe
            console.log('Network/other error, clearing token to be safe');
            await AsyncStorage.removeItem('token');
            setToken(null);
            setProfile(null);
          }
        }
      } else {
        console.log('No stored token, user needs to login');
        setToken(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in loadStoredAuth:', error);
      setToken(null);
      setProfile(null);
    } finally {
      console.log('=== AuthContext: Setting loading to false ===');
      console.log('Final state - token:', token ? 'SET' : 'NULL', 'profile:', profile ? 'SET' : 'NULL');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    console.log('=== Fetching user profile ===');
    try {
      const currentToken = await AsyncStorage.getItem('token');
      const response = await api.get('/profile/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      console.log('Profile fetched successfully');
      setProfile(response.data);
    } catch (error) {
      console.log('Error fetching profile:', error.response?.status);
      if (error.response?.status === 404) {
        setProfile(null);
      } else if (error.response?.status === 401) {
        console.log('Unauthorized, logging out');
        await logout();
      }
    }
  };

  const login = async (newToken) => {
    console.log('=== Login called ===');
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      // Fetch profile after login
      try {
        const response = await api.get('/profile/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setProfile(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setProfile(null); // No profile yet, will show ProfileSetup
        }
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const logout = async () => {
    console.log('=== Logout called ===');
    try {
      // Clear ALL stored data
      await AsyncStorage.multiRemove(['token', 'biometric_email', 'biometric_password']);
      setToken(null);
      setUser(null);
      setProfile(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // Force clear everything - for debugging
  const clearAllData = async () => {
    console.log('=== Clearing ALL data ===');
    try {
      await AsyncStorage.clear();
      setToken(null);
      setUser(null);
      setProfile(null);
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        loading,
        login,
        logout,
        fetchUserProfile,
        updateProfile,
        clearAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
