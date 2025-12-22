import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        Data Management
      </Text>

      {/* Load Demo */}
      <View style={styles.dataRow}>
        <View style={tw`flex-1`}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>
            Load Demo Data
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
            Populate the app with sample data.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
          onPress={onLoadDemo}
        >
          <Text style={styles.actionBtnText}>Load Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Import */}
      <View style={styles.dataRow}>
        <Icon
          name="cloud-upload-outline"
          size={24}
          color={theme.textSecondary}
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>
            Import Data
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
            Restore from backup JSON.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: theme.border }]}
          onPress={onImport}
        >
          <Text style={{ color: theme.text }}>Import</Text>
        </TouchableOpacity>
      </View>

      {/* Export */}
      <View style={styles.dataRow}>
        <Icon
          name="cloud-download-outline"
          size={24}
          color={theme.textSecondary}
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>
            Export Data
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
            Download generic backup JSON.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: theme.border }]}
          onPress={onExport}
        >
          <Text style={{ color: theme.text }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Clear Data */}
      <View
        style={[
          styles.dataRow,
          {
            borderBottomWidth: 0,
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
          },
        ]}
      >
        <Icon
          name="trash-outline"
          size={24}
          color="#ef4444"
          style={tw`mr-2.5`}
        />
        <View style={tw`flex-1`}>
          <Text style={[styles.rowTitle, { color: '#ef4444' }]}>
            Clear All Data
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
            Permanently remove all local data.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
          onPress={onClearData}
        >
          <Text style={styles.actionBtnText}>Clear Data</Text>
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
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
    gap: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  outlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default DataManagementCard;
