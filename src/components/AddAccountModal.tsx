import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { lightTheme, darkTheme } from '../theme';
import { Account } from '../types';
import { useData } from '../context/DataContext';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
  editAccount?: Account;
}

const ACCOUNT_TYPES: Array<'bank' | 'wallet' | 'credit' | 'cash'> = [
  'bank',
  'wallet',
  'credit',
  'cash',
];

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onSave,
  editAccount,
}) => {
  const systemColorScheme = useColorScheme();
  const { settings } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [name, setName] = useState(editAccount?.name || '');
  const [type, setType] = useState<'bank' | 'wallet' | 'credit' | 'cash'>(
    editAccount?.type || 'bank',
  );
  const [balance, setBalance] = useState(
    editAccount?.balance.toString() || '0',
  );

  const handleSave = () => {
    if (!name || !balance) {
      return;
    }

    onSave({
      name,
      type,
      balance: parseFloat(balance),
      currency: settings.currency, // Use settings currency
    });

    // Reset form
    setName('');
    setType('bank');
    setBalance('0');
    // Currency is derived from settings, no state needed
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editAccount ? 'Edit Account' : 'Add Account'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Account Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Account Name
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
                name="pricetag-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g., Main Checking"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Account Type */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Account Type
            </Text>
            <View style={styles.typeContainer}>
              {ACCOUNT_TYPES.map(accountType => (
                <TouchableOpacity
                  key={accountType}
                  style={[
                    styles.typeButton,
                    { borderColor: theme.border },
                    type === accountType && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setType(accountType)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === accountType ? '#FFF' : theme.text },
                    ]}
                  >
                    {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Initial Balance */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {editAccount ? 'Current Balance' : 'Initial Balance'}
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
                value={balance}
                onChangeText={text => {
                  // Filter out any non-numeric and non-decimal characters
                  const cleaned = text.replace(/[^0-9.]/g, '');

                  // Handle multiple decimals: keep only the first one
                  const parts = cleaned.split('.');
                  if (parts.length > 2) {
                    setBalance(parts[0] + '.' + parts.slice(1).join(''));
                  } else {
                    setBalance(cleaned);
                  }
                }}
              />
            </View>

            {/* Currency Input Removed - using default settings.currency */}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeText: {
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
});

export default AddAccountModal;
