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
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Account, Transaction } from '../types';
import AddAccountModal from '../components/AddAccountModal';
import AddTransactionModal from '../components/AddTransactionModal';
import { formatCurrency } from '../utils/currency';
import { Tooltip } from '../components/Tooltip';

// Format currency in compact form for amounts above 10 lakhs
const formatCompactCurrency = (amount: number, currency: string) => {
  const absAmount = Math.abs(amount);

  // For amounts above 10 lakh (1,000,000), show first 7 chars with ...
  if (absAmount >= 1000000) {
    const sign = amount < 0 ? '-' : '';
    const currencySymbol =
      currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    const amountStr = Math.floor(absAmount).toString();

    // Show first 7 characters (including currency symbol) + ...
    const displayStr = `${sign}${currencySymbol}${amountStr}`;
    if (displayStr.length > 7) {
      return displayStr.substring(0, 7) + '...';
    }
    return displayStr;
  }

  // For amounts below 10 lakh, show normal full format
  return formatCurrency(amount, currency);
};

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

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return 'business-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'credit':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      default:
        return 'wallet-outline';
    }
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={[styles.accountCard, { backgroundColor: theme.card }]}
      onLongPress={() => handleEdit(item)}
      activeOpacity={0.6}
    >
      <View style={styles.cardContent}>
        {/* Left: Icon + Info */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.primary + '20' },
            ]}
          >
            <Icon
              name={getAccountIcon(item.type)}
              size={24}
              color={theme.primary}
            />
          </View>

          <Tooltip content={item.name}>
            <TouchableOpacity style={styles.accountInfo} activeOpacity={0.7}>
              <Text
                style={[styles.accountName, { color: theme.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text
                style={[styles.accountType, { color: theme.textSecondary }]}
              >
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* Right: Balance */}
        <Tooltip content={formatCurrency(item.balance, settings.currency)}>
          <TouchableOpacity style={styles.rightSection} activeOpacity={0.7}>
            <Text
              style={[
                styles.balance,
                { color: item.balance >= 0 ? theme.income : theme.expense },
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {formatCompactCurrency(item.balance, settings.currency)}
            </Text>
          </TouchableOpacity>
        </Tooltip>
      </View>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            handleAddBalance(item);
          }}
          style={styles.actionItem}
        >
          <Icon name="add-outline" size={18} color={theme.income} />
          <Text style={[styles.actionLabel, { color: theme.income }]}>
            Add Money
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.actionDivider, { backgroundColor: theme.border }]}
        />

        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          style={styles.actionItem}
        >
          <Icon name="trash-outline" size={18} color={theme.danger} />
          <Text style={[styles.actionLabel, { color: theme.danger }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <View style={[styles.totalCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalBalance, settings.currency)}
          </Text>
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
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No accounts yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add your first account
            </Text>
          </View>
        }
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
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 13,
    opacity: 0.7,
  },
  rightSection: {
    paddingLeft: 12,
    maxWidth: '40%',
  },
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 4,
  },
  actionButtons: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default AccountsScreen;
