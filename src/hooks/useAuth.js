// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase/config'; // Importando do seu arquivo

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifica se o auth foi inicializado
    if (!auth) {
      setError('Firebase Auth não foi inicializado');
      setLoading(false);
      return;
    }

    // Escuta mudanças no estado de autenticação
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

    // Cleanup function
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError(error.message);
    }
  };

  return { user, loading, error, logout };
};