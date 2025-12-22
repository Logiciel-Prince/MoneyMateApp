import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';
import { formatCurrency } from '../utils/currency';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  theme: Theme;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isPositive?: boolean;
  currencyCode?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  theme,
  trend,
  trendDirection,
  isPositive,
  currencyCode = 'USD',
}) => {
  // Resolve color: if it's a tailwind class, use tw, else use as is
  const iconColorStyle =
    color.startsWith('text-') || color.startsWith('bg-')
      ? tw`${color}`
      : { color: color };
  const iconColor = (iconColorStyle as any).color || color;
  const iconBgColor = color.startsWith('text-')
    ? color.replace('text-', 'bg-').replace('600', '100')
    : `${color}20`;

  const bgStyle = color.startsWith('text-')
    ? tw`${iconBgColor} opacity-20`
    : { backgroundColor: `${color}20` };

  // Helper function to get trend color based on theme and positivity
  const getTrendColor = (positive: boolean, isDark: boolean): string => {
    if (positive) {
      return isDark ? '#4ade80' : '#16a34a';
    }
    return isDark ? '#f87171' : '#dc2626';
  };

  const trendColor = getTrendColor(isPositive ?? true, theme.mode === 'dark');

  return (
    <View
      style={[
        tw`p-4 rounded-2xl mb-4 shadow-md`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <View style={tw`flex-row justify-between items-start`}>
        <View>
          <View
            style={[
              tw`w-10 h-10 rounded-full justify-center items-center mb-2`,
              bgStyle,
            ]}
          >
            <Icon name={icon} size={20} color={iconColor} />
          </View>
          <Text style={[tw`text-sm mb-1`, { color: theme.textSecondary }]}>
            {label}
          </Text>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: theme.text }]}>
            {typeof value === 'number'
              ? formatCurrency(value, currencyCode)
              : value}
          </Text>

          {trend && (
            <View style={tw`flex-row items-center`}>
              <Icon
                name={trendDirection === 'up' ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={trendColor}
                style={[
                  tw`mr-1`,
                  {
                    transform: [
                      { rotate: trendDirection === 'up' ? '45deg' : '-45deg' },
                    ],
                  },
                ]}
              />
              <Text
                style={[
                  tw`text-xs`,
                  {
                    color: trendColor,
                  },
                ]}
              >
                {trend}
              </Text>
            </View>
          )}
        </View>

        {/* Large background icon */}
        <View style={tw`absolute right-0 -mr-2 opacity-5`}>
          <Icon name={icon} size={100} color={theme.text} />
        </View>
      </View>
    </View>
  );
};

export default StatCard;
