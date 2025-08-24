import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const DashboardFilters = ({ filters, onUpdateFilters }) => {
  const dateOptions = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mês' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pagos', label: 'Pagos' },
    { value: 'fiados', label: 'Fiados' },
    { value: 'pendentes', label: 'Pendentes' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtros</Text>
      
      {/* Filtro por período */}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Período:</Text>
        <View style={styles.optionsRow}>
          {dateOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                filters.dateRange === option.value && styles.optionButtonActive
              ]}
              onPress={() => onUpdateFilters({ dateRange: option.value })}
            >
              <Text style={[
                styles.optionText,
                filters.dateRange === option.value && styles.optionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filtro por status */}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.optionsRow}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                filters.status === option.value && styles.optionButtonActive
              ]}
              onPress={() => onUpdateFilters({ status: option.value })}
            >
              <Text style={[
                styles.optionText,
                filters.status === option.value && styles.optionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Busca por cliente */}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Buscar cliente:</Text>
        <TextInput
          style={styles.input}
          value={filters.customerName}
          onChangeText={(text) => onUpdateFilters({ customerName: text })}
          placeholder="Digite o nome do cliente"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default DashboardFilters;