import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import AuthPage from './pages/AuthPage';
import ProfileSetup from './pages/ProfileSetup';
import Discovery from './pages/Discovery';
import SmashOrPass from './pages/SmashOrPass';
import DMs from './pages/DMs';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Winks from './pages/Winks';
import Admin from './pages/Admin';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const AuthContext = createContext();

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 404) {
        setProfile(null);
      }
    }
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, profile, login, logout, fetchUserData }}>
      <div className="App">
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={!token ? <AuthPage /> : profile ? <Navigate to="/discover" /> : <Navigate to="/setup" />} />
            <Route path="/setup" element={token && !profile ? <ProfileSetup /> : <Navigate to="/" />} />
            <Route path="/discover" element={token && profile ? <Discovery /> : <Navigate to="/" />} />
            <Route path="/smash-or-pass" element={token && profile ? <SmashOrPass /> : <Navigate to="/" />} />
            <Route path="/dms" element={token && profile ? <DMs /> : <Navigate to="/" />} />
            <Route path="/chat/:matchId" element={token && profile ? <Chat /> : <Navigate to="/" />} />
            <Route path="/profile" element={token && profile ? <Profile /> : <Navigate to="/" />} />
            <Route path="/winks" element={token && profile ? <Winks /> : <Navigate to="/" />} />
            <Route path="/admin" element={token ? <Admin /> : <Navigate to="/" />} />
            <Route path="/subscription/*" element={token ? <Subscription /> : <Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
