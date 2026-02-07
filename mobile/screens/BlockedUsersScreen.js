import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const BlockedUsersScreen = ({ navigation }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get('/blocked-users');
      setBlockedUsers(response.data.blocked_users || []);
    } catch (error) {
      console.log('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (user) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.username || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await api.post('/unblock-user', { blocked_user_id: user.id });
              setBlockedUsers(blockedUsers.filter(u => u.id !== user.id));
              Alert.alert('Success', 'User has been unblocked');
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <Image
        source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/60' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
        <Text style={styles.name}>{item.name}, {item.age}</Text>
      </View>
      <TouchableOpacity style={styles.unblockButton} onPress={() => handleUnblock(item)}>
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="people-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No blocked users</Text>
          <Text style={styles.emptySubtext}>Users you block will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  username: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  name: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  unblockButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  unblockText: {
    color: '#FFF',
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
});

export default BlockedUsersScreen;
