// src/screens/RegisterScreen.jsx
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Image } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
    setForm((prev) => ({ ...prev, [name]: value }));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data);
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);
      Alert.alert("Registration Successful!");
      navigation.navigate("Login");
    } catch (err) {
      setErrors({ non_field_errors: ["Network error"] });
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/Maskgroup.png")}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.boxContainer}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.caption}>
          Sign up to enjoy the features of Revolutie
        </Text>

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={form.username}
          onChangeText={(val) => onChange("username", val)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email / Phone"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(val) => onChange("email", val)}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={form.password}
          onChangeText={(val) => onChange("password", val)}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={form.password2}
          onChangeText={(val) => onChange("password2", val)}
        />

        {errors && (
          <View style={styles.errorBox}>
            {Object.entries(errors).map(([k, v]) => (
              <Text key={k} style={styles.errorText}>
                <Text style={{ fontWeight: "bold" }}>{k}:</Text>{" "}
                {Array.isArray(v) ? v.join(", ") : v}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign up</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleBtnText}>G  Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Login")}
          >
            Sign in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  heroImage: {
    width: "100%",
    height: 200,
  },
  boxContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  caption: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 14,
    color: "#333",
  },
  btn: {
    backgroundColor: "#ff8c00",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  orText: {
    textAlign: "center",
    color: "#aaa",
    marginVertical: 12,
    fontSize: 13,
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  googleBtnText: {
    fontSize: 14,
    color: "#333",
  },
  errorBox: {
    marginBottom: 10,
  },
  errorText: {
    color: "salmon",
    fontSize: 13,
  },
  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
    color: "#888",
  },
  link: {
    color: "#007bff",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
});