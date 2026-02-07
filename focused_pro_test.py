#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

def test_message_deletion_endpoint():
    """Test the message deletion endpoint specifically"""
    base_url = "https://code-checkpoint-4.preview.emergentagent.com/api"
    
    print("🔍 Testing Message Deletion Endpoint Directly...")
    
    # Register user
    timestamp = int(time.time())
    response = requests.post(f"{base_url}/auth/register", json={
        "email": f"delete_test_{timestamp}@test.com",
        "password": "TestPass123!",
        "phone": "+1234567890"
    })
    
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.status_code}")
        return False
        
    token = response.json().get('token')
    user_id = response.json().get('user_id')
    
    # Create profile
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    response = requests.post(f"{base_url}/profile", json={
        "username": f"delete_test_{timestamp}",
        "name": "Delete Test User",
        "age": 25,
        "bio": "Test user",
        "gender_identity": "Non-binary",
        "pronouns": "they/them",
        "looking_for": "Friends",
        "interests": ["testing"],
        "latitude": 40.7128,
        "longitude": -74.0060
    }, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Profile creation failed: {response.status_code}")
        return False
    
    # Create second user for match
    response = requests.post(f"{base_url}/auth/register", json={
        "email": f"delete_test2_{timestamp}@test.com",
        "password": "TestPass123!",
        "phone": "+1234567891"
    })
    
    if response.status_code != 200:
        print(f"❌ Second user registration failed: {response.status_code}")
        return False
        
    token2 = response.json().get('token')
    user_id2 = response.json().get('user_id')
    
    # Create second profile
    headers2 = {'Authorization': f'Bearer {token2}', 'Content-Type': 'application/json'}
    response = requests.post(f"{base_url}/profile", json={
        "username": f"delete_test2_{timestamp}",
        "name": "Delete Test User 2",
        "age": 28,
        "bio": "Second test user",
        "gender_identity": "Genderfluid",
        "pronouns": "any pronouns",
        "looking_for": "Dating",
        "interests": ["testing"],
        "latitude": 40.7589,
        "longitude": -73.9851
    }, headers=headers2)
    
    if response.status_code != 200:
        print(f"❌ Second profile creation failed: {response.status_code}")
        return False
    
    # Create match
    response = requests.post(f"{base_url}/like", json={"target_user_id": user_id2}, headers=headers)
    if response.status_code != 200:
        print(f"❌ First like failed: {response.status_code}")
        return False
        
    response = requests.post(f"{base_url}/like", json={"target_user_id": user_id}, headers=headers2)
    if response.status_code != 200:
        print(f"❌ Second like failed: {response.status_code}")
        return False
    
    # Get match
    response = requests.get(f"{base_url}/matches", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get matches failed: {response.status_code}")
        return False
        
    matches = response.json()
    if not matches:
        print("❌ No matches found")
        return False
        
    match_id = matches[0]['id']
    print(f"✅ Match created: {match_id}")
    
    # Send message
    response = requests.post(f"{base_url}/messages", json={
        "match_id": match_id,
        "content": "Test message for deletion",
        "message_type": "text"
    }, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Send message failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False
        
    message_id = response.json().get('message_id')
    print(f"✅ Message sent: {message_id}")
    
    # Test deletion as non-Pro user
    print("\n🚫 Testing deletion as non-Pro user...")
    response = requests.delete(f"{base_url}/messages/{message_id}", headers=headers)
    
    print(f"Delete response status: {response.status_code}")
    print(f"Delete response body: {response.text}")
    
    if response.status_code == 403:
        print("✅ Non-Pro deletion correctly blocked")
        return True
    else:
        print(f"❌ Expected 403, got {response.status_code}")
        return False

def test_read_receipts():
    """Test read receipts functionality"""
    base_url = "https://code-checkpoint-4.preview.emergentagent.com/api"
    
    print("\n📖 Testing Read Receipts...")
    
    # Register user
    timestamp = int(time.time())
    response = requests.post(f"{base_url}/auth/register", json={
        "email": f"read_test_{timestamp}@test.com",
        "password": "TestPass123!",
        "phone": "+1234567890"
    })
    
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.status_code}")
        return False
        
    token = response.json().get('token')
    user_id = response.json().get('user_id')
    
    # Create profile
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    response = requests.post(f"{base_url}/profile", json={
        "username": f"read_test_{timestamp}",
        "name": "Read Test User",
        "age": 25,
        "bio": "Test user",
        "gender_identity": "Non-binary",
        "pronouns": "they/them",
        "looking_for": "Friends",
        "interests": ["testing"],
        "latitude": 40.7128,
        "longitude": -74.0060
    }, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Profile creation failed: {response.status_code}")
        return False
    
    # Create second user
    response = requests.post(f"{base_url}/auth/register", json={
        "email": f"read_test2_{timestamp}@test.com",
        "password": "TestPass123!",
        "phone": "+1234567891"
    })
    
    if response.status_code != 200:
        print(f"❌ Second user registration failed: {response.status_code}")
        return False
        
    token2 = response.json().get('token')
    user_id2 = response.json().get('user_id')
    
    # Create second profile
    headers2 = {'Authorization': f'Bearer {token2}', 'Content-Type': 'application/json'}
    response = requests.post(f"{base_url}/profile", json={
        "username": f"read_test2_{timestamp}",
        "name": "Read Test User 2",
        "age": 28,
        "bio": "Second test user",
        "gender_identity": "Genderfluid",
        "pronouns": "any pronouns",
        "looking_for": "Dating",
        "interests": ["testing"],
        "latitude": 40.7589,
        "longitude": -73.9851
    }, headers=headers2)
    
    if response.status_code != 200:
        print(f"❌ Second profile creation failed: {response.status_code}")
        return False
    
    # Create match
    response = requests.post(f"{base_url}/like", json={"target_user_id": user_id2}, headers=headers)
    response = requests.post(f"{base_url}/like", json={"target_user_id": user_id}, headers=headers2)
    
    # Get match
    response = requests.get(f"{base_url}/matches", headers=headers)
    matches = response.json()
    match_id = matches[0]['id']
    
    # Send message as user 1
    response = requests.post(f"{base_url}/messages", json={
        "match_id": match_id,
        "content": "Test message for read receipt",
        "message_type": "text"
    }, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Send message failed: {response.status_code}")
        return False
    
    print("✅ Message sent")
    
    # Get messages as user 2 (should mark as read)
    response = requests.get(f"{base_url}/messages/{match_id}", headers=headers2)
    
    if response.status_code != 200:
        print(f"❌ Get messages failed: {response.status_code}")
        return False
    
    messages = response.json()
    print(f"✅ Retrieved {len(messages)} messages")
    
    # Check for read receipts
    for message in messages:
        print(f"Message: {message.get('content')}")
        print(f"  Read: {message.get('read')}")
        print(f"  Read At: {message.get('read_at')}")
        print(f"  Sender: {message.get('sender_id')}")
        
        if message.get('sender_id') != user_id2 and message.get('read') and message.get('read_at'):
            print("✅ Read receipt with timestamp found!")
            return True
    
    print("❌ No read receipt with timestamp found")
    return False

def main():
    """Run focused tests"""
    print("🧪 Running Focused Pro Features Tests")
    print("=" * 50)
    
    deletion_test = test_message_deletion_endpoint()
    read_receipt_test = test_read_receipts()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Message Deletion: {'✅ PASS' if deletion_test else '❌ FAIL'}")
    print(f"  Read Receipts: {'✅ PASS' if read_receipt_test else '❌ FAIL'}")
    
    return 0 if (deletion_test and read_receipt_test) else 1

if __name__ == "__main__":
    sys.exit(main())