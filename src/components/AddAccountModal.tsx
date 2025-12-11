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
import {Account} from '../types';
import { useData } from '../context/DataContext';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
  editAccount?: Account;
}

const ACCOUNT_TYPES: Array<'checking' | 'savings' | 'credit' | 'cash'> = [
  'checking',
  'savings',
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
  const [type, setType] = useState<'checking' | 'savings' | 'credit' | 'cash'>(
    editAccount?.type || 'checking',
  );
  const [balance, setBalance] = useState(
    editAccount?.balance.toString() || '0',
  );
  const [currency, setCurrency] = useState(editAccount?.currency || 'USD');

  const handleSave = () => {
    if (!name || !balance) {
      return;
    }

    onSave({
      name,
      type,
      balance: parseFloat(balance),
      currency,
    });

    // Reset form
    setName('');
    setType('checking');
    setBalance('0');
    setCurrency('USD');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editAccount ? 'Edit Account' : 'Add Account'}
          </Text>

          {/* Account Name */}
          <Text style={[styles.label, { color: theme.text }]}>
            Account Name
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
            placeholder="e.g., Main Checking"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />

          {/* Account Type */}
          <Text style={[styles.label, { color: theme.text }]}>
            Account Type
          </Text>
          <View style={styles.typeContainer}>
            {ACCOUNT_TYPES.map(accountType => (
              <TouchableOpacity
                key={accountType}
                style={[
                  styles.typeChip,
                  type === accountType && { backgroundColor: theme.primary },
                  { borderColor: theme.border },
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
          <Text style={[styles.label, { color: theme.text }]}>
            {editAccount ? 'Current Balance' : 'Initial Balance'}
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
            value={balance}
            onChangeText={setBalance}
          />

          {/* Currency */}
          <Text style={[styles.label, { color: theme.text }]}>Currency</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="USD"
            placeholderTextColor={theme.textSecondary}
            value={currency}
            onChangeText={setCurrency}
          />

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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
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

export default AddAccountModal;
