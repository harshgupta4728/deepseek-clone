import React from 'react';
import { User, Bot } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 p-4">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </div>
  );
};

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}>
            {isAssistant ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
          
          {/* Message metadata */}
          <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
            {message.tokens && (
              <span className="ml-2">• {message.tokens} tokens</span>
            )}
            {message.model && (
              <span className="ml-2">• {message.model}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
