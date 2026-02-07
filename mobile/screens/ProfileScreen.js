import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const ProfileScreen = ({ navigation }) => {
  const { profile, logout, updateProfile } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPrivateAlbum, setShowPrivateAlbum] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [privatePhotos, setPrivatePhotos] = useState(profile?.private_photos || []);

  useEffect(() => { checkAdminStatus(); }, []);
  useEffect(() => { setPrivatePhotos(profile?.private_photos || []); }, [profile]);

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/user/me');
      setIsAdmin(response.data.is_admin === true);
    } catch (error) { console.log('Error:', error); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const openPhoto = (index) => { setSelectedPhotoIndex(index); setShowPhotoModal(true); };

  const pickPrivatePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library in your phone settings.');
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
      const newPhotos = [...privatePhotos, base64Image];
      setPrivatePhotos(newPhotos);
      
      try {
        await api.put('/profile/me', { private_photos: newPhotos });
        updateProfile({ ...profile, private_photos: newPhotos });
        Alert.alert('Success', 'Private photo added!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save photo');
        setPrivatePhotos(privatePhotos);
      }
    }
  };

  const removePrivatePhoto = (index) => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          const newPhotos = [...privatePhotos];
          newPhotos.splice(index, 1);
          setPrivatePhotos(newPhotos);
          try {
            await api.put('/profile/me', { private_photos: newPhotos });
            updateProfile({ ...profile, private_photos: newPhotos });
          } catch (error) { Alert.alert('Error', 'Failed to remove'); }
        },
      },
    ]);
  };

  const photos = profile?.photos || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => photos.length > 0 && openPhoto(0)}>
            <Image source={{ uri: photos[0] || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.name}, {profile?.age}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Photos ({photos.length}/5)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photos.map((photo, index) => (
              <TouchableOpacity key={index} onPress={() => openPhoto(index)}>
                <Image source={{ uri: photo }} style={styles.galleryPhoto} />
              </TouchableOpacity>
            ))}
            {photos.length === 0 && (
              <View style={styles.noPhotosContainer}>
                <Ionicons name="images-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.noPhotosText}>No photos yet</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.privateAlbumButton} onPress={() => setShowPrivateAlbum(true)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
              <View style={styles.privateAlbumInfo}>
                <Text style={styles.menuItemText}>Private Album</Text>
                <Text style={styles.privateAlbumCount}>{privatePhotos.length} photos</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Subscription')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.menuItemText}>Upgrade to Pro</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('WhoLikedMe')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.menuItemText}>Who Liked Me</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Winks')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="eye" size={24} color="#9B59B6" />
              <Text style={styles.menuItemText}>Winks</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="shield" size={24} color="#3498DB" />
                <Text style={styles.menuItemText}>Admin Panel</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showPhotoModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowPhotoModal(false)}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: photos[selectedPhotoIndex] }} style={styles.fullPhoto} resizeMode="contain" />
        </View>
      </Modal>

      <Modal visible={showPrivateAlbum} animationType="slide">
        <View style={styles.privateAlbumModal}>
          <View style={styles.privateAlbumHeader}>
            <TouchableOpacity onPress={() => setShowPrivateAlbum(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.privateAlbumTitle}>Private Album</Text>
            <TouchableOpacity onPress={pickPrivatePhoto}>
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.privateAlbumContent}>
            {privatePhotos.length > 0 ? (
              <FlatList
                data={privatePhotos}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onLongPress={() => removePrivatePhoto(index)}>
                    <Image source={{ uri: item }} style={styles.privatePhoto} />
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  <TouchableOpacity style={styles.addPhotoCard} onPress={pickPrivatePhoto}>
                    <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
                    <Text style={styles.addPhotoCardText}>Add Photo</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View style={styles.emptyPrivateAlbum}>
                <Ionicons name="lock-closed-outline" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyPrivateText}>No private photos yet</Text>
                <Text style={styles.emptyPrivateSubtext}>Add photos to share privately with matches</Text>
                <TouchableOpacity style={styles.addFirstPhotoButton} onPress={pickPrivatePhoto}>
                  <Ionicons name="add-circle" size={24} color="#FFF" />
                  <Text style={styles.addFirstPhotoText}>Add Private Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  content: { flex: 1 },
  profileHeader: { alignItems: 'center', padding: SPACING.xl },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: SPACING.md, borderWidth: 3, borderColor: COLORS.primary },
  name: { fontSize: FONT_SIZES.xxlarge, fontWeight: 'bold', color: COLORS.text },
  username: { fontSize: FONT_SIZES.medium, color: COLORS.textSecondary, marginTop: SPACING.xs },
  bio: { fontSize: FONT_SIZES.medium, color: COLORS.text, marginTop: SPACING.md, textAlign: 'center', paddingHorizontal: SPACING.lg },
  section: { padding: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.large, fontWeight: '600', color: COLORS.text },
  galleryPhoto: { width: 100, height: 130, borderRadius: 12, marginRight: SPACING.sm },
  noPhotosContainer: { width: 200, height: 130, borderRadius: 12, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  noPhotosText: { color: COLORS.textSecondary, marginTop: SPACING.sm },
  privateAlbumButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md },
  privateAlbumInfo: { marginLeft: SPACING.md },
  privateAlbumCount: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: FONT_SIZES.large, color: COLORS.text, marginLeft: SPACING.md },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, margin: SPACING.md },
  logoutText: { fontSize: FONT_SIZES.large, color: COLORS.error, marginLeft: SPACING.sm, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullPhoto: { width: '100%', height: '80%' },
  privateAlbumModal: { flex: 1, backgroundColor: COLORS.background },
  privateAlbumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  privateAlbumTitle: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  privateAlbumContent: { flex: 1, padding: SPACING.md },
  privatePhoto: { width: '31%', aspectRatio: 1, borderRadius: 8, margin: '1%' },
  addPhotoCard: { width: '31%', aspectRatio: 1, borderRadius: 8, margin: '1%', backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed' },
  addPhotoCardText: { fontSize: FONT_SIZES.small, color: COLORS.primary, marginTop: 4 },
  emptyPrivateAlbum: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyPrivateText: { fontSize: FONT_SIZES.large, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptyPrivateSubtext: { fontSize: FONT_SIZES.medium, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  addFirstPhotoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 24, marginTop: SPACING.xl },
  addFirstPhotoText: { color: '#FFF', fontSize: FONT_SIZES.large, fontWeight: '600', marginLeft: 8 },
});

export default ProfileScreen;
