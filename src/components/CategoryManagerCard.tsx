import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View
      style={[tw`rounded-2xl mx-4 mb-4 p-4`, { backgroundColor: theme.card }]}
    >
      <Text style={[tw`text-lg font-bold mb-4`, { color: theme.text }]}>
        Categories
      </Text>
      <View
        style={[
          tw`flex-row items-center justify-between p-3 rounded-xl gap-2.5 opacity-80`,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={tw`flex-row items-center gap-3 flex-1`}>
          <View
            style={[
              tw`w-10 h-10 rounded-xl justify-center items-center bg-[#8b5cf6]`,
            ]}
          >
            <Icon name="pricetag" size={24} color="#FFF" />
          </View>
          <View style={tw`flex-1`}>
            <Text
              style={[
                tw`text-base font-semibold mb-0.5`,
                { color: theme.text },
              ]}
            >
              Manage Categories
            </Text>
            <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
              Edit existing categories or add new ones.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            tw`px-3 py-1.5 border rounded-lg`,
            { borderColor: theme.border },
          ]}
          onPress={onManagePress}
        >
          <Text style={[tw`font-semibold`, { color: theme.text }]}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategoryManagerCard;

