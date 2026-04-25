// screens/LoginScreen.js
import React, { useState } from 'react';
import { Image, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch("http://172.20.10.6:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Login Successful!");
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("email", data.email);
        await AsyncStorage.setItem("username", data.username);
        navigation.navigate("Subscription");
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Maskgroup.png')}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Please login to continue to your account.</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleBtnText}>G  Sign in with Google</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Need an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Create one
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginTop: 28,
    marginHorizontal: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#555',
    marginHorizontal: 24,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 10,
    fontSize: 14,
    color: '#333',
  },
  btn: {
    backgroundColor: '#ff8c00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  orText: {
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 12,
    fontSize: 13,
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  googleBtnText: {
    fontSize: 14,
    color: '#333',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#888',
  },
  link: {
    color: '#007bff',
  },
});