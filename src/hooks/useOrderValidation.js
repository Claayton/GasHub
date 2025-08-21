
export const useOrderValidation = () => {
  const validateOrder = (customerName, address, products) => {
    if (!customerName.trim() || !address.trim()) {
      return { isValid: false, message: 'Nome do cliente e Endereço são obrigatórios.' };
    }

    for (const product of products) {
      if (!product.name || product.quantity < 1) {
        return { isValid: false, message: 'Preencha o nome e a quantidade de todos os produtos.' };
      }
      if (parseFloat(product.price.replace('R$', '').replace(',', '.')) <= 0) {
        return { isValid: false, message: 'O valor de todos os produtos deve ser maior que zero.' };
      }
    }

    return { isValid: true, message: '' };
  };

  return { validateOrder };
};