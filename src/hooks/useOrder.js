import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config'

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const pedidosRef = collection(db, 'pedidos');
  
      const unsubscribe = onSnapshot(
        pedidosRef,
        (querySnapshot) => {
          const fetchedPedidos = [];
          querySnapshot.forEach((doc) => {
            fetchedPedidos.push({
              id: doc.id,
              ...doc.data(),
            });
          });
  
          fetchedPedidos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setPedidos(fetchedPedidos);
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao buscar pedidos: ', error);
          setLoading(false);
        }
      );
  
      return () => unsubscribe();
    }, []);

  return { pedidos, loading };
};
