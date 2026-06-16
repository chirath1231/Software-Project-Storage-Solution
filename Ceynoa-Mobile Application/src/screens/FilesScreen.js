import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { folders, files } from "../data/mock";
import SearchBar from "../components/SearchBar";
import { FolderRow, FileRow } from "../components/Rows";

function FilterChip({ label, icon, c, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? c.accent.orange : c.bgSecondary,
          borderColor: active ? c.accent.orange : c.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? "#fff" : c.textSecondary }]}>{label}</Text>
      {icon ? <Ionicons name={icon} size={13} color={active ? "#fff" : c.textMuted} /> : null}
    </Pressable>
  );
}

export default function FilesScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const q = query.trim().toLowerCase();
  const shownFolders = tab === "files" ? [] : folders.filter((f) => f.name.toLowerCase().includes(q));
  const shownFiles = tab === "folders" ? [] : files.filter((f) => f.name.toLowerCase().includes(q));

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 120 }}
      >
        <Text style={[styles.h1, { color: c.textPrimary }]}>My Files</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Manage, organize, and share all your stored files.
        </Text>

        <View style={{ marginTop: 16 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search files & folders…" />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <FilterChip label="All" c={c} active={tab === "all"} onPress={() => setTab("all")} />
          <FilterChip label="Folders" c={c} active={tab === "folders"} onPress={() => setTab("folders")} />
          <FilterChip label="Files" c={c} active={tab === "files"} onPress={() => setTab("files")} />
          <View style={{ flex: 1 }} />
          <FilterChip label="Sort" icon="swap-vertical" c={c} />
        </View>

        {shownFolders.length > 0 ? (
          <>
            <Text style={[styles.group, { color: c.textMuted }]}>FOLDERS</Text>
            {shownFolders.map((f) => (
              <FolderRow key={f.id} folder={f} onPress={() => navigation.navigate("Folder", { id: f.id, name: f.name })} />
            ))}
          </>
        ) : null}

        {shownFiles.length > 0 ? (
          <>
            <Text style={[styles.group, { color: c.textMuted }]}>FILES</Text>
            {shownFiles.map((f) => (
              <FileRow key={f.id} file={f} />
            ))}
          </>
        ) : null}

        {shownFolders.length === 0 && shownFiles.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>No results for “{query}”.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  h1: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  sub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, marginBottom: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  group: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
