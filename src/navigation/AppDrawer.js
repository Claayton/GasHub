// src/navigation/AppDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Telas
import AddOrderScreen from '../screens/AddOrderScreen';
import ListOrdersScreen from '../screens/ListOrdersScreen';
import FiadoScreen from '../screens/ReceivablesScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="ListOrders"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Icon name="bars" size={22} color="#333" />
          </TouchableOpacity>
        ),
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#007bff',
        drawerLabelStyle: { fontSize: 16 },
      })}
    >
      <Drawer.Screen
        name="ListOrders"
        component={ListOrdersScreen}
        options={{
          title: 'Pedidos',
          drawerIcon: ({ color, size }) => (
            <Icon name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AddOrder"
        component={AddOrderScreen}
        options={{
          title: 'Adicionar Pedido',
          drawerIcon: ({ color, size }) => (
            <Icon name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Fiado"
        component={FiadoScreen}
        options={{
          title: 'Fiados',
          drawerIcon: ({ color, size }) => (
            <Icon name="money-bill-wave" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AppDrawer;