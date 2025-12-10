import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import {useData} from '../context/DataContext';
import {lightTheme, darkTheme} from '../theme';

const SettingsScreen = ({ navigation }: any) => {
  const systemColorScheme = useColorScheme();
  const {settings, loadDemoData, clearAllData} = useData();
  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const handleLoadDemoData = () => {
    Alert.alert(
      'Load Demo Data',
      'This will load sample transactions, accounts, budgets, and goals. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Load',
          onPress: () => {
            loadDemoData();
            // Alert.alert('Success', 'Demo data loaded successfully!'); // Removed alert to just redirect
            navigation.navigate('Dashboard');
          },
        },
      ],
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your data. This action cannot be undone. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data cleared successfully!');
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={[styles.section, {backgroundColor: theme.card}]}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>
          Appearance
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, {color: theme.text}]}>Theme</Text>
          <Text style={[styles.settingValue, {color: theme.textSecondary}]}>
            {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.section, {backgroundColor: theme.card}]}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>
          Preferences
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, {color: theme.text}]}>
            Currency
          </Text>
          <Text style={[styles.settingValue, {color: theme.textSecondary}]}>
            {settings.currency}
          </Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, {color: theme.text}]}>
            Language
          </Text>
          <Text style={[styles.settingValue, {color: theme.textSecondary}]}>
            English
          </Text>
        </View>
      </View>

      <View style={[styles.section, {backgroundColor: theme.card}]}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>Data</Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: theme.primary}]}
          onPress={handleLoadDemoData}>
          <Text style={styles.buttonText}>Load Demo Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: theme.danger}]}
          onPress={handleClearData}>
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appInfo}>
        <Text style={[styles.appName, {color: theme.text}]}>MoneyMate</Text>
        <Text style={[styles.version, {color: theme.textSecondary}]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    padding: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
  },
});

export default SettingsScreen;
