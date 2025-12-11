import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {lightTheme, darkTheme} from '../theme';
import {Budget} from '../types';
import { useData } from '../context/DataContext';

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  editBudget?: Budget;
}

const BUDGET_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Rent',
  'Dining',
  'Education',
  'Other',
];

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  editBudget,
}) => {
  const systemColorScheme = useColorScheme();
  const { settings } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [category, setCategory] = useState(editBudget?.category || '');
  const [amount, setAmount] = useState(editBudget?.amount.toString() || '');
  const [spent, setSpent] = useState(editBudget?.spent.toString() || '0');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>(
    editBudget?.period || 'monthly',
  );

  const handleSave = () => {
    if (!category || !amount) {
      return;
    }

    onSave({
      category,
      amount: parseFloat(amount),
      spent: parseFloat(spent),
      period,
    });

    // Reset form
    setCategory('');
    setAmount('');
    setSpent('0');
    setPeriod('monthly');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editBudget ? 'Edit Budget' : 'Add Budget'}
          </Text>

          {/* Category */}
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {BUDGET_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && { backgroundColor: theme.primary },
                  { borderColor: theme.border },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: category === cat ? '#FFF' : theme.text },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Budget Amount */}
          <Text style={[styles.label, { color: theme.text }]}>
            Budget Amount
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
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Spent Amount */}
          <Text style={[styles.label, { color: theme.text }]}>
            Already Spent
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
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            value={spent}
            onChangeText={setSpent}
          />

          {/* Period */}
          <Text style={[styles.label, { color: theme.text }]}>Period</Text>
          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === 'monthly' && { backgroundColor: theme.primary },
                { borderColor: theme.border },
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
                period === 'yearly' && { backgroundColor: theme.primary },
                { borderColor: theme.border },
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

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.textSecondary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddBudgetModal;
