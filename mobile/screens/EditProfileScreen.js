import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const EditProfileScreen = ({ navigation }) => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    looking_for: profile?.looking_for || '',
    position: profile?.position || '',
    tribe: profile?.tribe || '',
    hiv_status: profile?.hiv_status || '',
    hosting: profile?.hosting || '',
    photos: profile?.photos || [],
    private_photos: profile?.private_photos || [],
  });

  useEffect(() => { fetchUserEmail(); }, []);

  const fetchUserEmail = async () => {
    try {
      const response = await api.get('/user/me');
      setUserEmail(response.data.email);
    } catch (error) { console.log('Error:', error); }
  };

  const pickPhoto = async (isPrivate = false) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (isPrivate) {
        setFormData({ ...formData, private_photos: [...formData.private_photos, base64Image] });
      } else {
        if (formData.photos.length >= 5) {
          Alert.alert('Limit Reached', 'Maximum 5 public photos allowed');
          return;
        }
        setFormData({ ...formData, photos: [...formData.photos, base64Image] });
      }
    }
  };

  const removePhoto = (index, isPrivate) => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (isPrivate) {
            const p = [...formData.private_photos];
            p.splice(index, 1);
            setFormData({ ...formData, private_photos: p });
          } else {
            const p = [...formData.photos];
            p.splice(index, 1);
            setFormData({ ...formData, photos: p });
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/profile/me', formData);
      updateProfile({ ...profile, ...formData });
      Alert.alert('Success', 'Profile updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const OptionSelector = ({ label, options, value, onChange }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionButtons}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, value === option && styles.optionButtonActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.optionButtonText, value === option && styles.optionButtonTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.saveButton}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.emailText}>{userEmail || 'Loading...'}</Text>
          </View>
          <Text style={styles.emailNote}>Email cannot be changed</Text>
        </View>

        {/* Public Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Public Photos ({formData.photos.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index, false)}>
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {formData.photos.length < 5 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={() => pickPhoto(false)}>
                <Ionicons name="add" size={40} color={COLORS.textSecondary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Private Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Private Photos ({formData.private_photos.length})</Text>
          <Text style={styles.sectionSubtitle}>Only visible to matches you approve</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {formData.private_photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index, true)}>
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPhotoButton} onPress={() => pickPhoto(true)}>
              <Ionicons name="lock-closed-outline" size={30} color={COLORS.textSecondary} />
              <Text style={styles.addPhotoText}>Add Private</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Enter username"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell others about yourself..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What I'm Looking For</Text>
          <OptionSelector
            label="Interests"
            options={['Smash RN', 'Dating', 'Friends', 'Relationship', 'Chat']}
            value={formData.looking_for}
            onChange={(val) => setFormData({ ...formData, looking_for: val })}
          />
        </View>

        {/* Position & Tribe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>

          <OptionSelector
            label="Position"
            options={['Top', 'Bottom', 'Verse', 'Verse Top', 'Verse Bottom', 'Side']}
            value={formData.position}
            onChange={(val) => setFormData({ ...formData, position: val })}
          />

          <OptionSelector
            label="Tribe"
            options={['Bear', 'Twink', 'Otter', 'Jock', 'Daddy', 'Geek', 'Cub', 'Leather']}
            value={formData.tribe}
            onChange={(val) => setFormData({ ...formData, tribe: val })}
          />

          <OptionSelector
            label="Hosting"
            options={['Can Host', 'Cannot Host', 'Can Travel', 'Both']}
            value={formData.hosting}
            onChange={(val) => setFormData({ ...formData, hosting: val })}
          />
        </View>

        {/* Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Safety</Text>
          <OptionSelector
            label="HIV Status"
            options={['Negative', 'Negative on PrEP', 'Positive', 'Positive Undetectable', 'Prefer not to say']}
            value={formData.hiv_status}
            onChange={(val) => setFormData({ ...formData, hiv_status: val })}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  saveButton: { fontSize: FONT_SIZES.large, color: COLORS.primary, fontWeight: '600' },
  content: { flex: 1 },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  emailText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  emailNote: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  photoContainer: { marginRight: SPACING.sm, position: 'relative' },
  photo: { width: 100, height: 130, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  optionButtons: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  optionButtonActive: { backgroundColor: COLORS.primary },
  optionButtonText: { fontSize: FONT_SIZES.medium, color: COLORS.text },
  optionButtonTextActive: { color: '#FFF' },
});

export default EditProfileScreen;
