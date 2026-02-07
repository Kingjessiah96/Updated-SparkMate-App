import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, MAX_PHOTOS } from '../config/constants';

const ProfileSetupScreen = () => {
  const { fetchUserProfile, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [position, setPosition] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [genderIdentity, setGenderIdentity] = useState([]);
  const [pronouns, setPronouns] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [hivStatus, setHivStatus] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Picker modals
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [showBodyTypePicker, setShowBodyTypePicker] = useState(false);
  const [showEthnicityPicker, setShowEthnicityPicker] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  // Options
  const ages = Array.from({ length: 82 }, (_, i) => (i + 18).toString());
  
  const heights = [
    "4'10\" (147 cm)", "4'11\" (150 cm)", "5'0\" (152 cm)", "5'1\" (155 cm)",
    "5'2\" (157 cm)", "5'3\" (160 cm)", "5'4\" (163 cm)", "5'5\" (165 cm)",
    "5'6\" (168 cm)", "5'7\" (170 cm)", "5'8\" (173 cm)", "5'9\" (175 cm)",
    "5'10\" (178 cm)", "5'11\" (180 cm)", "6'0\" (183 cm)", "6'1\" (185 cm)",
    "6'2\" (188 cm)", "6'3\" (191 cm)", "6'4\" (193 cm)", "6'5\" (196 cm)",
    "6'6\" (198 cm)", "6'7\" (201 cm)", "6'8\"+ (203+ cm)"
  ];

  const weights = Array.from({ length: 30 }, (_, i) => {
    const lbs = 100 + (i * 10);
    const kg = Math.round(lbs * 0.453592);
    return `${lbs} lbs (${kg} kg)`;
  });

  const positionOptions = [
    { id: 'top', label: 'Top', icon: '⬆️' },
    { id: 'bottom', label: 'Bottom', icon: '⬇️' },
    { id: 'vers', label: 'Versatile', icon: '↕️' },
    { id: 'vers_top', label: 'Vers Top', icon: '⤴️' },
    { id: 'vers_bottom', label: 'Vers Bottom', icon: '⤵️' },
    { id: 'side', label: 'Side', icon: '↔️' },
    { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
  ];

  const bodyTypeOptions = [
    { id: 'twink', label: 'Twink', icon: '🧑' },
    { id: 'jock', label: 'Jock', icon: '💪' },
    { id: 'muscle', label: 'Muscular', icon: '🏋️' },
    { id: 'bear', label: 'Bear', icon: '🐻' },
    { id: 'cub', label: 'Cub', icon: '🧸' },
    { id: 'otter', label: 'Otter', icon: '🦦' },
    { id: 'daddy', label: 'Daddy', icon: '👨' },
    { id: 'leather', label: 'Leather', icon: '🖤' },
    { id: 'rugged', label: 'Rugged', icon: '🪵' },
    { id: 'geek', label: 'Geek', icon: '🤓' },
    { id: 'chub', label: 'Chub', icon: '🫄' },
    { id: 'slim', label: 'Slim', icon: '🧍' },
    { id: 'average', label: 'Average', icon: '👤' },
  ];

  const ethnicityOptions = [
    { id: 'asian', label: 'Asian', icon: '🌏' },
    { id: 'black', label: 'Black / African American', icon: '🌍' },
    { id: 'hispanic', label: 'Hispanic / Latino', icon: '🌎' },
    { id: 'middle_eastern', label: 'Middle Eastern', icon: '🕌' },
    { id: 'mixed', label: 'Mixed / Multiracial', icon: '🌈' },
    { id: 'native', label: 'Native American', icon: '🪶' },
    { id: 'pacific_islander', label: 'Pacific Islander', icon: '🏝️' },
    { id: 'south_asian', label: 'South Asian', icon: '🇮🇳' },
    { id: 'white', label: 'White / Caucasian', icon: '🌐' },
    { id: 'other', label: 'Other', icon: '✨' },
    { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
  ];

  const relationshipOptions = [
    { id: 'single', label: 'Single', icon: '💚' },
    { id: 'dating', label: 'Dating', icon: '💕' },
    { id: 'partnered', label: 'Partnered', icon: '💑' },
    { id: 'married', label: 'Married', icon: '💍' },
    { id: 'open_relationship', label: 'Open Relationship', icon: '💞' },
    { id: 'committed', label: 'Committed', icon: '❤️' },
    { id: 'engaged', label: 'Engaged', icon: '💎' },
    { id: 'its_complicated', label: "It's Complicated", icon: '🤷' },
    { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
  ];

  const genderOptions = ['Man', 'Woman', 'Non-binary', 'Trans Man', 'Trans Woman', 'Other'];
  const pronounOptions = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Other'];
  const lookingForOptions = ['Friends', 'Dating', 'Relationship', 'Networking', 'Chat', 'Right Now'];
  
  const hivStatusOptions = [
    { id: 'negative', label: 'Negative', icon: '➖' },
    { id: 'positive', label: 'Positive', icon: '➕' },
    { id: 'undetectable', label: 'Undetectable', icon: '💚' },
    { id: 'on_prep', label: 'On PrEP', icon: '💊' },
    { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
  ];

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        Alert.alert('Success', 'Location enabled!');
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!username || !name || !age) {
      Alert.alert('Error', 'Please fill in username, name, and age');
      return;
    }
    if (genderIdentity.length === 0 || pronouns.length === 0 || lookingFor.length === 0) {
      Alert.alert('Error', 'Please select at least one option for gender, pronouns, and what you\'re looking for');
      return;
    }

    setLoading(true);
    try {
      let photoUrls = ['https://via.placeholder.com/400x500?text=No+Photo'];
      
      const profileData = {
        username,
        name,
        age: parseInt(age),
        bio: bio || '',
        height: height || '',
        weight: weight || '',
        position: position || '',
        body_type: bodyType || '',
        ethnicity: ethnicity || '',
        relationship_status: relationshipStatus || '',
        gender_identity: genderIdentity.join(', '),
        pronouns: pronouns.join(', '),
        looking_for: lookingFor.join(', '),
        hiv_status: hivStatus || 'prefer_not_to_say',
        photos: photoUrls,
        interests: [],
        latitude: location?.coords?.latitude || null,
        longitude: location?.coords?.longitude || null,
      };

      console.log('Submitting profile:', JSON.stringify(profileData));
      const response = await api.post('/profile', profileData);
      await fetchUserProfile();
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error) {
      console.log('Profile creation error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  const renderMultiSelect = (title, options, selectedArray, setSelectedArray) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title} *</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, selectedArray.includes(option) && styles.optionButtonSelected]}
            onPress={() => toggleSelection(option, selectedArray, setSelectedArray)}
          >
            <Text style={[styles.optionText, selectedArray.includes(option) && styles.optionTextSelected]}>
              {option}
            </Text>
            {selectedArray.includes(option) && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPicker = (title, value, placeholder, onPress) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderPickerModal = (visible, setVisible, data, selectedValue, onSelect, title, isIconList = false) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => isIconList ? item.id : item}
            renderItem={({ item }) => {
              const itemValue = isIconList ? item.id : item;
              const itemLabel = isIconList ? item.label : item;
              const itemIcon = isIconList ? item.icon : null;
              const isSelected = selectedValue === itemValue;
              
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => { onSelect(itemValue); setVisible(false); }}
                >
                  {itemIcon && <Text style={styles.pickerItemIcon}>{itemIcon}</Text>}
                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                    {itemLabel}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={24} color="#FF6B6B" />}
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Setup Profile</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Logout', 'Clear all data and go back to login?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' }
          ]);
        }} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput style={styles.input} placeholder="Choose a username" placeholderTextColor="#999"
              value={username} onChangeText={setUsername} autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#999"
              value={name} onChangeText={setName} />
          </View>

          {renderPicker('Age *', age ? `${age} years old` : '', 'Select your age', () => setShowAgePicker(true))}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, styles.bioInput]} placeholder="Tell us about yourself..."
              placeholderTextColor="#999" value={bio} onChangeText={setBio} multiline numberOfLines={4} />
          </View>
        </View>

        {/* Physical Stats */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>
          <Text style={styles.sectionSubtitle}>Optional - help others find you</Text>
          
          {renderPicker('Height', height, 'Select your height', () => setShowHeightPicker(true))}
          {renderPicker('Weight', weight, 'Select your weight', () => setShowWeightPicker(true))}
          {renderPicker('Ethnicity', ethnicityOptions.find(e => e.id === ethnicity)?.label || '', 'Select your ethnicity', () => setShowEthnicityPicker(true))}
          {renderPicker('Body Type / Tribe', bodyTypeOptions.find(b => b.id === bodyType)?.label || '', 'Select your body type', () => setShowBodyTypePicker(true))}
        </View>

        {/* Relationship & Position */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Relationship & Position</Text>
          <Text style={styles.sectionSubtitle}>Let others know what you're about</Text>
          
          {renderPicker('Relationship Status', relationshipOptions.find(r => r.id === relationshipStatus)?.label || '', 'Select your relationship status', () => setShowRelationshipPicker(true))}
          {renderPicker('Position', positionOptions.find(p => p.id === position)?.label || '', 'Select your position', () => setShowPositionPicker(true))}
        </View>

        {/* Identity & Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identity & Preferences</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          {renderMultiSelect('Gender Identity', genderOptions, genderIdentity, setGenderIdentity)}
          {renderMultiSelect('Pronouns', pronounOptions, pronouns, setPronouns)}
          {renderMultiSelect('Looking For', lookingForOptions, lookingFor, setLookingFor)}
        </View>

        {/* Health Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Health Status</Text>
          <Text style={styles.sectionSubtitle}>This information is private and optional</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>HIV Status</Text>
            <View style={styles.hivOptionsContainer}>
              {hivStatusOptions.map((option) => (
                <TouchableOpacity key={option.id}
                  style={[styles.hivOption, hivStatus === option.id && styles.hivOptionSelected]}
                  onPress={() => setHivStatus(option.id)}>
                  <Text style={styles.hivOptionIcon}>{option.icon}</Text>
                  <Text style={[styles.hivOptionText, hivStatus === option.id && styles.hivOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {hivStatus === option.id && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Add up to {MAX_PHOTOS || 6} photos</Text>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < (MAX_PHOTOS || 6) && (
              <View style={styles.addPhotoButtons}>
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                  <Ionicons name="images-outline" size={32} color="#666" />
                  <Text style={styles.addPhotoText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={32} color="#666" />
                  <Text style={styles.addPhotoText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={requestLocationPermission}>
            <Ionicons name={location ? "location" : "location-outline"} size={24} color={location ? "#4CAF50" : "#666"} />
            <Text style={styles.locationButtonText}>
              {location ? 'Location Enabled ✓' : 'Enable Location (Optional)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={['#FF6B6B', '#FF8C00', '#FFD700']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitButtonGradient}>
            <Text style={styles.buttonText}>{loading ? 'Creating Profile...' : 'Complete Profile'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderPickerModal(showAgePicker, setShowAgePicker, ages, age, setAge, 'Select Age')}
      {renderPickerModal(showHeightPicker, setShowHeightPicker, heights, height, setHeight, 'Select Height')}
      {renderPickerModal(showWeightPicker, setShowWeightPicker, weights, weight, setWeight, 'Select Weight')}
      {renderPickerModal(showPositionPicker, setShowPositionPicker, positionOptions, position, setPosition, 'Select Position', true)}
      {renderPickerModal(showBodyTypePicker, setShowBodyTypePicker, bodyTypeOptions, bodyType, setBodyType, 'Select Body Type', true)}
      {renderPickerModal(showEthnicityPicker, setShowEthnicityPicker, ethnicityOptions, ethnicity, setEthnicity, 'Select Ethnicity', true)}
      {renderPickerModal(showRelationshipPicker, setShowRelationshipPicker, relationshipOptions, relationshipStatus, setRelationshipStatus, 'Select Relationship Status', true)}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 55, paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 28, fontWeight: 'bold', color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },
  logoutButton: { padding: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 },
  content: { flex: 1, paddingHorizontal: SPACING.md },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.large, fontWeight: '700', color: '#333', marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: FONT_SIZES.small, color: '#666', marginBottom: SPACING.md },
  inputContainer: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.medium, color: '#333', marginBottom: SPACING.xs, fontWeight: '600' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: SPACING.md, fontSize: FONT_SIZES.medium, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  bioInput: { height: 100, textAlignVertical: 'top' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: '#E0E0E0' },
  pickerButtonText: { fontSize: FONT_SIZES.medium, color: '#333' },
  placeholderText: { color: '#999' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8, marginBottom: 8 },
  optionButtonSelected: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  optionText: { fontSize: FONT_SIZES.medium, color: '#333' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  checkIcon: { marginLeft: 4 },
  hivOptionsContainer: { marginTop: SPACING.xs },
  hivOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 2, borderColor: '#E0E0E0' },
  hivOptionSelected: { borderColor: '#4CAF50', backgroundColor: '#F0FFF0' },
  hivOptionIcon: { fontSize: 20, marginRight: SPACING.md },
  hivOptionText: { flex: 1, fontSize: FONT_SIZES.medium, color: '#333' },
  hivOptionTextSelected: { fontWeight: '600', color: '#2E7D32' },
  photosContainer: { marginTop: SPACING.sm },
  photoWrapper: { position: 'relative', marginBottom: SPACING.md },
  photo: { width: '100%', height: 200, borderRadius: 12 },
  removeButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12 },
  addPhotoButtons: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.lg },
  addPhotoButton: { alignItems: 'center', justifyContent: 'center', width: 100, height: 100, backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed' },
  addPhotoText: { fontSize: FONT_SIZES.small, color: '#666', marginTop: SPACING.xs },
  locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: SPACING.md, borderRadius: 12, gap: SPACING.sm },
  locationButtonText: { fontSize: FONT_SIZES.medium, color: '#333' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, paddingBottom: 30 },
  submitButton: { borderRadius: 25, overflow: 'hidden' },
  submitButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { fontSize: FONT_SIZES.large, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '70%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  pickerItemSelected: { backgroundColor: '#FFF5F5' },
  pickerItemIcon: { fontSize: 24, marginRight: SPACING.md },
  pickerItemText: { flex: 1, fontSize: FONT_SIZES.large, color: '#333' },
  pickerItemTextSelected: { color: '#FF6B6B', fontWeight: '600' },
});

export default ProfileSetupScreen;
