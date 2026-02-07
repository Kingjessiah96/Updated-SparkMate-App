import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, SWIPE_THRESHOLD } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SmashOrPassScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const position = new Animated.ValueXY();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/discovery/profiles');
      setProfiles(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    try {
      const response = await api.post('/like', { target_user_id: profile.user_id });
      if (response.data.is_match) {
        Alert.alert('It\'s a Match! 🎉', 'You both liked each other!');
      }
      nextCard();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to like');
    }
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    try {
      await api.post('/pass', { target_user_id: profile.user_id });
      nextCard();
    } catch (error) {
      Alert.alert('Error', 'Failed to pass');
    }
  };

  const nextCard = () => {
    setCurrentIndex(currentIndex + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        handleLike();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        handlePass();
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No more profiles</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={fetchProfiles}>
            <Text style={styles.reloadButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smash or Pass</Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
            },
          ]}
        >
          <Image
            source={{ uri: currentProfile.photos[0] || 'https://via.placeholder.com/400' }}
            style={styles.image}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
            {currentProfile.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {currentProfile.bio}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass}>
          <Ionicons name="close" size={32} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
          <Ionicons name="heart" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: '75%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
  },
  cardInfo: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    padding: SPACING.lg,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  passButton: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  reloadButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  reloadButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
  },
});

export default SmashOrPassScreen;
