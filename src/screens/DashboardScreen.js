import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useDashboard } from '../hooks/useDashboard';
import DashboardFilters from '../components/DashboardFilters';

export default function DashboardScreen() {
  const { orders, metrics, filters, loading, updateFilters } = useDashboard();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ✅ AGORA USA O COMPONENTE DashboardFilters */}
      <DashboardFilters 
        filters={filters} 
        onUpdateFilters={updateFilters} 
      />

      {/* Seção de Métricas */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>📊 Métricas do Período</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="clipboard-list" size={24} color="#007bff" />
            <Text style={styles.metricValue}>{metrics.totalPedidos || 0}</Text>
            <Text style={styles.metricLabel}>Total Pedidos</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="money-bill-wave" size={24} color="#28a745" />
            <Text style={styles.metricValue}>
              R$ {(metrics.totalValor || 0).toFixed(2)}
            </Text>
            <Text style={styles.metricLabel}>Valor Total</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="clock" size={24} color="#ffc107" />
            <Text style={styles.metricValue}>{metrics.totalFiados || 0}</Text>
            <Text style={styles.metricLabel}>Fiados</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="check-circle" size={24} color="#28a745" />
            <Text style={styles.metricValue}>{metrics.totalPagos || 0}</Text>
            <Text style={styles.metricLabel}>Pagos</Text>
          </View>
        </View>

        {/* Métricas Adicionais */}
        <View style={styles.additionalMetrics}>
          <View style={styles.additionalMetric}>
            <Text style={styles.additionalMetricLabel}>Média por Pedido:</Text>
            <Text style={styles.additionalMetricValue}>
              R$ {(metrics.mediaPedido || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.additionalMetric}>
            <Text style={styles.additionalMetricLabel}>Taxa de Conversão:</Text>
            <Text style={styles.additionalMetricValue}>
              {(metrics.taxaConversao || 0).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de Pedidos */}
      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>
          📋 Pedidos ({orders.length || 0})
        </Text>
        
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderClient}>{order.customerName || 'Cliente não informado'}</Text>
              <Text style={styles.orderValue}>
                R$ {(order.totalValue || 0).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.orderDetails}>
              <Text style={styles.orderDate}>
                📅 {order.timestamp ? new Date(order.timestamp).toLocaleDateString('pt-BR') : 'Data não informada'}
              </Text>
              <Text style={[
                styles.orderStatus,
                order.paymentMethod === 'Fiado' ? styles.statusFiado : styles.statusPago
              ]}>
                {order.paymentMethod === 'Fiado' ? '⏰ Fiado' : '✅ Pago'}
              </Text>
            </View>

            {order.products && (
              <Text style={styles.orderProducts}>
                🛒 {order.products.length} produto(s)
              </Text>
            )}
          </View>
        ))}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            <Text style={styles.emptySubtext}>
              Tente ajustar os filtros ou período selecionado
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metricsSection: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  additionalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  additionalMetric: {
    alignItems: 'center',
  },
  additionalMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  additionalMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ordersSection: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 30,
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusFiado: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusPago: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  orderProducts: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
