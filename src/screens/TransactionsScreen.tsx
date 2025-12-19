import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  useColorScheme,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import tw from 'twrnc';
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
  } = useData();

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    let filtered = transactions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = transactions.filter(t => {
        const matchDesc = t.description?.toLowerCase().includes(query) ?? false;
        const matchCat = t.category.toLowerCase().includes(query);
        const matchAmount = t.amount.toString().includes(query);
        return matchDesc || matchCat || matchAmount;
      });
    }

    const sorted = [...filtered].sort(
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
  }, [transactions, searchQuery]);

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
          tw`flex-row justify-between items-center p-4 rounded-xl mb-2.5 border`,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
        onLongPress={() => handleEdit(item)}
      >
        <View style={tw`flex-1`}>
          <Text
            style={[tw`text-base font-semibold mb-1`, { color: theme.text }]}
          >
            {item.description || (isTransfer ? 'Transfer' : item.category)}
          </Text>
          <Text style={[tw`text-sm`, { color: theme.textSecondary }]}>
            {isTransfer && toAccount ? `To: ${toAccount.name}` : item.category}{' '}
            • {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={tw`items-end gap-2`}>
          <Text
            style={[
              tw`text-lg font-bold`,
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
            style={tw`p-1`}
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
        tw`py-4 px-4 mb-4 mt-2.5 flex-row justify-between items-end rounded-xl`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <View>
        <Text
          style={[
            tw`text-xs font-medium mb-0.5`,
            { color: theme.textSecondary },
          ]}
        >
          {section.year}
        </Text>
        <Text style={[tw`text-2xl font-bold`, { color: theme.text }]}>
          {section.month}
        </Text>
      </View>
      <View>
        <Text
          style={[
            tw`text-base font-semibold mb-1`,
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
    <View style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <View
        style={[
          tw`flex-row items-center px-4 m-4 mb-1 rounded-xl h-12`,
          { backgroundColor: theme.card },
        ]}
      >
        <Icon
          name="search"
          size={20}
          color={theme.textSecondary}
          style={tw`mr-2.5`}
        />
        <TextInput
          style={[tw`flex-1 text-base`, { color: theme.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={tw`p-4 pb-20`}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center pt-25`}>
            <Icon
              name="receipt-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text
              style={[
                tw`text-lg font-semibold mt-4`,
                { color: theme.textSecondary },
              ]}
            >
              {searchQuery
                ? 'No transactions match your search'
                : 'No transactions yet'}
            </Text>
            <Text style={[tw`text-sm mt-2`, { color: theme.textSecondary }]}>
              {searchQuery
                ? 'Try a different keyword'
                : 'Tap the + button to add your first transaction'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          tw`absolute right-5 bottom-5 w-14 h-14 rounded-full justify-center items-center shadow-lg`,
          {
            backgroundColor: theme.primary,
          },
        ]}
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

export default TransactionsScreen;
