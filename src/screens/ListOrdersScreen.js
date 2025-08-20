import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { formatarValor } from '../utils/formatters';
import Icon from 'react-native-vector-icons/FontAwesome5';
import OrderCard from '../components/OrderCard';
import { useOrders } from '../hooks/useOrder';

export default function ListOrdersScreen({ navigation }) {

  const { pedidos, loading } = useOrders();

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

  // ✅ RenderItem simplificado!
  const renderItem = ({ item }) => <OrderCard item={item} />;

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
  // ❌ REMOVE todos os estilos do card daqui!
});