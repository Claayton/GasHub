import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export default function AddOrderScreen({ navigation }) {
  const [orderData, setOrderData] = useState({
    nome: '',
    endereco: '',
    produto: 'Botijão de 13kg', // Exemplo de produto inicial
    quantidade: '',
    formaPagamento: 'Dinheiro',
    valorPendente: '',
    dataVencimento: ''
  });

  const handleAddOrder = async () => {
    // Validação básica dos campos
    if (!orderData.nome || !orderData.endereco || !orderData.quantidade) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return;
    }

    try {
      // Cria a coleção 'pedidos' e adiciona o documento com os dados do pedido
      const docRef = await addDoc(collection(db, 'pedidos'), {
        ...orderData,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser.uid,
        status: 'pendente', // Define um status inicial
      });
      Alert.alert('Sucesso', 'Pedido adicionado com sucesso!');

      // Limpa o formulário após a adição
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
      console.error('Erro ao adicionar documento: ', e);
      Alert.alert('Erro', 'Não foi possível adicionar o pedido.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Adicionar Pedido</Text>

      <Text style={styles.label}>Nome do Cliente:</Text>
      <TextInput
        style={styles.input}
        value={orderData.nome}
        onChangeText={(text) => setOrderData({ ...orderData, nome: text })}
      />

      <Text style={styles.label}>Endereço:</Text>
      <TextInput
        style={styles.input}
        value={orderData.endereco}
        onChangeText={(text) => setOrderData({ ...orderData, endereco: text })}
      />

      <Text style={styles.label}>Produto:</Text>
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

      <Text style={styles.label}>Quantidade:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={orderData.quantidade}
        onChangeText={(text) => setOrderData({ ...orderData, quantidade: text })}
      />

      <Text style={styles.label}>Forma de Pagamento:</Text>
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
        <View>
          <Text style={styles.label}>Valor Pendente:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={orderData.valorPendente}
            onChangeText={(text) => setOrderData({ ...orderData, valorPendente: text })}
          />
          <Text style={styles.label}>Data de Vencimento:</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={orderData.dataVencimento}
            onChangeText={(text) => setOrderData({ ...orderData, dataVencimento: text })}
          />
        </View>
      )}

      <Button title="Adicionar Pedido" onPress={handleAddOrder} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
    width: '100%',
    backgroundColor: '#fff',
  },
  pickerWeb: {
    width: '100%',
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
