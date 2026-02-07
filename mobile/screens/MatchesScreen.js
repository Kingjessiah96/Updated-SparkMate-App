import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { FONT_SIZES, SPACING } from '../config/constants';

const MatchesScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/matches');
      setConversations(response.data || []);
      // Filter favorites
      const favs = (response.data || []).filter(c => c.is_favorite);
      setFavorites(favs);
    } catch (error) {
      console.log('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayData = () => {
    const data = activeTab === 'all' ? conversations : favorites;
    if (searchQuery) {
      return data.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { matchId: item.id, user: item })}
    >
      <Image 
        source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/60' }} 
        style={styles.avatar} 
      />
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Start a conversation!'}
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubble-outline" size={80} color="rgba(255,255,255,0.5)" />
      </View>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>Start swiping to match with people!</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Smash')}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8C00', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startSwipingButton}
        >
          <Text style={styles.startSwipingText}>Start Swiping</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#4A90D9', '#357ABD', '#2E6BA6']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
          <Text style={styles.title}>DMs</Text>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All DMs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favs' && styles.tabActive]}
            onPress={() => setActiveTab('favs')}
          >
            <Ionicons 
              name="star" 
              size={18} 
              color={activeTab === 'favs' ? '#4A90D9' : '#FFD700'} 
              style={styles.favIcon}
            />
            <Text style={[styles.tabText, activeTab === 'favs' && styles.tabTextActive]}>
              Favs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations List */}
      <View style={styles.listCard}>
        {getDisplayData().length > 0 ? (
          <FlatList
            data={getDisplayData()}
            keyExtractor={(item) => item.id || item._id}
            renderItem={renderConversationItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabTextActive: {
    color: '#4A90D9',
  },
  favIcon: {
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    height: 45,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: '#333',
  },
  listCard: {
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  conversationName: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastMessage: {
    fontSize: FONT_SIZES.small,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.xl,
  },
  startSwipingButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  startSwipingText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
});

export default MatchesScreen;
