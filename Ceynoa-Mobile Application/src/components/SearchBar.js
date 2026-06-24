import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export default function SearchBar({ value, onChangeText, placeholder = "Search…" }) {
  const { c } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: c.bgPrimary, borderColor: c.border }]}>
      <Ionicons name="search" size={17} color={c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        style={[styles.input, { color: c.textPrimary }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <Ionicons
          name="close-circle"
          size={18}
          color={c.textMuted}
          onPress={() => onChangeText("")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});
