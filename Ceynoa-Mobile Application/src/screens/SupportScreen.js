import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { faqs } from "../data/mock";
import GradientHeader from "../components/GradientHeader";
import { Card, ListRow } from "../components/Card";

export default function SupportScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(null);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Support" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}>
        <Text style={[styles.title, { color: c.textPrimary }]}>We're here to help</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Find answers below or contact our team anytime.
        </Text>

        <Text style={[styles.group, { color: c.textMuted }]}>FAQ</Text>
        <View style={{ gap: 10 }}>
          {faqs.map((f, i) => {
            const expanded = open === i;
            return (
              <Pressable
                key={i}
                onPress={() => setOpen(expanded ? null : i)}
                style={[styles.faq, { backgroundColor: c.bgSecondary, borderColor: expanded ? c.accent.orange + "66" : c.border, shadowColor: c.shadow }]}
              >
                <View style={styles.faqHead}>
                  <Text style={[styles.faqQ, { color: c.textPrimary }]}>{f.q}</Text>
                  <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={c.textMuted} />
                </View>
                {expanded ? <Text style={[styles.faqA, { color: c.textSecondary }]}>{f.a}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.group, { color: c.textMuted }]}>GET IN TOUCH</Text>
        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <ListRow icon="chatbubbles-outline" label="Contact Us" subtitle="Chat with our support team" onPress={() => navigation.navigate("Clients")} />
          <Divider c={c} />
          <ListRow icon="mail-outline" label="Email Support" subtitle="support@ceynoa.app" onPress={() => {}} />
          <Divider c={c} />
          <ListRow icon="link-outline" label="Quick Links" subtitle="Guides, status & community" onPress={() => {}} />
        </Card>
      </ScrollView>
    </View>
  );
}

function Divider({ c }) {
  return <View style={{ height: 1, backgroundColor: c.border, marginLeft: 53 }} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  sub: { fontSize: 14.5, lineHeight: 21, marginTop: 6 },
  group: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  faq: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  faqQ: { flex: 1, fontSize: 14.5, fontWeight: "600" },
  faqA: { fontSize: 13.5, lineHeight: 20, marginTop: 10 },
});
