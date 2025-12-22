import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';
import { Budget, Category } from '../types';
import { formatCurrency } from '../utils/currency';

interface BudgetCardProps {
  budget: Budget;
  currentSpent: number;
  previousSpent: number;
  category?: Category;
  theme: Theme;
  currencyCode: string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  currentSpent,
  previousSpent,
  category,
  theme,
  currencyCode,
  onEdit,
  onDelete,
}) => {
  const percentage = (currentSpent / budget.amount) * 100;
  const isOverBudget = percentage > 100;

  // Calculate trend
  let trendPercentage = 0;
  let trendDirection: 'up' | 'down' | 'same' = 'same';

  if (previousSpent > 0) {
    trendPercentage = ((currentSpent - previousSpent) / previousSpent) * 100;
    if (currentSpent > previousSpent) trendDirection = 'up';
    else if (currentSpent < previousSpent) trendDirection = 'down';
  } else if (currentSpent > 0) {
    trendDirection = 'up';
    trendPercentage = 100;
  }

  return (
    <TouchableOpacity
      style={[styles.budgetCard, { backgroundColor: theme.card }]}
      onLongPress={() => onEdit(budget)}
    >
      <View style={styles.budgetHeader}>
        <View style={styles.headerLeftContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: category?.color || theme.primary },
            ]}
          >
            <Icon
              name={category?.icon || 'pricetag'}
              size={20}
              color="#FFF"
            />
          </View>
          <View style={styles.budgetLeft}>
            <Text style={[styles.category, { color: theme.text }]}>
              {budget.category}
            </Text>
            <Text style={[styles.period, { color: theme.textSecondary }]}>
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.budgetRight}>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatCurrency(currentSpent, currencyCode)} /{' '}
            {formatCurrency(budget.amount, currencyCode)}
          </Text>
          <TouchableOpacity
            onPress={() => onDelete(budget.id)}
            style={styles.deleteButton}
          >
            <Icon name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOverBudget ? theme.danger : theme.success,
            },
          ]}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Text
          style={[
            styles.percentage,
            { color: isOverBudget ? theme.danger : theme.textSecondary },
          ]}
        >
          {percentage.toFixed(1)}% {isOverBudget ? 'over' : 'used'}
        </Text>

        {/* Trend Indicator */}
        <View style={styles.trendContainer}>
          {trendDirection !== 'same' && (
            <Icon
              name={trendDirection === 'up' ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={trendDirection === 'up' ? theme.danger : theme.success}
              style={styles.trendIcon}
            />
          )}
          <Text
            style={[
              styles.trendText,
              {
                color:
                  trendDirection === 'same'
                    ? theme.textSecondary
                    : trendDirection === 'up'
                    ? theme.danger
                    : theme.success,
              },
            ]}
          >
            {trendDirection === 'same'
              ? 'No change vs last month'
              : `${Math.abs(trendPercentage).toFixed(1)}% vs last mo.`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetLeft: {
    flex: 1,
  },
  budgetRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendIcon: {
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BudgetCard;
