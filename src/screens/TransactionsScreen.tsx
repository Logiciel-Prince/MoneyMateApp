import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  useColorScheme,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Transaction } from '../types';
import AddTransactionModal from '../components/AddTransactionModal';
import { formatCurrency } from '../utils/currency';

const TransactionsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    transactions,
    accounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settings,
    scanSmsAndAddTransactions,
  } = useData();

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const count = await scanSmsAndAddTransactions();
      if (count > 0) {
        Alert.alert('SMS Scanned', `Added ${count} new transactions from SMS.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [scanSmsAndAddTransactions]);

  const sections = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const result: {
      title: string;
      year: string;
      month: string;
      data: Transaction[];
      netTotal: number;
    }[] = [];

    sorted.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });
      const title = `${month} ${year}`; // Unique key

      const lastSection = result[result.length - 1];

      let amount = 0;
      if (t.type === 'income') amount = t.amount;
      else if (t.type === 'expense') amount = -t.amount;
      // Transfers treated as 0 for net flow in this view,
      // or if user wants them included as expense, we could subtract.
      // Assuming transfers are neutral for "spending overview" unless they leave the system.
      // But purely for flow, let's keep them 0.

      if (lastSection && lastSection.title === title) {
        lastSection.data.push(t);
        lastSection.netTotal += amount;
      } else {
        result.push({
          title,
          year,
          month,
          data: [t],
          netTotal: amount,
        });
      }
    });

    return result;
  }, [transactions]);

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isTransfer = item.type === 'transfer';
    const toAccount = isTransfer
      ? accounts.find(a => a.id === item.toAccountId)
      : undefined;

    return (
      <TouchableOpacity
        style={[
          styles.transactionCard,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
        onLongPress={() => handleEdit(item)}
      >
        <View style={styles.transactionLeft}>
          <Text style={[styles.description, { color: theme.text }]}>
            {item.description || (isTransfer ? 'Transfer' : item.category)}
          </Text>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {isTransfer && toAccount ? `To: ${toAccount.name}` : item.category}{' '}
            • {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.amount,
              {
                color:
                  item.type === 'income'
                    ? theme.income
                    : item.type === 'transfer'
                    ? theme.primary
                    : theme.expense,
              },
            ]}
          >
            {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}
            {formatCurrency(item.amount, settings.currency, {
              showSymbol: false,
            })}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Icon name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: {
      year: string;
      month: string;
      netTotal: number;
    };
  }) => (
    <View
      style={[
        styles.sectionHeader,
        {
          backgroundColor: theme.card,
          borderRadius: 12,
          paddingHorizontal: 15,
        },
      ]}
    >
      <View>
        <Text style={[styles.headerYear, { color: theme.textSecondary }]}>
          {section.year}
        </Text>
        <Text style={[styles.headerMonth, { color: theme.text }]}>
          {section.month}
        </Text>
      </View>
      <View>
        <Text
          style={[
            styles.headerTotal,
            {
              color: section.netTotal < 0 ? theme.expense : theme.textSecondary,
            },
          ]}
        >
          {section.netTotal < 0 ? '-' : ''}
          {formatCurrency(Math.abs(section.netTotal), settings.currency, {
            showSymbol: true, // User might want symbol here, usually good for totals
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="receipt-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No transactions yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setEditingTransaction(undefined);
          setModalVisible(true);
        }}
      >
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
  sectionHeader: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 5,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerYear: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerMonth: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4, // Align with baseline of month roughly
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default TransactionsScreen;
