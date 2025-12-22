import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Theme } from '../theme';
import { formatCurrency } from '../utils/currency';

interface BudgetOverviewCardProps {
  totalBudgetAmount: number;
  totalSpentAmount: number;
  currencyCode: string;
  theme: Theme;
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  totalBudgetAmount,
  totalSpentAmount,
  currencyCode,
  theme,
}) => {
  const totalRemaining = Math.max(0, totalBudgetAmount - totalSpentAmount);
  const overallPercentage =
    totalBudgetAmount > 0 ? (totalSpentAmount / totalBudgetAmount) * 100 : 0;
  const isOverBudget = totalSpentAmount > totalBudgetAmount;

  return (
    <LinearGradient
      colors={[theme.primary, '#4c669f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.overviewCard}
    >
      <Text style={styles.overviewTitle}>Total Budget</Text>
      <Text style={styles.overviewAmount}>
        {formatCurrency(totalRemaining, currencyCode)}
      </Text>
      <Text style={styles.overviewSubtitle}>Remaining</Text>

      <View style={styles.overviewRow}>
        <View>
          <Text style={styles.overviewLabel}>Budgeted</Text>
          <Text style={styles.overviewValue}>
            {formatCurrency(totalBudgetAmount, currencyCode)}
          </Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.overviewLabel}>Spent</Text>
          <Text style={styles.overviewValue}>
            {formatCurrency(totalSpentAmount, currencyCode)}
          </Text>
        </View>
      </View>

      <View style={styles.overviewProgressBg}>
        <View
          style={[
            styles.overviewProgressFill,
            {
              width: `${Math.min(overallPercentage, 100)}%`,
              backgroundColor: isOverBudget ? '#FF6B6B' : '#FFF',
            },
          ]}
        />
      </View>
      <Text style={styles.overviewProgressText}>
        {overallPercentage.toFixed(1)}% used
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  overviewAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  overviewSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  overviewValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  overviewProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  overviewProgressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'right',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});

export default BudgetOverviewCard;
