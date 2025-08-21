import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase/config';

export const orderService = {
  async createOrder(orderData, userId = 'anonymous') {
    try {      
      const newOrder = {
        ...orderData,
        userId,
        timestamp: new Date().toISOString(),
        status: 'pendente',
      };

      const docRef = await addDoc(collection(db, 'pedidos'), newOrder);
      return { 
        success: true, 
        id: docRef.id,
        message: 'Pedido criado com sucesso' 
      };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return { 
        success: false, 
        error,
        message: 'Erro ao criar pedido' 
      };
    }
  },
};