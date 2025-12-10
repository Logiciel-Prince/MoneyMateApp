import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppData} from '../types';

const STORAGE_KEY = '@MoneyMate:data';

export const loadData = async (): Promise<AppData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading data:', e);
    return null;
  }
};

export const saveData = async (data: AppData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

export const clearData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};
