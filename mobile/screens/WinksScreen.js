import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { FONT_SIZES, SPACING } from '../config/constants';

const WinksScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('winks');
  const [winks, setWinks] = useState([]);
  const [viewedMe, setViewedMe] = useState([]);
  const [smashes, setSmashes] = useState([]);
  const [loading, setLoading] = useState(false);

  const isPro = profile?.is_pro || false;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'winks') {
        const response = await api.get('/winks/received');
        setWinks(response.data || []);
      } else if (activeTab === 'viewed' && isPro) {
        const response = await api.get('/profile/viewers');
        setViewedMe(response.data || []);
      } else if (activeTab === 'smashes' && isPro) {
        const response = await api.get('/smash/who-liked-me');
        setSmashes(response.data || []);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigation.navigate('Subscription');
  };

  const renderProLock = (featureName) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="lock-closed-outline" size={80} color="rgba(255,255,255,0.5)" />
      </View>
      <Text style={styles.emptyTitle}>Pro Feature</Text>
      <Text style={styles.emptySubtitle}>
        Upgrade to Pro to see who {featureName}
      </Text>
      <TouchableOpacity onPress={handleUpgrade}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeButton}
        >
          <Ionicons name="star" size={20} color="#FFFFFF" />
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <Image 
        source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/60' }} 
        style={styles.itemPhoto} 
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}, {item.age}</Text>
        <Text style={styles.itemUsername}>@{item.username}</Text>
        {activeTab === 'winks' && (
          <Text style={styles.itemAction}>😉 Winked at you</Text>
        )}
        {activeTab === 'viewed' && (
          <Text style={styles.itemAction}>👀 Viewed your profile</Text>
        )}
        {activeTab === 'smashes' && (
          <Text style={styles.itemAction}>💥 Wants to smash</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyEmoji}>😊</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'winks' && 'No winks yet'}
        {activeTab === 'viewed' && 'No profile views yet'}
        {activeTab === 'smashes' && 'No smashes yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'winks' && "When someone winks at you, they'll appear here"}
        {activeTab === 'viewed' && "People who view your profile will appear here"}
        {activeTab === 'smashes' && "People who want to smash will appear here"}
      </Text>
    </View>
  );

  const getActiveData = () => {
    if (activeTab === 'winks') return winks;
    if (activeTab === 'viewed') return viewedMe;
    if (activeTab === 'smashes') return smashes;
    return [];
  };

  return (
    <LinearGradient
      colors={['#D4A017', '#C4941A', '#B8860B']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs Card */}
      <View style={styles.tabsCard}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'winks' && styles.tabActive]}
          onPress={() => setActiveTab('winks')}
        >
          <Text style={styles.tabEmoji}>😉</Text>
          <Text style={[styles.tabText, activeTab === 'winks' && styles.tabTextActive]}>
            Winks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'viewed' && styles.tabActive]}
          onPress={() => setActiveTab('viewed')}
        >
          <Text style={styles.tabEmoji}>👀</Text>
          <Text style={[styles.tabText, activeTab === 'viewed' && styles.tabTextActive]}>
            Viewed{'\n'}Me
          </Text>
          <Text style={styles.crownIcon}>👑</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'smashes' && styles.tabActive]}
          onPress={() => setActiveTab('smashes')}
        >
          <Text style={styles.tabEmoji}>💥</Text>
          <Text style={[styles.tabText, activeTab === 'smashes' && styles.tabTextActive]}>
            Smashes
          </Text>
          <Text style={styles.crownIcon}>👑</Text>
        </TouchableOpacity>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {activeTab === 'winks' && (
          winks.length > 0 ? (
            <FlatList
              data={winks}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyList()
          )
        )}

        {activeTab === 'viewed' && (
          isPro ? (
            viewedMe.length > 0 ? (
              <FlatList
                data={viewedMe}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderEmptyList()
            )
          ) : (
            renderProLock('viewed your profile')
          )
        )}

        {activeTab === 'smashes' && (
          isPro ? (
            smashes.length > 0 ? (
              <FlatList
                data={smashes}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderEmptyList()
            )
          ) : (
            renderProLock('wants to smash you')
          )
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: SPACING.md,
    marginTop: 50,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 20,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 15,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#B8860B',
  },
  crownIcon: {
    fontSize: 14,
    marginLeft: 2,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemPhoto: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemUsername: {
    fontSize: FONT_SIZES.small,
    color: 'rgba(255,255,255,0.7)',
  },
  itemAction: {
    fontSize: FONT_SIZES.small,
    color: '#FFFFFF',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.md,
  },
  emptyEmoji: {
    fontSize: 80,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});

export default WinksScreen;
