import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const AdminScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ icon, label, value, color = COLORS.primary }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={32} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Platform Statistics</Text>
        
        <View style={styles.statsGrid}>
          <StatCard icon="people" label="Total Users" value={stats?.total_users || 0} />
          <StatCard icon="person" label="Profiles" value={stats?.total_profiles || 0} />
          <StatCard icon="heart" label="Matches" value={stats?.total_matches || 0} color={COLORS.error} />
          <StatCard icon="star" label="Pro Users" value={stats?.pro_users || 0} color={COLORS.warning} />
          <StatCard icon="alert-circle" label="Reports" value={stats?.total_reports || 0} color={COLORS.error} />
          <StatCard icon="ban" label="Blocks" value={stats?.total_blocks || 0} />
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="flag-outline" size={24} color={COLORS.error} />
              <Text style={styles.menuItemText}>User Reports</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats?.pending_reports || 0}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              <Text style={styles.menuItemText}>All Users</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="ban-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.menuItemText}>Blocked Users</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '600',
    color: COLORS.text,
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  statCard: {
    width: '50%',
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    padding: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
  },
});

export default AdminScreen;
