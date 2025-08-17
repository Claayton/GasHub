import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export default function AddOrderScreen() {
  const [orderData, setOrderData] = useState({
    nome: '',
    endereco: '',
    produto: 'Botijão de 13kg',
    quantidade: '',
    formaPagamento: 'Dinheiro',
    valorPendente: '',
    dataVencimento: ''
  });

  const handleAddOrder = async () => {
    if (!orderData.nome || !orderData.endereco || !orderData.quantidade) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return;
    }

    try {
      await addDoc(collection(db, 'pedidos'), {
        ...orderData,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser.uid,
        status: 'pendente',
      });
      Alert.alert('Sucesso', 'Pedido adicionado com sucesso!');
      setOrderData({
        nome: '',
        endereco: '',
        produto: 'Botijão de 13kg',
        quantidade: '',
        formaPagamento: 'Dinheiro',
        valorPendente: '',
        dataVencimento: ''
      });
    } catch (e) {
      console.error('Erro ao adicionar pedido: ', e);
      Alert.alert('Erro', 'Não foi possível adicionar o pedido.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>

      <View style={styles.card}>
        <Text style={styles.label}>Nome do Cliente</Text>
        <TextInput
          style={styles.input}
          value={orderData.nome}
          onChangeText={(text) => setOrderData({ ...orderData, nome: text })}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={orderData.endereco}
          onChangeText={(text) => setOrderData({ ...orderData, endereco: text })}
        />

        <Text style={styles.label}>Produto</Text>
        {Platform.OS === 'web' ? (
          <select
            value={orderData.produto}
            onChange={(e) => setOrderData({ ...orderData, produto: e.target.value })}
            style={styles.pickerWeb}
          >
            <option label="Botijão de 13kg" value="Botijão de 13kg" />
            <option label="Botijão de 5kg" value="Botijão de 5kg" />
            <option label="Água Mineral" value="Água Mineral" />
          </select>
        ) : (
          <Picker
            selectedValue={orderData.produto}
            style={styles.picker}
            onValueChange={(itemValue) => setOrderData({ ...orderData, produto: itemValue })}
          >
            <Picker.Item label="Botijão de 13kg" value="Botijão de 13kg" />
            <Picker.Item label="Botijão de 5kg" value="Botijão de 5kg" />
            <Picker.Item label="Água Mineral" value="Água Mineral" />
          </Picker>
        )}

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={orderData.quantidade}
          onChangeText={(text) => setOrderData({ ...orderData, quantidade: text })}
        />

        <Text style={styles.label}>Forma de Pagamento</Text>
        {Platform.OS === 'web' ? (
          <select
            value={orderData.formaPagamento}
            onChange={(e) => setOrderData({ ...orderData, formaPagamento: e.target.value })}
            style={styles.pickerWeb}
          >
            <option label="Dinheiro" value="Dinheiro" />
            <option label="Cartão" value="Cartao" />
            <option label="Pix" value="Pix" />
            <option label="Fiado" value="Fiado" />
          </select>
        ) : (
          <Picker
            selectedValue={orderData.formaPagamento}
            style={styles.picker}
            onValueChange={(itemValue) => setOrderData({ ...orderData, formaPagamento: itemValue })}
          >
            <Picker.Item label="Dinheiro" value="Dinheiro" />
            <Picker.Item label="Cartão" value="Cartao" />
            <Picker.Item label="Pix" value="Pix" />
            <Picker.Item label="Fiado" value="Fiado" />
          </Picker>
        )}

        {orderData.formaPagamento === 'Fiado' && (
          <>
            <Text style={styles.label}>Valor Pendente</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={orderData.valorPendente}
              onChangeText={(text) => setOrderData({ ...orderData, valorPendente: text })}
            />

            <Text style={styles.label}>Data de Vencimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={orderData.dataVencimento}
              onChangeText={(text) => setOrderData({ ...orderData, dataVencimento: text })}
            />
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleAddOrder}>
          <Text style={styles.submitButtonText}>Adicionar Pedido</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
  picker: {
    height: 40,
    width: '100%',
    marginTop: 5,
    backgroundColor: '#fff',
  },
  productCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
  },
  productLabel: {
    fontWeight: '600',
    marginBottom: 5,
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
  },
  qtyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  addProductButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  dateButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#333',
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
});
