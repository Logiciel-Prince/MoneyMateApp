import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  useColorScheme,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useData} from '../context/DataContext';
import {lightTheme, darkTheme} from '../theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SideMenu = ({visible, onClose, navigation, currentRoute, theme}: any) => {
  const slideAnim = React.useRef(new Animated.Value(-300)).current; 
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300, 
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const menuItems = [
    {label: 'Dashboard', icon: 'grid-outline', route: 'Dashboard'},
    {label: 'Transactions', icon: 'wallet-outline', route: 'Transactions'},
    {label: 'Accounts', icon: 'card-outline', route: 'Accounts'},
    {label: 'Budgets', icon: 'pie-chart-outline', route: 'Budgets'},
    {label: 'Goals', icon: 'trophy-outline', route: 'Goals'},
    {label: 'Settings', icon: 'settings-outline', route: 'Settings'},
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      animationType="none" // Disable default modal animation
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.overlayTouchable, {opacity: fadeAnim}]}>
            <Pressable style={styles.fullSize} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sideMenuContainer,
            {
              backgroundColor: theme.background,
              transform: [{translateX: slideAnim}],
            },
          ]}>
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>M</Text>
              </View>
              <Text style={[styles.appName, {color: theme.text}]}>
                MoneyMate
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    isActive && {backgroundColor: `${theme.primary}15`},
                  ]}
                  onPress={() => {
                    navigation.navigate(item.route);
                    onClose();
                  }}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={isActive ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      {color: isActive ? theme.primary : theme.textSecondary},
                      isActive && {fontWeight: '600'},
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AppHeader = ({navigation, route, _options}: any) => {
  const systemColorScheme = useColorScheme();
  const {settings, updateSettings} = useData();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const current = activeThemeType === 'dark' ? 'dark' : 'light';
    updateSettings({theme: current === 'dark' ? 'light' : 'dark'});
  };

  return (
    <View style={[styles.headerContainer, {backgroundColor: theme.background, paddingTop: insets.top}]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMenuVisible(true)}>
          <Icon name="menu-outline" size={28} color={theme.textSecondary} />
        </TouchableOpacity>
        
        {/* Optional: Show Title if not Dashboard, or purely empty as requested */}
        {/* <Text style={{color: theme.text, fontWeight: 'bold'}}>{route.name}</Text> */}

        <TouchableOpacity style={styles.navButton} onPress={toggleTheme}>
          <Icon
            name={activeThemeType === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        currentRoute={route.name}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // paddingHorizontal: 20,
    // paddingBottom: 10,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  // Side Menu Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouchable: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sideMenuContainer: {
    width: '75%',
    height: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    marginBottom: 30,
    marginTop: 20, // Add top margin for status bar spacing in modal
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#2563EB', // blue-600
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  menuItems: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
});

export default AppHeader;
