// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username').then(val => {
      if (val) setUsername(val);
    });
  }, []);

  const recentFiles = [
    { name: 'File Name', date: '20/01/2025', size: '100B' },
    { name: 'File Name', date: '20/01/2025', size: '1GB' },
    { name: 'File Name', date: '20/01/2025', size: '1GB' },
  ];

  const notifications = [
    "File 'Project.zip' uploaded successfully.",
    "Shared 'Video.mp4' — expires in 3 days.",
    'Payment confirmed for Premium Plan.',
  ];

  const sharedFiles = [
    { name: 'File Name', shared: 'jane@me.com', size: '100B' },
    { name: 'File Name', shared: 'jane@me.com', size: '100B' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.logoGroup}>
          <View style={[styles.logoBox, { backgroundColor: '#ff8c00' }]} />
          <View style={[styles.logoBox, { backgroundColor: '#333' }]} />
          <View style={[styles.logoBox, { backgroundColor: '#555' }]} />
        </View>
        <View style={styles.userGroup}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.welcomeText}>Hi, Welcome</Text>
            <Text style={styles.usernameText}>{username || 'Jane Doe'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username ? username[0].toUpperCase() : 'J'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Home</Text>
        <Text style={styles.pageSubtitle}>
          Here's a quick look at your storage and recent activity.
        </Text>

        {/* Storage Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Storage Overview</Text>
          <View style={styles.storageRow}>
            <View style={styles.ring}>
              <Text style={styles.ringText}>70%</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storageLabel}>
                70GB <Text style={styles.storageMuted}>/100GB</Text>
              </Text>
              <TouchableOpacity style={styles.upgradeBadge}>
                <Text style={styles.upgradeText}>Upgrade Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Upload */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Upload</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <View style={styles.plusCircle}>
              <Text style={styles.plusText}>+</Text>
            </View>
            <Text style={styles.uploadLabel}>Upload Files</Text>
            <Text style={styles.uploadHint}>
              Drag and drop or browse to upload (max 2GB)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Files */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Files</Text>
          {recentFiles.map((f, i) => (
            <View key={i} style={styles.fileRow}>
              <View style={styles.fileIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>{f.name}</Text>
                <Text style={styles.fileMeta}>{f.date}</Text>
              </View>
              <Text style={styles.fileSize}>{f.size}</Text>
              <View style={styles.dlBtn}>
                <Text style={styles.dlText}>↓</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          {notifications.map((n, i) => (
            <View key={i} style={styles.notifRow}>
              <View style={styles.notifDot} />
              <Text style={styles.notifText}>{n}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Shared Files */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shared Files</Text>
          {sharedFiles.map((f, i) => (
            <View key={i} style={styles.fileRow}>
              <View style={styles.fileIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>{f.name}</Text>
                <Text style={styles.fileMeta}>Shared with: {f.shared}</Text>
              </View>
              <Text style={styles.fileSize}>{f.size}</Text>
              <View style={styles.dlBtn}>
                <Text style={styles.dlText}>↓</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f7f7' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  logoGroup: { flexDirection: 'row', gap: 6 },
  logoBox: { width: 24, height: 24, borderRadius: 6 },
  userGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  welcomeText: { fontSize: 10, color: '#ff8c00', fontWeight: '600' },
  usernameText: { fontSize: 10, color: '#555' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ff8c00', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { padding: 16, paddingBottom: 24, gap: 12 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  pageSubtitle: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, borderWidth: 0.5, borderColor: '#eee',
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 10 },
  storageRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ring: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 6, borderColor: '#f0f0f0',
    borderTopColor: '#ff8c00', borderRightColor: '#ff8c00', borderBottomColor: '#ff8c00',
    alignItems: 'center', justifyContent: 'center',
  },
  ringText: { fontSize: 12, fontWeight: '700', color: '#ff8c00' },
  storageLabel: { fontSize: 13, fontWeight: '600', color: '#111' },
  storageMuted: { fontSize: 11, color: '#aaa' },
  upgradeBadge: {
    backgroundColor: '#ff8c00', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 12, marginTop: 6, alignSelf: 'flex-start',
  },
  upgradeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  uploadBox: {
    borderWidth: 1.5, borderColor: '#ddd', borderStyle: 'dashed',
    borderRadius: 10, padding: 16, alignItems: 'center', gap: 4,
  },
  plusCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff8f0', borderWidth: 2, borderColor: '#ff8c00',
    alignItems: 'center', justifyContent: 'center',
  },
  plusText: { color: '#ff8c00', fontSize: 20, lineHeight: 24 },
  uploadLabel: { color: '#ff8c00', fontWeight: '600', fontSize: 13 },
  uploadHint: { color: '#aaa', fontSize: 11, textAlign: 'center' },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5',
  },
  fileIcon: { width: 26, height: 26, backgroundColor: '#ff8c00', borderRadius: 5 },
  fileName: { fontSize: 11, color: '#222', fontWeight: '500' },
  fileMeta: { fontSize: 10, color: '#aaa' },
  fileSize: { fontSize: 10, color: '#aaa' },
  dlBtn: {
    width: 20, height: 20, borderWidth: 1.5,
    borderColor: '#ff8c00', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  dlText: { color: '#ff8c00', fontSize: 11 },
  notifRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 4 },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ff8c00', marginTop: 3, flexShrink: 0,
  },
  notifText: { fontSize: 11, color: '#333', flex: 1 },
  seeAll: {
    backgroundColor: '#ff8c00', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', marginTop: 10,
  },
  seeAllText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});