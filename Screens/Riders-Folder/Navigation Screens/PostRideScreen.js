import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import debounce from 'lodash.debounce';

const PostRideScreen = () => {
  const [pickupQuery, setPickupQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropQuery, setDropQuery] = useState('');
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const apiKey = 'n7A3hppEHqclMOSW8NOVK9flUFOrGmGd'; // 🔐 Replace this with your TomTom API key

  const fetchSuggestions = async (text, setSuggestions) => {
    try {
      const res = await axios.get(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(text)}.json`,
        {
          params: {
            key: apiKey,
            limit: 5,
            lat: 31.5204, // 📍 Lahore latitude
            lon: 74.3587, // 📍 Lahore longitude
            radius: 25000,
          },
        }
      );
      const results = res.data.results.map((r) => r.address.freeformAddress);
      setSuggestions(results);
    } catch (err) {
      console.error('Autocomplete error:', err.message);
    }
  };

  const debouncedPickupFetch = useCallback(
    debounce((text) => {
      fetchSuggestions(text, setPickupSuggestions);
    }, 500),
    []
  );

  const debouncedDropFetch = useCallback(
    debounce((text) => {
      fetchSuggestions(text, setDropSuggestions);
    }, 500),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Post a Ride</Text>

      <TextInput
        style={styles.input}
        placeholder="Pickup Location"
        value={pickupQuery}
        onChangeText={(text) => {
          setPickupQuery(text);
          debouncedPickupFetch(text);
        }}
      />
      <FlatList
        data={pickupSuggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => {
              setPickupQuery(item);
              setPickupSuggestions([]);
            }}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={dropQuery}
        onChangeText={(text) => {
          setDropQuery(text);
          debouncedDropFetch(text);
        }}
      />
      <FlatList
        data={dropSuggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => {
              setDropQuery(item);
              setDropSuggestions([]);
            }}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default PostRideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  suggestion: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});
