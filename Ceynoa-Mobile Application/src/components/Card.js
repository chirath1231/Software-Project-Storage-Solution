import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

// White rounded surface with a soft shadow.
export function Card({ children, style, padded = true }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.bgSecondary,
          borderColor: c.border,
          shadowColor: c.shadow,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// A tappable settings/menu row: tinted icon + label (+ optional subtitle) + chevron.
export function ListRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  right,
  onPress,
  danger = false,
  showChevron = true,
}) {
  const { c } = useTheme();
  const color = danger ? c.tones.dangerText : iconColor || c.accent.deep;
  const bg = iconBg || (danger ? "rgba(239,68,68,0.10)" : c.bgSoftOrange);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={19} color={color} />
        </View>
      ) : null}
      <View style={styles.rowMid}>
        <Text style={[styles.label, { color: danger ? c.tones.dangerText : c.textPrimary }]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  padded: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 11 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowMid: { flex: 1, gap: 2 },
  label: { fontSize: 15.5, fontWeight: "600" },
  subtitle: { fontSize: 12.5 },
});
