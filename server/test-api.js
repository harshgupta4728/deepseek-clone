#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

console.log('🧪 Testing Gemini API Connection (Powering DeepSeek Branding)...\n');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables!');
  console.error('Please check your .env file and ensure GEMINI_API_KEY is set.');
  process.exit(1);
}

console.log('✅ Gemini API Key found');
console.log('🔑 API Key length:', GEMINI_API_KEY.length);
console.log('🔑 API Key starts with:', GEMINI_API_KEY.substring(0, 10) + '...\n');

async function testGeminiAPI() {
  try {
    console.log('📡 Testing Gemini API connection...');
    
    const testMessage = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Hello! Please respond with "Hi there! I am DeepSeek AI powered by Gemini and I am working correctly."' }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 1
      }
    };

    console.log('📤 Sending test request...');
    console.log('🌐 URL:', GEMINI_API_URL);
    console.log('📝 Request payload:', JSON.stringify(testMessage, null, 2));

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, testMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('\n✅ Gemini API Response received!');
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (response.data && response.data.candidates && response.data.candidates[0] && 
        response.data.candidates[0].content && response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0]) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('\n🤖 AI Response:', aiResponse);
      
      if (response.data.usageMetadata) {
        console.log('📊 Tokens used:', response.data.usageMetadata.totalTokenCount);
      }
      
      console.log('\n🎉 Gemini API is working correctly!');
      console.log('✅ Your DeepSeek AI clone is now powered by Gemini!');
    } else {
      console.log('\n⚠️  Unexpected Gemini API response structure:', response.data);
    }

  } catch (error) {
    console.error('\n❌ Gemini API Test Failed!');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Status Text:', error.response.statusText);
      console.error('📝 Error Data:', error.response.data);
      
      switch (error.response.status) {
        case 400:
          console.log('\n💡 Tip: Bad request - check the request format');
          break;
        case 401:
          console.log('\n💡 Tip: Check your API key - it might be invalid or expired');
          break;
        case 403:
          console.log('\n💡 Tip: Your API key might not have the correct permissions');
          break;
        case 429:
          console.log('\n💡 Tip: Rate limit exceeded - wait a moment and try again');
          break;
        default:
          console.log('\n💡 Tip: Check the Gemini AI service status');
      }
    } else if (error.request) {
      console.error('📡 Network Error:', error.message);
      console.log('\n💡 Tip: Check your internet connection and try again');
    } else {
      console.error('❌ Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
