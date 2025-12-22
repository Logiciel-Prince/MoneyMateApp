import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  currencies: Currency[];
  onPress: () => void;
  theme: Theme;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  currencies,
  onPress,
  theme,
}) => {
  const currentCurrency = currencies.find(c => c.code === selectedCurrency);

  return (
    <View
      style={[
        tw`rounded-2xl mx-4 mb-4 p-4`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <Text style={[tw`text-lg font-bold mb-4`, { color: theme.text }]}>
        Currency
      </Text>
      <Text
        style={[tw`text-base font-medium mb-2`, { color: theme.textSecondary }]}
      >
        Display Currency
      </Text>

      <TouchableOpacity
        style={[
          tw`flex-row justify-between items-center p-3 border rounded-lg`,
          { borderColor: theme.border, backgroundColor: theme.background },
        ]}
        onPress={onPress}
      >
        <Text style={[tw`text-base`, { color: theme.text }]}>
          {selectedCurrency} ({currentCurrency?.symbol || '$'})
        </Text>
        <Icon name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

export default CurrencySelector;

