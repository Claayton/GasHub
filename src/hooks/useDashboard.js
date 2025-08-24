import { useState, useMemo } from 'react';
import { useOrders } from './useOrder';

export const useDashboard = () => {
  const { pedidos, loading } = useOrders();
  const [filters, setFilters] = useState({
    dateRange: 'hoje',
    status: 'todos',
    sortBy: 'data',
    sortOrder: 'desc',
    startDate: null,
    endDate: null,
    customerName: ''
  });

  // Filtros aplicados
  const filteredOrders = useMemo(() => {
    let filtered = [...pedidos];
    
    // Filtro por data
    switch (filters.dateRange) {
      case 'hoje':
        const hoje = new Date();
        filtered = filtered.filter(pedido => {
          const dataPedido = new Date(pedido.timestamp);
          return dataPedido.toDateString() === hoje.toDateString();
        });
        break;
      case 'semana':
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        filtered = filtered.filter(pedido => {
          const dataPedido = new Date(pedido.timestamp);
          return dataPedido >= umaSemanaAtras;
        });
        break;
      case 'mes':
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        filtered = filtered.filter(pedido => {
          const dataPedido = new Date(pedido.timestamp);
          return dataPedido >= umMesAtras;
        });
        break;
      case 'personalizado':
        if (filters.startDate && filters.endDate) {
          filtered = filtered.filter(pedido => {
            const dataPedido = new Date(pedido.timestamp);
            return dataPedido >= filters.startDate && 
                   dataPedido <= filters.endDate;
          });
        }
        break;
      default:
        break;
    }

    // Filtro por status
    if (filters.status !== 'todos') {
      filtered = filtered.filter(pedido => {
        switch (filters.status) {
          case 'pagos': 
            return pedido.paymentStatus === 'paid';
          case 'fiados': 
            return pedido.paymentMethod === 'Fiado';
          case 'pendentes': 
            return pedido.paymentStatus === 'pending';
          default: 
            return true;
        }
      });
    }

    // Filtro por cliente
    if (filters.customerName) {
      filtered = filtered.filter(pedido =>
        pedido.customerName && 
        pedido.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (filters.sortBy) {
        case 'valor':
          valueA = a.totalValue || 0;
          valueB = b.totalValue || 0;
          break;
        case 'cliente':
          valueA = a.customerName || '';
          valueB = b.customerName || '';
          break;
        case 'data':
        default:
          valueA = new Date(a.timestamp || 0).getTime();
          valueB = new Date(b.timestamp || 0).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' 
        ? valueA > valueB ? 1 : -1 
        : valueA < valueB ? 1 : -1;
    });

    return filtered;
  }, [pedidos, filters]);

  // Métricas calculadas - CORRIGIDO com valores padrão
  const metrics = useMemo(() => {
    const total = filteredOrders.reduce((sum, pedido) => sum + (pedido.totalValue || 0), 0);
    const fiados = filteredOrders.filter(p => p.paymentMethod === 'Fiado').length;
    const pagos = filteredOrders.filter(p => p.paymentStatus === 'paid').length;
    
    // ✅ VALORES PADRÃO DEFINIDOS para evitar undefined
    return {
      totalPedidos: filteredOrders.length || 0,
      totalValor: total || 0,
      mediaPedido: filteredOrders.length ? total / filteredOrders.length : 0,
      totalFiados: fiados || 0,
      totalPagos: pagos || 0,
      taxaConversao: filteredOrders.length ? (pagos / filteredOrders.length) * 100 : 0
    };
  }, [filteredOrders]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    orders: filteredOrders,
    metrics, // ✅ Agora sempre terá valores definidos
    filters,
    loading,
    updateFilters,
  };
};