import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { folders } from "../data/mock";
import GradientHeader from "../components/GradientHeader";
import Input from "../components/Input";
import Button from "../components/Button";

export default function UploadScreen({ navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState(false);
  const [fileName, setFileName] = useState("");
  const [shareWith, setShareWith] = useState("");
  const [expire, setExpire] = useState("");
  const [folder, setFolder] = useState(folders[0]);
  const [openFolder, setOpenFolder] = useState(false);

  const pickFile = () => {
    setPicked(true);
    setFileName("Proposal-v2.pdf");
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Upload Files" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
        >
          <Text style={[styles.lead, { color: c.textSecondary }]}>
            Here's a quick look at your storage and recent activity.
          </Text>

          {/* Dropzone */}
          <Pressable
            onPress={pickFile}
            style={[
              styles.dropzone,
              { borderColor: picked ? c.accent.orange : c.borderStrong, backgroundColor: picked ? c.bgSoftOrange : c.bgSecondary },
            ]}
          >
            <View style={[styles.dropIcon, { backgroundColor: c.bgSoftOrange }]}>
              <Ionicons name={picked ? "checkmark-circle" : "cloud-upload-outline"} size={28} color={c.accent.deep} />
            </View>
            <Text style={[styles.dropTitle, { color: c.textPrimary }]}>
              {picked ? fileName : "Tap to select files"}
            </Text>
            <Text style={[styles.dropHint, { color: c.textMuted }]}>JPEG, PNG, PDF and MP4 · up to 1 GB</Text>
          </Pressable>

          <Input label="File name" value={fileName} onChangeText={setFileName} placeholder="Untitled file" />

          {/* Upload to dropdown */}
          <Pressable
            onPress={() => setOpenFolder((o) => !o)}
            style={[styles.select, { backgroundColor: c.bgPrimary, borderColor: c.border, marginTop: 14 }]}
          >
            <View style={[styles.folderDot, { backgroundColor: folder.color }]} />
            <Text style={[styles.selectText, { color: c.textPrimary }]}>{folder.name}</Text>
            <Ionicons name={openFolder ? "chevron-up" : "chevron-down"} size={18} color={c.textMuted} />
            <View style={[styles.selectLabel, { backgroundColor: c.bgApp }]}>
              <Text style={[styles.selectLabelText, { color: c.textMuted }]}>Upload to</Text>
            </View>
          </Pressable>
          {openFolder ? (
            <View style={[styles.dropdown, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              {folders.map((f) => (
                <Pressable
                  key={f.id}
                  style={styles.dropItem}
                  onPress={() => {
                    setFolder(f);
                    setOpenFolder(false);
                  }}
                >
                  <View style={[styles.folderDot, { backgroundColor: f.color }]} />
                  <Text style={[styles.selectText, { color: c.textPrimary }]}>{f.name}</Text>
                  {folder.id === f.id ? <Ionicons name="checkmark" size={16} color={c.accent.deep} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          <Input label="Share with" value={shareWith} onChangeText={setShareWith} placeholder="Add people by email" icon="people-outline" style={{ marginTop: 14 }} />
          <Input label="Expire date" value={expire} onChangeText={setExpire} placeholder="DD / MM / YYYY" icon="calendar-outline" style={{ marginTop: 14 }} />

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" full={false} style={{ flex: 1 }} onPress={() => navigation.goBack()} />
            <Button label="Upload" icon="cloud-upload-outline" full={false} style={{ flex: 1.4 }} disabled={!picked} onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  lead: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
    marginBottom: 8,
  },
  dropIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dropTitle: { fontSize: 15.5, fontWeight: "700", marginTop: 4 },
  dropHint: { fontSize: 12.5 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  folderDot: { width: 14, height: 14, borderRadius: 4 },
  selectText: { flex: 1, fontSize: 15, fontWeight: "500" },
  selectLabel: { position: "absolute", top: -8, left: 12, paddingHorizontal: 6 },
  selectLabelText: { fontSize: 11.5, fontWeight: "600" },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: 8, overflow: "hidden" },
  dropItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  actions: { flexDirection: "row", gap: 12, marginTop: 26 },
});
