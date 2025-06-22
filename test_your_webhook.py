# test_your_webhook.py
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_transcript_final():
    """Test the transcript-final webhook (your original logic)"""
    url = "http://localhost:8000/vapi-webhook"
    
    # Test data matching VAPI's transcript-final format
    test_data = {
        "message": {
            "type": "transcript-final",
            "transcript": "I need to buy groceries and schedule a dentist appointment for Friday at 3pm",
            "role": "user",
            "timestamp": "2025-06-21T10:00:00Z"
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        response.raise_for_status()
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error testing transcript-final webhook: {e}")
        return False

def test_function_call():
    """Test tool-call webhook"""
    url = "http://localhost:8000/vapi-webhook"
    
    # This payload matches the newer 'tool-call' format
    test_data = {
        "message": {
            "type": "tool-call",
            "tool_call": {
                "name": "process_tasks",
                "parameters": {
                    "transcript": "I need to call mom and buy milk tomorrow"
                }
            }
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        response.raise_for_status()
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error testing function call webhook: {e}")
        return False

def test_direct_agent():
    """Test the TaskAgent directly via the new test endpoint"""
    url = "http://localhost:8000/test-agent"
    
    test_data = {
        "transcript": "I have a meeting with Sarah at 2pm tomorrow and I need to pick up dry cleaning"
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        response.raise_for_status()
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error testing direct agent endpoint: {e}")
        return False

def test_health():
    """Test health endpoint"""
    url = "http://localhost:8000/health"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error testing health endpoint: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Your VAPI Integration")
    print("=" * 50)
    
    # Simplified test runner
    tests = {
        "Health Check": test_health,
        "Direct Agent Test": test_direct_agent,
        "Transcript Final": test_transcript_final,
        "Tool Call": test_function_call,
    }
    
    results = {}
    all_passed = True
    
    for test_name, test_func in tests.items():
        print(f"\n📝 Running Test: {test_name}...")
        try:
            success = test_func()
            results[test_name] = success
            if not success:
                all_passed = False
        except Exception as e:
            print(f"❌ {test_name} failed with an unexpected exception: {e}")
            results[test_name] = False
            all_passed = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    print("-" * 50)
    if all_passed:
        print("🎉 All critical tests passed successfully!")
    else:
        print("🔥 Some tests failed. Please review the output above.")
    
    print("\n🚀 Next Steps:")
    print("1. Make sure your server is running in another terminal: uvicorn api-gateway.main:app --reload")
    print("2. Run this script to verify functionality: python test_your_webhook.py")
    print("3. Use ngrok to expose your webhook: ngrok http 8000")
    print("4. Configure VAPI with your ngrok URL + /vapi-webhook") 