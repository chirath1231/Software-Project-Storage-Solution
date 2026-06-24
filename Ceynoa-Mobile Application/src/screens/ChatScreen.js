import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { chatMessages } from "../data/mock";
import Avatar from "../components/Avatar";

export default function ChatScreen({ navigation, route }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { name = "Client", avatar, online } = route.params || {};
  const [messages, setMessages] = useState(chatMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: String(Date.now()), fromMe: true, text, time: "Now" }]);
    setDraft("");
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: c.bgSecondary, borderBottomColor: c.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={c.textPrimary} />
        </Pressable>
        <Avatar uri={avatar} size={40} online={online} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.status, { color: online ? c.tones.okText : c.textMuted }]}>
            {online ? "Online" : "Offline"}
          </Text>
        </View>
        <Pressable hitSlop={10}>
          <Ionicons name="ellipsis-vertical" size={20} color={c.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.dayLabel, { color: c.textMuted }]}>Today</Text>
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.bubbleWrap,
                { alignSelf: m.fromMe ? "flex-end" : "flex-start", alignItems: m.fromMe ? "flex-end" : "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  m.fromMe
                    ? { backgroundColor: c.accent.orange, borderBottomRightRadius: 4 }
                    : { backgroundColor: c.bgTertiary, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={[styles.bubbleText, { color: m.fromMe ? "#fff" : c.textPrimary }]}>{m.text}</Text>
              </View>
              <Text style={[styles.time, { color: c.textMuted }]}>{m.time}</Text>
            </View>
          ))}
        </ScrollView>

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
            <Pressable hitSlop={8}>
              <Ionicons name="attach" size={20} color={c.textMuted} />
            </Pressable>
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
  name: { fontSize: 16, fontWeight: "700" },
  status: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  dayLabel: { fontSize: 11.5, fontWeight: "600", textAlign: "center", marginBottom: 4 },
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
