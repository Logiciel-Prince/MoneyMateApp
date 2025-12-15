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
import { Budget, CategoryType } from '../types';
import { useData } from '../context/DataContext';

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  editBudget?: Budget;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  editBudget,
}) => {
  const systemColorScheme = useColorScheme();
  const { settings, categories } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [category, setCategory] = useState(editBudget?.category || '');
  const [amount, setAmount] = useState(editBudget?.amount.toString() || '');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>(
    editBudget?.period || 'monthly',
  );

  // Error states
  const [errors, setErrors] = useState({
    category: '',
    amount: '',
  });

  // Filter categories for Expense type
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }
    return categories
      .filter(cat => cat.type === CategoryType.EXPENSE)
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
  }, [categories]);

  const handleSave = () => {
    // Clear previous errors
    const newErrors = {
      category: '',
      amount: '',
    };

    let hasError = false;

    // Validate category
    if (!category || category.trim() === '') {
      newErrors.category = 'Please select a category';
      hasError = true;
    }

    // Validate amount
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Please enter a budget amount';
      hasError = true;
    } else {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = 'Please enter a valid positive amount';
        hasError = true;
      }
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    const parsedAmount = parseFloat(amount);

    onSave({
      category,
      amount: parsedAmount,
      spent: editBudget?.spent || 0, // Keep existing spent or 0
      period,
    });

    // Reset form
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setErrors({
      category: '',
      amount: '',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={activeThemeType === 'dark' ? 'dark' : 'light'}
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editBudget ? 'Edit Budget' : 'Add Budget'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Category */}
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
            {errors.category ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.category}
              </Text>
            ) : null}

            {/* Budget Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Budget Limit
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
            {errors.amount ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.amount}
              </Text>
            ) : null}

            {/* Period */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Period
            </Text>
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { borderColor: theme.border },
                  period === 'monthly' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setPeriod('monthly')}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: period === 'monthly' ? '#FFF' : theme.text },
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { borderColor: theme.border },
                  period === 'yearly' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setPeriod('yearly')}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: period === 'yearly' ? '#FFF' : theme.text },
                  ]}
                >
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '90%',
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
  periodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 15,
    fontWeight: '600',
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AddBudgetModal;
