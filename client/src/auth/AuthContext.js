 import React, { createContext, useState, useEffect, useContext } from 'react';
    import axios from 'axios';
    import { useNavigate } from 'react-router-dom';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();

      const API_URL = 'https://project-management-app-1-8540.onrender.com/api/v1';

 
      const authApi = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
      });

     
      authApi.interceptors.request.use(
        config => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        error => Promise.reject(error)
      );

 
      useEffect(() => {
        const loadUser = async () => {
          const token = localStorage.getItem('token');
          if (token) {
            try {
         
              const res = await authApi.get('/auth/me');
              setUser(res.data.data); 
            } catch (error) {
              console.error('Failed to authenticate user token:', error);
              localStorage.removeItem('token');
              setUser(null);
            }
          }
          setLoading(false);
        };
        loadUser();
      }, []);

      const login = async (email, password) => {
        try {
          const res = await axios.post(`${API_URL}/auth/login`, { email, password });
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user); 
          navigate('/');
        } catch (error) {
          console.error('Login failed:', error.response?.data?.error || error.message);
          throw error; 
        }
      };

      const register = async (name, email, password, role = 'Team Member') => {
        try {
          const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user);
          navigate('/');
        } catch (error) {
          console.error('Registration failed:', error.response?.data?.error || error.message);
          throw error;
        }
      };

      const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      };

      const hasRole = (requiredRoles) => {
        if (!user) return false;
        if (typeof requiredRoles === 'string') {
          return user.role === requiredRoles;
        }
        return requiredRoles.includes(user.role);
      };

      return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, hasRole, authApi }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);