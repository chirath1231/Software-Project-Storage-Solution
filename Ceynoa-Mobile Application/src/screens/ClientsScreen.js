import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput, ActivityIndicator, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/core";
import { useTheme } from "../theme/ThemeContext";
import { useChatSocket } from "../context/ChatSocketContext";
import { getConversations, getChatUsers, startConversation, createGroup } from "../api/chatApi";
import GradientHeader from "../components/GradientHeader";
import SearchBar from "../components/SearchBar";

function InitialsAvatar({ label, size = 48, online, c }) {
  const initial = (label || "?").trim().charAt(0).toUpperCase();
  return (
    <View style={{ width: size, height: size }}>
      <View style={[avatarStyles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.bgSoftOrange }]}>
        <Text style={[avatarStyles.initial, { color: c.accent.deep, fontSize: size * 0.4 }]}>{initial}</Text>
      </View>
      {online ? (
        <View style={[avatarStyles.dot, { width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]} />
      ) : null}
    </View>
  );
}

export default function ClientsScreen({ navigation }) {
  const { c } = useTheme();
  const { presence, unread, subscribe } = useChatSocket();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      // best-effort — keep whatever list we already have on a transient failure
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => subscribe((evt) => {
    if (evt.type === "chat_message" || evt.type === "group_update") load();
  }), [subscribe, load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const openModal = async () => {
    setModalOpen(true);
    setGroupMode(false);
    setGroupName("");
    setSelectedIds(new Set());
    setUserQuery("");
    if (chatUsers.length === 0) {
      setUsersLoading(true);
      try {
        setChatUsers(await getChatUsers());
      } catch {}
      setUsersLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (groupMode) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleStart = async () => {
    if (selectedIds.size === 0 || creating) return;
    setCreating(true);
    try {
      if (groupMode) {
        if (!groupName.trim()) { setCreating(false); return; }
        const res = await createGroup(groupName.trim(), Array.from(selectedIds));
        setModalOpen(false);
        load();
        navigation.navigate("Chat", { id: res.conversation_id, name: groupName.trim(), isGroup: true });
      } else {
        const otherId = Array.from(selectedIds)[0];
        const otherUser = chatUsers.find((u) => u.id === otherId);
        const res = await startConversation(otherId);
        setModalOpen(false);
        load();
        navigation.navigate("Chat", { id: res.conversation_id, name: otherUser?.username || "Chat", otherUserId: otherId });
      }
    } catch {
      // leave the modal open so the user can retry
    } finally {
      setCreating(false);
    }
  };

  const shownConversations = conversations.filter((cv) =>
    (cv.name || "").toLowerCase().includes(query.trim().toLowerCase())
  );
  const shownUsers = chatUsers.filter((u) => u.username.toLowerCase().includes(userQuery.trim().toLowerCase()));

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader
        title="Clients"
        onBack={() => navigation.goBack()}
        right={
          <Pressable hitSlop={8} style={styles.newBtn} onPress={openModal}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        }
      >
        <Text style={styles.subtitle}>Manage your clients, share files, and track activity.</Text>
        <View style={{ marginTop: 14 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search conversations…" />
        </View>
      </GradientHeader>

      {loading ? (
        <ActivityIndicator color={c.accent.deep} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent.deep} />}
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, gap: 10, flexGrow: 1 }}
        >
          {shownConversations.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>No conversations yet</Text>
              <Text style={[styles.emptySub, { color: c.textMuted }]}>Tap + to start chatting</Text>
            </View>
          ) : (
            shownConversations.map((cv) => {
              const liveOnline = cv.other_user ? presence[cv.other_user.id]?.isOnline : undefined;
              const isOnline = liveOnline !== undefined ? liveOnline : (cv.other_user?.is_online || false);
              const unreadCount = unread[cv.id] || 0;
              return (
                <Pressable
                  key={cv.id}
                  onPress={() =>
                    navigation.navigate("Chat", {
                      id: cv.id,
                      name: cv.name,
                      isGroup: cv.is_group,
                      otherUserId: cv.other_user?.id,
                      online: isOnline,
                    })
                  }
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  {cv.is_group ? (
                    <View style={[styles.groupIcon, { backgroundColor: c.bgSoftOrange }]}>
                      <Ionicons name="people" size={22} color={c.accent.deep} />
                    </View>
                  ) : (
                    <InitialsAvatar label={cv.name} size={48} online={isOnline} c={c} />
                  )}
                  <View style={styles.mid}>
                    <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{cv.name}</Text>
                    <Text style={[styles.note, { color: c.textMuted }]} numberOfLines={1}>
                      {cv.last_message?.text || (cv.is_group ? `${cv.participants.length} members` : "Say hello 👋")}
                    </Text>
                  </View>
                  {unreadCount > 0 ? (
                    <View style={[styles.badge, { backgroundColor: c.accent.orange }]}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* New chat / group */}
      <Modal transparent visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.bgSecondary, paddingBottom: insets.bottom + 18 }]} onPress={() => {}}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <Text style={[styles.sheetTitle, { color: c.textPrimary }]}>New Conversation</Text>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => { setGroupMode(false); setSelectedIds(new Set()); }}
                style={[styles.modeChip, { backgroundColor: !groupMode ? c.accent.orange : c.bgTertiary }]}
              >
                <Text style={[styles.modeChipText, { color: !groupMode ? "#fff" : c.textSecondary }]}>Direct Message</Text>
              </Pressable>
              <Pressable
                onPress={() => { setGroupMode(true); setSelectedIds(new Set()); }}
                style={[styles.modeChip, { backgroundColor: groupMode ? c.accent.orange : c.bgTertiary }]}
              >
                <Text style={[styles.modeChipText, { color: groupMode ? "#fff" : c.textSecondary }]}>Group Chat</Text>
              </Pressable>
            </View>

            {groupMode ? (
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group name"
                placeholderTextColor={c.textMuted}
                style={[styles.groupNameInput, { color: c.textPrimary, borderColor: c.border, backgroundColor: c.bgPrimary }]}
              />
            ) : null}

            <View style={{ marginTop: 12 }}>
              <SearchBar value={userQuery} onChangeText={setUserQuery} placeholder="Search people…" />
            </View>

            {usersLoading ? (
              <ActivityIndicator color={c.accent.deep} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
                {shownUsers.map((u) => {
                  const selected = selectedIds.has(u.id);
                  return (
                    <Pressable key={u.id} onPress={() => toggleSelect(u.id)} style={styles.userRow}>
                      <InitialsAvatar label={u.username} size={38} c={c} />
                      <Text style={[styles.userName, { color: c.textPrimary }]}>{u.username}</Text>
                      <Ionicons
                        name={selected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={selected ? c.accent.orange : c.textMuted}
                      />
                    </Pressable>
                  );
                })}
                {shownUsers.length === 0 ? (
                  <Text style={[styles.noUsers, { color: c.textMuted }]}>No users found.</Text>
                ) : null}
              </ScrollView>
            )}

            <Pressable
              onPress={handleStart}
              disabled={creating || selectedIds.size === 0 || (groupMode && !groupName.trim())}
              style={[
                styles.startBtn,
                { backgroundColor: c.accent.orange, opacity: creating || selectedIds.size === 0 || (groupMode && !groupName.trim()) ? 0.5 : 1 },
              ]}
            >
              {creating ? <ActivityIndicator size="small" color="#fff" /> : (
                <Text style={styles.startBtnText}>{groupMode ? "Create Group" : "Start Chat"}</Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  initial: { fontWeight: "800" },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
});

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
  groupIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, gap: 3 },
  name: { fontSize: 15.5, fontWeight: "700" },
  note: { fontSize: 13 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 8, flex: 1, justifyContent: "center" },
  emptyText: { fontSize: 15, fontWeight: "600" },
  emptySub: { fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 12, maxHeight: "85%" },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "800" },
  modeRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  modeChip: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: "center" },
  modeChipText: { fontSize: 13.5, fontWeight: "700" },
  groupNameInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginTop: 12 },
  userList: { maxHeight: 260, marginTop: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  userName: { flex: 1, fontSize: 14.5, fontWeight: "600" },
  noUsers: { textAlign: "center", fontSize: 13, paddingVertical: 20 },
  startBtn: { marginTop: 16, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
