// components/FilterModal.js
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";


export default function FilterModal({
  visible,
  onClose,
  filters,
  setFilters,
  categories = [],
  locations = [],
  onApply,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.modal, { backgroundColor: theme.card }]}>
        <Text style={[styles.heading, { color: theme.text }]}>Filter</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Category
        </Text>
        <Picker
        dropdownIconColor={theme.text}
          selectedValue={filters.category}
          style={{ color: theme.text }}
          onValueChange={(value) => setFilters((f) => ({ ...f, category: value }))}
        >
          <Picker.Item label="All" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Location
        </Text>
        <Picker
          selectedValue={filters.location}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
          onValueChange={(value) => setFilters((f) => ({ ...f, location: value }))}
        >
          <Picker.Item label="All" value="" />
          {locations.map((loc) => (
            <Picker.Item key={loc} label={loc} value={loc} />
          ))}
        </Picker>

        <Pressable
          onPress={onApply}
          style={[
            styles.button,
            { backgroundColor: theme.tint, borderColor: theme.border },
          ]}
        >
          <Text style={{ color: theme.card, fontWeight: "600" }}>Apply</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
