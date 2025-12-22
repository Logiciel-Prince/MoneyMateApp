import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';
import { formatCurrency } from '../utils/currency';

interface TotalBalanceCardProps {
  totalBalance: number;
  accountCount: number;
  currencyCode: string;
  theme: Theme;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  totalBalance,
  accountCount,
  currencyCode,
  theme,
}) => {
  return (
    <View style={[styles.totalCard, { backgroundColor: theme.primary }]}>
      <Text style={styles.totalLabel}>Total Balance</Text>
      <Text style={styles.totalAmount}>
        {formatCurrency(totalBalance, currencyCode)}
      </Text>
      <Text style={styles.totalAccounts}>
        {accountCount} {accountCount === 1 ? 'Account' : 'Accounts'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default TotalBalanceCard;
