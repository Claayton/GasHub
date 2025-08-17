import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ListOrdersScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, orderBy('timestamp', 'desc'));

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
        setPedidos(fetchedPedidos);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar pedidos: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos Recentes</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => navigation.navigate('AddOrder')}
          >
            <Icon name="plus" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customButton}
            onPress={() => navigation.navigate('Fiado')}
          >
            <Icon name="money-bill-wave" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Fiados</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.pedidoItem}>
            <Text style={styles.pedidoText}>Cliente: {item.nome}</Text>
            <Text style={styles.pedidoText}>Endereço: {item.endereco}</Text>
            <Text style={styles.pedidoText}>Produto: {item.produto}</Text>
            <Text style={styles.pedidoText}>Quantidade: {item.quantidade}</Text>
            <Text style={styles.pedidoText}>Pagamento: {item.formaPagamento}</Text>
            {item.formaPagamento === 'Fiado' && (
              <View>
                <Text style={styles.pedidoText}>Valor Pendente: R$ {item.valorPendente}</Text>
                <Text style={styles.pedidoText}>Vencimento: {item.dataVencimento}</Text>
              </View>
            )}
            <Text style={styles.dateText}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  customButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pedidoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pedidoText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
