import { useCallback, useMemo, memo } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatCurrency } from '../utils/formatters';
import { useOrderManager } from '../hooks/useOrderManager';

// Componente de produto memorizado
const ProductItem = memo(({ product, index, onRemove, onChange, onQuantityChange, canRemove }) => {
  return (
    <View style={styles.productCard}>
      <Text style={styles.productLabel}>Produto {index + 1}</Text>
      {canRemove && (
        <TouchableOpacity style={styles.removeProductButton} onPress={() => onRemove(product.id)}>
          <Text style={styles.removeProductButtonText}>Remover</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Nome do Produto</Text>
      <Picker
        selectedValue={product.name}
        style={styles.picker}
        onValueChange={(itemValue) => onChange(product.id, 'name', itemValue)}
      >
        <Picker.Item label="Botijão de 13kg" value="Botijão de 13kg" />
        <Picker.Item label="Botijão de 5kg" value="Botijão de 5kg" />
        <Picker.Item label="Água Mineral" value="Água Mineral" />
      </Picker>

      <Text style={styles.label}>Quantidade</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={[styles.qtyButton, product.quantity <= 1 && styles.qtyButtonDisabled]} 
          onPress={() => onQuantityChange(product.id, -1)} 
          disabled={product.quantity <= 1}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{product.quantity}</Text>
        <TouchableOpacity 
          style={styles.qtyButton} 
          onPress={() => onQuantityChange(product.id, 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Valor Unitário</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={product.price}
        onChangeText={(text) => onChange(product.id, 'price', formatCurrency(text))}
      />
    </View>
  );
});

// Componente de seção de fiado memorizado
const FiadoSection = memo(({ dueDate, onDateChange, showDatePicker, setShowDatePicker }) => {
  return (
    <>
      <Text style={styles.label}>Data de Vencimento</Text>
      <View>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{dueDate.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
    </>
  );
});

// Tela de carregamento
const LoadingScreen = memo(() => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007bff" />
    <Text>Carregando...</Text>
  </View>
));

export default function AddOrderScreen({ navigation }) {
  const {
    formData: { customerName, address, paymentMethod, dueDate },
    products,
    totalValue,
    authLoading,
    isSubmitting,
    showDatePicker,
    setCustomerName,
    setAddress,
    setPaymentMethod,
    setDueDate,
    setShowDatePicker,
    addProduct,
    removeProduct,
    updateProduct,
    updateQuantity,
    handleSubmitOrder
  } = useOrderManager();

  const onDateChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  }, [dueDate, setDueDate, setShowDatePicker]);

  const handleAddOrder = useCallback(async () => {
    const result = await handleSubmitOrder();
    
    if (result.success) {
      Alert.alert('Sucesso', 'Pedido adicionado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            // ✅ REDIRECIONAR PARA A LISTA DE PEDIDOS
            navigation.navigate('ListOrders');
          }
        }
      ]);
    } else if (result.message) {
      Alert.alert('Erro', result.message);
    }
  }, [handleSubmitOrder, navigation]);

  // Memorizar a lista de produtos renderizada
  const productsList = useMemo(() => (
    products.map((product, index) => (
      <ProductItem
        key={product.id}
        product={product}
        index={index}
        onRemove={removeProduct}
        onChange={updateProduct}
        onQuantityChange={updateQuantity}
        canRemove={products.length > 1}
      />
    ))
  ), [products, removeProduct, updateProduct, updateQuantity]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Bloco 1: Informações do Cliente */}
      <View style={styles.card}>
        <Text style={styles.label}>Nome do Cliente</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Bloco 2: Seção de Produtos */}
      <View style={styles.productsContainer}>
        {productsList}
        <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
          <Text style={styles.addProductButtonText}>Adicionar Produto</Text>
        </TouchableOpacity>
      </View>

      {/* Bloco 3: Seção de Pagamento */}
      <View style={styles.card}>
        <Text style={styles.label}>Forma de Pagamento</Text>
        <Picker
          selectedValue={paymentMethod}
          style={styles.picker}
          onValueChange={setPaymentMethod}
        >
          <Picker.Item label="Dinheiro" value="Dinheiro" />
          <Picker.Item label="Cartão" value="Cartão" />
          <Picker.Item label="Pix" value="Pix" />
          <Picker.Item label="Fiado" value="Fiado" />
        </Picker>

        <Text style={styles.label}>Valor Total do Pedido</Text>
        <Text style={styles.totalValueText}>{totalValue.formatted}</Text>

        {paymentMethod === 'Fiado' && (
          <FiadoSection
            dueDate={dueDate}
            onDateChange={onDateChange}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        )}
      </View>

      {/* Botão de Adicionar Pedido */}
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleAddOrder} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Adicionar Pedido</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },
  productsContainer: {
    marginBottom: 16
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginTop: 10,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    color: '#555',
  },
  productLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  totalValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 5,
    padding: 10,
    backgroundColor: '#e6f2ff',
    borderRadius: 8,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginTop: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  qtyButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  qtyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  addProductButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  removeProductButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
  },
  removeProductButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  dateButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  dateButtonText: {
    color: '#555',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#a9a9a9',
  },
});