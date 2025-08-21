import { useCallback } from 'react';
import { Alert } from 'react-native';
import { orderService } from '../services/orderService';

export const useOrderSubmission = () => {
  const submitOrder = useCallback(async (orderData, userId, products, resetForm, resetProducts, setIsSubmitting) => {
    setIsSubmitting(true);

    try {
      const result = await orderService.createOrder(orderData, userId);

      if (result.success) {
        Alert.alert('Sucesso', 'Pedido adicionado com sucesso!');
        resetForm();
        resetProducts();
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o pedido.');
      }

      return result;
    } catch (e) {
      console.error('Erro ao adicionar pedido: ', e);
      Alert.alert('Erro', 'Não foi possível adicionar o pedido.');
      return { success: false, error: e };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitOrder };
};