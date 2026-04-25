// screens/SettingsScreen.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';

export default function SettingsScreen({ navigation }) {

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch('http://172.20.10.6:8000/api/accounts/delete/', {
                method: 'DELETE',
                headers: { Authorization: `Token ${token}` },
              });
              if (res.ok) {
                await AsyncStorage.clear();
                navigation.replace('Login');
              } else {
                Alert.alert('Failed to delete account.');
              }
            } catch {
              Alert.alert('Error', 'Failed to connect to server.');
            }
          },
        },
      ]
    );
  };

  const items = [
    {
      label: 'Notification Setting',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('NotificationSetting'),
    },
    {
      label: 'Password Manager',
      icon: 'key-outline',
      onPress: () => navigation.navigate('PasswordManager'),
    },
    {
      label: 'Delete Account',
      icon: 'person-remove-outline',
      onPress: handleDeleteAccount,
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* This flex:1 pushes BottomBar to the very bottom */}
      <View style={styles.content}>
        <View style={styles.list}>
          {items.map((item, i) => (
            <TouchableOpacity key={i} style={styles.row} onPress={item.onPress}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={18} color="#ff8c00" />
              </View>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#ff8c00',
    paddingTop: 48,
    paddingBottom: 20,
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
  list: {
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff3e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  content: {
    flex: 1,          // takes all remaining space, shoving BottomBar to the bottom
    marginTop: 16,
  },
  list: {
    paddingHorizontal: 20,
    gap: 4,
    // remove marginTop: 16 from here, it's now on content
  },
});