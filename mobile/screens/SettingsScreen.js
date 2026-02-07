import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deletion', 'Please contact support@sparkmate.app to delete your account.')
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Location Sharing</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="person-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BlockedUsers')}>
            <Ionicons name="ban-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Blocked Users</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terms')}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Help Center', 'Need help? Contact us at:\n\nsupport@sparkmate.app')}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Report a Problem', 'To report issues or inappropriate behavior, email us at:\n\nsafety@sparkmate.app')}>
            <Ionicons name="flag-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Report a Problem</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('About SparkMate', 'SparkMate v1.0.0\n\nFind your perfect match!\n\n© 2026 SparkMate\nAll rights reserved.')}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>About</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            <Text style={[styles.menuText, { color: COLORS.error }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  content: { flex: 1 },
  section: { padding: SPACING.md, marginTop: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.large, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.md, paddingHorizontal: SPACING.sm },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: FONT_SIZES.large, color: COLORS.text, marginLeft: SPACING.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm },
  menuText: { flex: 1, fontSize: FONT_SIZES.large, color: COLORS.text, marginLeft: SPACING.md },
  dangerItem: { backgroundColor: 'rgba(255,68,68,0.1)' },
});

export default SettingsScreen;
