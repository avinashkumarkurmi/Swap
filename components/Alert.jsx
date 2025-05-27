import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

const Alert = ({ type = "info", message }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  console.log(type);
  
  const colors = {
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors[type] || colors.info },
      ]}
    >
      <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center"
  },
});

export default Alert;
