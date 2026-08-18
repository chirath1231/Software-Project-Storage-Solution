import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import GradientHeader from "../components/GradientHeader";
import Input from "../components/Input";
import Button from "../components/Button";

export default function PasswordManagerScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);

  const onChange = () => {
    setSaved(true);
    setTimeout(() => navigation.goBack(), 800);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Password Manager" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
        >
          <Input label="Current Password" value={current} onChangeText={setCurrent} placeholder="••••••••" secure icon="lock-closed-outline" />
          <Pressable style={styles.forgot}>
            <Text style={[styles.forgotText, { color: c.accent.deep }]}>Forgot Password?</Text>
          </Pressable>

          <Input label="New Password" value={next} onChangeText={setNext} placeholder="••••••••" secure icon="key-outline" style={{ marginTop: 16 }} />
          <Input label="Confirm New Password" value={confirm} onChangeText={setConfirm} placeholder="••••••••" secure icon="key-outline" style={{ marginTop: 16 }} />

          <View style={[styles.hint, { backgroundColor: c.bgSoftOrange }]}>
            <Ionicons name="information-circle-outline" size={16} color={c.accent.deep} />
            <Text style={[styles.hintText, { color: c.textSecondary }]}>
              Use at least 8 characters with a mix of letters, numbers and symbols.
            </Text>
          </View>

          {saved ? (
            <View style={[styles.toast, { backgroundColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)" }]}>
              <Ionicons name="checkmark-circle" size={18} color={c.tones.okText} />
              <Text style={[styles.toastText, { color: c.tones.okText }]}>Password changed</Text>
            </View>
          ) : null}

          <Button label="Change Password" icon="shield-checkmark-outline" onPress={onChange} style={{ marginTop: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  forgot: { alignSelf: "flex-end", marginTop: 10 },
  forgotText: { fontSize: 13, fontWeight: "600" },
  hint: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 12, padding: 13, marginTop: 18 },
  hintText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  toast: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: 18 },
  toastText: { fontSize: 13.5, fontWeight: "600" },
});
