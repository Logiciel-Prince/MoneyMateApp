import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '../theme';
import tw from 'twrnc';

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
    <View
      style={[
        tw`rounded-2xl mx-4 mb-4 p-4`,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      <Text style={[tw`text-lg font-bold mb-4`, { color: theme.text }]}>
        Appearance
      </Text>
      <View style={tw`flex-row justify-between items-center`}>
        <Text
          style={[tw`text-base font-medium`, { color: theme.textSecondary }]}
        >
          Theme
        </Text>
        <View
          style={[
            tw`flex-row p-[3px] rounded-[20px] gap-[2px] relative`,
            { backgroundColor: theme.background },
          ]}
        >
          {/* Animated sliding background indicator */}
          <Animated.View
            style={[
              tw`absolute top-[3px] left-[3px] w-[44px] h-[32px] rounded-2xl`,
              {
                backgroundColor: theme.card,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          />

          <Animated.View style={{ transform: [{ scale: scaleLight }] }}>
            <TouchableOpacity
              style={tw`w-[44px] h-[32px] rounded-2xl items-center justify-center z-10`}
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
              style={tw`w-[44px] h-[32px] rounded-2xl items-center justify-center z-10`}
              onPress={() => handlePress('system', scaleSystem)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  tw`font-semibold text-xs`,
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
              style={tw`w-[44px] h-[32px] rounded-2xl items-center justify-center z-10`}
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

export default ThemeSelector;

