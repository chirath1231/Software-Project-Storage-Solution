// src/screens/RegisterScreen.jsx
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
  setErrors(null);

  if (form.password !== form.password2) {
    setErrors({ password: "Passwords do not match." });
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("http://172.20.10.6:8000/api/auth/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors(data);
      setLoading(false);
      return;
    }

    // Save tokens & user info in AsyncStorage
    await AsyncStorage.setItem("access_token", data.access);
    await AsyncStorage.setItem("refresh_token", data.refresh);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    setLoading(false);
    Alert.alert("Registration Successful!");
    navigation.navigate("Login"); // optional
  } catch (err) {
    setErrors({ non_field_errors: ["Network error"] });
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.boxContainer}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.caption}>Sign up to enjoy the features of Revolutie</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={(val) => onChange("username", val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email / Phone"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(val) => onChange("email", val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(val) => onChange("password", val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={form.password2}
          onChangeText={(val) => onChange("password2", val)}
        />

        {errors && (
          <View style={styles.errorBox}>
            {Object.entries(errors).map(([k, v]) => (
              <Text key={k} style={styles.errorText}>
                <Text style={{ fontWeight: "bold" }}>{k}:</Text> {Array.isArray(v) ? v.join(", ") : v}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign up</Text>}
        </TouchableOpacity>

        <Text style={styles.or}>__________________ or __________________</Text>

        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.link} onPress={() => navigation.navigate("Login")}>Sign in</Text>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  boxContainer: { width: "90%" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  caption: { fontSize: 14, color: "#555", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
  btn: { backgroundColor: "#007bff", padding: 12, borderRadius: 5, alignItems: "center", marginVertical: 10 },
  btnText: { color: "#fff", fontWeight: "bold" },
  or: { textAlign: "center", marginVertical: 10, color: "#555" },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  socialText: {},
  errorBox: { marginBottom: 10 },
  errorText: { color: "salmon" },
  footerText: { marginTop: 10, textAlign: "center" },
  link: { color: "#007bff" },
  footerLinks: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
});
