import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { folders, files } from "../data/mock";
import GradientHeader from "../components/GradientHeader";
import SearchBar from "../components/SearchBar";
import { FolderRow, FileRow } from "../components/Rows";

export default function FolderScreen({ navigation, route }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const name = route.params?.name || "Folder";

  const subFolders = folders.slice(0, 2);
  const folderFiles = files.slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader
        title={name}
        onBack={() => navigation.goBack()}
        right={<Ionicons name="ellipsis-vertical" size={20} color="#fff" />}
      >
        <View style={styles.searchInHeader}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search in this folder…" />
        </View>
      </GradientHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
      >
        <View style={styles.toolbar}>
          <View style={styles.metaPills}>
            <View style={[styles.pill, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              <Ionicons name="lock-closed" size={12} color={c.textMuted} />
              <Text style={[styles.pillText, { color: c.textSecondary }]}>Private</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              <Ionicons name="swap-vertical" size={12} color={c.textMuted} />
              <Text style={[styles.pillText, { color: c.textSecondary }]}>Sort by</Text>
            </View>
          </View>
          <Pressable style={[styles.addBtn, { backgroundColor: c.bgSoftOrange }]} onPress={() => navigation.navigate("Upload")}>
            <Ionicons name="add" size={16} color={c.accent.deep} />
            <Text style={[styles.addText, { color: c.accent.deep }]}>Add new</Text>
          </Pressable>
        </View>

        <Text style={[styles.group, { color: c.textMuted }]}>FOLDERS</Text>
        {subFolders.map((f) => (
          <FolderRow key={f.id} folder={f} onPress={() => navigation.push("Folder", { id: f.id, name: f.name })} />
        ))}

        <Text style={[styles.group, { color: c.textMuted }]}>FILES</Text>
        {folderFiles.map((f) => (
          <FileRow key={f.id} file={f} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchInHeader: { marginTop: 14 },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  metaPills: { flexDirection: "row", gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 12.5, fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  addText: { fontSize: 13, fontWeight: "700" },
  group: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 18, marginBottom: 10 },
});
