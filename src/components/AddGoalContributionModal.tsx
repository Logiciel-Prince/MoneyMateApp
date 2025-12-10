import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import {lightTheme, darkTheme} from '../theme';
import {Goal, Account} from '../types';

interface AddGoalContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goalId: string, amount: number, accountId?: string) => void;
  goal: Goal | null;
  accounts: Account[];
}

const AddGoalContributionModal: React.FC<AddGoalContributionModalProps> = ({
  visible,
  onClose,
  onSave,
  goal,
  accounts,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (visible && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
      setAmount('');
    }
  }, [visible, accounts]);

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedAccountId) {
      Alert.alert('Error', 'Please select an account to deduct from');
      return;
    }
    
    // Check for sufficiency
    const acc = accounts.find(a => a.id === selectedAccountId);
    if (acc && acc.balance < parseFloat(amount)) {
        Alert.alert('Insufficient Funds', `Account ${acc.name} has only ₹${acc.balance}`);
        return;
    }

    if (goal) {
       onSave(goal.id, parseFloat(amount), selectedAccountId);
    }
    onClose();
  };

  if (!goal) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: theme.card}]}>
          <Text style={[styles.modalTitle, {color: theme.text}]}>
            Add to "{goal.name}"
          </Text>

          <ScrollView style={{maxHeight: 400}}>
            {/* Amount Input */}
            <Text style={[styles.label, {color: theme.text}]}>Amount to Save</Text>
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
                autoFocus
             />
            
            <Text style={[styles.helperText, {color: theme.textSecondary}]}>
               Target: ₹{goal.targetAmount.toLocaleString()} — Current: ₹{goal.currentAmount.toLocaleString()}
            </Text>

            {/* Account Selection (Always Visible) */}
            <View style={styles.accountSelection}>
                <Text style={[styles.label, {color: theme.text}]}>Deduct From Account</Text>
                <View style={styles.accountChips}>
                    {accounts.map(acc => (
                        <TouchableOpacity
                           key={acc.id}
                           style={[
                               styles.accountChip,
                               selectedAccountId === acc.id && {backgroundColor: theme.primary, borderColor: theme.primary},
                               {borderColor: theme.border}
                           ]}
                           onPress={() => setSelectedAccountId(acc.id)}
                        >
                            <Text style={[
                                styles.accountChipText,
                                {color: selectedAccountId === acc.id ? '#FFF' : theme.text}
                            ]}>
                                {acc.name} (₹{acc.balance.toLocaleString('en-IN', {maximumFractionDigits: 0})})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.border}]}
              onPress={onClose}>
              <Text style={[styles.buttonText, {color: theme.text}]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.primary}]}
              onPress={handleSave}>
              <Text style={[styles.buttonText, {color: '#FFF'}]}>Add Money</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
      fontSize: 12,
      marginBottom: 20,
  },
  accountSelection: {
      marginBottom: 20,
  },
  accountChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  accountChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
  },
  accountChipText: {
      fontSize: 12,
      fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddGoalContributionModal;
