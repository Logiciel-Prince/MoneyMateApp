import React, { useState } from 'react';
import {
  View,
  Text,
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
import AnimatedScreenWrapper from '../components/AnimatedScreenWrapper';

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

  // Style constants to avoid inline style warnings
  const whiteTextStyle = { color: '#FFF' };
  const themeTextStyle = { color: theme.text };

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
    <View
      style={[
        tw`flex-row items-center justify-between py-3 border-b`,
        { borderBottomColor: theme.border },
      ]}
    >
      <View style={tw`flex-row items-center gap-2.5 flex-1`}>
        <View
          style={[
            tw`w-8 h-8 rounded-full justify-center items-center`,
            { backgroundColor: item.color + '20' },
          ]}
        >
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
      style={[tw`flex-1`, { backgroundColor: theme.background }]}
      contentContainerStyle={tw`pb-10`}
    >
      <AnimatedScreenWrapper>
        <View style={tw`p-5 pt-2.5`}>
          <Text style={[tw`text-3xl font-bold`, { color: theme.text }]}>
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

        <View style={tw`items-center py-5`}>
          <Text style={[tw`text-xs`, { color: theme.textSecondary }]}>
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
          <View
            style={tw`flex-1 bg-[rgba(0,0,0,0.5)] justify-center items-center`}
          >
            <View
              style={[
                tw`w-[90%] p-5 rounded-2xl`,
                { backgroundColor: theme.card },
              ]}
            >
              <Text style={[tw`text-xl font-bold mb-4`, { color: theme.text }]}>
                Import Data
              </Text>
              <Text style={[{ color: theme.textSecondary }, tw`mb-2.5`]}>
                Paste your backup JSON content below:
              </Text>
              <TextInput
                style={[
                  tw`h-[150px] border rounded-lg p-2.5 text-xs mb-4 align-top`,
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
              <View style={tw`flex-row justify-end gap-3`}>
                <TouchableOpacity
                  style={[
                    tw`px-5 py-2.5 rounded-lg border min-w-[80px] items-center`,
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setImportModalVisible(false)}
                >
                  <Text style={{ color: theme.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    tw`px-5 py-2.5 rounded-lg border min-w-[80px] items-center`,
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
            style={tw`flex-1 bg-[rgba(0,0,0,0.5)] justify-center items-center`}
            onPress={() => setCurrencyModalVisible(false)}
            activeOpacity={1}
          >
            <View
              style={[
                tw`w-[80%] p-5 rounded-2xl`,
                { backgroundColor: theme.card },
              ]}
            >
              <Text style={[tw`text-xl font-bold mb-4`, { color: theme.text }]}>
                Select Currency
              </Text>
              {currencies.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    tw`py-4 flex-row justify-between border-b`,
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
          <View style={[tw`flex-1`, { backgroundColor: theme.background }]}>
            <View
              style={[
                tw`flex-row justify-between items-center p-5 border-b`,
                { borderBottomColor: theme.border },
              ]}
            >
              <Text style={[tw`text-xl font-bold`, { color: theme.text }]}>
                Manage Categories
              </Text>
              <TouchableOpacity
                onPress={() => setCategoriesModalVisible(false)}
              >
                <Icon name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={renderCategoryItem}
              contentContainerStyle={tw`p-5 pb-25`}
            />

            <View
              style={[
                tw`p-5 border-t`,
                {
                  backgroundColor: theme.card,
                  borderTopColor: theme.border,
                },
              ]}
            >
              <Text
                style={[{ color: theme.text }, tw`font-semibold`, tw`mb-2.5`]}
              >
                Add New Category
              </Text>
              <View style={tw`flex-row gap-2.5 mb-2.5`}>
                <TouchableOpacity
                  style={[
                    tw`py-2 px-4 rounded-full border`,
                    newCatType === CategoryType.EXPENSE
                      ? tw`bg-[#ef4444] border-[#ef4444]`
                      : tw`border-[#888]`,
                  ]}
                  onPress={() => setNewCatType(CategoryType.EXPENSE)}
                >
                  <Text
                    style={[
                      newCatType === CategoryType.EXPENSE
                        ? whiteTextStyle
                        : themeTextStyle,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    tw`py-2 px-4 rounded-full border`,
                    newCatType === CategoryType.INCOME
                      ? tw`bg-[#10b981] border-[#10b981]`
                      : tw`border-[#888]`,
                  ]}
                  onPress={() => setNewCatType(CategoryType.INCOME)}
                >
                  <Text
                    style={[
                      newCatType === CategoryType.INCOME
                        ? whiteTextStyle
                        : themeTextStyle,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={tw`flex-row gap-2.5`}>
                <TextInput
                  style={[
                    tw`flex-1 h-[45px] border rounded-lg p-2.5`,
                    {
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
                    tw`px-4 py-2 rounded-lg justify-center`,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleAddCategory}
                >
                  <Icon name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </AnimatedScreenWrapper>
    </ScrollView>
  );
};

export default SettingsScreen;

