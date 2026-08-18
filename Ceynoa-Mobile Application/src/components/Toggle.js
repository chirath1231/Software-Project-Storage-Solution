import React from "react";
import { Switch, Platform } from "react-native";
import { useTheme } from "../theme/ThemeContext";

// Brand-tinted switch used across settings screens.
export default function Toggle({ value, onValueChange }) {
  const { c } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: c.borderStrong, true: c.accent.orange }}
      thumbColor={Platform.OS === "android" ? (value ? "#fff" : "#f4f4f5") : undefined}
      ios_backgroundColor={c.borderStrong}
    />
  );
}
