import React, { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
}

const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Start with invisible
      fadeAnim.setValue(0);

      // Simple fade in animation - like Instagram, Twitter, etc.
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200, // Quick and subtle
        useNativeDriver: true,
      }).start();

      // No cleanup needed - keep screen visible when unfocused
    }, [fadeAnim])
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedScreenWrapper;
