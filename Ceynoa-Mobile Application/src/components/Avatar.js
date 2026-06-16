import React from "react";
import { Image, View, StyleSheet } from "react-native";
import { accent } from "../theme/colors";

export default function Avatar({ uri, size = 48, ring = false, online = false }) {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2.5 : 0,
          borderColor: "#fff",
          backgroundColor: "#E5E7EB",
        }}
      />
      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: size * 0.13,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
