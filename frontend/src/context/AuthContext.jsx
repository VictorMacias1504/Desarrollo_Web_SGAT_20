import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sgat_token');
    const userData = localStorage.getItem('sgat_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('sgat_token');
        localStorage.removeItem('sgat_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sgat_token', data.token);
    localStorage.setItem('sgat_user', JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem('sgat_token');
    localStorage.removeItem('sgat_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
