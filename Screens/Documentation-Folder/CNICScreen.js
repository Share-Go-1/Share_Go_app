import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';


const CNICScreen = ({ route, navigation }) => {
  const { setData } = route.params;
  const [cnicNumber, setCnicNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');



  const handleSave = async () => {
    setErrorMessage('');

    if (cnicNumber.length !== 13) {
      setErrorMessage('Please enter a valid 13-digit CNIC number.');
      return;
    }



      const data = { cnicNumber };
      setData('cnic', data);
      navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>CNIC Information</Text>

        <Image
          source={require('../../assets/frontside.png')}
          style={styles.imagePreview}
        />

        <Text style={styles.title}>CNIC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC number without dashes."
          value={cnicNumber}
          onChangeText={setCnicNumber}
          keyboardType="numeric"
          maxLength={13}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, color: '#333' },
  input: { width: '100%', height: 45, borderColor: '#ddd', borderWidth: 1, marginBottom: 25, paddingLeft: 15, borderRadius: 8, fontSize: 16 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10 },
  imageButton: { backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 8, marginBottom: 20, width: '100%', justifyContent: 'center', alignItems: 'center' },
  imageButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 200, marginTop: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 25 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CNICScreen;