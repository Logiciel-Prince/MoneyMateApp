import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import { Dropdown } from 'react-native-element-dropdown';
import { lightTheme, darkTheme } from '../theme';
import { Transaction, CategoryType } from '../types';
import { useData } from '../context/DataContext';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  accounts: Array<{ id: string; name: string }>;
  editTransaction?: Transaction;
}

// Helper function to format date as YYYY-MM-DD HH:mm
const getFormattedDateTime = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  accounts,
  editTransaction,
}) => {
  const systemColorScheme = useColorScheme();
  const { settings, categories } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(
    editTransaction?.type || 'expense',
  );
  const [amount, setAmount] = useState(
    editTransaction?.amount.toString() || '',
  );
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(
    editTransaction?.description || '',
  );

  const [accountId, setAccountId] = useState(
    editTransaction?.accountId || accounts[0]?.id || '',
  );
  const [toAccountId, setToAccountId] = useState(
    editTransaction?.toAccountId || '',
  );

  // Auto-fill date when modal opens

  // Filter categories based on transaction type
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }
    if (type === 'transfer') {
      return [];
    }
    const typeFilter =
      type === 'income' ? CategoryType.INCOME : CategoryType.EXPENSE;
    return categories
      .filter(cat => cat.type === typeFilter)
      .sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return a.name.localeCompare(b.name);
      })
      .map(cat => ({
        label: cat.name,
        value: cat.name,
        color: cat.color,
      }));
  }, [categories, type]);

  const accountOptions = useMemo(() => {
    return accounts.map(acc => ({
      label: acc.name,
      value: acc.id,
    }));
  }, [accounts]);

  const handleSave = () => {
    if (!amount || !accountId) {
      return;
    }

    if (type !== 'transfer' && !category) {
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      return;
    }

    const transactionDate = editTransaction
      ? editTransaction.date
      : getFormattedDateTime();

    onSave({
      type,
      amount: parseFloat(amount),
      category: type === 'transfer' ? 'Transfer' : category,
      description,
      date: transactionDate,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
    });

    setType('expense');
    setAmount('');
    setCategory('');
    setDescription('');
    setAccountId(accounts[0]?.id || '');
    setToAccountId('');
    onClose();
  };

  // Reset category when type changes
  const handleTypeChange = (newType: 'income' | 'expense' | 'transfer') => {
    setType(newType);
    setCategory('');
    if (newType !== 'transfer') {
      setToAccountId('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={activeThemeType === 'dark' ? 'dark' : 'light'}
          blurAmount={0.5}
          reducedTransparencyFallbackColor="white"
        />
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Type Selection */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Type
            </Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: theme.border },
                  type === 'income' && {
                    backgroundColor: theme.income,
                    borderColor: theme.income,
                  },
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: type === 'income' ? '#FFF' : theme.text },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: theme.border },
                  type === 'expense' && {
                    backgroundColor: theme.expense,
                    borderColor: theme.expense,
                  },
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: type === 'expense' ? '#FFF' : theme.text },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: theme.border },
                  type === 'transfer' && {
                    backgroundColor: '#3B82F6', // Blue for transfer
                    borderColor: '#3B82F6',
                  },
                ]}
                onPress={() => handleTypeChange('transfer')}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: type === 'transfer' ? '#FFF' : theme.text },
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Amount
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Icon
                name="cash-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Category - Hide for Transfer */}
            {type !== 'transfer' && (
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Category
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholderStyle={[
                    styles.placeholderStyle,
                    { color: theme.textSecondary },
                  ]}
                  selectedTextStyle={[
                    styles.selectedTextStyle,
                    { color: theme.text },
                  ]}
                  iconStyle={styles.iconStyle}
                  data={availableCategories}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select category"
                  value={category}
                  onChange={item => {
                    setCategory(item.value);
                  }}
                  renderLeftIcon={() => (
                    <Icon
                      name="pricetag-outline"
                      size={20}
                      color={theme.textSecondary}
                      style={styles.inputIcon}
                    />
                  )}
                  renderItem={(item: any) => (
                    <View style={styles.dropdownItem}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text
                        style={[styles.dropdownItemText, { color: theme.text }]}
                      >
                        {item.label}
                      </Text>
                      {category === item.value && (
                        <Icon
                          name="checkmark"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </View>
                  )}
                  containerStyle={[
                    styles.dropdownContainer,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </>
            )}

            {/* Description */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Description (Optional)
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Icon
                name="document-text-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter description (Optional)"
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Account */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {type === 'transfer' ? 'From Account' : 'Account'}
            </Text>
            <Dropdown
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              placeholderStyle={[
                styles.placeholderStyle,
                { color: theme.textSecondary },
              ]}
              selectedTextStyle={[
                styles.selectedTextStyle,
                { color: theme.text },
              ]}
              iconStyle={styles.iconStyle}
              data={accountOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select account"
              dropdownPosition="top"
              value={accountId}
              onChange={item => {
                setAccountId(item.value);
              }}
              renderLeftIcon={() => (
                <Icon
                  name="wallet-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
              )}
              renderItem={(item: any) => (
                <View style={styles.dropdownItem}>
                  <Text
                    style={[styles.dropdownItemText, { color: theme.text }]}
                  >
                    {item.label}
                  </Text>
                  {accountId === item.value && (
                    <Icon name="checkmark" size={20} color={theme.primary} />
                  )}
                </View>
              )}
              containerStyle={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* To Account - Only for Transfer */}
            {type === 'transfer' && (
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  To Account
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholderStyle={[
                    styles.placeholderStyle,
                    { color: theme.textSecondary },
                  ]}
                  selectedTextStyle={[
                    styles.selectedTextStyle,
                    { color: theme.text },
                  ]}
                  iconStyle={styles.iconStyle}
                  data={accountOptions.filter(opt => opt.value !== accountId)}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select account"
                  dropdownPosition="top"
                  value={toAccountId}
                  onChange={item => {
                    setToAccountId(item.value);
                  }}
                  renderLeftIcon={() => (
                    <Icon
                      name="wallet-outline"
                      size={20}
                      color={theme.textSecondary}
                      style={styles.inputIcon}
                    />
                  )}
                  renderItem={(item: any) => (
                    <View style={styles.dropdownItem}>
                      <Text
                        style={[styles.dropdownItemText, { color: theme.text }]}
                      >
                        {item.label}
                      </Text>
                      {toAccountId === item.value && (
                        <Icon
                          name="checkmark"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </View>
                  )}
                  containerStyle={[
                    styles.dropdownContainer,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdown: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  placeholderStyle: {
    fontSize: 15,
  },
  selectedTextStyle: {
    fontSize: 15,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  saveButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddTransactionModal;
