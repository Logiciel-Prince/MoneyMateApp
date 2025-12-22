import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';
import { Goal } from '../types';
import { formatCurrency } from '../utils/currency';

interface GoalCardProps {
  goal: Goal;
  theme: Theme;
  currencyCode: string;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddFunds: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  theme,
  currencyCode,
  onEdit,
  onDelete,
  onAddFunds,
}) => {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isComplete = percentage >= 100;
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const handleAddFunds = () => {
    Alert.prompt(
      'Add Funds',
      `How much would you like to add to "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: amount => {
            const addAmount = parseFloat(amount || '0');
            if (addAmount > 0) {
              onAddFunds(goal);
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad',
    );
  };

  return (
    <TouchableOpacity
      style={[styles.goalCard, { backgroundColor: theme.card }]}
      onLongPress={() => onEdit(goal)}
    >
      <View style={styles.goalHeader}>
        <View style={styles.goalLeft}>
          <Text style={[styles.goalName, { color: theme.text }]}>
            {goal.name}
          </Text>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {goal.category}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(goal.id)}
          style={styles.deleteButton}
        >
          <Icon name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.amountRow}>
          <Text style={[styles.currentAmount, { color: theme.primary }]}>
            {formatCurrency(goal.currentAmount, currencyCode)}
          </Text>
          <Text style={[styles.targetAmount, { color: theme.textSecondary }]}>
            / {formatCurrency(goal.targetAmount, currencyCode)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: isComplete ? theme.success : theme.primary,
              },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <Text
            style={[
              styles.percentage,
              { color: isComplete ? theme.success : theme.textSecondary },
            ]}
          >
            {percentage.toFixed(1)}% {isComplete && '✓ Complete'}
          </Text>
          <Text style={[styles.deadline, { color: theme.textSecondary }]}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          </Text>
        </View>
      </View>

      {/* Add Funds Button */}
      {!isComplete && (
        <TouchableOpacity
          style={[styles.addFundsButton, { backgroundColor: theme.primary }]}
          onPress={handleAddFunds}
        >
          <Icon name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.addFundsText}>Add Funds</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalLeft: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetAmount: {
    fontSize: 16,
    marginLeft: 4,
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
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 14,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFundsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalCard;
