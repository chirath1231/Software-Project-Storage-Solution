import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { accent } from "../theme/colors";

// Floating bubble mirroring the web app's global "Ceynoa Assistant" launcher
// (mounted on every dashboard page there). Hidden on the chat/assistant
// screens themselves so it never sits over the message composer.
export default function AIAssistantButton({ hidden, onPress }) {
  const insets = useSafeAreaInsets();
  if (hidden) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { bottom: insets.bottom + 96 }]}
      hitSlop={6}
    >
      <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
        <Ionicons name="sparkles" size={24} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: 18, zIndex: 998, elevation: 18 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: accent.deep,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
});
