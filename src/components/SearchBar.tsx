import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: Theme;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  theme,
}) => {
  return (
    <View
      style={[
        tw`flex-row items-center px-4 m-4 mb-1 rounded-xl h-12`,
        { backgroundColor: theme.card },
      ]}
    >
      <Icon
        name="search"
        size={20}
        color={theme.textSecondary}
        style={tw`mr-2.5`}
      />
      <TextInput
        style={[tw`flex-1 text-base`, { color: theme.text }]}
        placeholder="Search transactions..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange('')}>
          <Icon name="close-circle" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
