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
import AsyncStorage from "@react-native-async-storage/async-storage";


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
        // Save email and token
        await AsyncStorage.setItem("userEmail", email);
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
        }

        Alert.alert("Success", "Login Successful!");

        // Navigate to subscription page
        navigation.navigate("SubscriptionScreen"); // Ensure this screen is defined in your navigation stack
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
        <Text style={styles.caption}>
          Please login to continue to your account.
        </Text>

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

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 10 }}
        >
          <Text style={styles.link}>Create account</Text>
        </TouchableOpacity>
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
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#007bff", fontWeight: "bold", textAlign: "center" },
});
