# MoneyMate - React Native App

A modern personal finance tracker mobile application built with React Native and TypeScript.

## Features

- 📊 **Dashboard** - View total balance, income, expenses, and spending trends
- 💰 **Transactions** - Track all your financial transactions
- 🏦 **Accounts** - Manage multiple accounts (checking, savings, credit, cash)
- 📈 **Budgets** - Set and monitor category-based budgets
- 🎯 **Goals** - Track savings goals with progress visualization
- ⚙️ **Settings** - Customize theme, currency, and manage data
- 🌙 **Dark Mode** - Full light and dark theme support
- 💾 **Data Persistence** - All data saved locally with AsyncStorage

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React Navigation** - Bottom tab navigation
- **AsyncStorage** - Local data persistence
- **React Native Chart Kit** - Beautiful charts
- **React Native Vector Icons** - Icon library

## Prerequisites

- Node.js >= 18
- npm or yarn
- For Android: Android Studio and Android SDK
- For iOS: Xcode (Mac only)

## Installation

```bash
# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..
```

## Running the App

### Android
```bash
npm run android
```

### iOS (Mac only)
```bash
npm run ios
```

## Demo Data

The app includes a "Load Demo Data" feature in Settings that populates the app with sample transactions, accounts, budgets, and savings goals.

## License

MIT
