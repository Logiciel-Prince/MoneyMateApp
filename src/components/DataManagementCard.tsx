import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { Theme } from '../theme';

interface DataManagementCardProps {
  onLoadDemo: () => void;
  onImport: () => void;
  onExport: () => void;
  onClearData: () => void;
  theme: Theme;
}

const DataManagementCard: React.FC<DataManagementCardProps> = ({
  onLoadDemo,
  onImport,
  onExport,
  onClearData,
  theme,
}) => {
  return (
    <View
      style={[tw`rounded-2xl mx-4 mb-4 p-4`, { backgroundColor: theme.card }]}
    >
      <Text style={[tw`text-lg font-bold mb-4`, { color: theme.text }]}>
        Data Management
      </Text>

      {/* Load Demo */}
      <View
        style={tw`flex-row items-center py-3 border-b gap-2 border-[#FFFFFF10]`}
      >
        <View style={tw`flex-1`}>
          <Text style={[tw`text-base font-semibold`, { color: theme.text }]}>
            Load Demo Data
          </Text>
          <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
            Populate the app with sample data.
          </Text>
        </View>
        <TouchableOpacity
          style={tw`px-4 py-2 rounded-lg bg-[#3b82f6]`}
          onPress={onLoadDemo}
        >
          <Text style={tw`text-white font-semibold`}>Load Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Import */}
      <View
        style={tw`flex-row items-center py-3 border-b gap-2 border-[#FFFFFF10]`}
      >
        <Icon
          name="cloud-upload-outline"
          size={24}
          color={theme.textSecondary}
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={[tw`text-base font-semibold`, { color: theme.text }]}>
            Import Data
          </Text>
          <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
            Restore from backup JSON.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            tw`px-4 py-2 rounded-lg border`,
            { borderColor: theme.border },
          ]}
          onPress={onImport}
        >
          <Text style={{ color: theme.text }}>Import</Text>
        </TouchableOpacity>
      </View>

      {/* Export */}
      <View
        style={tw`flex-row items-center py-3 border-b gap-2 border-[#FFFFFF10]`}
      >
        <Icon
          name="cloud-download-outline"
          size={24}
          color={theme.textSecondary}
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={[tw`text-base font-semibold`, { color: theme.text }]}>
            Export Data
          </Text>
          <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
            Download generic backup JSON.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            tw`px-4 py-2 rounded-lg border`,
            { borderColor: theme.border },
          ]}
          onPress={onExport}
        >
          <Text style={{ color: theme.text }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Clear Data */}
      <View
        style={tw`flex-row items-center p-2.5 rounded-lg mt-2.5 gap-2 bg-[rgba(239,68,68,0.05)]`}
      >
        <Icon
          name="trash-outline"
          size={24}
          color="#ef4444"
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`text-base font-semibold text-[#ef4444]`}>
            Clear All Data
          </Text>
          <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
            Permanently remove all local data.
          </Text>
        </View>
        <TouchableOpacity
          style={tw`px-4 py-2 rounded-lg bg-[#ef4444]`}
          onPress={onClearData}
        >
          <Text style={tw`text-white font-semibold`}>Clear Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DataManagementCard;

