import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface PieChartCenterLabelProps {
  totalExpense: number;
  currencyCode: string;
  theme: Theme;
}

const PieChartCenterLabel: React.FC<PieChartCenterLabelProps> = React.memo(
  ({ totalExpense, currencyCode, theme }) => (
    <View style={tw`flex-1 items-center justify-center mt-2.5`}>
      <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>TOTAL</Text>
      <Text style={[tw`text-[22px] font-bold`, { color: theme.text }]}>
        {formatCurrency(totalExpense, currencyCode, {
          maximumFractionDigits: 0,
        })}
      </Text>
    </View>
  ),
);
PieChartCenterLabel.displayName = 'PieChartCenterLabel';

const createPieChartCenterLabelComponent = (
  props: PieChartCenterLabelProps,
) => {
  const BoundComponent = () => <PieChartCenterLabel {...props} />;
  BoundComponent.displayName = 'BoundPieChartCenterLabel';
  return BoundComponent;
};

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
  theme: Theme;
  currencyCode: string;
}

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  transactions,
  theme,
  currencyCode,
}) => {
  const [pieMonthOffset, setPieMonthOffset] = useState(0);

  const isDarkMode = theme.mode === 'dark';
  const cardBgSecondary = isDarkMode ? '#1f2937' : '#f3f4f6';
  const buttonBgSecondary = isDarkMode ? '#374151' : '#e5e7eb';

  const pieDisplayDate = new Date();
  pieDisplayDate.setMonth(pieDisplayDate.getMonth() + pieMonthOffset);

  const pieChartData = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + pieMonthOffset);

    const monthlyExpenses = transactions.filter(
      t =>
        t.type === 'expense' &&
        new Date(t.date).getMonth() === date.getMonth() &&
        new Date(t.date).getFullYear() === date.getFullYear(),
    );

    const grouped: { [key: string]: number } = {};
    monthlyExpenses.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (amt > 0) {
        grouped[t.category] = (grouped[t.category] || 0) + amt;
      }
    });

    const palette = [
      '#8B5CF6',
      '#F97316',
      '#EF4444',
      '#84CC16',
      '#EC4899',
      '#3B82F6',
      '#EAB308',
      '#14B8A6',
      '#6366F1',
      '#D946EF',
      '#06B6D4',
      '#F59E0B',
    ];

    const getCategoryColor = (cat: string) => {
      let hash = 0;
      for (let i = 0; i < cat.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    };

    let entries = Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        value: amount,
        color: getCategoryColor(name),
        text: '',
      }))
      .sort((a, b) => b.value - a.value);

    return entries;
  }, [transactions, pieMonthOffset]);

  const totalExpenseForPie = pieChartData.reduce(
    (acc, curr) => acc + curr.value,
    0,
  );

  const pieChartCenterLabel = useMemo(
    () =>
      createPieChartCenterLabelComponent({
        totalExpense: totalExpenseForPie,
        currencyCode: currencyCode,
        theme,
      }),
    [totalExpenseForPie, currencyCode, theme],
  );

  return (
    <View
      style={[
        tw`mx-5 mb-5 p-5 rounded-2xl shadow-md`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <View style={tw`flex-row items-center mb-2.5`}>
        <Icon
          name="pie-chart-outline"
          size={20}
          color={theme.text}
          style={tw`mr-3`}
        />
        <Text style={[tw`text-lg font-bold`, { color: theme.text }]}>
          Expense Breakdown
        </Text>
      </View>

      {/* Month Selector */}
      <View
        style={[
          tw`flex-row items-center justify-between w-full p-2 rounded-xl mb-2.5`,
          {
            backgroundColor: cardBgSecondary,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setPieMonthOffset(p => p - 1)}
          style={tw`p-1.5`}
        >
          <Icon name="chevron-back" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[tw`text-base font-semibold`, { color: theme.text }]}>
          {pieDisplayDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity
          onPress={() => setPieMonthOffset(p => p + 1)}
          style={tw`p-1.5`}
        >
          <Icon name="chevron-forward" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 items-center justify-center mt-2.5`}>
        {pieChartData.length > 0 ? (
          <>
            <PieChart
              key={`pie-chart-${transactions.length}-${totalExpenseForPie}-${pieMonthOffset}`}
              data={pieChartData}
              donut
              showText={false}
              radius={110}
              innerRadius={80}
              innerCircleColor={theme.card}
              centerLabelComponent={pieChartCenterLabel}
            />

            {/* Custom Legend List */}
            <View style={tw`mt-5 w-full`}>
              <ScrollView style={tw`max-h-[250px]`} nestedScrollEnabled>
                {pieChartData.map((item, index) => (
                  <View
                    key={index}
                    style={tw`flex-row justify-between items-center mb-3`}
                  >
                    <View style={tw`flex-row items-center gap-2.5`}>
                      <View
                        style={[
                          tw`w-2.5 h-2.5 rounded-full`,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          tw`text-sm font-medium`,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>

                    <View style={tw`flex-row items-center gap-3`}>
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
                            { color: theme.textSecondary },
                          ]}
                        >
                          {((item.value / totalExpenseForPie) * 100).toFixed(1)}
                          %
                        </Text>
                      </View>
                      <Text
                        style={[
                          tw`text-sm font-semibold w-20 text-right`,
                          { color: theme.text },
                        ]}
                      >
                        {formatCurrency(item.value, currencyCode)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={tw`h-50 justify-center items-center`}>
            <Text style={{ color: theme.textSecondary }}>
              No expenses for this month
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ExpenseBreakdownChart;
