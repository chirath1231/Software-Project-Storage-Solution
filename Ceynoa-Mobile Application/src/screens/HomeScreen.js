import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { storage, recentFiles, sharedFiles, notifications } from "../data/mock";
import StorageMeter from "../components/StorageMeter";
import Avatar from "../components/Avatar";
import { FileRow } from "../components/Rows";
import { accent } from "../theme/colors";

function SectionHeader({ title, onAction, c }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{title}</Text>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.seeAll, { color: c.accent.deep }]}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { c, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 120 }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.hello, { color: c.textMuted }]}>Welcome back</Text>
            <Text style={[styles.name, { color: c.textPrimary }]}>{user?.name || "Jane Doe"}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={c.textPrimary} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Profile")}>
              <Avatar uri={user?.avatar} size={44} ring />
            </Pressable>
          </View>
        </View>

        {/* Storage overview */}
        <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.storageCard}>
          <View style={styles.storageLeft}>
            <Text style={styles.storageLabel}>Storage Overview</Text>
            <Text style={styles.storageValue}>
              {storage.used} GB <Text style={styles.storageTotal}>of {storage.total} GB used</Text>
            </Text>
            <Pressable style={styles.upgradeBtn} onPress={() => navigation.navigate("Subscription")}>
              <Ionicons name="rocket-outline" size={15} color={accent.deep} />
              <Text style={styles.upgradeText}>Upgrade plan</Text>
            </Pressable>
          </View>
          <View style={styles.meterWrap}>
            <StorageMeter percent={storage.percent} size={104} stroke={11} label="used" />
          </View>
        </LinearGradient>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction c={c} icon="cloud-upload-outline" label="Upload" onPress={() => navigation.navigate("Upload")} />
          <QuickAction c={c} icon="folder-outline" label="My Files" onPress={() => navigation.navigate("Files")} />
          <QuickAction c={c} icon="people-outline" label="Clients" onPress={() => navigation.navigate("Clients")} />
        </View>

        {/* Recent files */}
        <SectionHeader title="Recent Files" c={c} onAction={() => navigation.navigate("Files")} />
        {recentFiles.map((f) => (
          <FileRow key={f.id} file={f} onPress={() => navigation.navigate("Files")} />
        ))}

        {/* Notifications preview */}
        <SectionHeader title="Notifications" c={c} onAction={() => navigation.navigate("Notifications")} />
        <View style={[styles.notifCard, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
          {notifications.slice(0, 2).map((n, i) => (
            <View key={n.id} style={[styles.notifRow, i === 0 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={[styles.notifDot, { backgroundColor: c.accent.orange }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, { color: c.textPrimary }]} numberOfLines={1}>{n.title}</Text>
                <Text style={[styles.notifTime, { color: c.textMuted }]}>{n.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shared files */}
        <SectionHeader title="Shared Files" c={c} onAction={() => navigation.navigate("Files")} />
        {sharedFiles.map((f) => (
          <FileRow key={f.id} file={f} onPress={() => navigation.navigate("Files")} />
        ))}
      </ScrollView>
    </View>
  );
}

function QuickAction({ c, icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.quick, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
      <View style={[styles.quickIcon, { backgroundColor: c.bgSoftOrange }]}>
        <Ionicons name={icon} size={20} color={c.accent.deep} />
      </View>
      <Text style={[styles.quickLabel, { color: c.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  hello: { fontSize: 13 },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  storageCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storageLeft: { flex: 1, gap: 8 },
  storageLabel: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },
  storageValue: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  storageTotal: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "500" },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginTop: 4,
  },
  upgradeText: { color: accent.deep, fontWeight: "700", fontSize: 13 },
  meterWrap: { marginLeft: 8 },

  quickRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  quick: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 13, fontWeight: "600" },

  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  seeAll: { fontSize: 13, fontWeight: "600" },

  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  notifDot: { width: 8, height: 8, borderRadius: 4 },
  notifTitle: { fontSize: 14, fontWeight: "600" },
  notifTime: { fontSize: 12, marginTop: 2 },
});
