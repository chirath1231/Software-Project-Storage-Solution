import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Linking, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, BASE_URL } from "../api/apiClient";
import GradientHeader from "../components/GradientHeader";
import StorageMeter from "../components/StorageMeter";
import { accent } from "../theme/colors";

export default function SubscriptionScreen({ navigation }) {
  const { c } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        apiGet("subscriptions/plans/"),
        user ? apiGet(`subscriptions/my-subscription/?email=${encodeURIComponent(user.email)}`) : null,
      ]);
      setPlans(plansRes || []);
      setCurrentSub(subRes || null);
    } catch (err) {
      console.error("Subscription load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleSubscribe = async (plan) => {
    if (plan.price === "0.00" || plan.price === 0) {
      Alert.alert("Free Plan", "You are automatically on the Free plan.");
      return;
    }
    setSubmittingId(plan.id);
    try {
      const data = await apiPost("subscriptions/checkout/", {
        plan_id: plan.id,
        user_email: user?.email,
      });

      if (data.checkout_url) {
        Alert.alert(
          "Complete Payment",
          `Opening PayHere to complete your ${plan.name} subscription.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Pay Now", onPress: () => Linking.openURL(data.checkout_url) },
          ]
        );
      } else {
        Alert.alert("Success", "Subscription activated!");
        loadData();
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to initiate payment.");
    } finally {
      setSubmittingId(null);
    }
  };

  const activePlanId = currentSub?.plan?.id;

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Subscription Plans" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent.deep} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading plans…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent.deep} />
          }
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}
        >
          <Text style={[styles.heading, { color: c.textPrimary }]}>Choose Your Plan</Text>
          <Text style={[styles.subheading, { color: c.textSecondary }]}>
            Upgrade your storage and unlock premium tools for your workflow.
          </Text>

          {/* Current plan card */}
          {currentSub ? (
            <View style={[styles.currentCard, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.currentLabel, { color: c.textMuted }]}>ACTIVE SUBSCRIPTION</Text>
                <Text style={[styles.currentName, { color: c.textPrimary }]}>
                  {currentSub.plan?.name || "Free"}
                </Text>
                <Text style={[styles.currentMeta, { color: c.textSecondary }]}>
                  {currentSub.plan?.storage_gb} GB Storage Limit
                </Text>
              </View>
              <StorageMeter percent={100} size={84} stroke={9} label="active" />
            </View>
          ) : (
            <View style={[styles.noPlanCard, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              <Ionicons name="information-circle-outline" size={20} color={c.accent.orange} />
              <Text style={[styles.noPlanText, { color: c.textSecondary }]}>
                You are currently using the default <Text style={{ fontWeight: "700" }}>Free (5 GB)</Text> plan.
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: c.textPrimary, marginBottom: 14 }]}>Available Plans</Text>

          <View style={{ gap: 16 }}>
            {plans.map((plan) => {
              const isCurrent = activePlanId === plan.id;
              const isBest = plan.name.toLowerCase().includes("pro");
              const isFree = plan.price === "0.00" || plan.price === 0;

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: c.bgSecondary,
                      borderColor: isBest ? c.accent.orange : c.border,
                      shadowColor: isBest ? c.accent.orange : c.shadow,
                    },
                    isBest && styles.cardBest,
                  ]}
                >
                  <View style={styles.cardHead}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardName, { color: c.textPrimary }]}>{plan.name}</Text>
                      {isBest && (
                        <View style={[styles.badge, { backgroundColor: c.bgSoftOrange }]}>
                          <Ionicons name="sparkles" size={12} color={c.accent.orange} />
                          <Text style={[styles.badgeText, { color: c.accent.orange }]}>MOST POPULAR</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={[styles.price, { color: c.textPrimary }]}>
                        {isFree ? "Free" : `LKR ${Number(plan.price).toLocaleString()}`}
                      </Text>
                      {!isFree && <Text style={[styles.pricePer, { color: c.textMuted }]}>/ month</Text>}
                    </View>
                  </View>

                  {plan.description ? (
                    <Text style={[styles.desc, { color: c.textSecondary }]}>{plan.description}</Text>
                  ) : null}

                  <View style={[styles.storagePill, { backgroundColor: c.bgTertiary }]}>
                    <Ionicons name="cloud-outline" size={15} color={c.accent.deep} />
                    <Text style={[styles.storagePillText, { color: c.accent.deep }]}>
                      {plan.storage_gb} GB Cloud Storage
                    </Text>
                  </View>

                  <View style={styles.features}>
                    <View style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={c.accent.orange} />
                      <Text style={[styles.featureText, { color: c.textPrimary }]}>
                        {plan.storage_gb} GB High-Speed Cloud Storage
                      </Text>
                    </View>
                    <View style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={c.accent.orange} />
                      <Text style={[styles.featureText, { color: c.textPrimary }]}>
                        Client Messaging & File Sharing
                      </Text>
                    </View>
                    <View style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={c.accent.orange} />
                      <Text style={[styles.featureText, { color: c.textPrimary }]}>
                        24/7 File Accessibility & Backups
                      </Text>
                    </View>
                  </View>

                  {isCurrent ? (
                    <View style={[styles.btnDisabled, { borderColor: "#bbf7d0" }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                      <Text style={[styles.btnDisabledText, { color: "#16a34a" }]}>Current Active Plan</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => handleSubscribe(plan)}
                      disabled={submittingId === plan.id}
                      style={({ pressed }) => [
                        styles.btn,
                        { backgroundColor: isBest ? c.accent.orange : c.accent.deep, opacity: pressed ? 0.8 : 1 },
                      ]}
                    >
                      {submittingId === plan.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.btnText}>{isFree ? "Default Plan" : "Upgrade to " + plan.name}</Text>
                          <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}

            {plans.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="cube-outline" size={36} color={c.textMuted} />
                <Text style={[styles.emptyText, { color: c.textMuted }]}>No subscription plans available right now.</Text>
              </View>
            )}
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color={c.textMuted} />
            <Text style={[styles.footerText, { color: c.textMuted }]}>
              Payments are securely processed via PayHere Gateway. Subscriptions auto-renew monthly. Cancel anytime.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14 },

  heading: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, textAlign: "center", marginTop: 4 },
  subheading: { fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 20 },

  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  currentLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  currentName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  currentMeta: { fontSize: 13 },

  noPlanCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  noPlanText: { flex: 1, fontSize: 13, lineHeight: 19 },

  sectionLabel: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },

  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    gap: 14,
  },
  cardBest: { shadowOpacity: 0.12 },

  cardHead: { gap: 8 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  cardName: { fontSize: 20, fontWeight: "800" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  price: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  pricePer: { fontSize: 13, fontWeight: "600" },

  desc: { fontSize: 13.5, lineHeight: 20 },

  storagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  storagePillText: { fontSize: 12.5, fontWeight: "700" },

  features: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { flex: 1, fontSize: 13.5 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  btnDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "#f0fdf4",
  },
  btnDisabledText: { fontWeight: "700", fontSize: 15 },

  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },

  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  footerText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
