import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>Currency</Text>
      <Text
        style={[
          styles.label,
          { color: theme.textSecondary, marginBottom: 8 },
        ]}
      >
        Display Currency
      </Text>

      <TouchableOpacity
        style={[
          styles.pickerButton,
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default CurrencySelector;
