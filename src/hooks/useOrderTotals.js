import { useMemo } from 'react';
import { formatarValor } from '../utils/formatters';

export const useOrderTotals = (pedidos) => {
  const totais = useMemo(() => {
    let totalPedidos = pedidos.length;
    let totalValor = 0;
    let pedidosPagos = 0;
    let pedidosFiados = 0;

    pedidos.forEach(pedido => {
      const valor = pedido.pendingValue || pedido.totalValue || 0;
      const valorNumerico = typeof valor === 'string' ? 
        parseFloat(valor.replace(',', '.')) : 
        Number(valor);
      
      totalValor += valorNumerico;
      
      if (pedido.paymentMethod === 'Fiado') {
        pedidosFiados++;
      } else {
        pedidosPagos++;
      }
    });

    return { 
      totalPedidos, 
      totalValor, 
      pedidosPagos, 
      pedidosFiados,
      totalValorFormatado: formatarValor(totalValor)
    };
  }, [pedidos]); // ✅ Recalcula apenas quando pedidos mudam

  return totais;
};