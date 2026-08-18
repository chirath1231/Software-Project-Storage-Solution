import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import GradientHeader from "../components/GradientHeader";
import Avatar from "../components/Avatar";
import Input from "../components/Input";
import Button from "../components/Button";

export default function EditProfileScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    updateUser({ name, phone, email, dob });
    setSaved(true);
    setTimeout(() => navigation.goBack(), 700);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Edit Profile" onBack={() => navigation.goBack()} height={64}>
        <View style={styles.avatarWrap}>
          <Avatar uri={user?.avatar} size={88} ring />
          <View style={[styles.camBadge, { borderColor: c.accent.amber }]}>
            <Ionicons name="camera" size={15} color="#fff" />
          </View>
        </View>
      </GradientHeader>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingTop: 44, paddingBottom: insets.bottom + 30 }}
        >
          <View style={{ gap: 16 }}>
            <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" icon="person-outline" />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+1 234 567 890" keyboardType="phone-pad" icon="call-outline" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" icon="mail-outline" />
            <Input label="Date Of Birth" value={dob} onChangeText={setDob} placeholder="DD / MM / YYYY" icon="calendar-outline" />
          </View>

          {saved ? (
            <View style={[styles.toast, { backgroundColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)" }]}>
              <Ionicons name="checkmark-circle" size={18} color={c.tones.okText} />
              <Text style={[styles.toastText, { color: c.tones.okText }]}>Profile updated</Text>
            </View>
          ) : null}

          <Button label="Update Profile" icon="save-outline" onPress={onSave} style={{ marginTop: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  avatarWrap: { alignItems: "center", marginTop: 14, marginBottom: -44 },
  camBadge: {
    position: "absolute",
    right: "34%",
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF8A00",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
  },
  toastText: { fontSize: 13.5, fontWeight: "600" },
});
