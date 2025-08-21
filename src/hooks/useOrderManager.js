import { useOrderForm } from './useOrderForm';
import { useProducts } from './useProducts';
import { useOrderValidation } from './useOrderValidation';
import { useOrderSubmission } from './useOrderSubmission';
import { useOrderCalculator } from './useOrderCalculator';
import { useAuth } from './useAuth';

export const useOrderManager = () => {
  // Todos os hooks
  const orderForm = useOrderForm();
  const products = useProducts();
  const { validateOrder } = useOrderValidation();
  const { submitOrder } = useOrderSubmission();
  const { totalValue } = useOrderCalculator(products.products);
  const auth = useAuth();

  // Função de submissão unificada
  const handleSubmitOrder = async () => {
    const validation = validateOrder(
      orderForm.formData.customerName,
      orderForm.formData.address,
      products.products
    );
    
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    // Preparar dados
    const sanitizedProducts = products.products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      price: parseFloat(p.price.replace('R$', '').replace(',', '.')),
    }));

    const orderData = {
      customerName: orderForm.formData.customerName,
      address: orderForm.formData.address,
      products: sanitizedProducts,
      paymentMethod: orderForm.formData.paymentMethod,
      totalValue: totalValue.raw,
    };

    // Adicionar dados de fiado se necessário
    if (orderForm.formData.paymentMethod === 'Fiado') {
      orderData.dueDate = orderForm.formData.dueDate.toISOString();
      orderData.pendingValue = totalValue.raw;
    }

    // Submeter
    return await submitOrder(
      orderData,
      auth.user?.uid,
      orderForm.resetForm,
      products.resetProducts,
      orderForm.setIsSubmitting
    );
  };

  return {
    // Dados
    formData: orderForm.formData,
    products: products.products,
    totalValue,
    user: auth.user,
    
    // Estados
    authLoading: auth.loading,
    isSubmitting: orderForm.isSubmitting,
    showDatePicker: orderForm.showDatePicker,
    
    // Ações
    setCustomerName: orderForm.setCustomerName,
    setAddress: orderForm.setAddress,
    setPaymentMethod: orderForm.setPaymentMethod,
    setDueDate: orderForm.setDueDate,
    setShowDatePicker: orderForm.setShowDatePicker,
    
    addProduct: products.addProduct,
    removeProduct: products.removeProduct,
    updateProduct: products.updateProduct,
    updateQuantity: products.updateQuantity,
    
    handleSubmitOrder,
    validateOrder,
  };
};