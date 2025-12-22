import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';

interface CategoryManagerCardProps {
  onManagePress: () => void;
  theme: Theme;
}

const CategoryManagerCard: React.FC<CategoryManagerCardProps> = ({
  onManagePress,
  theme,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        Categories
      </Text>
      <View
        style={[
          styles.innerCard,
          { backgroundColor: theme.background },
          tw`opacity-80`,
        ]}
      >
        <View style={styles.categoryInfo}>
          <View style={[styles.iconBox, { backgroundColor: '#8b5cf6' }]}>
            <Icon name="pricetag" size={24} color="#FFF" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={[styles.innerTitle, { color: theme.text }]}>
              Manage Categories
            </Text>
            <Text style={[{ color: theme.textSecondary }, tw`text-xs`]}>
              Edit existing categories or add new ones.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.smallBtn, { borderColor: theme.border }]}
          onPress={onManagePress}
        >
          <Text style={[{ color: theme.text }, tw`font-semibold`]}>
            Manage
          </Text>
        </TouchableOpacity>
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
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default CategoryManagerCard;
