import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert, Modal, Linking } from 'react-native';
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

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

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
        <TouchableOpacity 
          style={[styles.messageBubble, styles.locationBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
          onPress={() => openLocation(item.content)}
        >
          <Ionicons name="location" size={24} color="#FF6B6B" />
          <Text style={styles.locationText}>{locationText}</Text>
          <Text style={styles.tapToOpen}>Tap to open in Maps</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Image message
    if (item.message_type === 'image') {
      return (
        <View style={[styles.messageBubble, styles.imageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
          <Image source={{ uri: item.content }} style={styles.messageImage} />
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    }
    
    // Text message
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
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
  messageTime: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginTop: SPACING.xs, alignSelf: 'flex-end' },
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
});

export default ChatScreen;
