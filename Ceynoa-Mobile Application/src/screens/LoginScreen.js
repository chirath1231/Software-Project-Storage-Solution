// src/screens/LoginScreen.js
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://172.20.10.6:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Login Successful!");
        // Save token if needed
        // navigation.navigate("Home");
      } else {
        Alert.alert("Error", data.detail || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>LOGO</Text>

      <View style={styles.authBox}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.caption}>Please login to continue to your account.</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.rememberArea}>
          <TouchableOpacity>
            <Text>☑ Keep me logged in</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.or}>─── or ───</Text>

        <TouchableOpacity style={styles.socialBtn}>
          <Text>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Register")}
          >
            Create account
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
  rememberArea: { marginBottom: 15 },
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
