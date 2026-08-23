import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { getSharedFile } from "../api/sharingApi";
import { getFileType, getFileMeta, formatSize } from "../utils/fileTypes";
import GradientHeader from "../components/GradientHeader";
import Button from "../components/Button";

export default function SharedFileScreen({ route, navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const token = route?.params?.token;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("This share link is invalid.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await getSharedFile(token);
        setData(res);
      } catch (err) {
        if (err.status === 403) setError("You don't have permission to access this file.");
        else if (err.status === 404) setError("This share link is invalid or has been revoked.");
        else if (err.status === 401) setError("Please log in to view this file.");
        else setError("Unable to load this file.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const openFile = () => {
    if (data?.file_url) Linking.openURL(data.file_url).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <GradientHeader title="Shared File" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator color={c.accent.deep} style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.errIcon, { backgroundColor: c.tones.danger + "1F" }]}>
            <Ionicons name="lock-closed-outline" size={26} color={c.tones.dangerText} />
          </View>
          <Text style={[styles.errTitle, { color: c.textPrimary }]}>Access Denied</Text>
          <Text style={[styles.errSub, { color: c.textSecondary }]}>{error}</Text>
        </View>
      ) : (
        <View style={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
          <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.border, shadowColor: c.shadow }]}>
            {getFileType(data.file_name) === "image" ? (
              <Image source={{ uri: data.file_url }} style={styles.preview} resizeMode="contain" />
            ) : (
              <View style={[styles.iconPreview, { backgroundColor: getFileMeta(data.file_name).color + "1F" }]}>
                <Ionicons name={getFileMeta(data.file_name).icon} size={48} color={getFileMeta(data.file_name).color} />
              </View>
            )}

            <View style={styles.info}>
              <Text style={[styles.fileName, { color: c.textPrimary }]} numberOfLines={2}>{data.file_name}</Text>
              <Text style={[styles.fileMeta, { color: c.textMuted }]}>{formatSize(data.file_size)}</Text>
            </View>

            <Button label="Open / Download" icon="download-outline" onPress={openFile} style={{ marginTop: 16 }} />
          </View>

          <View style={styles.footNote}>
            <Ionicons name="lock-closed-outline" size={12} color={c.textMuted} />
            <Text style={[styles.footNoteText, { color: c.textMuted }]}>
              This file is protected — you're viewing it as a signed-in user.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  errIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  errTitle: { fontSize: 18, fontWeight: "800" },
  errSub: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },

  card: { borderRadius: 20, borderWidth: 1, padding: 18, shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  preview: { width: "100%", height: 220, borderRadius: 14 },
  iconPreview: { width: "100%", height: 160, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  info: { marginTop: 14, gap: 4 },
  fileName: { fontSize: 16.5, fontWeight: "700" },
  fileMeta: { fontSize: 13 },

  footNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18, justifyContent: "center" },
  footNoteText: { fontSize: 12 },
});
