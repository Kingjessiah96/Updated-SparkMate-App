import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const WhoLikedMeScreen = ({ navigation }) => {
  const [likes, setLikes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const response = await api.get('/who-liked-me');
      setLikes(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert('Pro Feature', 'Upgrade to Pro to see who liked you!');
        navigation.goBack();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const renderLike = ({ item }) => (
    <View style={styles.likeCard}>
      <Image
        source={{ uri: item.profile?.photos[0] || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.likeInfo}>
        <Text style={styles.name}>{item.profile?.name}</Text>
        <Text style={styles.age}>{item.profile?.age} years old</Text>
        {item.already_matched && (
          <Text style={styles.matchedText}>Already Matched</Text>
        )}
      </View>
      <Ionicons name="heart" size={24} color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Who Liked Me</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={likes}
        renderItem={renderLike}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchLikes} tintColor={COLORS.primary} />
        }
      />
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
  list: {
    padding: SPACING.md,
  },
  likeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  likeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  age: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  matchedText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
});

export default WhoLikedMeScreen;
