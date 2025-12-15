import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Register() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function onChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit() {
    setErrors({});
    if (form.password !== form.password2) {
      setErrors({ password: "Passwords do not match." });
      return;
    }

    if (!form.username || !form.email || !form.password) {
      setErrors({ general: "Please fill all fields" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://192.168.8.105:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          password2: form.password2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data);
        setLoading(false);
        return;
      }

      // Save tokens
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);
      navigation.navigate("Dashboard"); // or Home
    } catch (err) {
      setErrors({ non_field_errors: ["Network error"] });
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      {Object.keys(errors).length > 0 && (
        <View style={styles.errorBox}>
          {Object.entries(errors).map(([k, v]) => (
            <Text key={k} style={styles.errorText}>
              {k}: {Array.isArray(v) ? v.join(", ") : v}
            </Text>
          ))}
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={value => onChange("username", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        keyboardType="email-address"
        onChangeText={value => onChange("email", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={value => onChange("password", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={form.password2}
        onChangeText={value => onChange("password2", value)}
      />

      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already Registered? Login</Text>
      </TouchableOpacity>

      <View style={styles.footerLinks}>
        <Text style={styles.footerText}>Terms</Text>
        <Text style={styles.footerText}>Support</Text>
        <Text style={styles.footerText}>Customer Care</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  errorBox: {
    marginBottom: 15,
  },
  errorText: {
    color: "salmon",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footerText: {
    color: "#555",
  },
});