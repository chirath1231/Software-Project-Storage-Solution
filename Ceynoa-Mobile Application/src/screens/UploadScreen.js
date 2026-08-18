<<<<<<< HEAD
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
=======
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getFiles, getSubscription, uploadFile } from "../api/filesApi";
import GradientHeader from "../components/GradientHeader";
import Button from "../components/Button";

// Upload status: null | "uploading" | "success" | "error" | "limit"

function StatusIcon({ status, c }) {
  if (status === "uploading") return <ActivityIndicator size="large" color={c.accent.deep} />;
  if (status === "success")  return <Ionicons name="checkmark-circle" size={48} color="#22c55e" />;
  if (status === "limit")    return <Ionicons name="warning" size={48} color="#f97316" />;
  if (status === "error")    return <Ionicons name="close-circle" size={48} color="#ef4444" />;
  return <Ionicons name="cloud-upload-outline" size={48} color={c.textMuted} />;
}

export default function UploadScreen({ navigation }) {
  const { c } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [picked, setPicked] = useState(null); // { uri, name, size, mimeType }
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const pickFile = async () => {
    if (status === "uploading") return;
    setStatus(null);
    setMessage("");

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0] || result;
      setPicked({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        mimeType: asset.mimeType || "application/octet-stream",
      });
    } catch (err) {
      Alert.alert("File Picker Error", err.message || "Could not open file picker.");
    }
  };

  const checkStorageLimit = useCallback(async (file) => {
    const MAX = 2 * 1024 * 1024 * 1024; // 2 GB
    if (file.size > MAX) {
      return { allowed: false, message: "File exceeds the 2GB single-file limit." };
    }

    try {
      const [fileData, storageGB] = await Promise.all([
        getFiles(),
        user?.email ? getSubscription(user.email) : Promise.resolve(5),
      ]);
      const usedBytes = fileData.reduce((s, f) => s + (f.size || 0), 0);
      const planBytes = storageGB * 1024 * 1024 * 1024;
      const remaining = planBytes - usedBytes;

      if (remaining <= 0) {
        return { allowed: false, message: `Your ${storageGB}GB storage is full. Please upgrade your plan.`, isLimit: true };
      }
      if (file.size > remaining) {
        const remMB = (remaining / 1024 / 1024).toFixed(1);
        const fileMB = (file.size / 1024 / 1024).toFixed(1);
        return {
          allowed: false,
          message: `Not enough space. File needs ${fileMB} MB but only ${remMB} MB remaining.`,
          isLimit: true,
        };
      }
      return { allowed: true };
    } catch {
      return { allowed: true }; // Optimistic if check fails
    }
  }, [user?.email]);

  const handleUpload = async () => {
    if (!picked) return;

    const check = await checkStorageLimit(picked);
    if (!check.allowed) {
      setStatus("limit");
      setMessage(check.message);
      return;
    }

    setStatus("uploading");
    setMessage(`Uploading "${picked.name}"…`);

    try {
      await uploadFile(picked.uri, picked.name, picked.mimeType);
      setStatus("success");
      setMessage(`"${picked.name}" uploaded successfully!`);
      setPicked(null);

      setTimeout(() => {
        setStatus(null);
        setMessage("");
        navigation.goBack();
      }, 2000);
    } catch (err) {
      const msg = err.data?.detail || err.data?.error || err.message || "Upload failed. Please try again.";
      const isLimit = err.status === 413 || msg.toLowerCase().includes("storage");
      setStatus(isLimit ? "limit" : "error");
      setMessage(msg);
    }
  };

  const reset = () => {
    if (status === "uploading") return;
    setPicked(null);
    setStatus(null);
    setMessage("");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
>>>>>>> main
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
<<<<<<< HEAD
      <GradientHeader title="Upload Files" onBack={() => navigation.goBack()} />
=======
      <GradientHeader title="Upload File" onBack={() => navigation.goBack()} />
>>>>>>> main

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
        >
          <Text style={[styles.lead, { color: c.textSecondary }]}>
<<<<<<< HEAD
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
=======
            Select any file to upload to your Ceynoa cloud storage.
          </Text>

          {/* Drop zone / picker */}
          <Pressable
            onPress={status !== "uploading" ? pickFile : undefined}
            style={[
              styles.dropzone,
              {
                borderColor:
                  status === "success" ? "#22c55e"
                  : status === "limit"  ? "#f97316"
                  : status === "error"  ? "#ef4444"
                  : picked              ? c.accent.deep
                  : c.borderStrong,
                backgroundColor:
                  status === "success" ? "#f0fdf4"
                  : status === "limit"  ? "#fff7ed"
                  : status === "error"  ? "#fef2f2"
                  : picked              ? c.bgSoftOrange
                  : c.bgSecondary,
              },
            ]}
          >
            <View style={[styles.dropIcon, { backgroundColor: c.bgSoftOrange }]}>
              <StatusIcon status={status} c={c} />
            </View>

            {status === null && !picked && (
              <>
                <Text style={[styles.dropTitle, { color: c.textPrimary }]}>Tap to select a file</Text>
                <Text style={[styles.dropHint, { color: c.textMuted }]}>Any file type · up to 2 GB</Text>
              </>
            )}

            {picked && !status && (
              <>
                <Text style={[styles.dropTitle, { color: c.textPrimary }]} numberOfLines={2}>
                  {picked.name}
                </Text>
                <Text style={[styles.dropHint, { color: c.textMuted }]}>
                  {formatSize(picked.size)} · Tap to change
                </Text>
              </>
            )}

            {status === "uploading" && (
              <Text style={[styles.dropTitle, { color: c.accent.deep }]}>{message}</Text>
            )}

            {status === "success" && (
              <Text style={[styles.dropTitle, { color: "#16a34a" }]}>{message}</Text>
            )}

            {(status === "limit" || status === "error") && (
              <>
                <Text style={[styles.dropTitle, { color: status === "limit" ? "#ea580c" : "#dc2626" }]}>
                  {message}
                </Text>
                <Text style={[styles.dropHint, { color: c.textMuted }]}>Tap to pick a different file</Text>
              </>
            )}
          </Pressable>

          {/* Upgrade prompt on storage limit */}
          {status === "limit" && (
            <Pressable
              onPress={() => navigation.navigate("Subscription")}
              style={styles.upgradePrompt}
            >
              <Ionicons name="rocket-outline" size={16} color={c.accent.deep} />
              <Text style={[styles.upgradePromptText, { color: c.accent.deep }]}>
                Upgrade your plan for more storage →
              </Text>
            </Pressable>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="secondary"
              full={false}
              style={{ flex: 1 }}
              onPress={() => navigation.goBack()}
            />
            <Button
              label={status === "uploading" ? "Uploading…" : "Upload"}
              icon="cloud-upload-outline"
              full={false}
              style={{ flex: 1.4 }}
              disabled={!picked || status === "uploading" || status === "success"}
              onPress={handleUpload}
            />
          </View>

          {picked && status !== "uploading" && status !== "success" && (
            <Pressable onPress={reset} style={styles.clearBtn}>
              <Text style={[styles.clearBtnText, { color: c.textMuted }]}>Clear selection</Text>
            </Pressable>
          )}
>>>>>>> main
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
<<<<<<< HEAD
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
=======
  lead: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  dropzone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  dropIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dropTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  dropHint: { fontSize: 13, textAlign: "center" },

  upgradePrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 12,
  },
  upgradePromptText: { fontSize: 14, fontWeight: "600" },

  actions: { flexDirection: "row", gap: 12, marginTop: 28 },

  clearBtn: { alignItems: "center", marginTop: 14, paddingVertical: 8 },
  clearBtnText: { fontSize: 13 },
>>>>>>> main
});
