import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
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
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleLight = useRef(new Animated.Value(1)).current;
  const scaleSystem = useRef(new Animated.Value(1)).current;
  const scaleDark = useRef(new Animated.Value(1)).current;

  // Calculate button width (including padding and gap)
  const buttonWidth = 46; // 40 minWidth + 4 horizontal padding + 2 gap

  // Animate the sliding indicator when theme changes
  useEffect(() => {
    const position =
      currentTheme === 'light' ? 0 : currentTheme === 'system' ? 1 : 2;
    Animated.spring(slideAnim, {
      toValue: position * buttonWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [currentTheme, slideAnim]);

  const handlePress = (
    themeMode: 'light' | 'dark' | 'system',
    scaleValue: Animated.Value,
  ) => {
    // Scale animation for tactile feedback
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onThemeChange(themeMode);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>Appearance</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Theme
        </Text>
        <View
          style={[styles.themeToggle, { backgroundColor: theme.background }]}
        >
          {/* Animated sliding background indicator */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                backgroundColor: theme.card,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          />

          <Animated.View style={{ transform: [{ scale: scaleLight }] }}>
            <TouchableOpacity
              style={styles.themeBtn}
              onPress={() => handlePress('light', scaleLight)}
              activeOpacity={0.7}
            >
              <Icon
                name="sunny"
                size={20}
                color={
                  currentTheme === 'light' ? '#FDB813' : theme.textSecondary
                }
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleSystem }] }}>
            <TouchableOpacity
              style={styles.themeBtn}
              onPress={() => handlePress('system', scaleSystem)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.autoText,
                  {
                    color:
                      currentTheme === 'system'
                        ? theme.text
                        : theme.textSecondary,
                  },
                ]}
              >
                AUTO
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleDark }] }}>
            <TouchableOpacity
              style={styles.themeBtn}
              onPress={() => handlePress('dark', scaleDark)}
              activeOpacity={0.7}
            >
              <Icon
                name="moon"
                size={18}
                color={currentTheme === 'dark' ? '#FFF' : theme.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
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
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 44,
    height: 32,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  themeBtn: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  autoText: {
    fontWeight: '600',
    fontSize: 12,
  },
});

export default ThemeSelector;
