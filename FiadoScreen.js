import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function FiadoScreen() {
  const [fiadoPedidos, setFiadoPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('formaPagamento', '==', 'Fiado'));

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
                formaPagamento: 'Pago',
                valorPendente: null,
                dataVencimento: null,
                dataPagamento: new Date().toISOString(),
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

  return (
    <View style={styles.container}>
      <FlatList
        data={fiadoPedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMarkAsPaid(item.id)} style={styles.card}>
            <View>
              <Text style={styles.clientName}>{item.nome}</Text>
              <Text style={styles.fiadoText}>💰 R$ {item.valorPendente}</Text>
              <Text style={styles.fiadoText}>📅 Vencimento: {item.dataVencimento}</Text>
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
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
