import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { getTrash, restoreFile, permanentDeleteFile } from "../api/filesApi";
import { getFileMeta, formatSize, formatDate } from "../utils/fileTypes";
import GradientHeader from "../components/GradientHeader";

export default function TrashScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [emptying, setEmptying] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getTrash();
      setFiles(data);
    } catch {
      Alert.alert("Error", "Could not load trash.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleRestore = async (file) => {
    setBusyId(file.id);
    try {
      await restoreFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch {
      Alert.alert("Error", "Restore failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (file) => {
    Alert.alert(
      "Delete permanently?",
      `"${file.name}" will be permanently deleted and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusyId(file.id);
            try {
              await permanentDeleteFile(file.id);
              setFiles((prev) => prev.filter((f) => f.id !== file.id));
            } catch {
              Alert.alert("Error", "Delete failed.");
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    if (files.length === 0) return;
    Alert.alert(
      "Empty trash?",
      `Permanently delete all ${files.length} file${files.length !== 1 ? "s" : ""}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Empty Trash",
          style: "destructive",
          onPress: async () => {
            setEmptying(true);
            try {
              await Promise.all(files.map((f) => permanentDeleteFile(f.id)));
              setFiles([]);
            } catch {
              Alert.alert("Error", "Failed to empty trash.");
              load();
            } finally {
              setEmptying(false);
            }
          },
        },
      ]
    );
  };

  const totalGB = (files.reduce((s, f) => s + (f.size || 0), 0) / 1024 / 1024 / 1024).toFixed(2);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader
        title="Trash"
        onBack={() => navigation.goBack()}
        right={
          files.length > 0 ? (
            <Pressable onPress={handleEmptyTrash} hitSlop={8} disabled={emptying}>
              {emptying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#fff" />
              )}
            </Pressable>
          ) : null
        }
      />

      {loading ? (
        <ActivityIndicator color={c.accent.deep} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(f) => String(f.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent.deep} />}
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, flexGrow: 1 }}
          ListHeaderComponent={
            files.length > 0 ? (
              <View style={[styles.banner, { backgroundColor: c.bgSoftOrange, borderColor: c.tones.warn + "40" }]}>
                <Ionicons name="alert-circle-outline" size={16} color={c.tones.warnText} />
                <Text style={[styles.bannerText, { color: c.tones.warnText }]}>
                  {files.length} file{files.length !== 1 ? "s" : ""} in trash · {totalGB} GB recoverable · not counted toward your quota
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trash-outline" size={44} color={c.textMuted} />
              <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Trash is empty</Text>
              <Text style={[styles.emptySub, { color: c.textMuted }]}>Deleted files will appear here</Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = getFileMeta(item.name);
            const busy = busyId === item.id;
            return (
              <View style={[styles.row, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
                <View style={[styles.iconWrap, { backgroundColor: meta.color + "1F" }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={styles.mid}>
                  <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.metaText, { color: c.textMuted }]}>
                    {formatSize(item.size)}{item.deleted_at ? `  ·  Deleted ${formatDate(item.deleted_at)}` : ""}
                  </Text>
                </View>
                {busy ? (
                  <ActivityIndicator size="small" color={c.accent.deep} style={{ marginRight: 6 }} />
                ) : (
                  <View style={styles.actions}>
                    <Pressable onPress={() => handleRestore(item)} hitSlop={8} style={[styles.actionBtn, { backgroundColor: c.tones.ok + "1F" }]}>
                      <Ionicons name="refresh-outline" size={17} color={c.tones.okText} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item)} hitSlop={8} style={[styles.actionBtn, { backgroundColor: c.tones.danger + "1F" }]}>
                      <Ionicons name="trash-outline" size={17} color={c.tones.dangerText} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: "500" },
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
  metaText: { fontSize: 12.5 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10, flex: 1, justifyContent: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "600" },
  emptySub: { fontSize: 13 },
});
