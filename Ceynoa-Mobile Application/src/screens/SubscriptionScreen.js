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

// ─── helpers ──────────────────────────────────────────────────
async function fetchPlans() {
  return apiGet("/api/subscriptions/");
}

async function fetchUserSubscriptions(email) {
  return apiGet(`/api/subscriptions/user-subscriptions/${encodeURIComponent(email)}/`);
}

async function createPayment(sub, email) {
  return apiPost("/api/subscriptions/create-payment/", {
    subscription_id: sub.id,
    email,
    amount: Number(sub.price).toFixed(2),
    first_name: email.split("@")[0],
  });
}

function formatStorage(gb) {
  if (!gb) return "—";
  if (gb >= 1000) return `${(gb / 1000).toFixed(0)} TB`;
  return `${gb} GB`;
}

// ─── Plan card ────────────────────────────────────────────────
function PlanCard({ plan, isPaid, isBest, onSubscribe, subscribing, c }) {
  const features = Array.isArray(plan.features) ? plan.features : [];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.bgSecondary,
          borderColor: isBest ? c.accent.orange : c.border,
          shadowColor: c.shadow,
        },
        isBest && styles.cardBest,
      ]}
    >
      {/* Header row */}
      <View style={styles.cardHead}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardName, { color: c.textPrimary }]}>{plan.name}</Text>
          {isBest && (
            <View style={[styles.badge, { backgroundColor: c.bgSoftOrange }]}>
              <Text style={[styles.badgeText, { color: c.accent.deep }]}>Best Value</Text>
            </View>
          )}
          {isPaid && (
            <View style={[styles.badge, { backgroundColor: "#f0fdf4" }]}>
              <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
              <Text style={[styles.badgeText, { color: "#16a34a" }]}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: c.textPrimary }]}>
            Rs. {Number(plan.price).toFixed(2)}
          </Text>
          <Text style={[styles.pricePer, { color: c.textMuted }]}>/mo</Text>
        </View>
      </View>

      {/* Description */}
      {plan.description ? (
        <Text style={[styles.desc, { color: c.textSecondary }]}>{plan.description}</Text>
      ) : null}

      {/* Storage badge */}
      {plan.storage ? (
        <View style={[styles.storagePill, { backgroundColor: c.bgSoftOrange }]}>
          <Ionicons name="cloud-outline" size={13} color={c.accent.deep} />
          <Text style={[styles.storagePillText, { color: c.accent.deep }]}>
            {formatStorage(plan.storage)} Storage
          </Text>
        </View>
      ) : null}

      {/* Features */}
      {features.length > 0 && (
        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={15} color="#22c55e" />
              <Text style={[styles.featureText, { color: c.textSecondary }]}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Button */}
      {isPaid ? (
        <View style={[styles.btnDisabled, { borderColor: c.border }]}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={[styles.btnDisabledText, { color: "#16a34a" }]}>Subscribed</Text>
        </View>
      ) : (
        <Pressable
          onPress={onSubscribe}
          disabled={subscribing}
          style={({ pressed }) => ({ opacity: pressed || subscribing ? 0.75 : 1 })}
        >
          <LinearGradient
            colors={isBest ? accent.gradient : ["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            {subscribing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Subscribe Now</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────
export default function SubscriptionScreen({ navigation }) {
  const { c } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState([]);
  const [paidIds, setPaidIds] = useState(new Set());
  const [currentPlan, setCurrentPlan] = useState(null);
  const [storageGB, setStorageGB] = useState(5);
  const [storageUsedPct, setStorageUsedPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      // Web uses localStorage "username" (Django username) as the subscription key — not email
      const subKey = user?.username || user?.email;
      const [planData, userSubs] = await Promise.all([
        fetchPlans(),
        subKey ? fetchUserSubscriptions(subKey) : Promise.resolve([]),
      ]);

      const plansArr = Array.isArray(planData) ? planData : [];
      setPlans(plansArr);

      const activeSubs = Array.isArray(userSubs) ? userSubs : [];
      const ids = new Set(activeSubs.map((r) => Number(r.subscription_id)));
      setPaidIds(ids);

      // Find the user's latest active plan (API returns date field)
      if (activeSubs.length > 0) {
        const latest = [...activeSubs].sort(
          (a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
        )[0];
        const matchedPlan = plansArr.find((p) => p.id === Number(latest.subscription_id));
        setCurrentPlan(matchedPlan || null);
        setStorageGB(latest.storage || matchedPlan?.storage || 5);
      } else {
        setCurrentPlan(null);
        setStorageGB(5);
      }
    } catch (err) {
      console.error("SubscriptionScreen load error:", err);
      Alert.alert("Error", "Could not load subscription plans.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleSubscribe = async (plan) => {
    if (paidIds.has(plan.id)) {
      Alert.alert("Already Subscribed", "You already own this plan.");
      return;
    }
    const subKey = user?.username || user?.email;
    if (!subKey) {
      Alert.alert("Not logged in", "Please log in first.");
      return;
    }

    Alert.alert(
      "Confirm Subscription",
      `Subscribe to ${plan.name} for Rs. ${Number(plan.price).toFixed(2)}/month?\n\nYou will be redirected to PayHere to complete payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed to Payment",
          onPress: async () => {
            setSubscribingId(plan.id);
            try {
              // Send username as email (matches web app behaviour)
              const data = await createPayment(plan, subKey);
              if (!data.success) {
                Alert.alert("Payment Error", "Failed to create payment. Please try again.");
                return;
              }

              // Build PayHere checkout URL (try GET params — works on PayHere sandbox)
              const params = new URLSearchParams(data.paymentData).toString();
              const checkoutUrl = `https://sandbox.payhere.lk/pay/checkout?${params}`;

              const supported = await Linking.canOpenURL(checkoutUrl);
              if (supported) {
                await Linking.openURL(checkoutUrl);
              } else {
                Alert.alert(
                  "Payment",
                  "Could not open PayHere checkout. Please visit the website to complete your subscription.",
                  [
                    {
                      text: "Open Website",
                      onPress: () => Linking.openURL(`${BASE_URL}/dashboard/subscription`),
                    },
                    { text: "OK" },
                  ]
                );
              }
            } catch (err) {
              console.error("Payment error:", err);
              Alert.alert("Payment Error", err.message || "Payment failed. Please try again.");
            } finally {
              setSubscribingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: c.bgApp }]}>
        <GradientHeader title="Subscription Plans" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent.deep} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading plans…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Subscription Plans" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent.deep} />
        }
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}
      >
        {/* Page heading */}
        <Text style={[styles.heading, { color: c.textPrimary }]}>Choose Your Plan</Text>
        <Text style={[styles.subheading, { color: c.textSecondary }]}>
          Select the plan that fits your needs
        </Text>

        {/* Current plan card */}
        {currentPlan ? (
          <View
            style={[
              styles.currentCard,
              { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow },
            ]}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.currentLabel, { color: c.textMuted }]}>CURRENT PLAN</Text>
              <Text style={[styles.currentName, { color: c.textPrimary }]}>{currentPlan.name}</Text>
              <Text style={[styles.currentMeta, { color: c.textSecondary }]}>
                {formatStorage(storageGB)} storage
              </Text>
            </View>
            <StorageMeter percent={storageUsedPct} size={88} stroke={10} label="used" />
          </View>
        ) : (
          <View
            style={[
              styles.noPlanCard,
              { backgroundColor: c.bgSoftOrange, borderColor: c.accent.orange + "40" },
            ]}
          >
            <Ionicons name="information-circle-outline" size={20} color={c.accent.deep} />
            <Text style={[styles.noPlanText, { color: c.accent.deep }]}>
              You don't have an active subscription yet. Pick a plan below to get started.
            </Text>
          </View>
        )}

        {/* Plans */}
        <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Available Plans</Text>

        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>No plans available</Text>
          </View>
        ) : (
          <View style={{ gap: 16, marginTop: 12 }}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isPaid={paidIds.has(plan.id)}
                isBest={plan.name === "Standard"}
                onSubscribe={() => handleSubscribe(plan)}
                subscribing={subscribingId === plan.id}
                c={c}
              />
            ))}
          </View>
        )}

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={c.textMuted} />
          <Text style={[styles.footerText, { color: c.textMuted }]}>
            Payments are securely processed by PayHere. Pull down to refresh after payment.
          </Text>
        </View>
      </ScrollView>
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

  // Plan card
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
