import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  model: string;
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  isArchived: boolean;
  isPinned: boolean;
  totalTokens: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  isFetching: boolean; // Add flag to prevent multiple simultaneous fetches
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addChat: (chat: Chat) => void;
  addNewChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  fetchChats: (archived?: boolean) => Promise<void>;
  fetchChat: (chatId: string) => Promise<Chat | null>;
  clearChats: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      let fetchTimeout: NodeJS.Timeout | null = null;
      
      return {
        chats: [],
        currentChat: null,
        isLoading: false,
        error: null,
        socket: null,
        isConnected: false,
        isFetching: false,

        setChats: (chats: Chat[]) => {
          set({ chats });
        },

        setCurrentChat: (chat: Chat | null) => {
          set({ currentChat: chat });
        },

        addChat: (chat: Chat) => {
          set((state) => ({
            chats: [chat, ...state.chats],
          }));
        },

        addNewChat: (chat: Chat) => {
          console.log('Adding new chat to store:', { chatId: chat._id, title: chat.title });
          set((state) => ({
            chats: [chat, ...state.chats],
            currentChat: chat,
          }));
          console.log('New chat added to store successfully');
        },

        updateChat: (chatId: string, updates: Partial<Chat>) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat._id === chatId ? { ...chat, ...updates } : chat
            ),
            currentChat:
              state.currentChat?._id === chatId
                ? { ...state.currentChat, ...updates }
                : state.currentChat,
          }));
        },

        deleteChat: (chatId: string) => {
          set((state) => ({
            chats: state.chats.filter((chat) => chat._id !== chatId),
            currentChat:
              state.currentChat?._id === chatId ? null : state.currentChat,
          }));
        },

        addMessage: (chatId: string, message: Message) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat._id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, message],
                    lastActivity: new Date().toISOString(),
                  }
                : chat
            ),
            currentChat:
              state.currentChat?._id === chatId
                ? {
                    ...state.currentChat,
                    messages: [...state.currentChat.messages, message],
                    lastActivity: new Date().toISOString(),
                  }
                : state.currentChat,
          }));
        },

        clearMessages: (chatId: string) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat._id === chatId
                ? { ...chat, messages: [], totalTokens: 0 }
                : chat
            ),
            currentChat:
              state.currentChat?._id === chatId
                ? { ...state.currentChat, messages: [], totalTokens: 0 }
                : state.currentChat,
          }));
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        fetchChats: async (archived = false) => {
          const { isFetching } = get();
          
          // Prevent multiple simultaneous fetches
          if (isFetching) {
            console.log('Fetch already in progress, skipping...');
            return;
          }
          
          // Clear any existing timeout
          if (fetchTimeout) {
            clearTimeout(fetchTimeout);
          }
          
          console.log('Fetching chats:', { archived });
          
          // Debounce the fetch call
          fetchTimeout = setTimeout(async () => {
            try {
              set({ isLoading: true, error: null, isFetching: true });
              const response = await axios.get(`/api/chat?archived=${archived}`);
              console.log('Chats fetched successfully:', { count: response.data.chats.length, chats: response.data.chats });
              set({ chats: response.data.chats, isLoading: false, error: null, isFetching: false });
            } catch (error: any) {
              console.error('Failed to fetch chats:', error);
              // Don't set error for authentication issues or network errors during login
              if (error.response?.status === 401 || error.response?.status === 403) {
                // Authentication issues - don't show error, just clear loading
                console.log('Authentication issue, clearing loading state');
                set({ isLoading: false, error: null, isFetching: false });
              } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                // Network errors - don't show error during initial load
                console.log('Network error, clearing loading state');
                set({ isLoading: false, error: null, isFetching: false });
              } else {
                // Only show error for actual server errors
                console.log('Server error, setting error state');
                set({ 
                  error: error.response?.data?.error || 'Failed to load chats', 
                  isLoading: false,
                  isFetching: false
                });
              }
            }
          }, 100); // 100ms debounce
        },

        fetchChat: async (chatId: string) => {
          try {
            set({ isLoading: true, error: null });
            const response = await axios.get(`/api/chat/${chatId}`);
            const chat = response.data;
            set({ currentChat: chat, isLoading: false, error: null });
            return chat;
          } catch (error: any) {
            console.error('Failed to fetch chat:', error);
            set({ 
              error: error.response?.data?.error || 'Failed to load chat', 
              isLoading: false 
            });
            return null;
          }
        },

        connectSocket: () => {
          const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
          
          socket.on('connect', () => {
            set({ socket, isConnected: true });
            console.log('Connected to chat server');
          });

          socket.on('disconnect', () => {
            set({ isConnected: false });
            console.log('Disconnected from chat server');
          });

          socket.on('receive-message', (data: { chatId: string; message: Message }) => {
            const { chatId, message } = data;
            get().addMessage(chatId, message);
          });

          socket.on('user-typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
            // Handle typing indicators if needed
            console.log('User typing:', data);
          });
        },

        disconnectSocket: () => {
          const { socket } = get();
          if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
          }
        },

        joinChat: (chatId: string) => {
          const { socket } = get();
          if (socket && chatId) {
            socket.emit('join-chat', chatId);
          }
        },

        leaveChat: (chatId: string) => {
          const { socket } = get();
          if (socket && chatId) {
            socket.emit('leave-chat', chatId);
          }
        },

        clearChats: () => {
          set({ chats: [] });
        },
      };
    },
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
      }),
    }
  )
);
