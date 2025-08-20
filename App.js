import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { signOut } from 'firebase/auth';

// Telas
import LoginScreen from './src/screens/LoginScreen.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import AddOrderScreen from './src/screens/AddOrderScreen.js';
import ListOrdersScreen from './src/screens/ListOrdersScreen.js';
import FiadoScreen from './src/screens/ReceivablesScreen.js';

// Firebase
import { auth } from './src/config/firebaseConfig';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Drawer customizado
function CustomDrawerContent(props) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged cuida do redirecionamento
    } catch (e) {
      console.error('Erro ao sair:', e);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Cabeçalho */}
      <View style={styles.drawerHeader}>
        <Icon name="user-circle" size={48} />
        <Text style={styles.drawerUserEmail}>{user?.email ?? 'Usuário'}</Text>
      </View>

      {/* Itens de navegação */}
      <DrawerItemList {...props} />

      {/* Logout */}
      <View style={styles.drawerFooter}>
        <View style={styles.drawerLogoutButton} onTouchEnd={handleLogout}>
          <Icon name="sign-out-alt" size={16} color="#fff" />
          <Text style={styles.drawerLogoutText}>Sair</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
  initialRouteName="ListOrders"
  drawerContent={(props) => <CustomDrawerContent {...props} />}
  screenOptions={({ navigation }) => ({
    headerShown: true, // agora mostra o header
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
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="AppDrawer" component={AppDrawer} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },

  // Drawer
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    gap: 8,
  },
  drawerUserEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  drawerFooter: {
    marginTop: 'auto',
    padding: 20,
  },
  drawerLogoutButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
