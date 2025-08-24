import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useReceivables } from '../hooks/useReceivables';

export default function FiadoScreen() {
  const {
    pedidos: fiadoPedidos,
    carregando: loading,
    erro,
    marcarComoPago,
    calcularTotalFiados,
    temPedidos
  } = useReceivables();

  const [processandoPagamento, setProcessandoPagamento] = useState(null);

  const handleMarkAsPaid = async (pedidoId, customerName) => {
    setProcessandoPagamento(pedidoId);
    
    Alert.alert(
      'Marcar como Pago',
      `Tem certeza que deseja marcar o pedido de ${customerName} como pago?`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => setProcessandoPagamento(null)
        },
        {
          text: 'Marcar como Pago',
          onPress: async () => {
            try {
              const resultado = await marcarComoPago(pedidoId);
              
              if (resultado.success) {
                Alert.alert('Sucesso', resultado.message);
              } else {
                Alert.alert('Erro', resultado.message);
              }
            } catch (error) {
              console.error('Erro ao marcar como pago: ', error);
              Alert.alert('Erro', 'Não foi possível marcar o pedido como pago.');
            } finally {
              setProcessandoPagamento(null);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value) => {
    if (value === null || typeof value === 'undefined' || value === 0) return 'R$ 0,00';
    
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numericValue)) {
      console.warn('Invalid value for currency formatting:', value);
      return 'R$ 0,00';
    }
    
    return `R$ ${numericValue.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Não informado';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando fiados...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erro ao carregar pedidos</Text>
        <Text style={styles.errorSubText}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Fixo - NOVO ESTILO */}
      <View style={styles.headerFixo}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            {fiadoPedidos.length} pedidos fiados
          </Text>
          <Text style={styles.headerText}>
            Total: {formatCurrency(calcularTotalFiados())}
          </Text>
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <FlatList
          data={fiadoPedidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleMarkAsPaid(item.id, item.customerName)} 
              style={styles.card}
              disabled={processandoPagamento === item.id}
            >
              <View style={styles.cardContent}>
                <Text style={styles.clientName}>{item.customerName || 'Cliente não informado'}</Text>
                <Text style={styles.fiadoText}>💰 {formatCurrency(item.pendingValue)}</Text>
                <Text style={styles.fiadoText}>📅 Vencimento: {formatDate(item.dueDate)}</Text>
              </View>
              <View style={[
                styles.paidButton,
                processandoPagamento === item.id && styles.paidButtonDisabled
              ]}>
                {processandoPagamento === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.paidButtonText}>Pagar</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum pedido fiado encontrado
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: '#b94a48',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // NOVO HEADER - igual ao ListOrders
  headerFixo: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // CONTEÚDO
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  // CARD (mantido seu estilo original)
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  fiadoText: {
    fontSize: 14,
    color: '#b94a48',
    fontWeight: '600',
    marginBottom: 2,
  },
  paidButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    marginLeft: 10,
  },
  paidButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 30, 
    color: '#666',
    fontSize: 16,
  },
});