import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import Button from "../../components/Button";

export default function OnboardingScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <BrandLogo size={132} />
        <Text style={[styles.title, { color: c.textPrimary }]}>
          Smart <Text style={{ color: c.accent.deep }}>&</Text> Secure
        </Text>
        <Text style={[styles.title, { color: c.textPrimary }]}>Cloud Storage</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Login" icon="log-in-outline" onPress={() => navigation.navigate("Login")} />
        <Button
          label="Create Account"
          variant="secondary"
          icon="person-add-outline"
          onPress={() => navigation.navigate("SignUp")}
        />
        <Text style={[styles.tag, { color: c.textMuted }]}>Your files. Your control. Anywhere.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 38 },
  actions: { gap: 12 },
  tag: { textAlign: "center", fontSize: 13, marginTop: 10 },
});
