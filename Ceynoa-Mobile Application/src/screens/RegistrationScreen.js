// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit() {
    setErrors(null);

    if (form.password !== form.password2) {
      setErrors({ password: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://172.20.10.6:8000/api/auth/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            password2: form.password2,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors(data);
        setLoading(false);
        return;
      }

      // Optionally save tokens using AsyncStorage
      // AsyncStorage.setItem("access_token", data.access);

      setLoading(false);

      // Navigate to login screen
      navigation.navigate("Login");
    } catch (err) {
      setErrors({ non_field_errors: ["Network error"] });
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>LOGO</Text>

      <View style={styles.authBox}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.caption}>
          Sign up to enjoy the features of Revolutie
        </Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={form.username}
          onChangeText={text => onChange("username", text)}
        />
        <TextInput
          placeholder="Email / Phone"
          style={styles.input}
          value={form.email}
          onChangeText={text => onChange("email", text)}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={text => onChange("password", text)}
        />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry
          value={form.password2}
          onChangeText={text => onChange("password2", text)}
        />

        {errors && (
          <View style={{ marginBottom: 10 }}>
            {Object.entries(errors).map(([k, v]) => (
              <Text key={k} style={{ color: "salmon" }}>
                {k}: {Array.isArray(v) ? v.join(", ") : v}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Registering..." : "Sign up"}</Text>
        </TouchableOpacity>

        <Text style={styles.or}>─── or ───</Text>

        <TouchableOpacity style={styles.socialBtn}>
          <Text>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Sign in
          </Text>
        </Text>

        <View style={styles.footerLinks}>
          <Text style={styles.link}>Terms</Text>
          <Text style={styles.link}>Support</Text>
          <Text style={styles.link}>Customer Care</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  authBox: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  caption: { fontSize: 14, marginBottom: 20, color: "#666" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  or: { textAlign: "center", marginVertical: 10, color: "#999" },
  socialBtn: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  footerText: { textAlign: "center", marginTop: 15, color: "#666" },
  link: { color: "#007bff", fontWeight: "bold", marginRight: 10 },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 10,
  },
});
