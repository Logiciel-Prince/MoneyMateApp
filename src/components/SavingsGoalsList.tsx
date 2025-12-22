import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';
import { Goal } from '../types';
import { formatCurrency } from '../utils/currency';

interface SavingsGoalsListProps {
  goals: Goal[];
  theme: Theme;
  currencyCode: string;
  onAddMoney: (goal: Goal) => void;
}

const SavingsGoalsList: React.FC<SavingsGoalsListProps> = ({
  goals,
  theme,
  currencyCode,
  onAddMoney,
}) => {
  const isDarkMode = theme.mode === 'dark';
  const cardBgTertiary = isDarkMode ? '#1f2937' : '#f9fafb';
  const buttonBgSecondary = isDarkMode ? '#374151' : '#e5e7eb';
  const borderColorSecondary = isDarkMode ? '#374151' : '#e5e7eb';

  return (
    <View
      style={[
        tw`mx-5 mb-5 p-5 rounded-2xl shadow-md`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <Text style={[tw`text-lg font-bold mb-5`, { color: theme.text }]}>
        Top Savings Goals
      </Text>
      {goals.slice(0, 3).map(goal => {
        const progress =
          goal.targetAmount > 0
            ? Math.min(goal.currentAmount / goal.targetAmount, 1)
            : 0;
        const percent = Math.round(progress * 100);
        return (
          <View
            key={goal.id}
            style={[
              tw`border rounded-2xl p-4 mb-4`,
              {
                backgroundColor: cardBgTertiary,
                borderColor: borderColorSecondary,
              },
            ]}
          >
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={[tw`text-lg font-bold`, { color: theme.text }]}>
                {goal.name}
              </Text>
              <View style={[tw`flex-row items-center gap-3`]}>
                <View
                  style={[
                    tw`px-2 py-1 rounded-md min-w-12 items-center`,
                    {
                      backgroundColor: buttonBgSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-xs font-semibold`,
                      { color: theme.text },
                    ]}
                  >
                    {percent}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    tw`w-6 h-6 rounded-full items-center justify-center`,
                    {
                      backgroundColor: buttonBgSecondary,
                    },
                  ]}
                  onPress={() => onAddMoney(goal)}
                >
                  <Icon name="add" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[tw`flex-row justify-between items-center mb-3`]}>
              <Text
                style={[
                  tw`text-base font-semibold`,
                  { color: theme.textSecondary },
                ]}
              >
                {formatCurrency(goal.currentAmount, currencyCode)}
              </Text>
              <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
                of {formatCurrency(goal.targetAmount, currencyCode)}
              </Text>
            </View>

            <View
              style={[
                tw`h-2 rounded-sm`,
                {
                  backgroundColor: buttonBgSecondary,
                },
              ]}
            >
              <View
                style={[
                  tw`h-2 rounded-sm bg-[#3B82F6]`,
                  { width: `${percent}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
      {goals.length === 0 && (
        <Text
          style={[tw`text-center p-2.5`, { color: theme.textSecondary }]}
        >
          No savings goals yet.
        </Text>
      )}
    </View>
  );
};

export default SavingsGoalsList;
