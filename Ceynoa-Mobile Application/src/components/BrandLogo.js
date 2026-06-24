import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { accent } from "../theme/colors";

// The CEYNOA brand mark: a rounded "blob" with a soft square cut-out,
// echoing the cloud-storage logo in the sketches.
export default function BrandLogo({ size = 64 }) {
  const inner = size * 0.42;
  return (
    <LinearGradient
      colors={accent.gradient}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          borderTopRightRadius: size * 0.5,
        },
      ]}
    >
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner * 0.34,
          backgroundColor: "#FFFFFF",
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  blob: { alignItems: "center", justifyContent: "center" },
});
