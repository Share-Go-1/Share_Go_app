import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { launchImageLibrary } from 'react-native-image-picker';
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [username, setUsername] = useState("Your Name");
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        Alert.alert("Cancelled", "Image selection was cancelled.");
      } else if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../../assets/default-profile.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.username}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your name"
        />
      </View>
      <DrawerItem label="History" onPress={() => props.navigation.navigate('History')} />
      <DrawerItem label="Settings" onPress={() => props.navigation.navigate('Settings')} />
      <DrawerItem label="Driver Mode" onPress={() => props.navigation.navigate('DriverMode')} />
    </DrawerContentScrollView>
  );
};

const HomeScreen = () => {
  

  
};

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerPosition: 'right',
        headerLeft: () => null,
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Image 
              source={require('../../../assets/menu-icon.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        ),
        headerTitleAlign: 'center',
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: "" }} />
      <Drawer.Screen name="History" component={() => <View style={styles.screen}><Text>History Screen</Text></View>} />
      <Drawer.Screen name="Settings" component={() => <View style={styles.screen}><Text>Settings Screen</Text></View>} />
      <Drawer.Screen name="DriverMode" component={() => <View style={styles.screen}><Text>Driver Mode Screen</Text></View>} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 15,
  },
  menuIcon: {
    width: 40,
    height:40,
  },
});

export default AppDrawer;
