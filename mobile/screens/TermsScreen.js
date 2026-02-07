import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const TermsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By using SparkMate, you agree to be bound by these Terms of Service. If you do not agree, do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.bulletPoint}>• You must be at least 18 years old</Text>
        <Text style={styles.bulletPoint}>• You must be legally able to enter into a contract</Text>
        <Text style={styles.bulletPoint}>• You must not be prohibited from using the App</Text>
        <Text style={styles.bulletPoint}>• You must not have been previously banned</Text>

        <Text style={styles.sectionTitle}>3. User Conduct</Text>
        <Text style={styles.subTitle}>You Agree To:</Text>
        <Text style={styles.bulletPoint}>• Treat other users with respect</Text>
        <Text style={styles.bulletPoint}>• Provide truthful profile information</Text>
        <Text style={styles.bulletPoint}>• Only upload photos of yourself</Text>
        <Text style={styles.bulletPoint}>• Report suspicious behavior</Text>

        <Text style={styles.subTitle}>You Agree NOT To:</Text>
        <Text style={styles.bulletPoint}>• Harass, threaten, or abuse users</Text>
        <Text style={styles.bulletPoint}>• Post illegal or offensive content</Text>
        <Text style={styles.bulletPoint}>• Impersonate another person</Text>
        <Text style={styles.bulletPoint}>• Use the App for commercial purposes</Text>
        <Text style={styles.bulletPoint}>• Spam or send unsolicited messages</Text>
        <Text style={styles.bulletPoint}>• Attempt to hack or disrupt the App</Text>

        <Text style={styles.sectionTitle}>4. Content Guidelines</Text>
        <Text style={styles.subTitle}>Prohibited Content:</Text>
        <Text style={styles.bulletPoint}>• Nudity in public photos</Text>
        <Text style={styles.bulletPoint}>• Violence or graphic content</Text>
        <Text style={styles.bulletPoint}>• Hate speech or discrimination</Text>
        <Text style={styles.bulletPoint}>• Illegal activities</Text>
        <Text style={styles.bulletPoint}>• Spam or advertisements</Text>

        <Text style={styles.sectionTitle}>5. Safety</Text>
        <Text style={styles.paragraph}>
          We are not responsible for user behavior offline. Always meet in public places, tell someone where you're going, and trust your instincts.
        </Text>

        <Text style={styles.sectionTitle}>6. Premium Subscription</Text>
        <Text style={styles.bulletPoint}>• Pro: $19.99/month (50% off first month)</Text>
        <Text style={styles.bulletPoint}>• Subscriptions auto-renew monthly</Text>
        <Text style={styles.bulletPoint}>• Cancel anytime in account settings</Text>
        <Text style={styles.bulletPoint}>• No refunds for partial months</Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          You may delete your account at any time. We may suspend or terminate accounts for violating these Terms, illegal activity, or behavior harmful to other users.
        </Text>

        <Text style={styles.sectionTitle}>8. Disclaimers</Text>
        <Text style={styles.paragraph}>
          The App is provided "as is" without warranties. We do not conduct background checks on users. You interact with other users at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, contact us at: legal@sparkmate.app
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

export default TermsScreen;
