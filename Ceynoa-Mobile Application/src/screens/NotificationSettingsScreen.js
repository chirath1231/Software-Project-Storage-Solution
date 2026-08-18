import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import GradientHeader from "../components/GradientHeader";
import { Card } from "../components/Card";
import Toggle from "../components/Toggle";

const OPTIONS = [
  { key: "general", label: "General Notification", default: true },
  { key: "sound", label: "Sound", default: true },
  { key: "vibrate", label: "Vibrate", default: false },
  { key: "offers", label: "Special Offers", default: true },
  { key: "payments", label: "Payments", default: false },
  { key: "promo", label: "Promo And Discount", default: false },
];

export default function NotificationSettingsScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(
    OPTIONS.reduce((acc, o) => ({ ...acc, [o.key]: o.default }), {})
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Notification Settings" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}>
        <Card padded={false} style={{ paddingHorizontal: 18 }}>
          {OPTIONS.map((o, i) => (
            <View
              key={o.key}
              style={[styles.row, i < OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
            >
              <Text style={[styles.label, { color: c.textPrimary }]}>{o.label}</Text>
              <Toggle value={state[o.key]} onValueChange={(v) => setState((s) => ({ ...s, [o.key]: v }))} />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 17 },
  label: { fontSize: 15.5, fontWeight: "500" },
});
