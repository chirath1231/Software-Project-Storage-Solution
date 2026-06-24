import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { notifications } from "../data/mock";

const TYPE_META = {
  feature: { icon: "sparkles", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  tip: { icon: "bulb", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  system: { icon: "shield-checkmark", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function NotificationsScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 120 }}
      >
        <View style={styles.head}>
          <Text style={[styles.h1, { color: c.textPrimary }]}>Notifications</Text>
          <Pressable style={[styles.sortBtn, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
            <Text style={[styles.sortText, { color: c.textSecondary }]}>Sort by</Text>
            <Ionicons name="chevron-down" size={14} color={c.textMuted} />
          </Pressable>
        </View>

        <View style={{ gap: 12, marginTop: 16 }}>
          {notifications.map((n) => {
            const m = TYPE_META[n.type] || TYPE_META.feature;
            return (
              <View
                key={n.id}
                style={[
                  styles.card,
                  { backgroundColor: c.bgSecondary, borderColor: n.unread ? c.accent.orange + "55" : c.border, shadowColor: c.shadow },
                ]}
              >
                <View style={[styles.icon, { backgroundColor: m.bg }]}>
                  <Ionicons name={m.icon} size={20} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={2}>{n.title}</Text>
                    {n.unread ? <View style={[styles.unread, { backgroundColor: c.accent.orange }]} /> : null}
                  </View>
                  <Text style={[styles.body, { color: c.textSecondary }]} numberOfLines={2}>{n.body}</Text>
                  <Text style={[styles.time, { color: c.textMuted }]}>{n.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h1: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  sortText: { fontSize: 13, fontWeight: "600" },
  card: {
    flexDirection: "row",
    gap: 13,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  icon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, fontSize: 14.5, fontWeight: "700", lineHeight: 19 },
  unread: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  body: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  time: { fontSize: 11.5, marginTop: 8 },
});
