import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

const CLOUD_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&q=80";

export default function LoginScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("jonas_kahnwald@gmail.com");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignIn = () => {
    setLoading(true);
    setTimeout(() => signIn({ email }), 650); // auth swaps the navigator
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <ImageBackground source={{ uri: CLOUD_IMG }} style={[styles.hero, { height: 280 + insets.top }]}>
        <LinearGradient
          colors={["rgba(10,14,22,0.15)", "rgba(10,14,22,0.55)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable onPress={() => navigation.goBack()} style={[styles.back, { top: insets.top + 8 }]}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      </ImageBackground>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: c.bgApp }]}>
            <Text style={[styles.title, { color: c.textPrimary }]}>Login</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              Please login to continue to your account.
            </Text>

            <View style={{ gap: 14, marginTop: 18 }}>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" icon="mail-outline" />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure icon="lock-closed-outline" />
            </View>

            <Pressable style={styles.checkRow} onPress={() => setKeep((k) => !k)}>
              <View style={[styles.checkbox, { borderColor: keep ? c.accent.orange : c.borderStrong, backgroundColor: keep ? c.accent.orange : "transparent" }]}>
                {keep ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
              </View>
              <Text style={[styles.checkLabel, { color: c.textSecondary }]}>Keep me logged in</Text>
            </Pressable>

            <Button label="Sign in" loading={loading} onPress={onSignIn} style={{ marginTop: 4 }} />

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: c.border }]} />
              <Text style={[styles.or, { color: c.textMuted }]}>or</Text>
              <View style={[styles.line, { backgroundColor: c.border }]} />
            </View>

            <Pressable
              style={[styles.google, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
              onPress={onSignIn}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={[styles.googleText, { color: c.textPrimary }]}>Sign in with Google</Text>
            </Pressable>

            <Text style={[styles.foot, { color: c.textSecondary }]}>
              Need an account?{" "}
              <Text onPress={() => navigation.navigate("SignUp")} style={{ color: c.accent.deep, fontWeight: "700" }}>
                Create one
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, marginTop: -34 },
  hero: { width: "100%", justifyContent: "flex-start" },
  back: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    flex: 1,
  },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14.5, marginTop: 6, lineHeight: 20 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 18 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkLabel: { fontSize: 14, fontWeight: "500" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 18 },
  line: { flex: 1, height: 1 },
  or: { fontSize: 12, fontWeight: "600" },
  google: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  googleText: { fontSize: 15, fontWeight: "600" },
  foot: { textAlign: "center", marginTop: 22, fontSize: 14 },
});
