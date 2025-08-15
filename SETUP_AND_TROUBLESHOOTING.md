# DeepSeek AI Clone - Complete Setup & Troubleshooting Guide

This guide will help you set up your DeepSeek AI clone and fix any issues you encounter.

## 🚀 Quick Setup Steps

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Set Up Environment Variables
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add:
```env
# DeepSeek AI API Key (REQUIRED)
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here

# MongoDB Atlas Connection (REQUIRED for cloud database)
MONGODB_URI='mongodb+srv://harshgupta4728:HgTg4728@cluster0.3436v8e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Test DeepSeek AI API
```bash
# Test if your API key works
node test-deepseek-api.js
```

### 4. Start the Application
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm start
```

## 🔑 Getting Your DeepSeek AI API Key

1. Visit [DeepSeek AI Platform](https://platform.deepseek.com/)
2. Sign up/login to your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `server/.env` file

## 🗄️ MongoDB Atlas Setup

See `MONGODB_ATLAS_SETUP.md` for detailed MongoDB Atlas setup instructions.

## 🚨 Common Issues & Solutions

### Issue 1: "I apologize, but I'm having trouble processing your request right now"

**Symptoms:**
- Chat shows this error message
- API calls fail
- Server logs show API errors

**Solutions:**

1. **Test your API key first:**
   ```bash
   node test-deepseek-api.js
   ```

2. **Check your API key:**
   - Ensure it's correctly copied to `server/.env`
   - Verify it's not expired
   - Check if you have sufficient credits

3. **Check server logs:**
   ```bash
   cd server
   npm run dev
   ```
   Look for error messages in the console.

4. **Verify API endpoint:**
   - The app uses: `https://api.deepseek.com/v1/chat/completions`
   - Ensure your API key has access to this endpoint

### Issue 2: MongoDB Connection Failed

**Symptoms:**
- Server won't start
- "MongoDB connection error" in logs
- Database operations fail

**Solutions:**

1. **For MongoDB Atlas:**
   - Check your connection string format
   - Verify username/password
   - Ensure network access is configured
   - Check if cluster is running

2. **For local MongoDB:**
   - Start MongoDB service
   - Check if port 27017 is available

3. **Test connection:**
   ```bash
   cd server
   npm run dev
   ```
   Look for connection success message.

### Issue 3: Chat History Not Saving

**Symptoms:**
- Messages disappear after refresh
- No chat persistence
- Database errors

**Solutions:**

1. **Check MongoDB connection:**
   - Ensure server is connected to database
   - Check server logs for database errors

2. **Verify user authentication:**
   - Make sure you're logged in
   - Check if user account exists in database

3. **Check database collections:**
   - Users collection should exist
   - Chats collection should exist

### Issue 4: Real-time Updates Not Working

**Symptoms:**
- Messages don't appear instantly
- Socket connection errors
- "Disconnected" status

**Solutions:**

1. **Check Socket.IO connection:**
   - Look for connection status in chat interface
   - Check browser console for socket errors

2. **Verify server is running:**
   - Ensure server is on port 5000
   - Check if Socket.IO is initialized

3. **Check CORS settings:**
   - Ensure client URL is correct in server config

## 🔧 Advanced Troubleshooting

### Debug Mode

Enable detailed logging:

1. **Server debug:**
   ```bash
   cd server
   DEBUG=socket.io:* npm run dev
   ```

2. **Client debug:**
   - Open browser console
   - Look for error messages
   - Check network tab for failed requests

### API Testing

Test DeepSeek AI API manually:

```bash
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

### Database Debugging

Check database directly:

1. **MongoDB Atlas:**
   - Use MongoDB Compass
   - Check collections and documents
   - Verify indexes

2. **Local MongoDB:**
   ```bash
   mongosh
   use deepseek-ai-clone
   db.chats.find()
   db.users.find()
   ```

## 📊 Monitoring & Logs

### Server Logs
- MongoDB connection status
- API request/response logs
- Socket.IO connection logs
- Error details

### Client Logs
- Browser console errors
- Network request failures
- Socket connection status

### Database Logs
- Connection attempts
- Query performance
- Index usage

## 🆘 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Test your API key with `test-deepseek-api.js`
3. ✅ Check server logs for error messages
4. ✅ Verify MongoDB connection
5. ✅ Test with a simple message

### Information to Provide

When asking for help, include:

1. **Error message** (exact text)
2. **Server logs** (relevant parts)
3. **Client console logs** (if any)
4. **Steps to reproduce** the issue
5. **Environment details** (OS, Node.js version, etc.)

### Common Error Codes

- **401**: Authentication failed (check API key)
- **403**: Access denied (check API permissions)
- **429**: Rate limit exceeded (wait and retry)
- **500**: Server error (check server logs)
- **ECONNREFUSED**: Connection refused (check MongoDB)
- **ENOTFOUND**: Host not found (check connection string)

## 🎯 Success Checklist

Your DeepSeek AI clone is working correctly when:

- ✅ Server starts without errors
- ✅ MongoDB connection successful
- ✅ API test passes (`node test-deepseek-api.js`)
- ✅ Client connects to server
- ✅ User can register/login
- ✅ Chat messages are sent and received
- ✅ Chat history is saved
- ✅ Real-time updates work
- ✅ No error messages in chat

## 🔄 Reset & Clean Start

If everything is broken:

1. **Reset database:**
   ```bash
   # Delete existing data
   # (This will remove all users and chats)
   ```

2. **Check environment:**
   ```bash
   # Verify .env file is correct
   cat server/.env
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   cd server && rm -rf node_modules package-lock.json && npm install
   cd ../client && rm -rf node_modules package-lock.json && npm install
   ```

4. **Start fresh:**
   ```bash
   cd server && npm run dev
   # In another terminal
   cd client && npm start
   ```

---

**Need more help? Check the logs and error messages first! 🔍**
