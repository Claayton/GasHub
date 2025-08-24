// hooks/useReceivables.js
import { useState, useEffect, useCallback } from 'react';
import { receivablesService } from '../services/receivablesService';

export const useReceivables = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Buscar pedidos fiados em tempo real
  useEffect(() => {
    setCarregando(true);
    
    const unsubscribe = receivablesService.listenToReceivables(
      (pedidosRecebidos) => {
        setPedidos(pedidosRecebidos);
        setCarregando(false);
        setErro(null);
      },
      (error) => {
        console.log('Erro no hook:', error);
        setErro('Falha ao carregar pedidos fiados');
        setCarregando(false);
      }
    );

    // Limpar subscription quando componente desmontar
    return () => unsubscribe();
  }, []);

  // Marcar pedido como pago
  const marcarComoPago = useCallback(async (pedidoId) => {
    try {
      const resultado = await receivablesService.markAsPaid(pedidoId);
      return resultado;
    } catch (error) {
      console.log('Erro ao marcar como pago:', error);
      return { 
        success: false, 
        message: 'Erro interno ao processar pagamento' 
      };
    }
  }, []);

  // Calcular total de fiados
  const calcularTotalFiados = useCallback(() => {
    return pedidos.reduce((total, pedido) => {
      return total + (pedido.pendingValue || 0);
    }, 0);
  }, [pedidos]);

  // Buscar pedidos por cliente
  const buscarPorCliente = useCallback((nomeCliente) => {
    return pedidos.filter(pedido => 
      pedido.customerName?.toLowerCase().includes(nomeCliente.toLowerCase())
    );
  }, [pedidos]);

  return {
    // Estado
    pedidos,
    carregando,
    erro,
    
    // Ações
    marcarComoPago,
    calcularTotalFiados,
    buscarPorCliente,
    
    // Utilitários
    temPedidos: pedidos.length > 0,
    totalFiados: calcularTotalFiados()
  };
};