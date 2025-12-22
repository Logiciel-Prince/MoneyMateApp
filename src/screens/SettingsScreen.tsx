import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Modal,
  TextInput,
  Share,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { CategoryType, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';
import tw from 'twrnc';
import ThemeSelector from '../components/ThemeSelector';
import CurrencySelector from '../components/CurrencySelector';
import CategoryManagerCard from '../components/CategoryManagerCard';
import DataManagementCard from '../components/DataManagementCard';

const SettingsScreen = ({ navigation }: any) => {
  const systemColorScheme = useColorScheme();
  const {
    settings,
    updateSettings,
    loadDemoData,
    clearAllData,
    exportData,
    importData,
    categories,
    addCategory,
    deleteCategory,
  } = useData();

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  // Categories Modal State
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>(
    CategoryType.EXPENSE,
  );

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const handleLoadDemoData = () => {
    Alert.alert(
      'Load Demo Data',
      'This will overwrite existing data with sample data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            loadDemoData();
            Alert.alert('Success', 'Demo data loaded successfully!');
            navigation.navigate('Dashboard');
          },
        },
      ],
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, accounts, budgets, and goals. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data cleared successfully!');
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      const json = await exportData();
      await Share.share({
        message: json,
        title: 'MoneyMate Backup',
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please paste the JSON data first');
      return;
    }

    setIsImporting(true);
    setTimeout(async () => {
      const success = await importData(importText);
      setIsImporting(false);
      if (success) {
        setImportModalVisible(false);
        setImportText('');
        Alert.alert('Success', 'Data imported successfully!');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid data format. Please check your JSON.');
      }
    }, 100);
  };

  const toggleTheme = (mode: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: mode });
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;

    const newCategory: Category = {
      id: uuidv4(),
      name: newCatName.trim(),
      type: newCatType,
      color: newCatType === CategoryType.INCOME ? '#10b981' : '#ef4444',
      icon:
        newCatType === CategoryType.INCOME
          ? 'cash-outline'
          : 'pricetag-outline',
      is_default: false,
    };

    addCategory(newCategory);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
      return;
    }

    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCategory(id),
      },
    ]);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={[styles.categoryItem, { borderBottomColor: theme.border }]}>
      <View style={[tw`flex-row`, tw`items-center`, tw`gap-2.5`, tw`flex-1`]}>
        <View style={[styles.catIcon, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={18} color={item.color} />
        </View>
        <View>
          <Text style={[{ color: theme.text }, tw`font-medium`]}>
            {item.name}
          </Text>
          <Text
            style={[
              { color: theme.textSecondary },
              tw`text-[10px]`,
              tw`capitalize`,
            ]}
          >
            {item.type}
          </Text>
        </View>
      </View>

      {!item.is_default && (
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item.id, item.is_default)}
          style={tw`p-1.5`}
        >
          <Icon name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
      {item.is_default && (
        <Icon
          name="lock-closed-outline"
          size={14}
          color={theme.textSecondary}
          style={tw`opacity-50`}
        />
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={tw`pb-10`}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
      </View>

      {/* Theme Selector */}
      <ThemeSelector
        currentTheme={settings.theme}
        onThemeChange={toggleTheme}
        theme={theme}
      />

      {/* Currency Selector */}
      <CurrencySelector
        selectedCurrency={settings.currency}
        currencies={currencies}
        onPress={() => setCurrencyModalVisible(true)}
        theme={theme}
      />

      {/* Category Manager */}
      <CategoryManagerCard
        onManagePress={() => setCategoriesModalVisible(true)}
        theme={theme}
      />

      {/* Data Management */}
      <DataManagementCard
        onLoadDemo={handleLoadDemoData}
        onImport={() => setImportModalVisible(true)}
        onExport={handleExportData}
        onClearData={handleClearData}
        theme={theme}
      />

      <View style={styles.footer}>
        <Text style={[{ color: theme.textSecondary }, tw`text-xs`]}>
          MoneyMate v1.0.0 • Local Storage Persistence
        </Text>
      </View>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Import Data
            </Text>
            <Text style={[{ color: theme.textSecondary }, tw`mb-2.5`]}>
              Paste your backup JSON content below:
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              multiline
              value={importText}
              onChangeText={setImportText}
              placeholder="{ ... }"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={handleImportData}
                disabled={isImporting}
              >
                {isImporting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={tw`text-white`}>Import</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setCurrencyModalVisible(false)}
          activeOpacity={1}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.card, width: '80%' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Currency
            </Text>
            {currencies.map(c => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.currencyOption,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => {
                  updateSettings({ currency: c.code });
                  setCurrencyModalVisible(false);
                }}
              >
                <Text style={[{ color: theme.text }, tw`text-base`]}>
                  {c.symbol} - {c.name} ({c.code})
                </Text>
                {settings.currency === c.code && (
                  <Icon name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        visible={categoriesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <View
          style={[
            styles.fullScreenModal,
            { backgroundColor: theme.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>
              Manage Categories
            </Text>
            <TouchableOpacity onPress={() => setCategoriesModalVisible(false)}>
              <Icon name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          />

          <View
            style={[
              styles.addCategoryContainer,
              { backgroundColor: theme.card, borderTopColor: theme.border },
            ]}
          >
            <Text
              style={[{ color: theme.text }, tw`font-semibold`, tw`mb-2.5`]}
            >
              Add New Category
            </Text>
            <View style={[tw`flex-row`, tw`gap-2.5`, tw`mb-2.5`]}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  newCatType === CategoryType.EXPENSE && {
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                  },
                ]}
                onPress={() => setNewCatType(CategoryType.EXPENSE)}
              >
                <Text
                  style={{
                    color:
                      newCatType === CategoryType.EXPENSE ? '#FFF' : theme.text,
                  }}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  newCatType === CategoryType.INCOME && {
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                  },
                ]}
                onPress={() => setNewCatType(CategoryType.INCOME)}
              >
                <Text
                  style={{
                    color:
                      newCatType === CategoryType.INCOME ? '#FFF' : theme.text,
                  }}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[tw`flex-row`, tw`gap-2.5`]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    height: 45,
                    marginBottom: 0,
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Category Name"
                placeholderTextColor={theme.textSecondary}
                value={newCatName}
                onChangeText={setNewCatName}
              />
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.primary, justifyContent: 'center' },
                ]}
                onPress={handleAddCategory}
              >
                <Icon name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 12,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  currencyOption: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  fullScreenModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryContainer: {
    padding: 20,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default SettingsScreen;
