import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const SubscriptionScreen = ({ navigation }) => {
  const features = [
    { icon: 'infinite', text: 'Unlimited Swipes' },
    { icon: 'eye', text: 'See Who Viewed You' },
    { icon: 'heart', text: 'See Who Liked You' },
    { icon: 'location', text: 'Extended Distance (100km)' },
    { icon: 'checkmark-done', text: 'Read Receipts' },
    { icon: 'flash', text: 'Boost Your Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <Ionicons name="star" size={64} color="#FFD700" />
          <Text style={styles.heroTitle}>Go Pro</Text>
          <Text style={styles.heroSubtitle}>Unlock premium features</Text>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Ionicons name="gift" size={24} color="#FFF" />
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>50% OFF First Month!</Text>
                <Text style={styles.promoSubtitle}>Limited time offer</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What's Included:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon} size={20} color="#FFD700" />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>$19.99</Text>
            <Text style={styles.promoPrice}>$9.99</Text>
          </View>
          <Text style={styles.priceSubtext}>first month (then $19.99/mo)</Text>
        </View>

        <TouchableOpacity style={styles.subscribeButton}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8C00', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeButtonText}>Get 50% Off Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          First month $9.99, then $19.99/month. Auto-renews monthly. Cancel anytime.
        </Text>
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
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  promoBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promoGradient: {
    padding: SPACING.md,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTextContainer: {
    marginLeft: SPACING.md,
  },
  promoTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: '#FFF',
  },
  promoSubtitle: {
    fontSize: FONT_SIZES.small,
    color: 'rgba(255,255,255,0.9)',
  },
  featuresSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  pricingSection: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 28,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: SPACING.md,
  },
  promoPrice: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  priceSubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  subscribeButton: {
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: '#FFF',
  },
  disclaimer: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});

export default SubscriptionScreen;
