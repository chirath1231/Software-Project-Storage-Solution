// src/screens/WelcomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import bg from "../assets/background.png";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <View style={styles.logoBox}>
        <Image source={bg} style={styles.logoImage} />
      </View>

      <Text style={styles.title}>
        Smart & Secure {"\n"} Cloud Storage
      </Text>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupBtn}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.btnText}>Create Account</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Your files. Your control. Anywhere.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoImage: {
    width: 200,
    height: 210,
    borderRadius: 20,
    resizeMode: "cover",
    },
  logoBox: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  loginBtn: {
    backgroundColor: "#ff8c00",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  signupBtn: {
    backgroundColor: "#ff8c00",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    color: "#000000",
    fontSize: 15,
    fontStyle: "bold",
  },
});