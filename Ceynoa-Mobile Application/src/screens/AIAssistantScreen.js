import React, { useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { sendAssistantMessage } from "../api/assistantApi";

const GREETING = "Hi! I'm the Ceynoa Assistant. Ask me anything about file uploads, storage, sharing, subscriptions or account settings.";

export default function AIAssistantScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([{ id: "greeting", sender: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, sender: "user", text }]);
    setLoading(true);
    try {
      const res = await sendAssistantMessage(text);
      setMessages((m) => [...m, { id: `b${Date.now()}`, sender: "bot", text: res.reply || "…" }]);
    } catch {
      setMessages((m) => [...m, { id: `e${Date.now()}`, sender: "bot", text: "Sorry, I couldn't reach the assistant. Please try again." }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <AssistantHeader c={c} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubbleWrap, { alignSelf: m.sender === "user" ? "flex-end" : "flex-start" }]}
            >
              <View
                style={[
                  styles.bubble,
                  m.sender === "user"
                    ? { backgroundColor: c.accent.orange, borderBottomRightRadius: 4 }
                    : { backgroundColor: c.bgTertiary, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={[styles.bubbleText, { color: m.sender === "user" ? "#fff" : c.textPrimary }]}>{m.text}</Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.bubbleWrap, { alignSelf: "flex-start" }]}>
              <View style={[styles.bubble, styles.typingBubble, { backgroundColor: c.bgTertiary, borderBottomLeftRadius: 4 }]}>
                <View style={[styles.dot, { backgroundColor: c.accent.orange }]} />
                <View style={[styles.dot, { backgroundColor: c.accent.orange }]} />
                <View style={[styles.dot, { backgroundColor: c.accent.orange }]} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.composer, { backgroundColor: c.bgSecondary, borderTopColor: c.border, paddingBottom: insets.bottom + 10 }]}>
          <View style={[styles.inputWrap, { backgroundColor: c.bgTertiary }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about Ceynoa…"
              placeholderTextColor={c.textMuted}
              style={[styles.input, { color: c.textPrimary }]}
              onSubmitEditing={send}
              returnKeyType="send"
            />
          </View>
          <Pressable onPress={send} disabled={loading} style={[styles.send, { backgroundColor: c.accent.orange, opacity: loading ? 0.5 : 1 }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function AssistantHeader({ c, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: c.bgSecondary, borderBottomColor: c.border }]}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color={c.textPrimary} />
      </Pressable>
      <View style={[styles.botIcon, { backgroundColor: c.bgSoftOrange }]}>
        <Ionicons name="sparkles" size={18} color={c.accent.deep} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: c.textPrimary }]}>Ceynoa Assistant</Text>
        <Text style={[styles.status, { color: c.tones.okText }]}>Online Support AI</Text>
      </View>
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
  botIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "700" },
  status: { fontSize: 12, fontWeight: "600", marginTop: 1 },

  bubbleWrap: { maxWidth: "82%" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleText: { fontSize: 14.5, lineHeight: 20 },
  typingBubble: { flexDirection: "row", gap: 4, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrap: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: Platform.OS === "ios" ? 12 : 4 },
  input: { fontSize: 15, paddingVertical: 6 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
});
