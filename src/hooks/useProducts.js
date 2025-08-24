import { useState, useCallback } from 'react';

// Cria produto padrão com um valor inicial de 0
const createDefaultProduct = () => ({
  id: Date.now(),
  name: 'Botijão de 13kg',
  quantity: 1,
  price: 'R$ 0,00',
});

export const useProducts = (initialProducts = [createDefaultProduct()]) => {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = useCallback(() => {
    setProducts(prev => [...prev, createDefaultProduct()]);
  }, []);

  const removeProduct = useCallback((idToRemove) => {
    setProducts(prev => {
      if (prev.length > 1) {
        return prev.filter(p => p.id !== idToRemove);
      }
      return prev;
    });
  }, []);

  const updateProduct = useCallback((id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  const updateQuantity = useCallback((id, amount) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = p.quantity + amount;
        return { ...p, quantity: Math.max(1, newQty) };
      }
      return p;
    }));
  }, []);

  const resetProducts = useCallback(() => {
    setProducts([createDefaultProduct()]);
  }, []);

  return {
    products,
    addProduct,
    removeProduct,
    updateProduct,
    updateQuantity,
    resetProducts,
    setProducts
  };
};