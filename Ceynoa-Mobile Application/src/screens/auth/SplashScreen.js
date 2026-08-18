import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import BrandLogo from "../../components/BrandLogo";

export default function SplashScreen({ navigation }) {
  const { c } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Onboarding"), 1600);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: c.bgApp }]}>
      <View style={styles.center}>
        <BrandLogo size={96} />
        <Text style={[styles.word, { color: c.textPrimary }]}>CEYNOA</Text>
      </View>
      <Text style={[styles.tag, { color: c.textMuted }]}>
        Smart, Secure & Affordable Cloud{" "}
        <Text style={{ color: c.accent.deep, fontWeight: "700" }}>Storage</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", gap: 18, flex: 1, justifyContent: "center" },
  word: { fontSize: 28, fontWeight: "800", letterSpacing: 6, marginLeft: 6 },
  tag: { fontSize: 13.5, fontWeight: "500", marginBottom: 48 },
});
