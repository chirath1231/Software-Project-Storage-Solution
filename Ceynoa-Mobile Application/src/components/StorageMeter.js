import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";
import { accent } from "../theme/colors";

// Circular storage gauge — shows the used percentage as a gradient ring.
export default function StorageMeter({ percent = 70, size = 120, stroke = 12, label }) {
  const { c } = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(percent, 0), 100) / 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="meterGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accent.gradient[0]} />
            <Stop offset="1" stopColor={accent.gradient[1]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.bgTertiary}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#meterGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { color: c.textPrimary }]}>{percent}%</Text>
        {label ? <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: "absolute", alignItems: "center" },
  percent: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: "600", marginTop: 1 },
});
