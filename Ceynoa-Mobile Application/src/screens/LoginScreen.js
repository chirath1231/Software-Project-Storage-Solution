<<<<<<< HEAD
<<<<<<< HEAD
// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/accounts/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login Successful!");
     localStorage.setItem("userEmail", data.email);

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      window.location.href = "/subscription";
    } else {
      alert(data?.detail || data?.non_field_errors || "Login failed");
=======
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

=======
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

>>>>>>> 1fc8a0facc25dc50c203dd8abb02c38cfea64d82

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
<<<<<<< HEAD
>>>>>>> dc808b9 (Refactor Login and Registration screens: enhance layout, improve user experience, and streamline error handling)
=======
>>>>>>> 1fc8a0facc25dc50c203dd8abb02c38cfea64d82
    }
  };

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
=======
=======
>>>>>>> 1fc8a0facc25dc50c203dd8abb02c38cfea64d82
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
<<<<<<< HEAD
>>>>>>> dc808b9 (Refactor Login and Registration screens: enhance layout, improve user experience, and streamline error handling)
=======
>>>>>>> 1fc8a0facc25dc50c203dd8abb02c38cfea64d82
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 5 },
=======
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
<<<<<<< HEAD
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
<<<<<<< HEAD
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
>>>>>>> dc808b9 (Refactor Login and Registration screens: enhance layout, improve user experience, and streamline error handling)
=======
  link: { color: "#007bff", fontWeight: "bold", textAlign: "center" },
>>>>>>> 939e397 (Add Subscription and PayHere screens; update navigation and login flow)
=======
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#007bff", fontWeight: "bold", textAlign: "center" },
>>>>>>> 1fc8a0facc25dc50c203dd8abb02c38cfea64d82
});
