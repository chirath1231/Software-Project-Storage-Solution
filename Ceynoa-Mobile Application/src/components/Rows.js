import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { fileKindMeta } from "../data/mock";

export function FolderRow({ folder, onPress }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: folder.color + "22" }]}>
        <Ionicons name="folder" size={20} color={folder.color} />
      </View>
      <View style={styles.mid}>
        <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{folder.name}</Text>
        <Text style={[styles.meta, { color: c.textMuted }]}>{folder.files} files · {folder.size}</Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color={c.textMuted} />
    </Pressable>
  );
}

export function FileRow({ file, onPress }) {
  const { c } = useTheme();
  const meta = fileKindMeta[file.kind] || fileKindMeta.default;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.color + "1F" }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.mid}>
        <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{file.name}</Text>
        <Text style={[styles.meta, { color: c.textMuted }]}>
          {file.size} · {file.modified}
          {file.shared ? "  ·  Shared" : ""}
        </Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color={c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12.5 },
});
