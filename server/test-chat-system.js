const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let userId = null;

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

async function testChatSystem() {
  console.log('🧪 Testing DeepSeek AI Chat System...\n');

  try {
    // Step 1: Test user registration
    console.log('1. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  User already exists, trying login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        console.log('✅ User logged in successfully');
      } else {
        throw error;
      }
    }

    // Set authorization header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Step 2: Test chat creation
    console.log('\n2. Testing chat creation...');
    const createChatResponse = await axios.post(`${BASE_URL}/chat`, {
      title: 'Test Chat',
      model: 'gemini-1.5-flash'
    });
    const chatId = createChatResponse.data._id;
    console.log('✅ Chat created successfully:', chatId);

    // Step 3: Test sending a message
    console.log('\n3. Testing message sending...');
    const messageResponse = await axios.post(`${BASE_URL}/chat/${chatId}/messages`, {
      content: 'Hello! This is a test message.',
      model: 'gemini-1.5-flash'
    });
    console.log('✅ Message sent successfully');
    console.log('AI Response:', messageResponse.data.aiResponse.substring(0, 100) + '...');

    // Step 4: Test fetching chats
    console.log('\n4. Testing chat fetching...');
    const chatsResponse = await axios.get(`${BASE_URL}/chat`);
    console.log('✅ Chats fetched successfully');
    console.log('Number of chats:', chatsResponse.data.chats.length);

    // Step 5: Test fetching specific chat
    console.log('\n5. Testing specific chat fetching...');
    const chatResponse = await axios.get(`${BASE_URL}/chat/${chatId}`);
    console.log('✅ Specific chat fetched successfully');
    console.log('Chat title:', chatResponse.data.title);
    console.log('Number of messages:', chatResponse.data.messages.length);

    // Step 6: Test chat archiving
    console.log('\n6. Testing chat archiving...');
    await axios.put(`${BASE_URL}/chat/${chatId}/archive`, { archived: true });
    console.log('✅ Chat archived successfully');

    // Step 7: Test fetching archived chats
    console.log('\n7. Testing archived chat fetching...');
    const archivedResponse = await axios.get(`${BASE_URL}/chat?archived=true`);
    console.log('✅ Archived chats fetched successfully');
    console.log('Number of archived chats:', archivedResponse.data.chats.length);

    // Step 8: Test chat unarchiving
    console.log('\n8. Testing chat unarchiving...');
    await axios.put(`${BASE_URL}/chat/${chatId}/archive`, { archived: false });
    console.log('✅ Chat unarchived successfully');

    // Step 9: Test chat pinning
    console.log('\n9. Testing chat pinning...');
    await axios.put(`${BASE_URL}/chat/${chatId}/pin`, { pinned: true });
    console.log('✅ Chat pinned successfully');

    // Step 10: Test chat deletion
    console.log('\n10. Testing chat deletion...');
    await axios.delete(`${BASE_URL}/chat/${chatId}`);
    console.log('✅ Chat deleted successfully');

    console.log('\n🎉 All tests passed! The chat system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- User authentication: ✅');
    console.log('- Chat creation: ✅');
    console.log('- Message sending: ✅');
    console.log('- Chat fetching: ✅');
    console.log('- Chat archiving: ✅');
    console.log('- Chat pinning: ✅');
    console.log('- Chat deletion: ✅');

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
testChatSystem();
