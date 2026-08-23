import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { getSharedFolder } from "../api/sharingApi";
import { getFileMeta, formatSize, formatDate } from "../utils/fileTypes";
import GradientHeader from "../components/GradientHeader";

export default function SharedFolderScreen({ route, navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const token = route?.params?.token;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("This share link is invalid.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await getSharedFolder(token);
        setData(res);
      } catch (err) {
        if (err.status === 403) setError("You don't have permission to access this folder.");
        else if (err.status === 404) setError("This share link is invalid or has been revoked.");
        else if (err.status === 401) setError("Please log in to view this folder.");
        else setError("Unable to load this folder.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Shared Folder" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator color={c.accent.deep} style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.errIcon, { backgroundColor: c.tones.danger + "1F" }]}>
            <Ionicons name="lock-closed-outline" size={26} color={c.tones.dangerText} />
          </View>
          <Text style={[styles.errTitle, { color: c.textPrimary }]}>Access Denied</Text>
          <Text style={[styles.errSub, { color: c.textSecondary }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={data.files}
          keyExtractor={(f) => String(f.id)}
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}
          ListHeaderComponent={
            <View style={[styles.folderHead, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
              <View style={[styles.folderIcon, { backgroundColor: c.bgSoftOrange }]}>
                <Ionicons name="folder" size={26} color={c.accent.deep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.folderName, { color: c.textPrimary }]} numberOfLines={1}>{data.folder_name}</Text>
                <Text style={[styles.folderMeta, { color: c.textMuted }]}>
                  {data.files.length} file{data.files.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={40} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>This folder is empty</Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = getFileMeta(item.name);
            return (
              <Pressable
                onPress={() => Linking.openURL(item.url).catch(() => {})}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: meta.color + "1F" }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={styles.mid}>
                  <Text style={[styles.rowName, { color: c.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.rowMeta, { color: c.textMuted }]}>
                    {formatSize(item.size)}{item.uploaded_at ? `  ·  ${formatDate(item.uploaded_at)}` : ""}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={18} color={c.textMuted} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  errIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  errTitle: { fontSize: 18, fontWeight: "800" },
  errSub: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },

  folderHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  folderIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  folderName: { fontSize: 17, fontWeight: "800" },
  folderMeta: { fontSize: 13, marginTop: 2 },

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
  rowName: { fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 12.5 },

  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
