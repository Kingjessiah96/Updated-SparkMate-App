import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Modal,
  ScrollView,
  Switch,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { FONT_SIZES, SPACING } from '../config/constants';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 48) / 3;

const DiscoveryScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    onlineOnly: false,
    withPhotos: false,
    position: null, // 'top', 'bottom', 'vers', 'verTop', 'versBottom'
    lookingFor: null, // 'chat', 'dates', 'friends', 'networking', 'relationship', 'rightNow'
    tribe: null, // 'bear', 'daddy', 'jock', 'twink', 'otter', 'geek', 'leather', 'rugged', 'muscle'
    ageMin: 18,
    ageMax: 99,
  });

  const positionOptions = [
    { id: 'top', label: 'Top' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'vers', label: 'Vers' },
    { id: 'versTop', label: 'Vers Top' },
    { id: 'versBottom', label: 'Vers Bottom' },
  ];

  const lookingForOptions = [
    { id: 'chat', label: 'Chat' },
    { id: 'dates', label: 'Dates' },
    { id: 'friends', label: 'Friends' },
    { id: 'networking', label: 'Networking' },
    { id: 'relationship', label: 'Relationship' },
    { id: 'rightNow', label: 'Right Now' },
  ];

  const tribeOptions = [
    { id: 'bear', label: 'Bear' },
    { id: 'daddy', label: 'Daddy' },
    { id: 'jock', label: 'Jock' },
    { id: 'twink', label: 'Twink' },
    { id: 'otter', label: 'Otter' },
    { id: 'geek', label: 'Geek' },
    { id: 'leather', label: 'Leather' },
    { id: 'rugged', label: 'Rugged' },
    { id: 'muscle', label: 'Muscle' },
    { id: 'cub', label: 'Cub' },
    { id: 'poz', label: 'Poz' },
    { id: 'trans', label: 'Trans' },
  ];

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/discovery', { params: filters });
      setProfiles(response.data || []);
    } catch (error) {
      console.log('Error fetching profiles:', error);
      // Mock data for testing
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      onlineOnly: false,
      withPhotos: false,
      position: null,
      lookingFor: null,
      tribe: null,
      ageMin: 18,
      ageMax: 99,
    });
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.onlineOnly) count++;
    if (filters.withPhotos) count++;
    if (filters.position) count++;
    if (filters.lookingFor) count++;
    if (filters.tribe) count++;
    return count;
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image 
        source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/150' }} 
        style={styles.gridPhoto}
      />
      {item.is_online && <View style={styles.onlineIndicator} />}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gridOverlay}
      >
        <Text style={styles.gridName}>{item.name}</Text>
        <Text style={styles.gridDistance}>{item.distance || '< 1'} mi</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.5)" />
      <Text style={styles.emptyTitle}>No one nearby</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your filters or check back later</Text>
    </View>
  );

  const renderFilterOption = (options, selectedValue, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterOptionsWrap}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterChip,
              selectedValue === option.id && styles.filterChipActive
            ]}
            onPress={() => onSelect(selectedValue === option.id ? null : option.id)}
          >
            <Text style={[
              styles.filterChipText,
              selectedValue === option.id && styles.filterChipTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF4444', '#CC0000', '#990000']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby</Text>
        <View style={styles.headerActions}>
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#FF4444' : '#FFFFFF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map" size={20} color={viewMode === 'map' ? '#FF4444' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
          
          {/* Filter Button */}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={22} color="#FFFFFF" />
            {activeFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'grid' ? (
          profiles.length > 0 ? (
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              renderItem={renderGridItem}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
            />
          ) : (
            renderEmptyState()
          )
        ) : (
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={60} color="rgba(255,255,255,0.5)" />
              <Text style={styles.mapPlaceholderText}>Map View</Text>
              <Text style={styles.mapPlaceholderSubtext}>Coming Soon</Text>
            </View>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Toggle Filters */}
              <View style={styles.filterSection}>
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Online Now</Text>
                    <Text style={styles.toggleSubLabel}>Only show users currently online</Text>
                  </View>
                  <Switch
                    value={filters.onlineOnly}
                    onValueChange={(value) => setFilters({...filters, onlineOnly: value})}
                    trackColor={{ false: '#DDD', true: '#FF4444' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>With Photos</Text>
                    <Text style={styles.toggleSubLabel}>Only show profiles with photos</Text>
                  </View>
                  <Switch
                    value={filters.withPhotos}
                    onValueChange={(value) => setFilters({...filters, withPhotos: value})}
                    trackColor={{ false: '#DDD', true: '#FF4444' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* Position Filter */}
              {renderFilterOption(
                positionOptions, 
                filters.position, 
                (value) => setFilters({...filters, position: value}),
                'Position'
              )}

              {/* Looking For Filter */}
              {renderFilterOption(
                lookingForOptions, 
                filters.lookingFor, 
                (value) => setFilters({...filters, lookingFor: value}),
                'Looking For'
              )}

              {/* Tribe Filter */}
              {renderFilterOption(
                tribeOptions, 
                filters.tribe, 
                (value) => setFilters({...filters, tribe: value}),
                'Tribe'
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <LinearGradient
                colors={['#FF4444', '#CC0000']}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
    marginRight: SPACING.md,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    padding: SPACING.sm,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.3,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  gridName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gridDistance: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: SPACING.md,
  },
  mapPlaceholderSubtext: {
    fontSize: FONT_SIZES.medium,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
  filterContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: SPACING.md,
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF4444',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleSubLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  applyButton: {
    padding: SPACING.lg,
    paddingBottom: 30,
  },
  applyButtonGradient: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DiscoveryScreen;
