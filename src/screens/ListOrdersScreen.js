import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ListOrdersScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');

    const unsubscribe = onSnapshot(
      pedidosRef,
      (querySnapshot) => {
        const fetchedPedidos = [];
        querySnapshot.forEach((doc) => {
          fetchedPedidos.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Ordenar os pedidos em memória por timestamp mais recente
        fetchedPedidos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </SafeAreaView>
    );
  }

  // Filtra os pedidos
  const pedidosFiltrados = pedidos.filter((item) => {
    if (filtro === 'Todos') return true;
    if (filtro === 'Fiados') return item.paymentMethod === 'Fiado';
    if (filtro === 'Pagos') return item.paymentMethod !== 'Fiado';
  });

  const renderItem = ({ item }) => {
  const isFiado = item.paymentMethod === 'Fiado';
  const valorExibir = item.pendingValue || item.totalValue || '0,00';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.customerName}</Text>
        <View style={[styles.badge, { backgroundColor: isFiado ? '#f0ad4e' : '#5cb85c' }]}>
          <Text style={styles.badgeText}>{item.paymentMethod}</Text>
        </View>
      </View>

      {/* Lista de produtos */}
      <View style={styles.productsList}>
        {item.products.map((product, index) => (
          <Text key={index} style={styles.productText}>
            • {product.name} ({product.quantity} un.)
          </Text>
        ))}
      </View>

      <Text style={styles.addressText}>{item.address}</Text>

      {/* Exibir valor para todos */}
      <Text style={styles.fiadoText}>💰 Valor: R$ {valorExibir}</Text>

      {/* Info extra só para Fiado */}
      {isFiado && item.dueDate && (
        <Text style={styles.fiadoText}>📅 Vencimento: {new Date(item.dueDate).toLocaleDateString()}</Text>
      )}

      <Text style={styles.dateText}>Pedido em: {new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );
};


  return (
    <SafeAreaView style={styles.container}>
      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: '#007bff' }]}
          onPress={() => navigation.navigate('AddOrder')}
        >
          <Icon name="plus" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>

        {/* Botão para "Fiados" agora é apenas um filtro */}
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: '#f0ad4e' }]}
          onPress={() => setFiltro('Fiados')}
        >
          <Icon name="money-bill-wave" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Fiados</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro */}
      <View style={styles.filterContainer}>
        {['Todos', 'Pagos', 'Fiados'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.filterButton, filtro === tipo && styles.filterButtonActive]}
            onPress={() => setFiltro(tipo)}
          >
            <Text style={[styles.filterText, filtro === tipo && styles.filterTextActive]}>
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>
            Nenhum pedido encontrado
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  customButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  productsList: {
    marginBottom: 4,
  },
  productText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  fiadoInfo: {
    marginTop: 6,
  },
  fiadoText: {
    fontSize: 14,
    color: '#b94a48',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
});
