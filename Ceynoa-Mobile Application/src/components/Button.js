import React from "react";
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

// variant: "primary" | "secondary" | "danger" | "ghost"
export default function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
  full = true,
}) {
  const { c } = useTheme();
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? "#fff" : c.textPrimary} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={17}
              color={
                isPrimary
                  ? "#fff"
                  : isDanger
                  ? c.tones.dangerText
                  : c.textPrimary
              }
            />
          ) : null}
          <Text
            style={[
              styles.label,
              {
                color: isPrimary
                  ? "#fff"
                  : isDanger
                  ? c.tones.dangerText
                  : c.textPrimary,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        style={({ pressed }) => [
          full && styles.full,
          { borderRadius: 14, opacity: disabled ? 0.5 : pressed ? 0.92 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={c.accent.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        full && styles.full,
        {
          backgroundColor: isDanger
            ? "rgba(239,68,68,0.10)"
            : isGhost
            ? "transparent"
            : c.bgTertiary,
          borderWidth: 1,
          borderColor: isDanger ? "rgba(239,68,68,0.30)" : c.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  full: { alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
});
