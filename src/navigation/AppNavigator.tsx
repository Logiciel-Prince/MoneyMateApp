import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useColorScheme, StatusBar} from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import {lightTheme, darkTheme} from '../theme';

import AppHeader from '../components/AppHeader';

import {useData} from '../context/DataContext';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const systemColorScheme = useColorScheme();
  const {settings} = useData();
  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  return (
    <>
      <StatusBar
        barStyle={activeThemeType === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({route}) => ({
            header: (props) => <AppHeader {...props} />,
            tabBarIcon: ({focused, color, size}) => {
              let iconName = '';

              switch (route.name) {
                case 'Dashboard':
                  iconName = focused ? 'grid' : 'grid-outline';
                  break;
                case 'Transactions':
                  iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                  break;
                case 'Accounts':
                  iconName = focused ? 'card' : 'card-outline';
                  break;
                case 'Budgets':
                  iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                  break;
                case 'Goals':
                  iconName = focused ? 'rocket' : 'rocket-outline';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          })}>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Transactions" component={TransactionsScreen} />
          <Tab.Screen name="Accounts" component={AccountsScreen} />
          <Tab.Screen name="Budgets" component={BudgetsScreen} />
          <Tab.Screen name="Goals" component={GoalsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
