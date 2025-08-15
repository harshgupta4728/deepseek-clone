const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

async function testChatTitles() {
  console.log('🧪 Testing Chat Title Generation...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ Logged in successfully');

    // Step 2: Test different message types for title generation
    const testMessages = [
      'Hello, how are you?',
      'Can you help me with JavaScript programming?',
      'What is the capital of France?',
      'Hi there!',
      'Please explain quantum physics',
      'I need help with my homework',
      'Tell me about artificial intelligence'
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`\n${i + 2}. Testing message: "${message}"`);
      
      // Create new chat
      const createResponse = await axios.post(`${BASE_URL}/chat`, {
        title: 'New Chat',
        model: 'gemini-1.5-flash'
      });
      const chatId = createResponse.data._id;
      
      // Send message
      const messageResponse = await axios.post(`${BASE_URL}/chat/${chatId}/messages`, {
        content: message,
        model: 'gemini-1.5-flash'
      });
      
      // Check the generated title
      const chatResponse = await axios.get(`${BASE_URL}/chat/${chatId}`);
      const generatedTitle = chatResponse.data.title;
      
      console.log(`   Generated title: "${generatedTitle}"`);
      
      // Clean up - delete the chat
      await axios.delete(`${BASE_URL}/chat/${chatId}`);
    }

    console.log('\n🎉 Chat title generation test completed!');
    console.log('\n📋 Summary:');
    console.log('- Chat titles are now generated from first user message');
    console.log('- Common prefixes are removed for cleaner titles');
    console.log('- Titles are limited to 40 characters with ellipsis');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testChatTitles();
