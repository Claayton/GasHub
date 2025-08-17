import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Função para formatar valor em BRL
const formatCurrency = (value) => {
  const numericValue = parseInt(value.replace(/[\D]/g, ''), 10);
  if (isNaN(numericValue)) return '';
  return (numericValue / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Cria produto padrão
const createDefaultProduct = () => ({
  id: Date.now(),
  name: 'Botijão de 13kg',
  quantity: 1,
});

export default function AddOrderScreen() {
  const [orderData, setOrderData] = useState({
    customerName: '',
    address: '',
    paymentMethod: 'Dinheiro',
    pendingValue: '',
    dueDate: new Date(),
  });
  const [products, setProducts] = useState([createDefaultProduct()]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => setIsLoading(false));
    return () => unsubscribe();
  }, []);

  const handleAddProduct = () => setProducts([...products, createDefaultProduct()]);

  const handleRemoveProduct = (idToRemove) => {
    if (products.length > 1) setProducts(products.filter(p => p.id !== idToRemove));
  };

  const handleProductChange = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleQuantityChange = (id, amount) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newQty = p.quantity + amount;
        return { ...p, quantity: Math.max(1, newQty) };
      }
      return p;
    }));
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || orderData.dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setOrderData({ ...orderData, dueDate: currentDate });
  };

  const handleAddOrder = async () => {
    setIsSubmitting(true);

    if (!orderData.customerName.trim() || !orderData.address.trim()) {
      Alert.alert('Erro', 'Nome do cliente e Endereço são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    for (const product of products) {
      if (!product.name || product.quantity < 1) {
        Alert.alert('Erro', 'Preencha o nome e a quantidade de todos os produtos.');
        setIsSubmitting(false);
        return;
      }
    }

    if (!orderData.pendingValue.trim()) {
      Alert.alert('Erro', 'O valor é obrigatório.');
      setIsSubmitting(false);
      return;
    }

    try {
      const sanitizedProducts = products.map(p => ({ name: p.name, quantity: p.quantity }));
      const userId = auth.currentUser?.uid || 'anonymous';

      const newOrder = {
        customerName: orderData.customerName,
        address: orderData.address,
        products: sanitizedProducts,
        paymentMethod: orderData.paymentMethod,
        pendingValue: orderData.pendingValue,
        timestamp: new Date().toISOString(),
        userId,
        status: 'pendente',
      };

      if (orderData.paymentMethod === 'Fiado') {
        newOrder.dueDate = orderData.dueDate.toISOString();
      }

      await addDoc(collection(db, 'pedidos'), newOrder);

      Alert.alert('Sucesso', 'Pedido adicionado com sucesso!');

      setOrderData({
        customerName: '',
        address: '',
        paymentMethod: 'Dinheiro',
        pendingValue: '',
        dueDate: new Date(),
      });
      setProducts([createDefaultProduct()]);
    } catch (e) {
      console.error('Erro ao adicionar pedido: ', e);
      Alert.alert('Erro', 'Não foi possível adicionar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.label}>Nome do Cliente</Text>
        <TextInput
          style={styles.input}
          value={orderData.customerName}
          onChangeText={(text) => setOrderData({ ...orderData, customerName: text })}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={orderData.address}
          onChangeText={(text) => setOrderData({ ...orderData, address: text })}
        />

        <Text style={styles.label}>Forma de Pagamento</Text>
        {Platform.OS === 'web' ? (
          <select
            value={orderData.paymentMethod}
            onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
            style={styles.pickerWeb}
          >
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão</option>
            <option value="Pix">Pix</option>
            <option value="Fiado">Fiado</option>
          </select>
        ) : (
          <Picker
            selectedValue={orderData.paymentMethod}
            style={styles.picker}
            onValueChange={(itemValue) => setOrderData({ ...orderData, paymentMethod: itemValue })}
          >
            <Picker.Item label="Dinheiro" value="Dinheiro" />
            <Picker.Item label="Cartão" value="Cartão" />
            <Picker.Item label="Pix" value="Pix" />
            <Picker.Item label="Fiado" value="Fiado" />
          </Picker>
        )}

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={orderData.pendingValue}
          onChangeText={(text) => setOrderData({ ...orderData, pendingValue: formatCurrency(text) })}
        />

        {orderData.paymentMethod === 'Fiado' && (
          <>
            <Text style={styles.label}>Data de Vencimento</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={orderData.dueDate.toISOString().substring(0, 10)}
                onChange={(e) => setOrderData({ ...orderData, dueDate: new Date(e.target.value) })}
                style={styles.inputWebDate}
              />
            ) : (
              <View>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateButtonText}>{orderData.dueDate.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={orderData.dueDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
            )}
          </>
        )}
      </View>

      {products.map((product, index) => (
        <View key={product.id} style={styles.productCard}>
          <Text style={styles.productLabel}>Produto {index + 1}</Text>
          {products.length > 1 && (
            <TouchableOpacity style={styles.removeProductButton} onPress={() => handleRemoveProduct(product.id)}>
              <Text style={styles.removeProductButtonText}>Remover</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Nome do Produto</Text>
          {Platform.OS === 'web' ? (
            <select
              value={product.name}
              onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
              style={styles.pickerWeb}
            >
              <option value="Botijão de 13kg">Botijão de 13kg</option>
              <option value="Botijão de 5kg">Botijão de 5kg</option>
              <option value="Água Mineral">Água Mineral</option>
            </select>
          ) : (
            <Picker
              selectedValue={product.name}
              style={styles.picker}
              onValueChange={(itemValue) => handleProductChange(product.id, 'name', itemValue)}
            >
              <Picker.Item label="Botijão de 13kg" value="Botijão de 13kg" />
              <Picker.Item label="Botijão de 5kg" value="Botijão de 5kg" />
              <Picker.Item label="Água Mineral" value="Água Mineral" />
            </Picker>
          )}

          <Text style={styles.label}>Quantidade</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => handleQuantityChange(product.id, -1)} disabled={product.quantity <= 1}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{product.quantity}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={() => handleQuantityChange(product.id, 1)}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
        <Text style={styles.addProductButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleAddOrder} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>{isSubmitting ? 'Adicionando...' : 'Adicionar Pedido'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  inputWebDate: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
    color: '#555',
  },
  picker: {
    height: 'auto', // Alterado para auto
    width: '100%',
    marginTop: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8, // Adicionado padding vertical
  },
  pickerWeb: {
    height: 'auto', // Alterado para auto
    width: '100%',
    marginTop: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    paddingVertical: 12, // Adicionado padding vertical
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
