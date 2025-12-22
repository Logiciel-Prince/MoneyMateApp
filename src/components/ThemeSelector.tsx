import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';

interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  theme: Theme;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  theme,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        Appearance
      </Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Theme
        </Text>
        <View style={[styles.themeToggle, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              currentTheme === 'light' && {
                backgroundColor: theme.card,
                elevation: 2,
              },
            ]}
            onPress={() => onThemeChange('light')}
          >
            <Icon
              name="sunny"
              size={20}
              color={currentTheme === 'light' ? '#FDB813' : theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              currentTheme === 'system' && {
                backgroundColor: theme.card,
                elevation: 2,
              },
            ]}
            onPress={() => onThemeChange('system')}
          >
            <Text
              style={{
                color:
                  currentTheme === 'system' ? theme.text : theme.textSecondary,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              AUTO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              currentTheme === 'dark' && {
                backgroundColor: theme.card,
                elevation: 2,
              },
            ]}
            onPress={() => onThemeChange('dark')}
          >
            <Icon
              name="moon"
              size={18}
              color={currentTheme === 'dark' ? '#FFF' : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 20,
    gap: 2,
  },
  themeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
});

export default ThemeSelector;
