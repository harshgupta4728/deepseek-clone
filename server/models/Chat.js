const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  },
  model: {
    type: String,
    default: 'gemini-1.5-flash-latest'
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  model: {
    type: String,
    default: 'gemini-1.5-flash'
  },
  settings: {
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 4096,
      min: 1,
      max: 8192
    },
    topP: {
      type: Number,
      default: 1,
      min: 0,
      max: 1
    },
    frequencyPenalty: {
      type: Number,
      default: 0,
      min: -2,
      max: 2
    },
    presencePenalty: {
      type: Number,
      default: 0,
      min: -2,
      max: 2
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  totalTokens: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isArchived: 1 });
chatSchema.index({ userId: 1, isPinned: 1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Method to add message
chatSchema.methods.addMessage = function(role, content, tokens = 0, model = 'gemini-1.5-flash') {
  // Ensure messages array exists
  if (!this.messages) {
    this.messages = [];
  }
  
  this.messages.push({
    role,
    content,
    tokens,
    model
  });
  this.totalTokens += tokens;
  this.lastActivity = new Date();
  
  // Auto-generate title if it's the first user message
  if (this.messages.length === 1 && role === 'user') {
    // Clean the content for title generation
    let title = content.trim();
    
    // Remove common prefixes and clean up
    title = title.replace(/^(hi|hello|hey|good morning|good afternoon|good evening|please|can you|could you|help me|i need|i want|tell me|explain|what is|how to|how do)/i, '');
    title = title.trim();
    
    // Limit length and add ellipsis if needed
    if (title.length > 40) {
      title = title.substring(0, 40) + '...';
    }
    
    // If title is empty or too short, use a default
    if (!title || title.length < 3) {
      title = 'New Chat';
    }
    
    this.title = title;
  }
  
  return this.save();
};

// Method to get recent messages
chatSchema.methods.getRecentMessages = function(limit = 10) {
  if (!this.messages) {
    return [];
  }
  return this.messages.slice(-limit);
};

// Method to archive chat
chatSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Method to unarchive chat
chatSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

// Method to pin chat
chatSchema.methods.pin = function() {
  this.isPinned = true;
  return this.save();
};

// Method to unpin chat
chatSchema.methods.unpin = function() {
  this.isPinned = false;
  return this.save();
};

// Ensure virtual fields are serialized
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema);
