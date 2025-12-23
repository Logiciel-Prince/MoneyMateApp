import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import tw from 'twrnc';
import { Theme } from '../theme';
import { Transaction } from '../types';
import { getCurrencySymbol } from '../utils/currency';

const screenWidth = Dimensions.get('window').width;

interface ChartLabelProps {
  label: string;
  theme: Theme;
}

const ChartLabel: React.FC<ChartLabelProps> = ({ label, theme }) => (
  <View style={tw`w-12 ml-1.5`}>
    <Text
      style={[tw`text-xs text-center`, { color: theme.textSecondary }]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

interface CenteredChartLabelProps {
  label: string;
  theme: Theme;
  width: number;
}

const CenteredChartLabel: React.FC<CenteredChartLabelProps> = ({
  label,
  theme,
  width,
}) => (
  <View style={[tw`items-center justify-center mt-1`, { width }]}>
    <Text
      style={[tw`text-xs text-center`, { color: theme.textSecondary }]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

const ChartLabelWrapper: React.FC<ChartLabelProps> = React.memo(
  ({ label, theme }) => <ChartLabel label={label} theme={theme} />,
);
ChartLabelWrapper.displayName = 'ChartLabelWrapper';

const CenteredChartLabelWrapper: React.FC<CenteredChartLabelProps> =
  React.memo(({ label, theme, width }) => (
    <CenteredChartLabel label={label} theme={theme} width={width} />
  ));
CenteredChartLabelWrapper.displayName = 'CenteredChartLabelWrapper';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  theme: Theme;
  currencyCode: string;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  transactions,
  theme,
  currencyCode,
}) => {
  const parseDate = (dateStr: string) => {
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      d = new Date(dateStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) return d;
    }

    return new Date();
  };

  const getMonthlyTotal = React.useCallback(
    (type: 'income' | 'expense', date: Date) => {
      return transactions
        .filter(t => {
          if (t.type !== type) return false;
          const tDate = parseDate(t.date);
          return (
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },
    [transactions],
  );

  const sectionCount = 5;

  const { barChartData, chartMaxValue, stepValue } = useMemo(() => {
    const data: any[] = [];
    let monthsBack = 5;

    if (transactions.length > 0) {
      const dates = transactions
        .map(t => parseDate(t.date).getTime())
        .filter(d => !isNaN(d));

      if (dates.length > 0) {
        const minTimestamp = Math.min(...dates);
        const minDate = new Date(minTimestamp);
        const now = new Date();

        const diffYears = now.getFullYear() - minDate.getFullYear();
        const diffMonths = diffYears * 12 + now.getMonth() - minDate.getMonth();

        monthsBack = Math.min(Math.max(diffMonths, 0), 4);
      } else {
        monthsBack = 0;
      }
    } else {
      monthsBack = 0;
    }

    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d
        .toLocaleString('default', { month: 'short' })
        .substring(0, 3);
      const inc = getMonthlyTotal('income', d);
      const exp = getMonthlyTotal('expense', d);

      data.push({
        value: inc,
        frontColor: theme.mode === 'dark' ? '#4ade80' : '#16a34a',
        spacing: 6,
        label: label,
        // eslint-disable-next-line react/no-unstable-nested-components
        labelComponent: () => <ChartLabelWrapper label={label} theme={theme} />,
      });
      data.push({
        value: exp,
        frontColor: theme.mode === 'dark' ? '#f87171' : '#dc2626',
        spacing: 32,
      });
    }

    const rawMax = Math.max(...data.map((d: any) => d.value || 0), 100);
    const maxValue = rawMax;
    const step = rawMax / sectionCount;

    return { barChartData: data, chartMaxValue: maxValue, stepValue: step };
  }, [transactions, theme, getMonthlyTotal]);

  return (
    <View
      style={[
        tw`mx-5 mb-5 p-5 rounded-2xl shadow-md`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <View style={tw`flex-row justify-between items-center mb-5`}>
        <Text style={[tw`text-lg font-bold`, { color: theme.text }]}>
          Income & Expense History
        </Text>
      </View>

      {barChartData.length > 0 ? (
        (() => {
          const availableWidth = screenWidth - 100;

          let barWidth = 22;
          let groupSpacing = 32;
          let internalSpacing = 10;
          let initialSpacing = 20;

          const numGroups = Math.ceil(barChartData.length / 2);

          if (numGroups === 1) {
            barWidth = availableWidth * 0.35;
            internalSpacing = availableWidth * 0.1;
            groupSpacing = 0;

            const contentWidth = barWidth * 2 + internalSpacing;
            initialSpacing = (availableWidth - contentWidth) / 2;
          } else if (numGroups === 2) {
            barWidth = availableWidth / 7.5;
            internalSpacing = barWidth / 2;
            groupSpacing = barWidth;

            const groupWidth = barWidth * 2 + internalSpacing;
            const totalWidth = groupWidth * 2 + groupSpacing;
            initialSpacing = (availableWidth - totalWidth) / 2;
          } else if (numGroups === 3) {
            barWidth = availableWidth / 11;
            internalSpacing = 5;
            groupSpacing = barWidth * 0.8;

            const groupWidth = barWidth * 2 + internalSpacing;
            const totalWidth = groupWidth * 3 + groupSpacing * 2;
            initialSpacing = (availableWidth - totalWidth) / 2;
          } else if (numGroups === 4) {
            barWidth = availableWidth / 14;
            internalSpacing = 4;
            groupSpacing = 12;

            const groupWidth = barWidth * 2 + internalSpacing;
            const totalWidth = groupWidth * 4 + groupSpacing * 3;
            initialSpacing = (availableWidth - totalWidth) / 2;
          } else {
            barWidth = 16;
            groupSpacing = 20;
            internalSpacing = 4;

            const gWidth = barWidth * 2 + internalSpacing;
            const totWidth =
              numGroups * gWidth + Math.max(0, numGroups - 1) * groupSpacing;

            if (totWidth < availableWidth) {
              initialSpacing = (availableWidth - totWidth) / 2;
            } else {
              initialSpacing = 20;
            }
          }

          const structuredData = barChartData.map((item, index) => {
            const isIncomeBar = index % 2 === 0;
            const groupWidth = barWidth * 2 + internalSpacing;

            const newItem = {
              ...item,
              spacing: isIncomeBar ? internalSpacing : groupSpacing,
            };

            if (isIncomeBar && item.label) {
              newItem.labelComponent = () => (
                <CenteredChartLabelWrapper
                  label={item.label}
                  theme={theme}
                  width={groupWidth}
                />
              );
            }
            return newItem;
          });

          return (
            <BarChart
              key={`bar-chart-${transactions.length}-${barWidth}`}
              data={structuredData}
              barWidth={barWidth}
              initialSpacing={Math.max(0, initialSpacing)}
              disableScroll
              roundedTop
              roundedBottom={false}
              rulesType="dashed"
              rulesColor={theme.border}
              rulesLength={screenWidth - 100}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={[
                tw`text-[10px]`,
                { color: theme.textSecondary },
              ]}
              noOfSections={sectionCount}
              maxValue={chartMaxValue}
              stepValue={stepValue > 0 ? stepValue : 10}
              barBorderRadius={4}
              isAnimated
              animationDuration={500}
              yAxisLabelPrefix={getCurrencySymbol(currencyCode)}
              formatYLabel={(label: string) => {
                if (!label) return '0';
                const value = parseFloat(label);
                if (isNaN(value)) return label;

                const format = (
                  val: number,
                  divisor: number,
                  suffix: string,
                ) => {
                  const v = val / divisor;
                  return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + suffix;
                };

                if (value >= 10000000) {
                  return format(value, 10000000, 'Cr');
                }
                if (value >= 100000) {
                  return format(value, 100000, 'L');
                }
                if (value >= 1000) {
                  return format(value, 1000, 'k');
                }
                return value.toFixed(0);
              }}
              renderTooltip={(item: any, index: number) => {
                const minTooltipWidth = 70;
                const tooltipWidth = Math.max(barWidth, minTooltipWidth);

                const isLastBar = index === structuredData.length - 1;
                const isFirstBar = index === 0;

                let marginLeft = -(tooltipWidth / 2);
                if (isLastBar) {
                  marginLeft = -(tooltipWidth - barWidth / 2);
                } else if (isFirstBar) {
                  // Ensure tooltip doesn't go off the left edge
                  marginLeft = 0;
                }

                return (
                  <View
                    style={[
                      tw`absolute items-center justify-center rounded-2xl py-0.5`,
                      {
                        marginLeft: marginLeft,
                        width: tooltipWidth,
                        backgroundColor: theme.text,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-bold`,
                        {
                          color: theme.card,
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {getCurrencySymbol(currencyCode)}
                      {item.value.toLocaleString()}
                    </Text>
                  </View>
                );
              }}
            />
          );
        })()
      ) : (
        <View style={tw`h-50 justify-center items-center`}>
          <Text style={{ color: theme.textSecondary }}>No data available</Text>
        </View>
      )}

      {/* Legend for Bar Chart */}
      <View style={tw`flex-row justify-center mt-4 gap-5`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-2 h-2 rounded-full mr-2 bg-green-500`} />
          <Text
            style={[tw`text-xs font-bold`, { color: theme.textSecondary }]}
          >
            Income
          </Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-2 h-2 rounded-full mr-2 bg-red-400`} />
          <Text
            style={[tw`text-xs font-bold`, { color: theme.textSecondary }]}
          >
            Expense
          </Text>
        </View>
      </View>
    </View>
  );
};

export default IncomeExpenseChart;
