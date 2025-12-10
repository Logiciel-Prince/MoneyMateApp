import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useData} from '../context/DataContext';
import {lightTheme, darkTheme} from '../theme';
import {Account} from '../types';
import AddAccountModal from '../components/AddAccountModal';

const AccountsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {accounts, addAccount, updateAccount, deleteAccount, settings} = useData();
  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(
    undefined,
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAddAccount = (accountData: Omit<Account, 'id'>) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, accountData);
    } else {
      const newAccount: Account = {
        ...accountData,
        id: Date.now().toString(),
      };
      addAccount(newAccount);
    }
    setEditingAccount(undefined);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account? All associated transactions will remain.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount(id),
        },
      ],
    );
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return 'card-outline';
      case 'savings':
        return 'wallet-outline';
      case 'credit':
        return 'card';
      case 'cash':
        return 'cash-outline';
      default:
        return 'wallet-outline';
    }
  };

  const renderAccount = ({item}: {item: Account}) => (
    <TouchableOpacity
      style={[styles.accountCard, {backgroundColor: theme.card}]}
      onLongPress={() => handleEdit(item)}>
      <View style={styles.accountLeft}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: theme.primary + '20'},
          ]}>
          <Icon name={getAccountIcon(item.type)} size={24} color={theme.primary} />
        </View>
        <View>
          <Text style={[styles.accountName, {color: theme.text}]}>
            {item.name}
          </Text>
          <Text style={[styles.accountType, {color: theme.textSecondary}]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.accountRight}>
        <Text
          style={[
            styles.balance,
            {color: item.balance >= 0 ? theme.income : theme.expense},
          ]}>
          ${item.balance.toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}>
          <Icon name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <View style={[styles.totalCard, {backgroundColor: theme.primary}]}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>${totalBalance.toFixed(2)}</Text>
          <Text style={styles.totalAccounts}>
            {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
          </Text>
        </View>
      )}

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="wallet-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              No accounts yet
            </Text>
            <Text style={[styles.emptySubtext, {color: theme.textSecondary}]}>
              Tap the + button to add your first account
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.primary}]}
        onPress={() => {
          setEditingAccount(undefined);
          setModalVisible(true);
        }}>
        <Icon name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddAccountModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingAccount(undefined);
        }}
        onSave={handleAddAccount}
        editAccount={editingAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalCard: {
    margin: 15,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  totalAmount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  totalAccounts: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
  },
  accountRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default AccountsScreen;
