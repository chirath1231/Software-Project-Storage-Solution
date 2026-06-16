import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { storage, plans } from "../data/mock";
import GradientHeader from "../components/GradientHeader";
import StorageMeter from "../components/StorageMeter";
import { accent } from "../theme/colors";

export default function SubscriptionScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("plus");

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Subscription" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}
      >
        {/* Current plan */}
        <View style={[styles.current, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.currentLabel, { color: c.textMuted }]}>CURRENT PLAN</Text>
            <Text style={[styles.currentName, { color: c.textPrimary }]}>Plus</Text>
            <Text style={[styles.currentMeta, { color: c.textSecondary }]}>
              {storage.used} GB of {storage.total} GB used
            </Text>
          </View>
          <StorageMeter percent={storage.percent} size={92} stroke={10} label="full" />
        </View>

        <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Subscription details</Text>

        <View style={{ gap: 14, marginTop: 12 }}>
          {plans.map((p) => {
            const active = selected === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                style={[
                  styles.plan,
                  {
                    backgroundColor: c.bgSecondary,
                    borderColor: active ? c.accent.orange : c.border,
                    shadowColor: c.shadow,
                  },
                  active && styles.planActive,
                ]}
              >
                <View style={styles.planHead}>
                  <View>
                    <View style={styles.planTitleRow}>
                      <Text style={[styles.planName, { color: c.textPrimary }]}>{p.name}</Text>
                      {p.highlight ? (
                        <View style={[styles.popular, { backgroundColor: c.bgSoftOrange }]}>
                          <Text style={[styles.popularText, { color: c.accent.deep }]}>Popular</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.planStorage, { color: c.textMuted }]}>{p.storage} storage</Text>
                  </View>
                  <View style={styles.priceWrap}>
                    <Text style={[styles.price, { color: c.textPrimary }]}>${p.price}</Text>
                    <Text style={[styles.per, { color: c.textMuted }]}>/mo</Text>
                  </View>
                </View>

                <View style={styles.features}>
                  {p.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={c.accent.deep} />
                      <Text style={[styles.featureText, { color: c.textSecondary }]}>{f}</Text>
                    </View>
                  ))}
                </View>

                {active ? (
                  <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.selectBtn}>
                    <Text style={styles.selectText}>{p.id === "plus" ? "Current Plan" : "Choose " + p.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.selectBtnOutline, { borderColor: c.border }]}>
                    <Text style={[styles.selectTextOutline, { color: c.textPrimary }]}>Select</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  current: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  currentLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  currentName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4 },
  currentMeta: { fontSize: 13 },
  sectionLabel: { fontSize: 16, fontWeight: "800", marginTop: 24 },
  plan: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  planActive: { shadowOpacity: 0.1 },
  planHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 18, fontWeight: "800" },
  popular: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  popularText: { fontSize: 10.5, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  planStorage: { fontSize: 13, marginTop: 3 },
  priceWrap: { flexDirection: "row", alignItems: "baseline" },
  price: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  per: { fontSize: 13, fontWeight: "600" },
  features: { gap: 9, marginTop: 14, marginBottom: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  featureText: { fontSize: 13.5 },
  selectBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  selectText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
  selectBtnOutline: { borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1 },
  selectTextOutline: { fontWeight: "700", fontSize: 14.5 },
});
