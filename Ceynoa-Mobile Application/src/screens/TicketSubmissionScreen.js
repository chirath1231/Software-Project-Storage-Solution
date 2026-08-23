import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { createTicket } from "../api/ticketsApi";
import GradientHeader from "../components/GradientHeader";
import Input from "../components/Input";
import Button from "../components/Button";

const CATEGORIES = ["Bug / Error", "Feature Request", "Account / Access", "Performance", "Content Issue", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

function ChipGroup({ options, value, onChange, c, error }) {
  return (
    <View style={styles.chipWrap}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? c.accent.orange : c.bgSecondary,
                borderColor: active ? c.accent.orange : (error ? c.tones.danger : c.border),
              },
            ]}
          >
            <Text style={[styles.chipText, { color: active ? "#fff" : c.textSecondary }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TicketSubmissionScreen({ navigation }) {
  const { c } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!category) e.category = "Required";
    if (!priority) e.priority = "Required";
    if (!subject.trim()) e.subject = "Required";
    if (!description.trim()) e.description = "Required";
    return e;
  };

  const reset = () => {
    setName(user?.name || user?.username || "");
    setEmail(user?.email || "");
    setCategory("");
    setPriority("");
    setSubject("");
    setDescription("");
    setErrors({});
    setSubmitted(false);
    setTicketId("");
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const res = await createTicket({
        name: name.trim(),
        email: email.trim(),
        category,
        priority,
        title: subject.trim(),
        description: description.trim(),
      });
      setTicketId(`TKT-${res.id}`);
      setSubmitted(true);
    } catch (err) {
      if (err.status === 401) {
        alert("Your session has expired. Please log in again.");
      } else {
        alert("Failed to submit ticket. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: c.bgApp }]}>
        <GradientHeader title="Submit a Ticket" onBack={() => navigation.goBack()} />
        <View style={[styles.successWrap, { paddingBottom: insets.bottom + 30 }]}>
          <View style={[styles.successIcon, { backgroundColor: c.tones.ok + "1F" }]}>
            <Ionicons name="checkmark-circle" size={40} color={c.tones.ok} />
          </View>
          <Text style={[styles.successTitle, { color: c.textPrimary }]}>Ticket submitted!</Text>
          <Text style={[styles.successSub, { color: c.textSecondary }]}>
            Your request has been received. We'll follow up at{" "}
            <Text style={{ color: c.accent.deep, fontWeight: "700" }}>{email}</Text>
          </Text>
          <View style={[styles.ticketPill, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
            <Text style={[styles.ticketPillLabel, { color: c.textMuted }]}>TICKET ID</Text>
            <Text style={[styles.ticketPillValue, { color: c.textPrimary }]}>{ticketId}</Text>
          </View>
          <Button label="Submit another ticket" variant="secondary" onPress={reset} style={{ marginTop: 22 }} />
          <Button label="Back to Support" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Submit a Ticket" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
        >
          <Text style={[styles.lead, { color: c.textSecondary }]}>
            Fill in the details and we'll get back to you.
          </Text>

          <Input label="Full Name" value={name} onChangeText={setName} placeholder="Jane Smith" icon="person-outline" />
          <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="jane@company.com" keyboardType="email-address" icon="mail-outline" style={{ marginTop: 16 }} />

          <Text style={[styles.fieldLabel, { color: errors.category ? c.tones.dangerText : c.textMuted }]}>CATEGORY</Text>
          <ChipGroup options={CATEGORIES} value={category} onChange={setCategory} c={c} error={errors.category} />

          <Text style={[styles.fieldLabel, { color: errors.priority ? c.tones.dangerText : c.textMuted }]}>PRIORITY</Text>
          <ChipGroup options={PRIORITIES} value={priority} onChange={setPriority} c={c} error={errors.priority} />

          <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="Brief summary" icon="pricetag-outline" style={{ marginTop: 16 }} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue…"
            icon="document-text-outline"
            multiline
            numberOfLines={5}
            style={{ marginTop: 16 }}
          />

          <Button label="Submit Ticket" icon="send-outline" loading={loading} onPress={handleSubmit} style={{ marginTop: 26 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  lead: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "600" },

  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  successIcon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  successTitle: { fontSize: 22, fontWeight: "800" },
  successSub: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  ticketPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },
  ticketPillLabel: { fontSize: 10.5, fontWeight: "700", letterSpacing: 1 },
  ticketPillValue: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
});
