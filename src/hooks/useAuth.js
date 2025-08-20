// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false); // Loading específico para login/register

  useEffect(() => {
    if (!auth) {
      setError('Firebase Auth não foi inicializado');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erro no auth state:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.message);
      throw error; // Importante: re-lançar o erro para a tela poder tratar
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error.message);
      throw error; // Re-lançar o erro
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError(error.message);
      throw error;
    }
  };

  return { 
    user, 
    loading, 
    authLoading, // Loading específico para auth
    error, 
    login, 
    register, 
    logout 
  };
};