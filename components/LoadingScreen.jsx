import { BlurView } from 'expo-blur';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <View style={styles.overlay}>
      <BlurView intensity={80} style={styles.blur} tint="light" />
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // fill entire screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute', // so it's on top of blur
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 15,
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
});
