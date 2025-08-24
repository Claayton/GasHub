// services/receivablesService.js
import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase/config';

export const receivablesService = {
  // 1. Ouvir pedidos fiados em tempo real
  listenToReceivables: (onSuccess, onError) => {
    try {
      const pedidosRef = collection(db, 'pedidos');
      const q = query(pedidosRef, where('paymentMethod', '==', 'Fiado'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const pedidos = [];
          snapshot.forEach((documento) => {
            pedidos.push({
              id: documento.id,
              ...documento.data()
            });
          });
          onSuccess(pedidos);
        },
        (error) => {
          console.log('Erro ao buscar fiados:', error);
          if (onError) onError(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.log('Erro no listenToReceivables:', error);
      if (onError) onError(error);
      return () => {}; // Retorna função vazia pra não quebrar
    }
  },

  // 2. Marcar pedido como pago
  markAsPaid: async (pedidoId) => {
    try {
      const pedidoRef = doc(db, 'pedidos', pedidoId);
      
      await updateDoc(pedidoRef, {
        paymentMethod: 'Pago',
        pendingValue: 0,
        dueDate: null,
        paymentDate: new Date().toISOString()
      });
      
      return { success: true, message: 'Pedido marcado como pago!' };
    } catch (error) {
      console.log('Erro ao marcar como pago:', error);
      return { success: false, message: 'Erro ao marcar como pago.' };
    }
  }
};