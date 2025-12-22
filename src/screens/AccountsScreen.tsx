import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Account, Transaction } from '../types';
import AddAccountModal from '../components/AddAccountModal';
import AddTransactionModal from '../components/AddTransactionModal';
import TotalBalanceCard from '../components/TotalBalanceCard';
import AccountCard from '../components/AccountCard';
import EmptyAccountList from '../components/EmptyAccountList';
import AnimatedScreenWrapper from '../components/AnimatedScreenWrapper';

const AccountsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    settings,
    addTransaction,
  } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(
    undefined,
  );

  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [selectedAccountForBalance, setSelectedAccountForBalance] = useState<
    Account | undefined
  >(undefined);

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

  const handleAddBalance = (account: Account) => {
    setSelectedAccountForBalance(account);
    setAddTransactionVisible(true);
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    addTransaction(newTransaction);
    setAddTransactionVisible(false);
    setSelectedAccountForBalance(undefined);
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount(id),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AnimatedScreenWrapper>
        {/* Total Balance Card */}
        {accounts.length > 0 && (
          <TotalBalanceCard
            totalBalance={totalBalance}
            accountCount={accounts.length}
            currencyCode={settings.currency}
            theme={theme}
          />
        )}

        <FlatList
          data={accounts}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              theme={theme}
              currencyCode={settings.currency}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddMoney={handleAddBalance}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyAccountList theme={theme} />}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => {
            setEditingAccount(undefined);
            setModalVisible(true);
          }}
        >
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

        {/* Add Balance Modal */}
        <AddTransactionModal
          visible={addTransactionVisible}
          onClose={() => {
            setAddTransactionVisible(false);
            setSelectedAccountForBalance(undefined);
          }}
          onSave={handleSaveTransaction}
          accounts={accounts}
          initialType="income"
          initialAccountId={selectedAccountForBalance?.id}
        />
      </AnimatedScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default AccountsScreen;
