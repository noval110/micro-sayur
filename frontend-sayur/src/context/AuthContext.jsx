import React, {
  createContext,
  useContext,
  useState
} from 'react';

import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({
  children
}) => {
  const [user, setUser] =
    useState(() => {
      try {
        const savedUser =
          localStorage.getItem(
            'sayur_user'
          );

        return savedUser
          ? JSON.parse(savedUser)
          : null;

      } catch {
        return null;
      }
    });

  const [token, setToken] =
    useState(
      () =>
        localStorage.getItem(
          'sayur_token'
        ) || ''
    );

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password
  ) => {
    try {
      setLoading(true);

      const response =
        await api.post(
          '/users/signin',
          {
            email,
            password
          }
        );

      const responseData =
        response.data?.data;

      const accessToken =
        responseData?.access_token;

      if (!accessToken) {
        throw new Error(
          'Token login tidak ditemukan dari server.'
        );
      }

      const userData = {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role,
        phone: responseData.phone,
        photo: responseData.photo,
        lat: responseData.lat,
        lng: responseData.lng
      };

      // Simpan ke state
      setToken(accessToken);
      setUser(userData);

      // Simpan ke localStorage
      localStorage.setItem(
        'sayur_token',
        accessToken
      );

      localStorage.setItem(
        'sayur_user',
        JSON.stringify(
          userData
        )
      );

      return {
        success: true,
        user: userData,
        token: accessToken
      };

    } catch (err) {
      console.error(
        'Login error:',
        err.response?.data ||
          err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.massage ||
        err.message ||
        'Login gagal. Periksa email dan password.';

      throw new Error(message);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      setLoading(true);

      const response =
        await api.post(
          '/users/signup',
          {
            name,
            email,
            password,

            password_confirmation:
              password
          }
        );

      return response.data;

    } catch (err) {
      console.error(
        'Register error:',
        err.response?.data ||
          err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.massage ||
        err.message ||
        'Pendaftaran gagal.';

      throw new Error(message);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    setUser(null);
    setToken('');

    localStorage.removeItem(
      'sayur_token'
    );

    localStorage.removeItem(
      'sayur_user'
    );
  };

  // ==========================================
  // AUTH STATE
  // ==========================================

  const isAuthenticated =
    Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,

        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);