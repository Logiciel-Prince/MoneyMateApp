import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';

interface EmptyBudgetListProps {
  theme: Theme;
}

const EmptyBudgetList: React.FC<EmptyBudgetListProps> = ({ theme }) => {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="pie-chart-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No budgets yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Tap the + button to create your first budget
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default EmptyBudgetList;
