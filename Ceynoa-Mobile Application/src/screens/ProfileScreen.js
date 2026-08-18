import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import GradientHeader from "../components/GradientHeader";
import Avatar from "../components/Avatar";
import { Card, ListRow } from "../components/Card";
import Button from "../components/Button";

export default function ProfileScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="My Profile" height={56}>
        <View style={styles.profile}>
          <Avatar uri={user?.avatar} size={64} ring />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || "Jane Doe"}</Text>
            <Text style={styles.meta}>{user?.phone || "+123 567 89000"}</Text>
            <Text style={styles.meta}>{user?.email || "janedoe@example.com"}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("EditProfile")} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      </GradientHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
      >
        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <ListRow icon="person-outline" label="Profile" onPress={() => navigation.navigate("EditProfile")} />
          <Divider c={c} />
          <ListRow icon="diamond-outline" label="Subscription Plan" subtitle={`Current: ${user?.plan || "Plus"}`} onPress={() => navigation.navigate("Subscription")} />
          <Divider c={c} />
          <ListRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy")} />
          <Divider c={c} />
          <ListRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate("Settings")} />
          <Divider c={c} />
          <ListRow icon="help-buoy-outline" label="Support" onPress={() => navigation.navigate("Support")} />
          <Divider c={c} />
          <ListRow icon="people-outline" label="Clients" onPress={() => navigation.navigate("Clients")} />
        </Card>

        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4, marginTop: 16 }}>
          <ListRow icon="log-out-outline" label="Logout" danger showChevron={false} onPress={() => setShowLogout(true)} />
        </Card>
      </ScrollView>

      {/* Logout confirmation */}
      <Modal transparent visible={showLogout} animationType="fade" onRequestClose={() => setShowLogout(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowLogout(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.bgSecondary, paddingBottom: insets.bottom + 18 }]} onPress={() => {}}>
            <View style={[styles.sheetIcon, { backgroundColor: "rgba(239,68,68,0.10)" }]}>
              <Ionicons name="log-out-outline" size={26} color={c.tones.dangerText} />
            </View>
            <Text style={[styles.sheetTitle, { color: c.textPrimary }]}>Log out?</Text>
            <Text style={[styles.sheetBody, { color: c.textSecondary }]}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={styles.sheetActions}>
              <Button label="Cancel" variant="secondary" full={false} style={{ flex: 1 }} onPress={() => setShowLogout(false)} />
              <Button label="Yes, Logout" variant="danger" full={false} style={{ flex: 1 }} onPress={signOut} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Divider({ c }) {
  return <View style={{ height: 1, backgroundColor: c.border, marginLeft: 53 }} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 14 },
  name: { color: "#fff", fontSize: 19, fontWeight: "800" },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
  },
  sheetIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  sheetBody: { fontSize: 14.5, textAlign: "center", marginTop: 8, lineHeight: 21 },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 22, alignSelf: "stretch" },
});
