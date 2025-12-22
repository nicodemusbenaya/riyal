import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // FUNGSI UTAMA: Ambil data profil
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    console.log('[AUTH] fetchUserProfile called, token:', token ? 'exists' : 'missing');
    if (!token) return false;

    try {
      console.log('[AUTH] Calling GET /profile/me...');
      const response = await api.get('/profile/me');
      const profileData = response.data;
      console.log('[AUTH] Profile data received:', profileData);

      const formattedUser = {
        id: profileData.user_id,
        name: profileData.name,
        username: profileData.name,
        email: profileData.email,
        role: profileData.role,
        skills: profileData.skill ? profileData.skill.split(',') : [],
        avatar: profileData.pict,
        profileComplete: true 
      };

      setUser(formattedUser);
      localStorage.setItem('currentUser', JSON.stringify(formattedUser));
      console.log('[AUTH] User set successfully:', formattedUser.name);
      return true; 
    } catch (error) {
      console.log('[AUTH] fetchUserProfile error:', error.response?.status, error.response?.data);
      // PERBAIKAN PENTING DI SINI:
      // Jika error 404 (Profil belum ada), kita JANGAN biarkan user null.
      // Kita buat object user sementara agar tidak ditendang ke Login.
      if (error.response && error.response.status === 404) {
         console.log("[AUTH] User login, but no profile yet.");
         const incompleteUser = { profileComplete: false };
         setUser(incompleteUser);
         // Kita return true (artinya "Auth Sukses", meski profil belum ada)
         // agar OAuthCallback tahu tokennya valid.
         return true; 
      }
      
      // Jika error 401 (Token Invalid), baru kita return false
      if (error.response && error.response.status === 401) {
          console.log('[AUTH] Token invalid, removing...');
          localStorage.removeItem('token');
          setUser(null);
      }
      return false;
    }
  };

  // Cek Auth saat aplikasi dibuka
  useEffect(() => {
    const initAuth = async () => {
      console.log('[AUTH] initAuth() called');
      const token = localStorage.getItem('token');
      console.log('[AUTH] Token on init:', token ? 'exists' : 'missing');
      if (token) {
        await fetchUserProfile();
      }
      setLoading(false);
      console.log('[AUTH] initAuth() completed, loading set to false');
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('[AUTH] login() called with email:', email);
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      console.log('[AUTH] login response, token:', access_token ? 'received' : 'missing');

      localStorage.setItem('token', access_token);
      console.log('[AUTH] Token saved to localStorage');
      
      await fetchUserProfile(); // Ambil profil segera
      console.log('[AUTH] fetchUserProfile completed');

      return { success: true };
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Gagal login.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        confirm_password: userData.password
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Gagal mendaftar.' 
      };
    }
  };

// src/contexts/AuthContext.js

// ... kode sebelumnya ...

  const loginWithGoogle = async () => {
    try {
      // 1. Request ke backend untuk mendapatkan URL Login (bukan redirect langsung)
      // Gunakan instance 'api' yang sudah ada agar base URL otomatis ter-handle
      const response = await api.get('/auth/google/login'); 
      
      // 2. Ambil login_url dari JSON response backend
      const { login_url } = response.data;

      // 3. Lakukan redirect di browser menggunakan URL dari Google tersebut
      if (login_url) {
        window.location.href = login_url;
      }
    } catch (error) {
      console.error("Gagal inisialisasi Google Login:", error);
      // Opsional: Tampilkan toast error disini
    }
  };

// ... sisa kode ...

  const uploadAvatar = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post('/profile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  };

  // const updateProfile = async (profileData) => {
  //   try {
  //     // Format skill menjadi string sesuai backend API
  //     let skillString = "";
  //     if (Array.isArray(profileData.skills)) {
  //       skillString = profileData.skills.join(',');
  //     } else if (typeof profileData.skills === 'string') {
  //       skillString = profileData.skills;
  //     }

  //     const payload = {
  //       name: profileData.name,
  //       birthdate: profileData.birthdate,
  //       role: profileData.role,
  //       skill: skillString,
  //       pict: profileData.avatarUrl || ""
  //     };

  //     console.log("Sending profile payload:", payload); // Debug log

  //     if (user?.profileComplete) {
  //        await api.put('/profile/', payload);
  //     } else {
  //        await api.post('/profile/', payload);
  //     }

  //     await fetchUserProfile(); // Refresh data
  //     return { success: true };
  //   } catch (error) {
  //     console.error("Update profile error:", error);
  //     throw error;
  //   }
  // };

  const updateProfile = async (profileData) => {
  try {
    let skillString = "";
    if (Array.isArray(profileData.skills)) {
      skillString = profileData.skills.join(',');
    } else if (typeof profileData.skills === 'string') {
      skillString = profileData.skills;
    }

    const payload = {
      name: profileData.name,
      birthdate: profileData.birthdate,
      role: profileData.role,
      skill: skillString,
      pict: profileData.avatarUrl || ""
    };

    console.log("Sending profile payload:", payload);

    if (user?.profileComplete) {
      await api.put('/profile/', payload);
    } else {
      await api.post('/profile/', payload);

      // 🔥 PENTING: SET STATUS PROFILE SUDAH ADA
      setUser(prev => ({
        ...prev,
        profileComplete: true
      }));
    }

    await fetchUserProfile();
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      updateProfile,
      uploadAvatar,
      fetchUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};