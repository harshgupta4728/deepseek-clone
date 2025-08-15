# 🚀 Quick Setup Guide for DeepSeek AI Clone

## ✅ **What's Already Configured:**

- ✅ MongoDB Atlas connection string (your database)
- ✅ User authentication system (login/signup)
- ✅ Google OAuth integration
- ✅ Chat system with Gemini AI
- ✅ Real-time messaging with Socket.IO

## 🔧 **Step 1: Create Environment File**

Create `server/.env` file with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration (Your Cloud Database)
MONGODB_URI=mongodb+srv://harshgupta4728:HgTg4728@cluster0.3436v8e.mongodb.net/deepseek-ai-clone?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Gemini AI Configuration (REQUIRED for AI responses)
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## 🔑 **Step 2: Get Your Gemini API Key**

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign up/login to your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and replace `your-gemini-api-key-here` in `.env`

## 🗄️ **Step 3: MongoDB Atlas Setup (Already Done!)**

Your MongoDB Atlas is already configured with:
- ✅ Database: `deepseek-ai-clone`
- ✅ User: `harshgupta4728`
- ✅ Password: `HgTg4728`
- ✅ Cluster: `cluster0.3436v8e.mongodb.net`

## 📦 **Step 4: Install Dependencies**

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

## 🧪 **Step 5: Test Gemini API**

```bash
cd server
node test-api.js
```

You should see: `✅ Gemini API is working correctly!`

## 🚀 **Step 6: Start Your Application**

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm start
```

## 🌐 **Step 7: Test Everything**

1. **Open:** http://localhost:3000
2. **Register/Login:** Create account or login
3. **Start Chat:** Type a message and get AI response
4. **Check MongoDB Atlas:** Your data will be saved there!

## 📊 **What Gets Saved in MongoDB Atlas:**

### **Users Collection:**
- User accounts (email, password, name)
- Google OAuth accounts
- User preferences and settings
- Usage statistics

### **Chats Collection:**
- All chat conversations
- Messages (user + AI)
- Chat settings and metadata
- Token usage

### **Sessions Collection:**
- User login sessions
- Authentication tokens

## 🔍 **Verify MongoDB Connection:**

When you start the server, you should see:
```
✅ Connected to MongoDB successfully!
🌐 Using MongoDB Atlas (cloud database)
📊 Database: deepseek-ai-clone
```

## 🚨 **If Something Goes Wrong:**

1. **Check MongoDB Atlas:**
   - Ensure cluster is running
   - Verify network access (0.0.0.0/0 for development)
   - Check username/password

2. **Check API Key:**
   - Run `node test-api.js`
   - Verify Gemini API key is correct

3. **Check Server Logs:**
   - Look for error messages in server console
   - Check MongoDB connection status

## 🎯 **Expected Results:**

- ✅ Users can register/login
- ✅ Google OAuth works
- ✅ Chat messages are saved
- ✅ AI responses work
- ✅ Real-time updates work
- ✅ All data saved in MongoDB Atlas

## 📱 **Access Your App:**

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Database:** MongoDB Atlas (cloud)

---

**🎉 Your DeepSeek AI clone is now powered by Gemini AI and saves everything to MongoDB Atlas!**
