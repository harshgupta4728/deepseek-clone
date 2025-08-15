const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken, checkSubscription } = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

// Gemini API configuration (using Gemini API key but keeping DeepSeek branding)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API key
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables!');
  console.error('Please check your .env file and ensure GEMINI_API_KEY is set.');
} else {
  console.log('✅ Gemini API key loaded successfully');
  console.log('API Key length:', GEMINI_API_KEY.length);
  console.log('API Key starts with:', GEMINI_API_KEY.substring(0, 10) + '...');
}

// Get socket.io instance
let io;
const setIO = (socketIO) => {
  io = socketIO;
};

// Get all chats for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { 
      userId: req.user._id,
      isArchived: archived === 'true'
    };
    
    const chats = await Chat.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-messages');
    
    const total = await Chat.countDocuments(query);
    
    res.json({
      chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create new chat
router.post('/', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const { title, model, settings } = req.body;
    
    console.log('Creating new chat:', { userId: req.user._id, title, model });
    
    const chat = new Chat({
      userId: req.user._id,
      title: title || 'New Chat',
      model: model || 'gemini-1.5-flash',
      settings: settings || {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    });
    
    const savedChat = await chat.save();
    console.log('Chat created successfully:', { chatId: savedChat._id, title: savedChat.title });
    
    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get specific chat
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Send message to Gemini AI (powering DeepSeek branding)
router.post('/:chatId/messages', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const { content, model = 'gemini-1.5-flash' } = req.body;
    const chatId = req.params.chatId;
    
    console.log('Processing message:', { chatId, content: content.substring(0, 50) + '...', model });
    
    // Find or create chat
    let chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      console.log('Chat not found, creating new chat for user:', req.user._id);
      chat = new Chat({
        userId: req.user._id,
        title: 'New Chat', // Let addMessage method handle title generation
        model,
        settings: {
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      });
      await chat.save();
      console.log('New chat created:', { chatId: chat._id, userId: chat.userId });
    }
    
    // Add user message
    await chat.addMessage('user', content);
    console.log('User message added to chat:', { chatId: chat._id, messageCount: chat.messages.length });
    
    // Update user usage
    req.user.usage.messagesSent += 1;
    await req.user.save();
    
    // Prepare messages for Gemini API
    const messages = chat.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Get AI response from Gemini (powering DeepSeek)
    let aiResponse = '';
    let tokensUsed = 0;
    
    try {
      // Format messages for Gemini API
      const formattedMessages = chat.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      console.log('Sending request to Gemini API (powering DeepSeek):', {
        url: GEMINI_API_URL,
        hasApiKey: !!GEMINI_API_KEY,
        messageCount: formattedMessages.length,
        firstMessage: formattedMessages[0]
      });
      
      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: formattedMessages,
        generationConfig: {
          temperature: chat.settings.temperature || 0.7,
          maxOutputTokens: chat.settings.maxTokens || 4096,
          topP: chat.settings.topP || 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('Gemini API response received (powering DeepSeek):', {
        status: response.status,
        hasData: !!response.data,
        hasCandidates: !!(response.data && response.data.candidates),
        candidateCount: response.data?.candidates?.length || 0
      });
      
      // Check if response has the expected structure
      if (response.data && response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
        tokensUsed = response.data.usageMetadata?.totalTokenCount || 0;
        console.log('Successfully extracted AI response:', { aiResponse: aiResponse.substring(0, 100) + '...', tokensUsed });
      } else {
        console.error('Unexpected Gemini API response structure:', response.data);
        throw new Error('Invalid response structure from Gemini API');
      }
      
    } catch (aiError) {
      console.error('Gemini API error details:', {
        message: aiError.message,
        status: aiError.response?.status,
        statusText: aiError.response?.statusText,
        data: aiError.response?.data,
        config: {
          url: aiError.config?.url,
          method: aiError.config?.method,
          hasApiKey: !!aiError.config?.url?.includes('key=')
        }
      });
      
      // Provide more specific error messages
      if (aiError.response?.status === 400) {
        aiResponse = "I'm sorry, but I couldn't understand your request. Please try rephrasing it.";
      } else if (aiError.response?.status === 401) {
        aiResponse = "Authentication failed. Please check your API key configuration.";
      } else if (aiError.response?.status === 403) {
        aiResponse = "Access denied. Please check your API key permissions.";
      } else if (aiError.response?.status === 429) {
        aiResponse = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (aiError.response?.status >= 500) {
        aiResponse = "AI service is temporarily unavailable. Please try again later.";
      } else if (aiError.code === 'ECONNABORTED') {
        aiResponse = "Request timeout. Please try again.";
      } else if (aiError.code === 'ENOTFOUND') {
        aiResponse = "Network error. Please check your internet connection.";
      } else {
        aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again later.";
      }
      tokensUsed = 0;
    }
    
    // Add AI response
    await chat.addMessage('assistant', aiResponse, tokensUsed, model);
    
    // Update user token usage
    req.user.usage.tokensUsed += tokensUsed;
    await req.user.save();
    
    // Broadcast real-time updates if socket.io is available
    if (io) {
      io.to(chatId).emit('receive-message', {
        chatId,
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
          tokens: tokensUsed,
          model
        }
      });
    }
    
    res.json({
      chat,
      aiResponse,
      tokensUsed
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update chat settings
router.put('/:chatId/settings', authenticateToken, async (req, res) => {
  try {
    const { settings, title } = req.body;
    
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        userId: req.user._id
      },
      {
        $set: {
          ...(settings && { settings }),
          ...(title && { title })
        }
      },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({ error: 'Failed to update chat settings' });
  }
});

// Archive/Unarchive chat
router.put('/:chatId/archive', authenticateToken, async (req, res) => {
  try {
    const { archived } = req.body;
    
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (archived) {
      await chat.archive();
    } else {
      await chat.unarchive();
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ error: 'Failed to archive chat' });
  }
});

// Pin/Unpin chat
router.put('/:chatId/pin', authenticateToken, async (req, res) => {
  try {
    const { pinned } = req.body;
    
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (pinned) {
      await chat.pin();
    } else {
      await chat.unpin();
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Pin chat error:', error);
    res.status(500).json({ error: 'Failed to pin chat' });
  }
});

// Delete chat
router.delete('/:chatId', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Clear chat messages
router.delete('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    chat.messages = [];
    chat.totalTokens = 0;
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = { router, setIO };
