import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './src/context/DataContext';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </SafeAreaProvider>
  );
}

export default App;
