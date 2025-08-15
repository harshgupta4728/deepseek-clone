const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function testChatSaving() {
  console.log('🧪 Testing Chat Saving to Database...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Logged in successfully');

    // Step 2: Create a new chat
    console.log('\n2. Creating new chat...');
    const createChatResponse = await axios.post(`${BASE_URL}/chat`, {
      title: 'Test Chat',
      model: 'gemini-1.5-flash'
    });
    
    const chatId = createChatResponse.data._id;
    console.log('✅ Chat created:', { chatId, title: createChatResponse.data.title });

    // Step 3: Send a message to the chat
    console.log('\n3. Sending message to chat...');
    const messageResponse = await axios.post(`${BASE_URL}/chat/${chatId}/messages`, {
      content: 'This is a test message to verify chat saving.',
      model: 'gemini-1.5-flash'
    });
    
    console.log('✅ Message sent successfully');
    console.log('AI Response:', messageResponse.data.aiResponse.substring(0, 100) + '...');

    // Step 4: Fetch the chat to verify it was saved
    console.log('\n4. Fetching chat to verify saving...');
    const fetchChatResponse = await axios.get(`${BASE_URL}/chat/${chatId}`);
    
    console.log('✅ Chat fetched successfully');
    console.log('Chat data:', {
      id: fetchChatResponse.data._id,
      title: fetchChatResponse.data.title,
      userId: fetchChatResponse.data.userId,
      messageCount: fetchChatResponse.data.messages.length,
      createdAt: fetchChatResponse.data.createdAt
    });

    // Step 5: Fetch all chats to verify it appears in the list
    console.log('\n5. Fetching all chats...');
    const allChatsResponse = await axios.get(`${BASE_URL}/chat`);
    
    console.log('✅ All chats fetched successfully');
    console.log('Total chats:', allChatsResponse.data.chats.length);
    allChatsResponse.data.chats.forEach((chat, index) => {
      console.log(`   ${index + 1}. ${chat.title} (${chat._id})`);
    });

    // Step 6: Clean up - delete the test chat
    console.log('\n6. Cleaning up test chat...');
    await axios.delete(`${BASE_URL}/chat/${chatId}`);
    console.log('✅ Test chat deleted successfully');

    console.log('\n🎉 Chat saving test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Chat creation: ✅');
    console.log('- Message sending: ✅');
    console.log('- Chat persistence: ✅');
    console.log('- Chat retrieval: ✅');
    console.log('- Chat listing: ✅');

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
testChatSaving();
