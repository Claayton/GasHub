import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function FiadoScreen() {
  const [fiadoPedidos, setFiadoPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');
    // Corrigido para buscar o campo "paymentMethod" que é o nome correto no Firebase
    const q = query(pedidosRef, where('paymentMethod', '==', 'Fiado'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedPedidos = [];
        querySnapshot.forEach((doc) => {
          fetchedPedidos.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setFiadoPedidos(fetchedPedidos);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar pedidos fiados: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleMarkAsPaid = (pedidoId) => {
    Alert.alert(
      'Marcar como Pago',
      'Tem certeza que deseja marcar este pedido como pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Pago',
          onPress: async () => {
            try {
              const pedidoRef = doc(db, 'pedidos', pedidoId);
              await updateDoc(pedidoRef, {
                // Corrigido para o campo "paymentMethod"
                paymentMethod: 'Pago',
                // Corrigidos os nomes dos campos para coincidir com o banco de dados
                pendingValue: null,
                dueDate: null,
                paymentDate: new Date().toISOString(),
              });
              Alert.alert('Sucesso', 'Pedido marcado como pago!');
            } catch (error) {
              console.error('Erro ao marcar como pago: ', error);
              Alert.alert('Erro', 'Não foi possível marcar o pedido como pago.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando fiados...</Text>
      </View>
    );
  }

  const formatCurrency = (value) => {
    if (value === null || typeof value === 'undefined') return 'R$ 0,00';
    // Remove o "R$" e a vírgula antes de converter para número
    const numericValue = parseFloat(String(value).replace('R$', '').replace('.', '').replace(',', '.'));
    if (isNaN(numericValue)) {
      console.warn('Invalid value for currency formatting:', value);
      return 'R$ 0,00';
    }
    return `R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={fiadoPedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMarkAsPaid(item.id)} style={styles.card}>
            <View style={styles.cardContent}>
              {/* Corrigidos os nomes dos campos exibidos e o formato de valor e data */}
              <Text style={styles.clientName}>{item.customerName}</Text>
              <Text style={styles.fiadoText}>💰 {formatCurrency(item.pendingValue)}</Text>
              <Text style={styles.fiadoText}>📅 Vencimento: {formatDate(item.dueDate)}</Text>
            </View>
            <View style={styles.paidButton}>
              <Text style={styles.paidButtonText}>Pagar</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>
            Nenhum pedido fiado encontrado
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
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
  },
    paidButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // remove alignSelf
    marginLeft: 10,
  },

  paidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
