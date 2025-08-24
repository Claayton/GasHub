import { useCallback } from 'react';
import { Alert } from 'react-native';
import { orderService } from '../services/orderService';

export const useOrderSubmission = () => {
  const submitOrder = useCallback(async (orderData, userId) => {
    try {
      const result = await orderService.createOrder(orderData, userId);
      return result;
    } catch (e) {
      console.error('Erro ao adicionar pedido: ', e);
      return { 
        success: false, 
        message: 'Não foi possível adicionar o pedido.' 
      };
    }
  }, []);

  return { submitOrder };
};