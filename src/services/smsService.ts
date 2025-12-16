
import { PermissionsAndroid, Platform } from 'react-native';
import { parseSms, ParsedSms } from '../utils/smsParser';

export const requestSmsPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "MoneyMate needs access to your SMS to track transactions automatically.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return false;
};

export const fetchTransactionSms = (minDate: number = 0): Promise<ParsedSms[]> => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'android') {
        resolve([]);
        return;
    }
    
    // Dynamically require to avoid issues on non-Android platforms if the package is missing/incompatible
    const SmsAndroid = require('react-native-get-sms-android');

    const filter = {
      box: 'inbox',
      minDate: minDate, // Timestamp in ms
    };

    // SmsAndroid.list signature: (filter, failCallback, successCallback)
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.log('Failed with this error: ' + fail);
        // If permission denied or other error, mostly we just resolve empty to not crash app logic
        console.warn('SMS List failed:', fail);
        resolve([]);
      },
      (count: number, smsList: string) => {
        try {
            const arr = JSON.parse(smsList);
            const transactions: ParsedSms[] = [];
            
            arr.forEach((sms: any) => {
              // Parse each SMS
              // sms.date is typically timestamp in ms
              const parsed = parseSms(sms.body, parseInt(sms.date, 10));
              if (parsed) {
                transactions.push(parsed);
              }
            });
            
            resolve(transactions);
        } catch (e) {
            console.error("Error parsing SMS list", e);
            resolve([]);
        }
      },
    );
  });
};
