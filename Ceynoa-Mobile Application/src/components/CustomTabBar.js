import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { accent, tabBar } from "../theme/colors";

const ICONS = {
  Home: ["home", "home-outline"],
  Files: ["document", "document-outline"],
  Notifications: ["notifications", "notifications-outline"],
  Profile: ["person", "person-outline"],
};

// Dark floating tab bar with a raised center Upload button (per sketch).
export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  // Split tabs into two halves around the central FAB.
  const routes = state.routes;
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route) => {
    const idx = routes.findIndex((r) => r.key === route.key);
    const focused = state.index === idx;
    const [on, off] = ICONS[route.name] || ["ellipse", "ellipse-outline"];
    return (
      <Pressable
        key={route.key}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
      >
        <Ionicons
          name={focused ? on : off}
          size={23}
          color={focused ? tabBar.active : tabBar.inactive}
        />
        {focused ? <View style={styles.activeDot} /> : null}
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.host, { paddingBottom: insets.bottom ? insets.bottom : 12 }]}>
      <View style={[styles.bar, { backgroundColor: tabBar.bg }]}>
        <View style={styles.half}>{left.map(renderTab)}</View>
        <View style={styles.gap} />
        <View style={styles.half}>{right.map(renderTab)}</View>
      </View>

      {/* Center raised Upload FAB */}
      <Pressable
        style={styles.fabWrap}
        onPress={() => navigation.navigate("Upload")}
      >
        <View style={[styles.fabRing, { backgroundColor: c.bgApp }]}>
          <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
            <Ionicons name="cloud-upload" size={24} color="#fff" />
          </LinearGradient>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    borderRadius: 22,
    paddingHorizontal: 8,
    width: "100%",
    ...Platform.select({
      android: { elevation: 12 },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
    }),
  },
  half: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  gap: { width: 64 },
  tab: { alignItems: "center", justifyContent: "center", height: 64, width: 56 },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: accent.amber,
    marginTop: 5,
  },
  fabWrap: { position: "absolute", top: -22, alignSelf: "center" },
  fabRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 8 },
      default: {
        shadowColor: accent.deep,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
});
