import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import GradientHeader from "../components/GradientHeader";

const SECTIONS = [
  {
    h: "1. Information we collect",
    p: "We collect the files you upload, basic account details such as your name and email, and usage data needed to keep your storage secure and reliable.",
  },
  {
    h: "2. How we use your data",
    p: "Your data is used solely to provide the service: storing, syncing, and sharing your files. We never sell your personal information to third parties.",
  },
  {
    h: "3. Encryption & security",
    p: "Files are encrypted in transit and at rest. Access is protected by your credentials and optional two-factor authentication.",
  },
  {
    h: "4. Sharing & links",
    p: "When you share a file, you control who can access it and for how long. Expired links are permanently revoked.",
  },
  {
    h: "5. Your rights",
    p: "You can export or delete your data at any time from Settings. Deleting your account removes all stored files irreversibly.",
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
        <Text style={[styles.updated, { color: c.textMuted }]}>Last updated · May 2026</Text>
        <Text style={[styles.intro, { color: c.textSecondary }]}>
          At CEYNOA, your privacy is a priority. This policy explains what we collect and how we protect it.
        </Text>
        {SECTIONS.map((s) => (
          <View key={s.h} style={{ marginTop: 22 }}>
            <Text style={[styles.h, { color: c.textPrimary }]}>{s.h}</Text>
            <Text style={[styles.p, { color: c.textSecondary }]}>{s.p}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  updated: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  intro: { fontSize: 14.5, lineHeight: 22, marginTop: 10 },
  h: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  p: { fontSize: 14, lineHeight: 22 },
});
