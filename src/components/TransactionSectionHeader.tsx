import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Theme } from '../theme';
import { formatCurrency } from '../utils/currency';

interface TransactionSectionHeaderProps {
  year: string;
  month: string;
  netTotal: number;
  theme: Theme;
  currencyCode: string;
}

const TransactionSectionHeader: React.FC<TransactionSectionHeaderProps> = ({
  year,
  month,
  netTotal,
  theme,
  currencyCode,
}) => {
  return (
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
          {year}
        </Text>
        <Text style={[tw`text-2xl font-bold`, { color: theme.text }]}>
          {month}
        </Text>
      </View>
      <View>
        <Text
          style={[
            tw`text-base font-semibold mb-1`,
            {
              color: netTotal < 0 ? theme.expense : theme.textSecondary,
            },
          ]}
        >
          {netTotal < 0 ? '-' : ''}
          {formatCurrency(Math.abs(netTotal), currencyCode, {
            showSymbol: true,
          })}
        </Text>
      </View>
    </View>
  );
};

export default TransactionSectionHeader;
