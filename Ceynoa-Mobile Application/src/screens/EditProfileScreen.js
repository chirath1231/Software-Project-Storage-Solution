// screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';

export default function EditProfileScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
  });

  useEffect(() => {
    AsyncStorage.multiGet(['username', 'email']).then(values => {
      setForm(prev => ({
        ...prev,
        fullName: values[0][1] || '',
        email: values[1][1] || '',
      }));
    });
  }, []);

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://172.20.10.6:8000/api/accounts/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Alert.alert('Profile updated successfully!');
      } else {
        const data = await res.json();
        Alert.alert('Update failed', JSON.stringify(data));
      }
    } catch {
      Alert.alert('Error', 'Failed to connect to server.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <TouchableOpacity style={styles.avatarEdit}>
          <Ionicons name="pencil" size={12} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor="#ccc"
          value={form.fullName}
          onChangeText={v => onChange('fullName', v)}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+123 567 89000"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={v => onChange('phone', v)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="janedoe@example.com"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={v => onChange('email', v)}
        />

        <Text style={styles.label}>Date Of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="DD / MM / YYY"
          placeholderTextColor="#ccc"
          value={form.dob}
          onChangeText={v => onChange('dob', v)}
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
          <Text style={styles.btnText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#ff8c00',
    paddingTop: 48,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 48,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffb347',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff8c00',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff3e8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  btn: {
    backgroundColor: '#ff8c00',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});