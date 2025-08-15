import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { Send, Settings, RotateCcw, Plus, Search, Paperclip } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MessageList from '../components/MessageList';
import ChatSettings from '../components/ChatSettings';

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentChat,
    setCurrentChat,
    addMessage,
    addNewChat,
    updateChat,
    clearMessages,
    connectSocket,
    disconnectSocket,
    joinChat,
    leaveChat,
    isConnected,
    fetchChat,
    isLoading,
    error,
    clearError
  } = useChatStore();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChat = useCallback(async (id: string) => {
    try {
      const chat = await fetchChat(id);
      if (!chat) {
        toast.error('Chat not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
      navigate('/');
    }
  }, [fetchChat, navigate]);

  // Initialize socket connection
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  // Load chat when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
      joinChat(chatId);
    } else {
      setCurrentChat(null);
    }

    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, joinChat, leaveChat, setCurrentChat, loadChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // Clear errors when user changes
  useEffect(() => {
    if (user) {
      clearError();
    }
  }, [user, clearError]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error && !isLoading) {
      toast.error(error);
      // Clear the error after showing it
      setTimeout(() => clearError(), 100);
    }
  }, [error, isLoading, clearError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post('/api/chat', {
        title: 'New Chat',
        model: 'gemini-1.5-flash'
      });
      
      const newChat = response.data;
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    const userMessage = {
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const messageContent = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      console.log('Sending message:', { messageContent, hasChatId: !!chatId, hasCurrentChat: !!currentChat });
      
      // If no current chat, create a new one first
      let currentChatId = chatId;
      if (!currentChatId) {
        console.log('Creating new chat...');
        const newChatResponse = await axios.post('/api/chat', {
          title: 'New Chat',
          model: 'gemini-1.5-flash'
        });
        currentChatId = newChatResponse.data._id;
        
        console.log('New chat created:', { chatId: currentChatId, chatData: newChatResponse.data });
        
        // Add the new chat to the store
        addNewChat(newChatResponse.data);
        
        // Navigate to the new chat
        navigate(`/chat/${currentChatId}`);
      }

      // Add user message immediately
      if (currentChatId) {
        console.log('Adding user message to chat:', currentChatId);
        addMessage(currentChatId, userMessage);
      }

      // Send message to AI
      console.log('Sending message to AI:', { chatId: currentChatId, content: messageContent });
      const response = await axios.post(`/api/chat/${currentChatId}/messages`, {
        content: messageContent,
      });

      const { chat: updatedChat, aiResponse } = response.data;
      console.log('AI response received:', { chatId: currentChatId, aiResponse: aiResponse.substring(0, 50) + '...' });

      // Update chat with AI response
      if (updatedChat) {
        setCurrentChat(updatedChat);
      }

      // Show typing indicator briefly
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      if (error.response?.status === 429) {
        toast.error('Monthly message limit reached. Please upgrade to continue.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }

      // Remove the user message if it failed
      if (currentChat && currentChat._id) {
        const updatedMessages = currentChat.messages.filter(
          (msg: any) => msg.content !== messageContent
        );
        updateChat(currentChat._id, { messages: updatedMessages });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (!currentChat) return;

    try {
      await axios.delete(`/api/chat/${currentChat._id}/messages`);
      clearMessages(currentChat._id);
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    if (!currentChat) return;

    try {
      const response = await axios.put(`/api/chat/${currentChat._id}/settings`, {
        settings,
      });
      setCurrentChat(response.data);
      setShowSettings(false);
      toast.success('Settings updated');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show welcome screen when no chat is selected
  if (!currentChat && !chatId) {
    return (
      <div className="flex flex-col h-full">
        {/* Welcome Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewChat}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              title="New Chat"
            >
              <Plus size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Welcome to DeepSeek AI
            </h2>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md mx-auto px-4">
            {/* DeepSeek Logo/Icon */}
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">DS</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Hi, I'm DeepSeek
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              How can I help you today?
            </p>

            {/* Quick Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleNewChat}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Start New Chat
              </button>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                  <Search size={16} className="inline mr-2" />
                  Search
                </button>
                <button className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                  <Paperclip size={16} className="inline mr-2" />
                  Upload
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-8">
              AI-generated, for reference only
            </p>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown}
                placeholder="Message DeepSeek..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isSending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="flex-shrink-0 p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Help text */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface when a chat is selected
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleNewChat}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="New Chat"
          >
            <Plus size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentChat?.title || 'New Chat'}
          </h2>
          {currentChat && currentChat.totalTokens > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {currentChat.totalTokens} tokens
            </span>
          )}
          {/* Connection status indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Chat settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Clear chat"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Chat Settings Panel */}
      {showSettings && currentChat && (
        <ChatSettings
          settings={currentChat.settings}
          onSave={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {currentChat ? (
          <MessageList messages={currentChat.messages} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={handleKeyDown}
              placeholder="Message DeepSeek..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isSending || !isConnected}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending || !isConnected}
            className="flex-shrink-0 p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Usage info and connection status */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {user && (
            <span>
              Messages: {user.usage?.messagesSent || 0} / {user.subscription?.type === 'free' ? '100' : '∞'}
            </span>
          )}
          <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
