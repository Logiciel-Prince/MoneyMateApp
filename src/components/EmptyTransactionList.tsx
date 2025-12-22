import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';

interface EmptyTransactionListProps {
  searchQuery: string;
  theme: Theme;
}

const EmptyTransactionList: React.FC<EmptyTransactionListProps> = ({
  searchQuery,
  theme,
}) => {
  return (
    <View style={tw`flex-1 justify-center items-center pt-25`}>
      <Icon name="receipt-outline" size={64} color={theme.textSecondary} />
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
  );
};

export default EmptyTransactionList;
