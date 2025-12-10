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
import {Transaction} from '../types';
import AddTransactionModal from '../components/AddTransactionModal';

const TransactionsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    transactions,
    accounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settings,
  } = useData();

  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | undefined>(undefined);

  const handleAddTransaction = (
    transactionData: Omit<Transaction, 'id'>,
  ) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      };
      addTransaction(newTransaction);
    }
    setEditingTransaction(undefined);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  const renderTransaction = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={[
        styles.transactionCard,
        {backgroundColor: theme.card, borderColor: theme.border},
      ]}
      onLongPress={() => handleEdit(item)}>
      <View style={styles.transactionLeft}>
        <Text style={[styles.description, {color: theme.text}]}>
          {item.description}
        </Text>
        <Text style={[styles.category, {color: theme.textSecondary}]}>
          {item.category} • {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.amount,
            {color: item.type === 'income' ? theme.income : theme.expense},
          ]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
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
      <FlatList
        data={transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="receipt-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              No transactions yet
            </Text>
            <Text style={[styles.emptySubtext, {color: theme.textSecondary}]}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.primary}]}
        onPress={() => {
          setEditingTransaction(undefined);
          setModalVisible(true);
        }}>
        <Icon name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTransaction(undefined);
        }}
        onSave={handleAddTransaction}
        accounts={accounts}
        editTransaction={editingTransaction}
      />
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
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  amount: {
    fontSize: 18,
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

export default TransactionsScreen;
