import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal
} from 'react-native';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handlePressIn = (event: any) => {
    // Measure the element position
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setPosition({ x: pageX, y: pageY, width, height });
      setVisible(true);
    });
  };

  const handlePressOut = () => {
    setVisible(false);
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement<any>, {
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
      })}

      {visible && (
        <Modal transparent visible={visible} animationType="fade">
          <View style={styles.overlay} pointerEvents="none">
            <View
              style={[
                styles.tooltip,
                {
                  position: 'absolute',
                  top: position.y - 45, // Position above the element
                  left: position.x + position.width / 2,
                  transform: [{ translateX: -125 }], // Center the tooltip (assuming max width 250)
                },
              ]}
            >
              <Text style={styles.tooltipText}>{content}</Text>
              {/* Arrow pointing down */}
              <View style={styles.arrow} />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  tooltip: {
    backgroundColor: '#18181b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    marginLeft: -5,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#18181b',
  },
});
