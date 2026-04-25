// components/BottomBar.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'Home',          icon: 'home-outline' },
    { name: 'Files',         icon: 'folder-outline' },
    { name: 'Notifications', icon: 'notifications-outline' },
    { name: 'Profile',       icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Home */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home-outline" size={22} color={route.name === 'Home' ? '#ff8c00' : '#aaa'} />
      </TouchableOpacity>

      {/* Files */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Files')}>
        <Ionicons name="folder-outline" size={22} color={route.name === 'Files' ? '#ff8c00' : '#aaa'} />
      </TouchableOpacity>

      {/* FAB — center */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Upload')}>
          <Ionicons name="arrow-up-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Notifications')}>
        <Ionicons name="notifications-outline" size={22} color={route.name === 'Notifications' ? '#ff8c00' : '#aaa'} />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-outline" size={22} color={route.name === 'Profile' ? '#ff8c00' : '#aaa'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,        // lifts FAB above the bar
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ff8c00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
});