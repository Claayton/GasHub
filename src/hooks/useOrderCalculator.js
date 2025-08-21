import { useMemo } from 'react';

export const useOrderCalculator = (products) => {
  const totalValue = useMemo(() => {
    const sum = products.reduce((acc, product) => {
      const price = parseFloat(product.price.replace('R$', '').replace(',', '.'));
      const quantity = parseInt(product.quantity, 10);
      return acc + (isNaN(price) || isNaN(quantity) ? 0 : price * quantity);
    }, 0);
    
    return {
      raw: sum,
      formatted: sum.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    };
  }, [products]);

  return { totalValue };
};