import { View, Text, StyleSheet } from 'react-native';
import { formatarValor, formatarData } from '../utils/formatters';

const OrderCard = ({ item }) => {
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
        <Text style={styles.fiadoText}>
          📅 Vencimento: {formatarData(item.dueDate)}
        </Text>
      )}

      <Text style={styles.dateText}>
        Pedido em: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );
};

// ✅ ESTILOS VÃO JUNTO NO MESMO ARQUIVO!
const styles = StyleSheet.create({
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

export default OrderCard;