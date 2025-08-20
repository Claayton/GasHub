import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { formatarValor, formatarData, formatarDataHora } from '../utils/formatters';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ListOrdersScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filtrarPedidosHoje = (pedidos) => {
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    return pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.timestamp);
      return dataPedido >= inicioDia;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  const pedidosFiltrados = filtrarPedidosHoje(pedidos);

  const calcularTotaisDetalhados = () => {
    let totalPedidos = pedidosFiltrados.length;
    let totalValor = 0;
    let pedidosPagos = 0;
    let pedidosFiados = 0;

    pedidosFiltrados.forEach(pedido => {
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

    return { totalPedidos, totalValor, pedidosPagos, pedidosFiados };
  };

  const { totalPedidos, totalValor, pedidosPagos, pedidosFiados } = calcularTotaisDetalhados();

  const renderItem = ({ item }) => {
    const isFiado = item.paymentMethod === 'Fiado';
    const valorExibir = item.pendingValue || item.totalValue || 0;
    const statusColor = isFiado ? '#d9534f' : '#28a745';
    const statusIcon = isFiado ? '⏰' : '✅';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.clientName}>{item.customerName}</Text>
          <View style={[styles.badge, { backgroundColor: isFiado ? '#f0ad4e' : '#5cb85c' }]}>
            <Text style={styles.badgeText}>{item.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.productsList}>
          {item.products.map((product, index) => (
            <Text key={index} style={styles.productText}>
              • {product.name} ({product.quantity} un.)
            </Text>
          ))}
        </View>

        <Text style={styles.addressText}>{item.address}</Text>

        <Text style={[styles.valorText, { color: statusColor }]}>
          {statusIcon} Valor: R$ {formatarValor(valorExibir)}
        </Text>

        {isFiado && item.dueDate && (
          <Text style={styles.fiadoText}>📅 Vencimento: {formatarData(item.dueDate)}</Text>
        )}

        <Text style={styles.dateText}>Pedido em: {formatarDataHora(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.headerFixo}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            {totalPedidos} pedidos ({pedidosPagos}💰 | {pedidosFiados}⏰)
          </Text>
          <Text style={styles.headerText}>
            Total: R$ {formatarValor(totalValor)}
          </Text>
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: '#007bff' }]}
            onPress={() => navigation.navigate('AddOrder')}
          >
            <Icon name="plus" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={pedidosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum pedido encontrado hoje
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
  content: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  customButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#007bff',
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
    fontSize: 16,
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
  valorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  fiadoText: {
    fontSize: 14,
    color: '#b94a48',
    fontWeight: '600',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
});