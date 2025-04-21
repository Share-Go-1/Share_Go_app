import React, { useEffect, useState } from 'react';
import 'react-native-url-polyfill/auto';
import { SafeAreaView, StyleSheet } from 'react-native';
import StackNavigator from './Screens/Stack/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {

  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator initialRoute={'Login'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
