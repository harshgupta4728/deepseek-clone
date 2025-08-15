import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import {
  MessageSquare,
  Plus,
  Archive,
  Trash2,
  Pin,
  MoreVertical,
  Search,
  X,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { 
    chats, 
    setChats, 
    currentChat, 
    setCurrentChat, 
    deleteChat, 
    fetchChats,
    isLoading 
  } = useChatStore();
  const { user } = useAuthStore();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Fetch chats on component mount
  useEffect(() => {
    if (user) {
      // Add a small delay to ensure authentication is complete
      const timer = setTimeout(() => {
        fetchChats(showArchived);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [fetchChats, showArchived, user]);

  // Fetch chats when archived filter changes
  useEffect(() => {
    if (user) { // Only fetch if user is authenticated
      fetchChats(showArchived);
    }
  }, [showArchived, fetchChats, user]);

  const createNewChat = async () => {
    try {
      const response = await axios.post('/api/chat', {
        title: 'New Chat',
      });
      
      const newChat = response.data;
      setChats([newChat, ...chats]);
      setCurrentChat(newChat);
      navigate(`/chat/${newChat._id}`);
      onClose(); // Close sidebar on mobile
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      deleteChat(chatId);
      
      // If we're currently viewing the deleted chat, navigate to home
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        navigate('/');
      }
      
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleArchiveChat = async (chatId: string, archived: boolean) => {
    try {
      await axios.put(`/api/chat/${chatId}/archive`, { archived });
      fetchChats(showArchived); // Refresh the list with current filter
      toast.success(archived ? 'Chat archived' : 'Chat unarchived');
    } catch (error) {
      console.error('Failed to archive chat:', error);
      toast.error('Failed to archive chat');
    }
  };

  const handlePinChat = async (chatId: string, pinned: boolean) => {
    try {
      await axios.put(`/api/chat/${chatId}/pin`, { pinned });
      fetchChats(showArchived); // Refresh the list with current filter
      toast.success(pinned ? 'Chat pinned' : 'Chat unpinned');
    } catch (error) {
      console.error('Failed to pin chat:', error);
      toast.error('Failed to pin chat');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          DeepSeek AI
        </h2>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Toggle Archived */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Archive size={16} />
          <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pinned
                </div>
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isActive={chatId === chat._id}
                    onDelete={handleDeleteChat}
                    onArchive={handleArchiveChat}
                    onPin={handlePinChat}
                    onSelect={() => {
                      setCurrentChat(chat);
                      navigate(`/chat/${chat._id}`);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Regular Chats */}
            {unpinnedChats.length > 0 && (
              <div>
                {pinnedChats.length > 0 && (
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recent
                  </div>
                )}
                {unpinnedChats.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isActive={chatId === chat._id}
                    onDelete={handleDeleteChat}
                    onArchive={handleArchiveChat}
                    onPin={handlePinChat}
                    onSelect={() => {
                      setCurrentChat(chat);
                      navigate(`/chat/${chat._id}`);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}

            {filteredChats.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No chats found' : 'No chats yet'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatItemProps {
  chat: any;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onArchive: (chatId: string, archived: boolean) => void;
  onPin: (chatId: string, pinned: boolean) => void;
  onSelect: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  onDelete,
  onArchive,
  onPin,
  onSelect,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <MessageSquare size={16} />
          <span className="truncate">{chat.title}</span>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {chat.isPinned && <Pin size={12} className="text-yellow-500" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <MoreVertical size={12} />
          </button>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={() => {
              onPin(chat._id, !chat.isPinned);
              setShowMenu(false);
            }}
            className="flex items-center w-full px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Pin size={14} className="mr-2" />
            {chat.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => {
              onArchive(chat._id, !chat.isArchived);
              setShowMenu(false);
            }}
            className="flex items-center w-full px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Archive size={14} className="mr-2" />
            {chat.isArchived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => {
              onDelete(chat._id);
              setShowMenu(false);
            }}
            className="flex items-center w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
