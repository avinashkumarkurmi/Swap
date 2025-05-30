// components/ThemedButton.js
import React from "react";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors"; // Adjust path if needed

export default function ThemedButton({ title, onPress, style = {}, textStyle = {} }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: theme.card }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
