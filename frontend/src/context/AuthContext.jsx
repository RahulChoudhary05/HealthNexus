import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── helpers ───────────────────────────────────────────────────────────────
  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  // ── bootstrap: restore session on reload ─────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!localStorage.getItem('access_token')) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/profile/');
        setUser(data);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [clearSession]);

  // ── register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, password2) => {
    try {
      const { data } = await api.post('/auth/register/', { name, email, password, password2 });
      localStorage.setItem('access_token',  data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      // Flatten DRF validation errors
      const raw = err.response?.data;
      let message = 'Registration failed.';
      if (raw) {
        if (raw.message) {
          message = raw.message;
        } else {
          message = Object.values(raw).flat().join(' ');
        }
      }
      return { success: false, message };
    }
  };

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      localStorage.setItem('access_token',  data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.',
      };
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch { /* ignore */ } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
