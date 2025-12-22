import React, { useState, useMemo } from 'react';
import {
  View,
  SectionList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Transaction } from '../types';
import AddTransactionModal from '../components/AddTransactionModal';
import SearchBar from '../components/SearchBar';
import TransactionItem from '../components/TransactionItem';
import TransactionSectionHeader from '../components/TransactionSectionHeader';
import EmptyTransactionList from '../components/EmptyTransactionList';

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
      const title = `${month} ${year}`;

      const lastSection = result[result.length - 1];

      let amount = 0;
      if (t.type === 'income') amount = t.amount;
      else if (t.type === 'expense') amount = -t.amount;

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

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
      />

      <SectionList
        sections={sections}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            accounts={accounts}
            theme={theme}
            currencyCode={settings.currency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        renderSectionHeader={({ section }) => (
          <TransactionSectionHeader
            year={section.year}
            month={section.month}
            netTotal={section.netTotal}
            theme={theme}
            currencyCode={settings.currency}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={tw`p-4 pb-20`}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyTransactionList searchQuery={searchQuery} theme={theme} />
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
