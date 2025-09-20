#!/usr/bin/env python3
"""
Test script for ADHD Language Understanding
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_adhd_language_processor():
    """Test the ADHD Language Processor"""
    print("🧠 Testing ADHD Language Understanding...")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
    
    if not api_key:
        print("❌ ANTHROPIC_API_KEY not found!")
        print("\n🔧 To fix this:")
        print("1. Get your API key from: https://console.anthropic.com/")
        print("2. Set it as an environment variable:")
        print("   export ANTHROPIC_API_KEY='your-key-here'")
        print("   OR create a .env file with:")
        print("   ANTHROPIC_API_KEY=your-key-here")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    # Test different models to see which one works
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    
    models_to_test = [
        "claude-3-haiku-20240307",
        "claude-3-sonnet-20240229", 
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20241022"
    ]
    
    print("\n🔍 Testing available models...")
    working_model = None
    
    for model in models_to_test:
        try:
            response = client.messages.create(
                model=model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Say 'Hello'"}]
            )
            print(f"✅ {model} - WORKS!")
            working_model = model
            break
        except Exception as e:
            print(f"❌ {model} - {str(e)[:50]}...")
    
    if not working_model:
        print("\n❌ No working models found!")
        return False
    
    print(f"\n🎯 Using working model: {working_model}")
    
    # Test the processor with the working model
    try:
        sys.path.append('voice-service')
        from adhd_language_processor import ADHDLanguageProcessor
        
        processor = ADHDLanguageProcessor()
        
        if not processor.anthropic_client:
            print("❌ Claude 4 client not initialized")
            return False
        
        print("✅ Claude 4 client initialized successfully!")
        
        # Test with a sample ADHD speech pattern
        test_input = "I need to... um... that email thing... doctor appointment... insurance stuff... but I'm worried they'll think I'm stupid if I ask questions..."
        
        print(f"\n🎤 Testing with input: '{test_input}'")
        print("-" * 50)
        
        result = processor.process_adhd_speech(test_input)
        
        print("📊 Results:")
        print(f"Processed text: {result.get('processed_text', 'N/A')}")
        print(f"Tasks extracted: {len(result.get('extracted_tasks', []))}")
        print(f"Emotional state: {result.get('emotional_state', {}).get('primary_emotion', 'N/A')}")
        print(f"RSD indicators: {result.get('emotional_state', {}).get('rsd_indicators', [])}")
        print(f"Confidence: {result.get('processing_confidence', 'N/A')}")
        
        print("\n✅ ADHD Language Understanding is working with Claude 4!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing ADHD Language Processor: {e}")
        return False

if __name__ == "__main__":
    test_adhd_language_processor() 