import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SubscriptionScreen({ navigation }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);

      fetch("http://172.20.10.6:8000/api/subscriptions/")
        .then((res) => res.json())
        .then((data) => setSubscriptions(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };

    loadData();
  }, []);

  const handleSubscribe = async (sub) => {
    if (!userEmail) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(
        "http://172.20.10.6:8000/api/subscriptions/create-payment/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription_id: sub.id,
            email: userEmail,
            amount: Number(sub.price).toFixed(2),
            first_name: userEmail.split("@")[0],
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert("Payment creation failed");
        return;
      }

      navigation.navigate("PayHereScreen", {
        paymentData: data.paymentData,
      });

    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Subscriptions</Text>

      {subscriptions.map((sub) => (
        <View key={sub.id} style={styles.card}>
          <Text style={styles.name}>{sub.name}</Text>
          <Text>{sub.description}</Text>
          <Text style={styles.price}>Rs. {sub.price}</Text>

          <TouchableOpacity
            onPress={() => handleSubscribe(sub)}
            style={styles.button}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, marginBottom: 20, fontWeight: "bold" },
  card: {
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
  },
  name: { fontSize: 20, fontWeight: "bold" },
  price: { marginTop: 8, fontWeight: "bold", fontSize: 18 },
  button: {
    marginTop: 12,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
