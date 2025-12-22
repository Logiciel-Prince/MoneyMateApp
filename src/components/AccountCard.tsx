import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';
import { Account } from '../types';
import { formatCurrency } from '../utils/currency';
import { Tooltip } from './Tooltip';

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

interface AccountCardProps {
  account: Account;
  theme: Theme;
  currencyCode: string;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onAddMoney: (account: Account) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  theme,
  currencyCode,
  onEdit,
  onDelete,
  onAddMoney,
}) => {
  return (
    <TouchableOpacity
      style={[styles.accountCard, { backgroundColor: theme.card }]}
      onLongPress={() => onEdit(account)}
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
              name={getAccountIcon(account.type)}
              size={24}
              color={theme.primary}
            />
          </View>

          <Tooltip content={account.name}>
            <TouchableOpacity style={styles.accountInfo} activeOpacity={0.7}>
              <Text
                style={[styles.accountName, { color: theme.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {account.name}
              </Text>
              <Text
                style={[styles.accountType, { color: theme.textSecondary }]}
              >
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
              </Text>
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* Right: Balance */}
        <Tooltip content={formatCurrency(account.balance, currencyCode)}>
          <TouchableOpacity style={styles.rightSection} activeOpacity={0.7}>
            <Text
              style={[
                styles.balance,
                { color: account.balance >= 0 ? theme.income : theme.expense },
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {formatCompactCurrency(account.balance, currencyCode)}
            </Text>
          </TouchableOpacity>
        </Tooltip>
      </View>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            onAddMoney(account);
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
            onDelete(account.id);
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
};

const styles = StyleSheet.create({
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
});

export default AccountCard;
