// DetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function DetailsScreen({ route }) {
  const { input } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.subtitle}>You entered:</Text>
      <Text style={styles.inputText}>{input || 'Nothing entered'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    alignSelf: 'center',
  },
  inputText: {
    fontSize: 22,
    color: '#333',
    alignSelf: 'center',
  },
});

export default DetailsScreen;
