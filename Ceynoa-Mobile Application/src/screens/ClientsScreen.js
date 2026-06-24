import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { clients } from "../data/mock";
import GradientHeader from "../components/GradientHeader";
import SearchBar from "../components/SearchBar";
import Avatar from "../components/Avatar";

export default function ClientsScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const shown = clients.filter((cl) => cl.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader
        title="Clients"
        onBack={() => navigation.goBack()}
        right={
          <Pressable hitSlop={8} style={styles.newBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        }
      >
        <Text style={styles.subtitle}>Manage your clients, share files, and track activity.</Text>
        <View style={{ marginTop: 14 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search clients…" />
        </View>
      </GradientHeader>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, gap: 10 }}>
        {shown.map((cl) => (
          <Pressable
            key={cl.id}
            onPress={() => navigation.navigate("Chat", { id: cl.id, name: cl.name, avatar: cl.avatar, online: cl.online })}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Avatar uri={cl.avatar} size={48} online={cl.online} />
            <View style={styles.mid}>
              <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{cl.name}</Text>
              <Text style={[styles.note, { color: c.textMuted }]} numberOfLines={1}>{cl.note}</Text>
            </View>
            {cl.unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: c.accent.orange }]}>
                <Text style={styles.badgeText}>{cl.unread}</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  subtitle: { color: "rgba(255,255,255,0.92)", fontSize: 13.5, marginTop: 10, lineHeight: 19 },
  newBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  mid: { flex: 1, gap: 3 },
  name: { fontSize: 15.5, fontWeight: "700" },
  note: { fontSize: 13 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
