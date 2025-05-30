import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

import { Colors } from "../constants/Colors"; // adjust path if needed

const CustomPicker = ({
  label = "Select an option",
  options = [],
  selectedValue,
  onValueChange,
  containerStyle = {},
  labelStyle = {},
  valueStyle = {},
  modalStyle = {},
  optionStyle = {},
  optionTextStyle = {},
}) => {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const handleSelect = (value) => {
    onValueChange(value);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={[
          styles.container,
          { borderColor: theme.border, backgroundColor: theme.background },
          containerStyle,
          
        ]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.label, { color: theme.text }, labelStyle]}>
          {label}
        </Text>
        <Text
          style={[styles.selectedValue, { color: theme.primary }, valueStyle]}
        >
          {selectedValue || "Select..."}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
    
      >
        <Pressable
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.modalBackground },
            modalStyle,
          ]}
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <View
              style={[
                styles.modalContainer,
                // { backgroundColor: theme.background },
                {backgroundColor: theme.card}
              ]}
            >
              {/* Close Button */}
              <Pressable
                style={[styles.closeButton]}
                onPress={() => setVisible(false)}
              >
                <Text style={[styles.closeText, { color: theme.text }]}>
                  ×
                </Text>
              </Pressable>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={options}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.option, optionStyle]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.text },
                        optionTextStyle,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
  },
  modalContainer: {
    borderRadius: 10,
    padding: 16,
    maxHeight: "80%",
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
});

export default CustomPicker;
