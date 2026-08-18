<<<<<<< HEAD
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { folders, files } from "../data/mock";
import SearchBar from "../components/SearchBar";
import { FolderRow, FileRow } from "../components/Rows";
=======
import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image,
  ActivityIndicator, Alert, Modal, RefreshControl, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/core";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getFiles, getSubscription, trashFile } from "../api/filesApi";
import SearchBar from "../components/SearchBar";
import ShareModal from "../components/ShareModal";
import { getFileMeta, getFileType, formatSize, formatDate } from "../utils/fileTypes";
>>>>>>> main

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

<<<<<<< HEAD
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
=======
// Three-dot action menu
function FileActionMenu({ file, c, onClose, onShare, onDelete }) {
  const items = [
    {
      icon: "eye-outline",
      label: "Preview / Open",
      action: () => {
        onClose();
        Linking.openURL(file.url).catch(() => Alert.alert("Error", "Could not open file."));
      },
    },
    {
      icon: "share-social-outline",
      label: "Share",
      action: () => { onClose(); onShare(); },
    },
    {
      icon: "download-outline",
      label: "Download",
      action: () => {
        onClose();
        Linking.openURL(file.url).catch(() => Alert.alert("Error", "Could not open file."));
      },
    },
    null,
    {
      icon: "trash-outline",
      label: "Move to Trash",
      danger: true,
      action: () => { onClose(); onDelete(); },
    },
  ];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        <View style={[styles.menuSheet, { backgroundColor: c.bgPrimary }]}>
          {/* File info */}
          <View style={[styles.menuHeader, { borderBottomColor: c.border }]}>
            <View style={[styles.menuFileIcon, { backgroundColor: getFileMeta(file.name).color + "1F" }]}>
              <Ionicons name={getFileMeta(file.name).icon} size={20} color={getFileMeta(file.name).color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuFileName, { color: c.textPrimary }]} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={[styles.menuFileMeta, { color: c.textMuted }]}>
                {formatSize(file.size)}{file.uploaded_at ? `  ·  ${formatDate(file.uploaded_at)}` : ""}
              </Text>
            </View>
          </View>

          {items.map((item, i) =>
            item === null ? (
              <View key={i} style={[styles.menuDivider, { backgroundColor: c.border }]} />
            ) : (
              <Pressable key={i} onPress={item.action} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.6 : 1 }]}>
                <Ionicons name={item.icon} size={20} color={item.danger ? "#ef4444" : c.textPrimary} />
                <Text style={[styles.menuItemText, { color: item.danger ? "#ef4444" : c.textPrimary }]}>
                  {item.label}
                </Text>
              </Pressable>
            )
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// File row for list view
function FileListRow({ file, c, onMenuOpen }) {
  const meta = getFileMeta(file.name);
  const type = getFileType(file.name);

  return (
    <Pressable
      onPress={() => Linking.openURL(file.url).catch(() => {})}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.color + "1F" }]}>
        {type === "image" && file.url ? (
          <Image source={{ uri: file.url }} style={styles.thumbImg} />
        ) : (
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        )}
      </View>
      <View style={styles.mid}>
        <Text style={[styles.rowName, { color: c.textPrimary }]} numberOfLines={1}>{file.name}</Text>
        <Text style={[styles.rowMeta, { color: c.textMuted }]}>
          {formatSize(file.size)}{file.uploaded_at ? `  ·  ${formatDate(file.uploaded_at)}` : ""}
        </Text>
      </View>
      <Pressable onPress={() => onMenuOpen(file)} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={18} color={c.textMuted} />
      </Pressable>
    </Pressable>
  );
}

// File card for grid view
function FileGridCard({ file, c, onMenuOpen }) {
  const meta = getFileMeta(file.name);
  const type = getFileType(file.name);

  return (
    <Pressable
      onPress={() => Linking.openURL(file.url).catch(() => {})}
      style={[styles.gridCard, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
    >
      {/* Thumbnail */}
      <View style={[styles.gridThumb, { backgroundColor: meta.color + "18" }]}>
        {type === "image" && file.url ? (
          <Image source={{ uri: file.url }} style={styles.gridThumbImg} resizeMode="cover" />
        ) : (
          <Ionicons name={meta.icon} size={32} color={meta.color} />
        )}
      </View>

      {/* Info + three-dot */}
      <View style={styles.gridInfo}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.gridName, { color: c.textPrimary }]} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={[styles.gridMeta, { color: c.textMuted }]}>{formatSize(file.size)}</Text>
        </View>
        <Pressable onPress={() => onMenuOpen(file)} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={16} color={c.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FilesScreen({ navigation }) {
  const { c } = useTheme();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [isStorageFull, setIsStorageFull] = useState(false);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const [menuFile, setMenuFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);

  const loadData = useCallback(async () => {
    try {
      // Use username (matches web app's localStorage "username" key used for subscriptions)
      const subKey = user?.username || user?.email;
      const [fileData, storageGB] = await Promise.all([
        getFiles(),
        subKey ? getSubscription(subKey) : Promise.resolve(5),
      ]);

      const sorted = [...fileData].sort(
        (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
      );
      setFiles(sorted);
      setTotalStorageGB(storageGB);

      const usedBytes = fileData.reduce((s, f) => s + (f.size || 0), 0);
      const usedGB = usedBytes / 1024 / 1024 / 1024;
      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));
      const pct = Math.min(Math.round((usedGB / storageGB) * 100), 100);
      setStorageUsed(pct);
      setIsStorageFull(usedGB >= storageGB * 0.99);
    } catch (err) {
      if (err.status === 401) signOut();
      else console.error("FilesScreen load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (!loading) loadData();
    }, [loadData])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleDelete = (file) => {
    Alert.alert(
      "Move to Trash",
      `Move "${file.name}" to Trash?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Move to Trash",
          style: "destructive",
          onPress: async () => {
            try {
              await trashFile(file.id);
              await loadData();
            } catch {
              Alert.alert("Error", "Could not delete file.");
            }
          },
        },
      ]
    );
  };

  // Filter
  const q = query.trim().toLowerCase();
  const TYPE_GROUPS = {
    images:   ["image"],
    videos:   ["video"],
    docs:     ["pdf", "word", "excel", "text", "code", "html", "other"],
  };

  let shownFiles = files.filter((f) => f.name.toLowerCase().includes(q));
  if (tab !== "all") {
    const types = TYPE_GROUPS[tab] || [];
    shownFiles = shownFiles.filter((f) => types.includes(getFileType(f.name)));
  }

  const remainingGB = Math.max(0, totalStorageGB - Number(totalUsedGB)).toFixed(2);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      {/* Action menu */}
      {menuFile && (
        <FileActionMenu
          file={menuFile}
          c={c}
          onClose={() => setMenuFile(null)}
          onShare={() => setShareFile(menuFile)}
          onDelete={() => handleDelete(menuFile)}
        />
      )}

      {/* Share modal */}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent.deep} />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 18,
          paddingBottom: 120,
        }}
>>>>>>> main
      >
        <Text style={[styles.h1, { color: c.textPrimary }]}>My Files</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Manage, organize, and share all your stored files.
        </Text>

<<<<<<< HEAD
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
=======
        {/* Storage bar */}
        <View style={[styles.storageBar, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
          <View style={styles.storageBarTop}>
            <Text style={[styles.storageBarLabel, { color: c.textSecondary }]}>Storage Used</Text>
            <View style={styles.viewToggle}>
              <Pressable
                onPress={() => setViewMode("list")}
                style={[styles.toggleBtn, viewMode === "list" && [styles.toggleBtnActive, { backgroundColor: c.bgApp }]]}
              >
                <Ionicons name="list-outline" size={16} color={viewMode === "list" ? c.textPrimary : c.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => setViewMode("grid")}
                style={[styles.toggleBtn, viewMode === "grid" && [styles.toggleBtnActive, { backgroundColor: c.bgApp }]]}
              >
                <Ionicons name="grid-outline" size={16} color={viewMode === "grid" ? c.textPrimary : c.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.storageNumbers, { color: c.textPrimary }]}>
              {totalUsedGB} / {totalStorageGB} GB ({storageUsed}%)
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: c.bgTertiary }]}>
            <View style={[styles.progressFill, { width: `${storageUsed}%` }]} />
          </View>
          <View style={styles.storageBarBottom}>
            <Text style={[styles.storageSubtext, { color: c.textMuted }]}>{files.length} files</Text>
            <Text style={[styles.storageSubtext, { color: c.textMuted }]}>
              {remainingGB > 0 ? `${remainingGB} GB free` : "Storage full"}
            </Text>
          </View>
        </View>

        {/* Storage full banner */}
        {isStorageFull && (
          <Pressable
            onPress={() => navigation.navigate("Subscription")}
            style={styles.fullBanner}
          >
            <Ionicons name="warning-outline" size={18} color="#dc2626" />
            <Text style={styles.fullBannerText}>
              Storage full — upgrade your plan to upload more files.
            </Text>
            <Text style={styles.fullBannerAction}>Upgrade →</Text>
          </Pressable>
        )}

        <View style={{ marginTop: 14 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search files…" />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        >
          <FilterChip label="All" c={c} active={tab === "all"} onPress={() => setTab("all")} />
          <FilterChip label="Images" c={c} active={tab === "images"} onPress={() => setTab("images")} />
          <FilterChip label="Videos" c={c} active={tab === "videos"} onPress={() => setTab("videos")} />
          <FilterChip label="Documents" c={c} active={tab === "docs"} onPress={() => setTab("docs")} />
        </ScrollView>

        {/* File list / grid */}
        {loading ? (
          <ActivityIndicator color={c.accent.deep} style={{ paddingVertical: 40 }} />
        ) : shownFiles.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              {q ? `No results for "${q}"` : "No files uploaded yet"}
            </Text>
          </View>
        ) : viewMode === "list" ? (
          <View style={{ marginTop: 14 }}>
            {shownFiles.map((f) => (
              <FileListRow key={f.id} file={f} c={c} onMenuOpen={setMenuFile} />
            ))}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {shownFiles.map((f) => (
              <FileGridCard key={f.id} file={f} c={c} onMenuOpen={setMenuFile} />
            ))}
          </View>
        )}
>>>>>>> main
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  h1: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  sub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
<<<<<<< HEAD
=======

  storageBar: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  storageBarTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  storageBarLabel: { flex: 1, fontSize: 13, fontWeight: "500" },
  storageNumbers: { fontSize: 12, fontWeight: "600" },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    gap: 2,
  },
  toggleBtn: {
    padding: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#f97316", borderRadius: 3 },
  storageBarBottom: { flexDirection: "row", justifyContent: "space-between" },
  storageSubtext: { fontSize: 11 },

  fullBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  fullBannerText: { flex: 1, color: "#dc2626", fontSize: 12, fontWeight: "500" },
  fullBannerAction: { color: "#f97316", fontWeight: "700", fontSize: 12 },

>>>>>>> main
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
<<<<<<< HEAD
  group: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 18, marginBottom: 10 },
=======

  // List row
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
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImg: { width: 42, height: 42, borderRadius: 12 },
  mid: { flex: 1, gap: 3 },
  rowName: { fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 12.5 },

  // Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  gridCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  gridThumb: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  gridThumbImg: { width: "100%", height: 110 },
  gridInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  gridName: { fontSize: 12.5, fontWeight: "600" },
  gridMeta: { fontSize: 11, marginTop: 2 },

  // Action menu
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  menuSheet: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  menuFileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuFileName: { fontSize: 14, fontWeight: "700" },
  menuFileMeta: { fontSize: 12, marginTop: 2 },
  menuDivider: { height: 1, marginVertical: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: { fontSize: 15, fontWeight: "500" },

>>>>>>> main
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
