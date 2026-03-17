#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ChurchAPITester:
    def __init__(self, base_url="https://faithful-cms-portal.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = {}

    def log(self, message, is_error=False):
        """Log test messages"""
        if is_error:
            print(f"❌ {message}")
        else:
            print(f"✅ {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"{name} - Status: {response.status_code}")
                self.test_results[name] = {
                    'status': 'PASS',
                    'status_code': response.status_code,
                    'response': response.json() if response.content else {}
                }
                return success, response.json() if response.content else {}
            else:
                error_msg = f"{name} - Expected {expected_status}, got {response.status_code}"
                if response.content:
                    try:
                        error_details = response.json()
                        error_msg += f" - {error_details}"
                    except:
                        error_msg += f" - {response.text[:200]}"
                        
                self.log(error_msg, is_error=True)
                self.test_results[name] = {
                    'status': 'FAIL',
                    'expected_status': expected_status,
                    'actual_status': response.status_code,
                    'error': error_msg
                }
                return False, {}

        except requests.exceptions.RequestException as e:
            error_msg = f"{name} - Network Error: {str(e)}"
            self.log(error_msg, is_error=True)
            self.test_results[name] = {
                'status': 'ERROR',
                'error': error_msg
            }
            return False, {}

    def test_public_endpoints(self):
        """Test all public endpoints"""
        print("\n🌐 Testing PUBLIC endpoints...")
        
        # Test settings
        self.run_test("Get Settings", "GET", "settings", 200)
        
        # Test announcements
        self.run_test("Get Announcements", "GET", "announcements", 200)
        
        # Test sermons
        self.run_test("Get Sermons", "GET", "sermons", 200)
        
        # Test events
        self.run_test("Get Events", "GET", "events", 200)
        
        # Test gallery
        self.run_test("Get Gallery", "GET", "gallery", 200)
        
        # Test gallery categories
        self.run_test("Get Gallery Categories", "GET", "gallery/categories", 200)
        
        # Test clergy
        self.run_test("Get Clergy", "GET", "clergy", 200)
        
        # Test pages
        self.run_test("Get Pages", "GET", "pages", 200)
        
        # Test specific page
        self.run_test("Get About Page", "GET", "pages/about", 200)
        
        # Test contact message submission
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from the automated test suite."
        }
        self.run_test("Submit Contact Message", "POST", "messages", 200, contact_data)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing AUTH endpoints...")
        
        # Test registration
        register_data = {
            "email": f"testadmin_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "name": "Test Admin"
        }
        
        success, response = self.run_test("Admin Registration", "POST", "auth/register", 200, register_data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"🎯 Admin token obtained successfully")
            
            # Test login with the same credentials
            login_data = {
                "email": register_data["email"],
                "password": register_data["password"]
            }
            self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
            
            # Test getting current user info
            self.run_test("Get Current User", "GET", "auth/me", 200, auth_required=True)
        else:
            print("❌ Failed to get admin token - skipping authenticated tests")
            return False
        
        return True

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.token:
            print("❌ No admin token available - skipping admin tests")
            return
            
        print("\n🔒 Testing ADMIN endpoints...")
        
        # Test stats
        self.run_test("Get Admin Stats", "GET", "stats", 200, auth_required=True)
        
        # Test getting messages (admin only)
        self.run_test("Get Messages (Admin)", "GET", "messages", 200, auth_required=True)
        
        # Test getting donations (admin only)
        self.run_test("Get Donations (Admin)", "GET", "donations", 200, auth_required=True)
        
        # Test updating settings
        settings_update = {
            "church_name": "St. Anthony Catholic Church - Updated",
            "phone": "+234 800 000 0000"
        }
        self.run_test("Update Settings", "PUT", "settings", 200, settings_update, auth_required=True)
        
        # Test creating sermon
        sermon_data = {
            "title": "Test Sermon",
            "description": "This is a test sermon",
            "preacher": "Fr. Test",
            "date": "2024-02-15",
            "video_url": "https://www.youtube.com/watch?v=test",
            "video_type": "youtube"
        }
        success, sermon_response = self.run_test("Create Sermon", "POST", "sermons", 200, sermon_data, auth_required=True)
        
        # Test creating event
        event_data = {
            "title": "Test Event",
            "description": "This is a test event",
            "date": "2024-03-15",
            "time": "10:00 AM",
            "location": "Parish Hall",
            "is_featured": True
        }
        success, event_response = self.run_test("Create Event", "POST", "events", 200, event_data, auth_required=True)
        
        # Test creating announcement
        announcement_data = {
            "title": "Test Announcement",
            "content": "This is a test announcement",
            "priority": 1
        }
        self.run_test("Create Announcement", "POST", "announcements", 200, announcement_data, auth_required=True)
        
        # Test creating clergy
        clergy_data = {
            "name": "Fr. Test Priest",
            "title": "Test Priest",
            "bio": "This is a test priest biography",
            "order": 10
        }
        self.run_test("Create Clergy", "POST", "clergy", 200, clergy_data, auth_required=True)
        
        # Test creating gallery image
        gallery_data = {
            "title": "Test Image",
            "description": "This is a test image",
            "image_url": "https://example.com/test.jpg",
            "category": "Test"
        }
        self.run_test("Create Gallery Image", "POST", "gallery", 200, gallery_data, auth_required=True)

    def test_donation_flow(self):
        """Test donation/payment flow"""
        print("\n💰 Testing DONATION flow...")
        
        donation_data = {
            "amount": 25.00,
            "donor_name": "Test Donor",
            "donor_email": "donor@example.com",
            "message": "Test donation",
            "origin_url": "https://faithful-cms-portal.preview.emergentagent.com"
        }
        
        success, response = self.run_test("Create Donation Checkout", "POST", "donations/checkout", 200, donation_data)
        
        if success and 'session_id' in response:
            session_id = response['session_id']
            self.run_test("Get Donation Status", "GET", f"donations/status/{session_id}", 200)

    def test_seed_data(self):
        """Test seed data endpoint"""
        print("\n🌱 Testing SEED DATA...")
        self.run_test("Seed Sample Data", "POST", "seed", 200)

    def generate_report(self):
        """Generate test report"""
        print(f"\n📊 Test Results Summary")
        print(f"{'='*50}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Show failed tests
        failed_tests = [name for name, result in self.test_results.items() if result['status'] != 'PASS']
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test_name in failed_tests:
                result = self.test_results[test_name]
                print(f"  - {test_name}: {result.get('error', 'Unknown error')}")
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'tests_run': self.tests_run,
                    'tests_passed': self.tests_passed,
                    'success_rate': self.tests_passed/self.tests_run*100 if self.tests_run > 0 else 0,
                    'timestamp': datetime.now().isoformat()
                },
                'results': self.test_results
            }, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    print("🏛️  St. Anthony Catholic Church API Test Suite")
    print("=" * 60)
    
    tester = ChurchAPITester()
    
    # Run all tests
    try:
        # Test seed data first
        tester.test_seed_data()
        
        # Test public endpoints
        tester.test_public_endpoints()
        
        # Test auth and get admin token
        auth_success = tester.test_auth_endpoints()
        
        # Test admin endpoints if auth worked
        if auth_success:
            tester.test_admin_endpoints()
        
        # Test donation flow
        tester.test_donation_flow()
        
    except Exception as e:
        print(f"❌ Test suite error: {str(e)}")
        return 1
    
    # Generate report
    success = tester.generate_report()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())