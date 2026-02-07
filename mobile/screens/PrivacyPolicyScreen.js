import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to SparkMate. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.subTitle}>Information You Provide:</Text>
        <Text style={styles.bulletPoint}>• Account Information: Email, password, name, age</Text>
        <Text style={styles.bulletPoint}>• Profile Information: Photos, bio, preferences</Text>
        <Text style={styles.bulletPoint}>• Location Data: Your geographic location</Text>
        <Text style={styles.bulletPoint}>• Communications: Messages through our platform</Text>
        <Text style={styles.bulletPoint}>• Payment Information: Processed securely through Stripe</Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.bulletPoint}>• Create and manage your account</Text>
        <Text style={styles.bulletPoint}>• Display your profile to other users</Text>
        <Text style={styles.bulletPoint}>• Show you nearby users based on location</Text>
        <Text style={styles.bulletPoint}>• Facilitate messaging between users</Text>
        <Text style={styles.bulletPoint}>• Process subscription payments</Text>
        <Text style={styles.bulletPoint}>• Ensure safety and prevent fraud</Text>

        <Text style={styles.sectionTitle}>4. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We may share your information with other users (profile visibility), service providers (Stripe, hosting), and when required by law. We never sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Privacy Controls</Text>
        <Text style={styles.bulletPoint}>• Edit or delete your profile at any time</Text>
        <Text style={styles.bulletPoint}>• Control visibility of private photos</Text>
        <Text style={styles.bulletPoint}>• Block users you don't want to interact with</Text>
        <Text style={styles.bulletPoint}>• Delete your account and all data</Text>

        <Text style={styles.sectionTitle}>6. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure password hashing, and regular security audits.
        </Text>

        <Text style={styles.sectionTitle}>7. Age Restrictions</Text>
        <Text style={styles.paragraph}>
          SparkMate is intended for users 18 years of age or older. We do not knowingly collect information from anyone under 18.
        </Text>

        <Text style={styles.sectionTitle}>8. Private Photos</Text>
        <Text style={styles.paragraph}>
          Private photos are only visible to users you explicitly approve, stored securely, and never shared publicly or with third parties.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          For privacy questions or concerns, contact us at: privacy@sparkmate.app
        </Text>

        <Text style={styles.sectionTitle}>10. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have rights to access, correct, delete your data, object to processing, and withdraw consent. Contact us to exercise these rights.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  content: { flex: 1, padding: SPACING.lg },
  lastUpdated: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: SPACING.lg, fontStyle: 'italic' },
  sectionTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  subTitle: { fontSize: FONT_SIZES.medium, fontWeight: '600', color: COLORS.text, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  paragraph: { fontSize: FONT_SIZES.medium, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.sm },
  bulletPoint: { fontSize: FONT_SIZES.medium, color: COLORS.text, lineHeight: 24, paddingLeft: SPACING.sm },
});

export default PrivacyPolicyScreen;
