import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function FiadoScreen({ navigation }) {
  const [fiadoPedidos, setFiadoPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referência para a coleção 'pedidos'
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('formaPagamento', '==', 'Fiado'));

    // Listener para buscar os pedidos fiados em tempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPedidos = [];
      querySnapshot.forEach((document) => {
        fetchedPedidos.push({
          id: document.id,
          ...document.data(),
        });
      });
      setFiadoPedidos(fetchedPedidos);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar pedidos fiados: ', error);
      setLoading(false);
    });

    // Desinscreve o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const handleMarkAsPaid = async (pedidoId) => {
    Alert.alert(
      'Marcar como Pago',
      'Tem certeza que deseja marcar este pedido como pago?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando fiados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes Fiados</Text>
      <FlatList
        data={fiadoPedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMarkAsPaid(item.id)} style={styles.fiadoItem}>
            <View>
              <Text style={styles.fiadoText}>Cliente: {item.nome}</Text>
              <Text style={styles.fiadoText}>Valor Pendente: R$ {item.valorPendente}</Text>
              <Text style={styles.fiadoText}>Vencimento: {item.dataVencimento}</Text>
            </View>
            <View style={styles.paidButton}>
              <Text style={styles.paidButtonText}>Pagar</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  fiadoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fiadoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  paidButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
