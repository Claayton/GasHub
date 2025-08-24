import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '../hooks/useAuth'; // Usando seu hook aqui também!

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth(); // Bem mais simples!

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <Icon name="user-circle" size={48} />
        <Text style={styles.drawerUserEmail}>{user?.email ?? 'Usuário'}</Text>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.drawerFooter}>
        <View style={styles.drawerLogoutButton} onTouchEnd={logout}>
          <Icon name="sign-out-alt" size={16} color="#fff" />
          <Text style={styles.drawerLogoutText}>Sair</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
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

export default CustomDrawerContent;