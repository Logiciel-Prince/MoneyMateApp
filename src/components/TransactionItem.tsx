import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';
import { Transaction, Account } from '../types';
import { formatCurrency } from '../utils/currency';

interface TransactionItemProps {
  transaction: Transaction;
  accounts: Account[];
  theme: Theme;
  currencyCode: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  accounts,
  theme,
  currencyCode,
  onEdit,
  onDelete,
}) => {
  const isTransfer = transaction.type === 'transfer';
  const toAccount = isTransfer
    ? accounts.find(a => a.id === transaction.toAccountId)
    : undefined;

  return (
    <TouchableOpacity
      style={[
        tw`flex-row justify-between items-center p-4 rounded-xl mb-2.5 border`,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
      onLongPress={() => onEdit(transaction)}
    >
      <View style={tw`flex-1`}>
        <Text
          style={[tw`text-base font-semibold mb-1`, { color: theme.text }]}
        >
          {transaction.description ||
            (isTransfer ? 'Transfer' : transaction.category)}
        </Text>
        <Text style={[tw`text-sm`, { color: theme.textSecondary }]}>
          {isTransfer && toAccount ? `To: ${toAccount.name}` : transaction.category}{' '}
          • {new Date(transaction.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={tw`items-end gap-2`}>
        <Text
          style={[
            tw`text-lg font-bold`,
            {
              color:
                transaction.type === 'income'
                  ? theme.income
                  : transaction.type === 'transfer'
                  ? theme.primary
                  : theme.expense,
            },
          ]}
        >
          {transaction.type === 'income'
            ? '+'
            : transaction.type === 'expense'
            ? '-'
            : ''}
          {formatCurrency(transaction.amount, currencyCode, {
            showSymbol: false,
          })}
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(transaction.id)}
          style={tw`p-1`}
        >
          <Icon name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
