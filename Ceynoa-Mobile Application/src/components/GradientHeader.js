import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { accent } from "../theme/colors";

// Orange gradient header with rounded bottom corners (per sketch).
// Use `centered` for the back+title layout, default for a left-aligned big title.
export default function GradientHeader({
  title,
  onBack,
  right,
  centered = true,
  children,
  height,
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={accent.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.wrap,
        { paddingTop: insets.top + 10, minHeight: (height || 64) + insets.top },
      ]}
    >
      <View style={styles.bar}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <Text
          style={[styles.title, centered ? styles.titleCentered : styles.titleLeft]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.iconBtn}>{right}</View>
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  bar: { flexDirection: "row", alignItems: "center", minHeight: 40 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontWeight: "800", fontSize: 19, flex: 1 },
  titleCentered: { textAlign: "center" },
  titleLeft: { textAlign: "left", marginLeft: 4 },
});
