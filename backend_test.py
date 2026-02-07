#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class SparkMateAPITester:
    def __init__(self, base_url="https://code-checkpoint-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.profile_id = None
        self.match_id = None
        self.message_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def setup_test_users(self):
        """Create test users - one regular, one Pro"""
        print("\n🚀 Setting up test users...")
        
        # Create regular user
        timestamp = int(time.time())
        regular_email = f"regular_user_{timestamp}@test.com"
        pro_email = f"pro_user_{timestamp}@test.com"
        
        # Register regular user
        success, response = self.run_test(
            "Register Regular User",
            "POST",
            "auth/register",
            200,
            data={
                "email": regular_email,
                "password": "TestPass123!",
                "phone": "+1234567890"
            }
        )
        
        if not success:
            return False
            
        self.regular_token = response.get('token')
        self.regular_user_id = response.get('user_id')
        
        # Register Pro user
        success, response = self.run_test(
            "Register Pro User",
            "POST", 
            "auth/register",
            200,
            data={
                "email": pro_email,
                "password": "TestPass123!",
                "phone": "+1234567891"
            }
        )
        
        if not success:
            return False
            
        self.pro_token = response.get('token')
        self.pro_user_id = response.get('user_id')
        
        # Manually set Pro status (simulating subscription)
        # In real app, this would be done through payment flow
        print("📝 Note: Pro status would be set through payment flow in production")
        
        return True

    def create_test_profiles(self):
        """Create profiles for both users"""
        print("\n👤 Creating test profiles...")
        
        # Create regular user profile
        self.token = self.regular_token
        success, response = self.run_test(
            "Create Regular User Profile",
            "POST",
            "profile",
            200,
            data={
                "username": f"regular_user_{int(time.time())}",
                "name": "Regular User",
                "age": 25,
                "bio": "Regular user for testing",
                "gender_identity": "Non-binary",
                "pronouns": "they/them",
                "looking_for": "Friends",
                "interests": ["testing", "coding"],
                "latitude": 40.7128,
                "longitude": -74.0060
            }
        )
        
        if not success:
            return False
            
        # Create Pro user profile
        self.token = self.pro_token
        success, response = self.run_test(
            "Create Pro User Profile",
            "POST",
            "profile", 
            200,
            data={
                "username": f"pro_user_{int(time.time())}",
                "name": "Pro User",
                "age": 28,
                "bio": "Pro user for testing",
                "gender_identity": "Genderfluid",
                "pronouns": "any pronouns",
                "looking_for": "Dating",
                "interests": ["premium", "features"],
                "latitude": 40.7589,
                "longitude": -73.9851
            }
        )
        
        return success

    def create_test_match(self):
        """Create a match between the two users"""
        print("\n💕 Creating test match...")
        
        # Regular user likes Pro user
        self.token = self.regular_token
        success, response = self.run_test(
            "Regular User Likes Pro User",
            "POST",
            "like",
            200,
            data={"target_user_id": self.pro_user_id}
        )
        
        if not success:
            return False
            
        # Pro user likes Regular user (creates match)
        self.token = self.pro_token
        success, response = self.run_test(
            "Pro User Likes Regular User (Creates Match)",
            "POST",
            "like",
            200,
            data={"target_user_id": self.regular_user_id}
        )
        
        if not success:
            return False
            
        # Get match ID
        success, response = self.run_test(
            "Get Matches",
            "GET",
            "matches",
            200
        )
        
        if success and response:
            matches = response
            if matches:
                self.match_id = matches[0]['id']
                print(f"📝 Match ID: {self.match_id}")
                return True
                
        return False

    def test_message_deletion_non_pro(self):
        """Test message deletion fails for non-Pro users"""
        print("\n🚫 Testing message deletion for non-Pro users...")
        
        # Send message as regular user
        self.token = self.regular_token
        success, response = self.run_test(
            "Send Message as Regular User",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Test message from regular user",
                "message_type": "text"
            }
        )
        
        if not success:
            return False
            
        message_id = response.get('message_id')
        
        # Try to delete message as regular user (should fail with 403)
        success, response = self.run_test(
            "Delete Message as Non-Pro User (Should Fail)",
            "DELETE",
            f"messages/{message_id}",
            403
        )
        
        return success

    def test_message_deletion_pro_user(self):
        """Test message deletion succeeds for Pro users"""
        print("\n✅ Testing message deletion for Pro users...")
        
        # First, manually set Pro status by directly updating the database
        # This simulates a user who has completed the payment flow
        try:
            import subprocess
            
            # Use mongosh to set Pro status for the pro user
            mongo_command = f'mongosh test_database --eval "db.users.updateOne({{id: \\"{self.pro_user_id}\\"}}, {{\\$set: {{is_pro: true}}}})"'
            result = subprocess.run(mongo_command, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("📝 Successfully set Pro status for test user")
            else:
                print(f"⚠️ Could not set Pro status: {result.stderr}")
                print("📝 Continuing with test assuming Pro status is set")
            
        except Exception as e:
            print(f"⚠️ Could not set Pro status directly: {e}")
            print("📝 Continuing with test assuming Pro status is set")
        
        # Send message as Pro user
        self.token = self.pro_token
        success, response = self.run_test(
            "Send Message as Pro User",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Test message from Pro user - to be deleted",
                "message_type": "text"
            }
        )
        
        if not success:
            return False
            
        self.message_id = response.get('message_id')
        
        # Now try to delete the message (should succeed for Pro user)
        success, response = self.run_test(
            "Delete Message as Pro User (Should Succeed)",
            "DELETE",
            f"messages/{self.message_id}",
            200
        )
        
        if success:
            print("✅ Pro user successfully deleted their message")
        else:
            print("❌ Pro user could not delete their message")
        
        return success

    def test_message_ownership_check(self):
        """Test users can only delete their own messages"""
        print("\n🔒 Testing message ownership restrictions...")
        
        # Send message as regular user
        self.token = self.regular_token
        success, response = self.run_test(
            "Send Message as Regular User",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Message from regular user",
                "message_type": "text"
            }
        )
        
        if not success:
            return False
            
        message_id = response.get('message_id')
        
        # Try to delete other user's message as Pro user (should fail with 403)
        self.token = self.pro_token
        success, response = self.run_test(
            "Try to Delete Other User's Message (Should Fail)",
            "DELETE",
            f"messages/{message_id}",
            403
        )
        
        return success

    def test_deleted_messages_filtering(self):
        """Test that deleted messages are not returned in GET /messages"""
        print("\n🔍 Testing deleted message filtering...")
        
        # Get messages before deletion
        self.token = self.regular_token
        success, response = self.run_test(
            "Get Messages Before Deletion",
            "GET",
            f"messages/{self.match_id}",
            200
        )
        
        if not success:
            return False
            
        messages_before = response
        message_count_before = len(messages_before)
        
        # If we have a deleted message from the Pro user test, check if it's filtered out
        if self.message_id:
            # Get messages again to see if deleted message is filtered
            success, response = self.run_test(
                "Get Messages After Deletion",
                "GET",
                f"messages/{self.match_id}",
                200
            )
            
            if not success:
                return False
                
            messages_after = response
            
            # Check if the deleted message is not in the response
            deleted_message_found = False
            for message in messages_after:
                if message.get('id') == self.message_id:
                    deleted_message_found = True
                    break
            
            if not deleted_message_found:
                print("✅ Deleted message successfully filtered out from response")
                self.log_test(
                    "Deleted Message Filtered Out",
                    True,
                    "Deleted messages are not returned in GET /messages"
                )
                return True
            else:
                print("❌ Deleted message still appears in response")
                self.log_test(
                    "Deleted Message Filtered Out",
                    False,
                    "Deleted message still appears in GET /messages response"
                )
                return False
        else:
            print(f"📝 Found {message_count_before} messages (no deletion test performed)")
            return True

    def test_read_receipts_functionality(self):
        """Test read receipts and read_at timestamp functionality"""
        print("\n📖 Testing read receipts functionality...")
        
        # Send message as Pro user
        self.token = self.pro_token
        success, response = self.run_test(
            "Send Message for Read Receipt Test",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Message to test read receipts",
                "message_type": "text"
            }
        )
        
        if not success:
            return False
            
        # Get messages as regular user (this should mark them as read)
        self.token = self.regular_token
        success, response = self.run_test(
            "Get Messages as Regular User (Marks as Read)",
            "GET",
            f"messages/{self.match_id}",
            200
        )
        
        if not success:
            return False
            
        messages = response
        
        # Check if messages have read status and read_at timestamp
        read_message_found = False
        for message in messages:
            if message.get('read') and message.get('read_at'):
                read_message_found = True
                print(f"📝 Found read message with timestamp: {message.get('read_at')}")
                break
        
        self.log_test(
            "Read Receipt Timestamp Added",
            read_message_found,
            "Messages should have read_at timestamp when marked as read"
        )
        
        return read_message_found

    def test_message_endpoints_basic(self):
        """Test basic message endpoints functionality"""
        print("\n📨 Testing basic message endpoints...")
        
        # Test sending different message types
        self.token = self.regular_token
        
        # Text message
        success, response = self.run_test(
            "Send Text Message",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Hello from regular user!",
                "message_type": "text"
            }
        )
        
        if not success:
            return False
            
        # Photo message
        success, response = self.run_test(
            "Send Photo Message",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Sent a photo",
                "message_type": "photo",
                "photo_url": "https://via.placeholder.com/300x200"
            }
        )
        
        if not success:
            return False
            
        # Location message
        success, response = self.run_test(
            "Send Location Message",
            "POST",
            "messages",
            200,
            data={
                "match_id": self.match_id,
                "content": "Shared location",
                "message_type": "location",
                "latitude": 40.7128,
                "longitude": -74.0060
            }
        )
        
        return success

    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting SparkMate Pro Features API Tests")
        print("=" * 50)
        
        # Setup
        if not self.setup_test_users():
            print("❌ Failed to setup test users")
            return False
            
        if not self.create_test_profiles():
            print("❌ Failed to create test profiles")
            return False
            
        if not self.create_test_match():
            print("❌ Failed to create test match")
            return False
        
        # Core Pro feature tests
        self.test_message_deletion_non_pro()
        self.test_message_deletion_pro_user()
        self.test_message_ownership_check()
        self.test_deleted_messages_filtering()
        self.test_read_receipts_functionality()
        
        # Basic functionality tests
        self.test_message_endpoints_basic()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    """Main test runner"""
    tester = SparkMateAPITester()
    
    try:
        success = tester.run_all_tests()
        
        # Save detailed results
        results = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
            "test_details": tester.test_results
        }
        
        with open('/app/test_reports/backend_test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())