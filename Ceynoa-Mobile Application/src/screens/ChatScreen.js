import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/core";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useChatSocket } from "../context/ChatSocketContext";
import { getMessages, sendMessageRest } from "../api/chatApi";

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function InitialsAvatar({ label, online, c }) {
  const initial = (label || "?").trim().charAt(0).toUpperCase();
  return (
    <View style={{ width: 40, height: 40 }}>
      <View style={[styles.avatarCircle, { backgroundColor: c.bgSoftOrange }]}>
        <Text style={[styles.avatarInitial, { color: c.accent.deep }]}>{initial}</Text>
      </View>
      {online ? <View style={styles.avatarDot} /> : null}
    </View>
  );
}

export default function ChatScreen({ navigation, route }) {
  const { c } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { presence, sendMessage: wsSend, subscribe, setActiveConversation, connected } = useChatSocket();

  const { id: conversationId, name = "Chat", isGroup = false, otherUserId, online: initialOnline } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  const liveOnline = otherUserId != null ? presence[otherUserId]?.isOnline : undefined;
  const isOnline = liveOnline !== undefined ? liveOnline : !!initialOnline;

  const normalize = useCallback((m) => ({
    id: String(m.id),
    clientId: m.client_id,
    fromMe: m.is_mine === true || (m.sender ?? m.sender_id) === user?.id,
    text: m.text,
    time: formatTime(m.created_at || m.timestamp),
    senderUsername: m.sender_username,
  }), [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setActiveConversation(conversationId);
      return () => setActiveConversation(null);
    }, [conversationId, setActiveConversation])
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMessages(conversationId);
        if (!cancelled) setMessages(data.map(normalize));
      } catch {
        // leave the thread empty rather than block the composer
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conversationId, normalize]);

  useEffect(() => subscribe((evt) => {
    if (evt.type !== "chat_message" || evt.conversationId !== conversationId) return;
    const msg = evt.message;
    setMessages((prev) => {
      const withoutPending = msg.client_id ? prev.filter((m) => m.clientId !== msg.client_id) : prev;
      if (withoutPending.some((m) => m.id === String(msg.id))) return withoutPending;
      return [...withoutPending, normalize(msg)];
    });
  }), [subscribe, conversationId, normalize]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const clientId = `c${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setMessages((prev) => [...prev, { id: `pending-${clientId}`, clientId, fromMe: true, text, time: "Now", pending: true }]);

    const sentViaSocket = wsSend(conversationId, text, clientId);
    if (!sentViaSocket) {
      try {
        const res = await sendMessageRest(conversationId, text);
        setMessages((prev) => prev.map((m) => (m.clientId === clientId ? normalize(res) : m)));
      } catch {
        setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, pending: false, failed: true } : m)));
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: c.bgSecondary, borderBottomColor: c.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={c.textPrimary} />
        </Pressable>
        {isGroup ? (
          <View style={[styles.groupIcon, { backgroundColor: c.bgSoftOrange }]}>
            <Ionicons name="people" size={18} color={c.accent.deep} />
          </View>
        ) : (
          <InitialsAvatar label={name} c={c} online={isOnline} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.status, { color: isGroup ? c.textMuted : (isOnline ? c.tones.okText : c.textMuted) }]}>
            {isGroup ? "Group chat" : (isOnline ? "Online" : "Offline")}
          </Text>
        </View>
        {!connected ? <Ionicons name="cloud-offline-outline" size={18} color={c.textMuted} /> : null}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        {loading ? (
          <ActivityIndicator color={c.accent.deep} style={{ marginTop: 30 }} />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <Text style={[styles.placeholderText, { color: c.textMuted }]}>Say hello 👋</Text>
            ) : (
              messages.map((m) => (
                <View
                  key={m.id}
                  style={[styles.bubbleWrap, { alignSelf: m.fromMe ? "flex-end" : "flex-start", alignItems: m.fromMe ? "flex-end" : "flex-start" }]}
                >
                  {isGroup && !m.fromMe && m.senderUsername ? (
                    <Text style={[styles.senderLabel, { color: c.textMuted }]}>{m.senderUsername}</Text>
                  ) : null}
                  <View
                    style={[
                      styles.bubble,
                      m.fromMe
                        ? { backgroundColor: c.accent.orange, borderBottomRightRadius: 4, opacity: m.pending ? 0.6 : 1 }
                        : { backgroundColor: c.bgTertiary, borderBottomLeftRadius: 4 },
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: m.fromMe ? "#fff" : c.textPrimary }]}>{m.text}</Text>
                  </View>
                  <Text style={[styles.time, { color: m.failed ? c.tones.dangerText : c.textMuted }]}>
                    {m.failed ? "Failed to send" : m.time}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Composer */}
        <View style={[styles.composer, { backgroundColor: c.bgSecondary, borderTopColor: c.border, paddingBottom: insets.bottom + 10 }]}>
          <View style={[styles.inputWrap, { backgroundColor: c.bgTertiary }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message…"
              placeholderTextColor={c.textMuted}
              style={[styles.input, { color: c.textPrimary }]}
              multiline
            />
          </View>
          <Pressable onPress={send} style={[styles.send, { backgroundColor: c.accent.orange }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  groupIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontWeight: "800", fontSize: 16 },
  avatarDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 16, fontWeight: "700" },
  status: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  placeholderText: { textAlign: "center", marginTop: 40, fontSize: 14 },
  senderLabel: { fontSize: 11, fontWeight: "600", marginBottom: 2, marginHorizontal: 4 },
  bubbleWrap: { maxWidth: "82%", gap: 3 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleText: { fontSize: 14.5, lineHeight: 20 },
  time: { fontSize: 10.5, marginHorizontal: 4 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    maxHeight: 120,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 6 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
});
