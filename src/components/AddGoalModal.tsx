import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { lightTheme, darkTheme } from '../theme';
import { Goal } from '../types';
import { useData } from '../context/DataContext';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
  editGoal?: Goal;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
  onSave,
  editGoal,
}) => {
  const systemColorScheme = useColorScheme();
  const { settings } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [name, setName] = useState(editGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    editGoal?.targetAmount.toString() || '',
  );
  const [currentAmount, setCurrentAmount] = useState(
    editGoal?.currentAmount.toString() || '0',
  );
  const [deadline, setDeadline] = useState(editGoal?.deadline || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleNumericInput = (
    text: string,
    setter: (value: string) => void,
  ) => {
    // Allow digits and a single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setter(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setter(cleaned);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDeadline(formatted);
    }
  };

  const handleSave = () => {
    // Clear previous errors
    const newErrors = {
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
    };

    let hasError = false;

    // Validate goal name
    if (!name || name.trim() === '') {
      newErrors.name = 'Please enter a goal name';
      hasError = true;
    }

    // Validate target amount
    if (!targetAmount || targetAmount.trim() === '') {
      newErrors.targetAmount = 'Please enter a target amount';
      hasError = true;
    } else {
      const parsedTargetAmount = parseFloat(targetAmount);
      if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
        newErrors.targetAmount = 'Please enter a valid positive target amount';
        hasError = true;
      }
    }

    // Validate current amount
    const parsedCurrentAmount = parseFloat(currentAmount || '0');
    if (isNaN(parsedCurrentAmount) || parsedCurrentAmount < 0) {
      newErrors.currentAmount = 'Please enter a valid current amount';
      hasError = true;
    }

    if (targetAmount && parsedCurrentAmount > parseFloat(targetAmount || '0')) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
      hasError = true;
    }

    // Validate deadline
    if (!deadline || deadline.trim() === '') {
      newErrors.deadline = 'Please select a deadline';
      hasError = true;
    } else {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline must be today or in the future';
        hasError = true;
      }
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    onSave({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parsedCurrentAmount,
      deadline,
      category: 'Savings', // Default category
    });

    // Reset form
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setErrors({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
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
              {editGoal ? 'Edit Goal' : 'Add Goal'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Goal Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Goal Name
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
                name="flag-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g., Emergency Fund"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
            {errors.name ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.name}
              </Text>
            ) : null}

            {/* Target Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Target Amount
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
                value={targetAmount}
                onChangeText={text => handleNumericInput(text, setTargetAmount)}
              />
            </View>
            {errors.targetAmount ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.targetAmount}
              </Text>
            ) : null}

            {/* Current Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Current Amount
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
                name="wallet-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                value={currentAmount}
                onChangeText={text =>
                  handleNumericInput(text, setCurrentAmount)
                }
              />
            </View>
            {errors.currentAmount ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.currentAmount}
              </Text>
            ) : null}

            {/* Deadline */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Deadline (YYYY-MM-DD)
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
                name="calendar-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{ flex: 1 }}
              >
                <Text
                  style={[
                    styles.input,
                    {
                      color: deadline ? theme.text : theme.textSecondary,
                      paddingVertical: 12, // Match input padding
                    },
                  ]}
                >
                  {deadline || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.deadline ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.deadline}
              </Text>
            ) : null}

            {showDatePicker && (
              <DateTimePicker
                value={deadline ? new Date(deadline) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
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

export default AddGoalModal;
