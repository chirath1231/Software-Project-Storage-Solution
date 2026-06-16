import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

// Floating-style labeled input: the label sits on the top border of the field,
// matching the sketch's form fields.
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  icon,
  style,
  ...rest
}) {
  const { c } = useTheme();
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.field,
          {
            backgroundColor: c.bgPrimary,
            borderColor: focused ? c.accent.orange : c.border,
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={c.textMuted} style={styles.leftIcon} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: c.textPrimary }]}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={18} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {label ? (
        <View style={[styles.labelWrap, { backgroundColor: c.bgApp }]}>
          <Text style={[styles.label, { color: focused ? c.accent.deep : c.textMuted }]}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", marginTop: 8 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  leftIcon: {},
  input: { flex: 1, fontSize: 15, padding: 0 },
  labelWrap: { position: "absolute", top: -8, left: 12, paddingHorizontal: 6 },
  label: { fontSize: 11.5, fontWeight: "600" },
});
