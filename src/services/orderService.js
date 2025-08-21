import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';

export const orderService = {
  async createOrder(orderData) {
    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      
      const newOrder = {
        ...orderData,
        userId,
        timestamp: new Date().toISOString(),
        status: 'pendente',
      };

      const docRef = await addDoc(collection(db, 'pedidos'), newOrder);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return { success: false, error };
    }
  },

  // Futuramente pode adicionar mais métodos:
  // getOrders, updateOrder, deleteOrder, etc.
};