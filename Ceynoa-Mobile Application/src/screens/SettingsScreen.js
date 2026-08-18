import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import GradientHeader from "../components/GradientHeader";
import { Card, ListRow } from "../components/Card";
import Toggle from "../components/Toggle";
import Button from "../components/Button";

export default function SettingsScreen({ navigation }) {
  const { c, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }}>
        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <ListRow icon="notifications-outline" label="Notification Setting" onPress={() => navigation.navigate("NotificationSettings")} />
          <Divider c={c} />
          <ListRow icon="key-outline" label="Password Manager" onPress={() => navigation.navigate("PasswordManager")} />
          <Divider c={c} />
          <ListRow
            icon={isDark ? "moon-outline" : "sunny-outline"}
            label="Dark Mode"
            showChevron={false}
            right={<Toggle value={isDark} onValueChange={toggleTheme} />}
          />
        </Card>

        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4, marginTop: 16 }}>
          <ListRow icon="trash-outline" label="Delete Account" danger showChevron={false} onPress={() => setShowDelete(true)} />
        </Card>
      </ScrollView>

      <Modal transparent visible={showDelete} animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowDelete(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.bgSecondary, paddingBottom: insets.bottom + 18 }]} onPress={() => {}}>
            <View style={[styles.sheetIcon, { backgroundColor: "rgba(239,68,68,0.10)" }]}>
              <Ionicons name="trash-outline" size={26} color={c.tones.dangerText} />
            </View>
            <Text style={[styles.sheetTitle, { color: c.textPrimary }]}>Delete account?</Text>
            <Text style={[styles.sheetBody, { color: c.textSecondary }]}>
              This permanently removes your files and data. This action can't be undone.
            </Text>
            <View style={styles.sheetActions}>
              <Button label="Cancel" variant="secondary" full={false} style={{ flex: 1 }} onPress={() => setShowDelete(false)} />
              <Button label="Delete" variant="danger" full={false} style={{ flex: 1 }} onPress={() => setShowDelete(false)} />
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
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 24, alignItems: "center" },
  sheetIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  sheetBody: { fontSize: 14.5, textAlign: "center", marginTop: 8, lineHeight: 21 },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 22, alignSelf: "stretch" },
});
