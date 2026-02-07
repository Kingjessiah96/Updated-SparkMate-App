import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert, Modal, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';

const ChatScreen = ({ route, navigation }) => {
  const { matchId, matchName } = route.params;
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUserStatus();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserStatus = async () => {
    try {
      const response = await api.get('/user/me');
      setIsPro(response.data.is_pro);
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${matchId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content, messageType = 'text') => {
    if (!content.trim()) return;

    try {
      await api.post('/messages', {
        match_id: matchId,
        content: content,
        message_type: messageType,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendLocation = async () => {
    setSendingLocation(true);
    setShowAttachMenu(false);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow location access to share your location.');
        setSendingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const locationString = `📍 Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      await sendMessage(JSON.stringify({ lat: latitude, lng: longitude }), 'location');
      Alert.alert('Success', 'Location shared!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setSendingLocation(false);
    }
  };

  const sendPhoto = async () => {
    setShowAttachMenu(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      await sendMessage(base64Image, 'image');
    }
  };

  const openLocation = (content) => {
    try {
      const location = JSON.parse(content);
      const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open location');
    }
  };

  // Long press handler for message deletion
  const handleLongPress = (message) => {
    if (message.sender_id !== profile?.user_id) {
      return; // Can only delete own messages
    }
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  const deleteMessage = async () => {
    if (!selectedMessage) return;

    if (!isPro) {
      setShowDeleteModal(false);
      Alert.alert(
        'Pro Feature',
        'Upgrade to Pro to unsend messages and photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/messages/${selectedMessage.id}`);
      Alert.alert('Success', 'Message unsent');
      fetchMessages();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to unsend message');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedMessage(null);
    }
  };

  const formatReadTime = (readAt) => {
    if (!readAt) return null;
    const date = new Date(readAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Read ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Read ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === profile?.user_id;
    
    // Location message
    if (item.message_type === 'location') {
      let locationText = '📍 Shared Location';
      try {
        const loc = JSON.parse(item.content);
        locationText = `📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
      } catch (e) {}
      
      return (
        <Pressable 
          style={[styles.messageBubble, styles.locationBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
          onPress={() => openLocation(item.content)}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
        >
          <Ionicons name="location" size={24} color="#FF6B6B" />
          <Text style={styles.locationText}>{locationText}</Text>
          <Text style={styles.tapToOpen}>Tap to open in Maps</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMyMessage && isPro && (
              <View style={styles.readReceipt}>
                {item.read ? (
                  <Ionicons name="checkmark-done" size={16} color="#4FC3F7" />
                ) : (
                  <Ionicons name="checkmark" size={16} color={COLORS.textSecondary} />
                )}
              </View>
            )}
          </View>
          {isMyMessage && isPro && item.read && item.read_at && (
            <Text style={styles.readTime}>{formatReadTime(item.read_at)}</Text>
          )}
        </Pressable>
      );
    }
    
    // Image message
    if (item.message_type === 'image') {
      return (
        <Pressable 
          style={[styles.messageBubble, styles.imageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
        >
          <Image source={{ uri: item.content }} style={styles.messageImage} />
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMyMessage && isPro && (
              <View style={styles.readReceipt}>
                {item.read ? (
                  <Ionicons name="checkmark-done" size={16} color="#4FC3F7" />
                ) : (
                  <Ionicons name="checkmark" size={16} color={COLORS.textSecondary} />
                )}
              </View>
            )}
          </View>
          {isMyMessage && isPro && item.read && item.read_at && (
            <Text style={styles.readTime}>{formatReadTime(item.read_at)}</Text>
          )}
        </Pressable>
      );
    }
    
    // Text message
    return (
      <Pressable 
        style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>{item.content}</Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMyMessage && isPro && (
            <View style={styles.readReceipt}>
              {item.read ? (
                <Ionicons name="checkmark-done" size={16} color="#4FC3F7" />
              ) : (
                <Ionicons name="checkmark" size={16} color="rgba(255,255,255,0.7)" />
              )}
            </View>
          )}
        </View>
        {isMyMessage && isPro && item.read && item.read_at && (
          <Text style={[styles.readTime, isMyMessage && styles.myReadTime]}>{formatReadTime(item.read_at)}</Text>
        )}
        {isMyMessage && (
          <Text style={styles.holdHint}>Hold to unsend</Text>
        )}
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash-outline" size={32} color="#FF5252" />
            </View>
            <Text style={styles.deleteModalTitle}>Unsend Message?</Text>
            <Text style={styles.deleteModalText}>
              This message will be removed from the conversation for both you and {matchName}.
            </Text>
            
            {!isPro && (
              <View style={styles.proFeatureBox}>
                <View style={styles.proHeader}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.proFeatureTitle}>Pro Feature</Text>
                </View>
                <Text style={styles.proFeatureText}>
                  Upgrade to Pro to unsend messages and photos
                </Text>
              </View>
            )}

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedMessage(null);
                }}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmDeleteButton, !isPro && styles.upgradeButton]}
                onPress={deleteMessage}
                disabled={deleting}
              >
                {deleting ? (
                  <Text style={styles.confirmDeleteText}>Deleting...</Text>
                ) : isPro ? (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={styles.confirmDeleteText}>Unsend</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="star" size={18} color="#FFF" />
                    <Text style={styles.confirmDeleteText}>Upgrade</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{matchName || 'Chat'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachMenu(true)}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(newMessage)}>
          <Ionicons name="send" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Attachment Menu Modal */}
      <Modal visible={showAttachMenu} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowAttachMenu(false)}>
          <View style={styles.attachMenuContainer}>
            <View style={styles.attachMenu}>
              <Text style={styles.attachMenuTitle}>Share</Text>
              
              <TouchableOpacity style={styles.attachOption} onPress={sendPhoto}>
                <View style={[styles.attachIconContainer, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="image" size={24} color="#FFF" />
                </View>
                <Text style={styles.attachOptionText}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachOption} onPress={sendLocation} disabled={sendingLocation}>
                <View style={[styles.attachIconContainer, { backgroundColor: '#FF6B6B' }]}>
                  <Ionicons name="location" size={24} color="#FFF" />
                </View>
                <Text style={styles.attachOptionText}>
                  {sendingLocation ? 'Getting location...' : 'Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAttachMenu(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: FONT_SIZES.xlarge, fontWeight: '600', color: COLORS.text },
  messagesList: { padding: SPACING.md },
  messageBubble: { maxWidth: '70%', padding: SPACING.md, borderRadius: 16, marginBottom: SPACING.sm },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: COLORS.card },
  messageText: { fontSize: FONT_SIZES.medium, color: COLORS.text },
  myMessageText: { color: '#FFF' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: SPACING.xs },
  messageTime: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },
  readReceipt: { marginLeft: 4 },
  readTime: { fontSize: 10, color: COLORS.textSecondary, alignSelf: 'flex-end', marginTop: 2 },
  myReadTime: { color: 'rgba(255,255,255,0.6)' },
  holdHint: { fontSize: 9, color: 'rgba(255,255,255,0.4)', alignSelf: 'flex-end', marginTop: 2 },
  locationBubble: { alignItems: 'center', paddingVertical: SPACING.lg },
  locationText: { fontSize: FONT_SIZES.medium, color: COLORS.text, marginTop: SPACING.sm },
  tapToOpen: { fontSize: FONT_SIZES.small, color: COLORS.primary, marginTop: SPACING.xs },
  imageBubble: { padding: SPACING.xs },
  messageImage: { width: 200, height: 200, borderRadius: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  attachButton: { padding: SPACING.xs, marginRight: SPACING.xs },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 24, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.medium, color: COLORS.text, marginRight: SPACING.sm },
  sendButton: { padding: SPACING.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  attachMenuContainer: { backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg },
  attachMenu: { paddingBottom: 30 },
  attachMenuTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg },
  attachOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  attachIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  attachOptionText: { fontSize: FONT_SIZES.large, color: COLORS.text },
  cancelButton: { marginTop: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.card, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: FONT_SIZES.large, color: COLORS.text, fontWeight: '600' },
  
  // Delete Modal Styles
  deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  deleteModalContent: { backgroundColor: COLORS.background, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  deleteIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,82,82,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  deleteModalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  deleteModalText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  proFeatureBox: { backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 12, padding: 12, marginBottom: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  proHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  proFeatureTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginLeft: 6 },
  proFeatureText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  deleteModalButtons: { flexDirection: 'row', width: '100%', gap: 12 },
  cancelDeleteButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center' },
  cancelDeleteText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  confirmDeleteButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FF5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  upgradeButton: { backgroundColor: '#FFB300' },
  confirmDeleteText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});

export default ChatScreen;
