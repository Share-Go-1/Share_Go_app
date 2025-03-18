import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const DriverHomeScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>DriverHomeScreen</Text>
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <DriverHomeScreen/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
