import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, Share, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import {
  getShare, createOrUpdateShare, deleteShare,
  addCollaborator, removeCollaborator,
} from "../api/filesApi";

export default function ShareModal({ file, onClose }) {
  const { c } = useTheme();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkPermission, setLinkPermission] = useState("read");

  const [newEmail, setNewEmail] = useState("");
  const [newPerm, setNewPerm] = useState("read");
  const [addingCollab, setAddingCollab] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getShare(file.id);
        setShare(res);
        setLinkPermission(res.link_permission);
      } catch (err) {
        if (err.status !== 404) console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [file.id]);

  const handleCreateOrUpdate = async (perm = linkPermission) => {
    setSaving(true);
    try {
      const res = await createOrUpdateShare(file.id, perm);
      setShare(res);
    } catch (err) {
      Alert.alert("Error", "Could not create share link.");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = () => {
    Alert.alert(
      "Revoke link?",
      "Anyone with the link will lose access.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShare(file.id);
              setShare(null);
            } catch {
              Alert.alert("Error", "Could not revoke link.");
            }
          },
        },
      ]
    );
  };

  const handleShareLink = async () => {
    if (!share?.share_url) return;
    try {
      await Share.share({ message: share.share_url, url: share.share_url });
    } catch {}
  };

  const handleAddCollab = async () => {
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setAddingCollab(true);
    try {
      const res = await addCollaborator(file.id, newEmail.trim().toLowerCase(), newPerm);
      setShare((prev) => ({
        ...prev,
        collaborators: prev.collaborators?.some((c) => c.id === res.id)
          ? prev.collaborators.map((c) => (c.id === res.id ? res : c))
          : [...(prev.collaborators || []), res],
      }));
      setNewEmail("");
    } catch (err) {
      setEmailError(err.data?.detail || "Failed to add collaborator.");
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollab = async (collabId) => {
    try {
      await removeCollaborator(file.id, collabId);
      setShare((prev) => ({
        ...prev,
        collaborators: prev.collaborators.filter((c) => c.id !== collabId),
      }));
    } catch {
      Alert.alert("Error", "Could not remove collaborator.");
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={[styles.sheet, { backgroundColor: c.bgPrimary }]}>
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: c.border }]} />

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: c.bgSoftOrange }]}>
                <Ionicons name="share-social-outline" size={18} color={c.accent.deep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Share File</Text>
                <Text style={[styles.headerSub, { color: c.textMuted }]} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={c.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 32 }}
            >
              {loading ? (
                <ActivityIndicator color={c.accent.deep} style={{ paddingVertical: 40 }} />
              ) : (
                <>
                  {/* ─── Shareable Link ─── */}
                  <View>
                    <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
                      SHAREABLE LINK
                    </Text>

                    {share?.is_active ? (
                      <>
                        {/* Permission toggle */}
                        <View style={styles.permRow}>
                          <Text style={[styles.permLabel, { color: c.textSecondary }]}>
                            Anyone with link can:
                          </Text>
                          <View style={[styles.toggleRow, { backgroundColor: c.bgTertiary }]}>
                            {["read", "read_upload"].map((p) => (
                              <Pressable
                                key={p}
                                onPress={() => {
                                  setLinkPermission(p);
                                  handleCreateOrUpdate(p);
                                }}
                                style={[
                                  styles.toggleBtn,
                                  linkPermission === p && [styles.toggleBtnActive, { backgroundColor: c.bgPrimary }],
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.toggleText,
                                    { color: linkPermission === p ? c.textPrimary : c.textMuted },
                                  ]}
                                >
                                  {p === "read" ? "View only" : "View & Upload"}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>

                        {/* Link display + share */}
                        <View style={[styles.linkBox, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
                          <Ionicons name="link-outline" size={14} color={c.textMuted} />
                          <Text style={[styles.linkText, { color: c.textSecondary }]} numberOfLines={1}>
                            {share.share_url}
                          </Text>
                        </View>

                        <View style={styles.linkActions}>
                          <Pressable
                            onPress={handleShareLink}
                            style={[styles.actionBtn, { backgroundColor: c.accent.deep }]}
                          >
                            <Ionicons name="share-outline" size={14} color="#fff" />
                            <Text style={styles.actionBtnText}>Share Link</Text>
                          </Pressable>
                          <Pressable
                            onPress={handleRevoke}
                            style={[styles.revokeBtn, { borderColor: c.border }]}
                          >
                            <Ionicons name="trash-outline" size={14} color="#ef4444" />
                            <Text style={styles.revokeBtnText}>Revoke</Text>
                          </Pressable>
                        </View>
                      </>
                    ) : (
                      <View style={[styles.emptyLink, { borderColor: c.border, backgroundColor: c.bgTertiary }]}>
                        <Ionicons name="link-outline" size={28} color={c.textMuted} />
                        <Text style={[styles.emptyLinkText, { color: c.textMuted }]}>
                          No shareable link created yet
                        </Text>
                        <Pressable
                          onPress={() => handleCreateOrUpdate()}
                          disabled={saving}
                          style={[styles.actionBtn, { backgroundColor: c.accent.deep, opacity: saving ? 0.5 : 1 }]}
                        >
                          {saving
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="link-outline" size={14} color="#fff" />
                          }
                          <Text style={styles.actionBtnText}>Generate Link</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* ─── Collaborators (only when share is active) ─── */}
                  {share?.is_active && (
                    <View>
                      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
                        INVITE BY EMAIL
                      </Text>

                      {/* Add form */}
                      <View style={styles.addRow}>
                        <View style={[styles.emailInput, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
                          <Ionicons name="mail-outline" size={14} color={c.textMuted} />
                          <TextInput
                            value={newEmail}
                            onChangeText={(t) => { setNewEmail(t); setEmailError(""); }}
                            placeholder="colleague@example.com"
                            placeholderTextColor={c.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={[styles.emailText, { color: c.textPrimary }]}
                          />
                        </View>

                        <Pressable
                          onPress={() => setNewPerm((p) => (p === "read" ? "read_upload" : "read"))}
                          style={[styles.permToggle, { backgroundColor: c.bgTertiary, borderColor: c.border }]}
                        >
                          <Ionicons
                            name={newPerm === "read" ? "eye-outline" : "cloud-upload-outline"}
                            size={14}
                            color={c.accent.deep}
                          />
                        </Pressable>

                        <Pressable
                          onPress={handleAddCollab}
                          disabled={addingCollab || !newEmail}
                          style={[
                            styles.addBtn,
                            { backgroundColor: c.accent.deep, opacity: addingCollab || !newEmail ? 0.4 : 1 },
                          ]}
                        >
                          {addingCollab
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="person-add-outline" size={16} color="#fff" />
                          }
                        </Pressable>
                      </View>

                      {emailError ? (
                        <Text style={styles.emailError}>{emailError}</Text>
                      ) : null}

                      {/* Collab list */}
                      {share.collaborators?.map((collab) => (
                        <View key={collab.id} style={[styles.collabRow, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
                          <View style={[styles.collabAvatar, { backgroundColor: c.bgSoftOrange }]}>
                            <Text style={[styles.collabInitial, { color: c.accent.deep }]}>
                              {collab.email[0].toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.collabEmail, { color: c.textPrimary }]} numberOfLines={1}>
                              {collab.email}
                            </Text>
                            <Text style={[styles.collabPerm, { color: c.textMuted }]}>
                              {collab.permission === "read" ? "View only" : "View & Upload"}
                            </Text>
                          </View>
                          <Pressable onPress={() => handleRemoveCollab(collab.id)} hitSlop={8}>
                            <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 1 },

  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 12 },

  permRow: { gap: 8, marginBottom: 12 },
  permLabel: { fontSize: 12 },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleText: { fontSize: 12, fontWeight: "600" },

  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  linkText: { flex: 1, fontSize: 12, fontFamily: "monospace" },

  linkActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  revokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  revokeBtnText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },

  emptyLink: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyLinkText: { fontSize: 13 },

  addRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  emailInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emailText: { flex: 1, fontSize: 13 },
  permToggle: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emailError: { color: "#ef4444", fontSize: 12, marginBottom: 8 },

  collabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  collabAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  collabInitial: { fontSize: 13, fontWeight: "700" },
  collabEmail: { fontSize: 13, fontWeight: "500" },
  collabPerm: { fontSize: 11, marginTop: 1 },
});
