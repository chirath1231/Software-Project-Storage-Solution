import React, { useEffect, useRef } from "react";
import { Animated, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useChatSocket } from "../context/ChatSocketContext";

// A small "new message" banner driven by the live chat WebSocket — the
// in-app stand-in for push notifications (no background push infra here).
export default function ChatToast({ onPress }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast, dismissToast } = useChatSocket();
  const anim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => dismissToast(), 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast]);

  if (!toast) return null;

  const hide = () => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => dismissToast());
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: insets.top + 8,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={() => { hide(); onPress?.(toast); }}
        style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color={c.accent.deep} />
        <Text style={[styles.body, { color: c.textPrimary }]} numberOfLines={2}>
          <Text style={{ fontWeight: "800" }}>{toast.senderUsername}: </Text>
          {toast.text}
        </Text>
        <Pressable hitSlop={8} onPress={hide}>
          <Ionicons name="close" size={16} color={c.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14, zIndex: 999, elevation: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  body: { flex: 1, fontSize: 13.5, lineHeight: 18 },
});
