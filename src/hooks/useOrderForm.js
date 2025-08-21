import { useState, useCallback } from 'react';

export const useOrderForm = (initialState = {}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    paymentMethod: 'Dinheiro',
    dueDate: new Date(),
    ...initialState
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      customerName: '',
      address: '',
      paymentMethod: 'Dinheiro',
      dueDate: new Date(),
    });
  }, []);

  return {
    formData,
    showDatePicker,
    isSubmitting,
    setShowDatePicker,
    setIsSubmitting,
    updateField,
    resetForm,
    // Setters individuais para melhor performance
    setCustomerName: (value) => updateField('customerName', value),
    setAddress: (value) => updateField('address', value),
    setPaymentMethod: (value) => updateField('paymentMethod', value),
    setDueDate: (value) => updateField('dueDate', value),
  };
};