# MongoDB Atlas Setup Guide for DeepSeek AI Clone

This guide will help you set up MongoDB Atlas (cloud database) to store chat history and user accounts for your DeepSeek AI clone.

## 🚀 Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account or sign in with Google/GitHub

## 🏗️ Step 2: Create a New Cluster

1. **Choose Plan**: Select "FREE" tier (M0)
2. **Cloud Provider**: Choose AWS, Google Cloud, or Azure
3. **Region**: Select a region close to your users
4. **Cluster Name**: Enter `deepseek-cluster` (or any name you prefer)
5. Click "Create"

## 🔐 Step 3: Create Database User

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. **Authentication Method**: Choose "Password"
4. **Username**: Enter `deepseek-user` (or any username)
5. **Password**: Create a strong password (save this!)
6. **Database User Privileges**: Select "Read and write to any database"
7. Click "Add User"

## 🌐 Step 4: Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. **IP Address**: 
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address
4. Click "Confirm"

## 🔗 Step 5: Get Connection String

1. In the left sidebar, click "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## ⚙️ Step 6: Update Environment Variables

1. Navigate to your project's `server/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and update the MongoDB URI:
   ```env
   MONGODB_URI='mongodb+srv://harshgupta4728:HgTg4728@cluster0.3436v8e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
   ```

   **Replace:**
   - `deepseek-user` with your actual username
   - `your_password` with your actual password
   - `deepseek-cluster.xxxxx.mongodb.net` with your actual cluster URL
   - `deepseek-ai-clone` with your preferred database name

## 🧪 Step 7: Test Connection

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Check the console for MongoDB connection success:
   ```
   ✅ Connected to MongoDB Atlas successfully!
   Database: deepseek-ai-clone
   ```

## 🔒 Security Best Practices

### For Development:
- Use "Allow Access from Anywhere" (0.0.0.0/0)
- Use simple passwords (but still secure)

### For Production:
- Restrict IP access to your server's IP only
- Use strong, complex passwords
- Enable MongoDB Atlas security features
- Use environment variables for sensitive data

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check username and password
   - Ensure user has correct permissions

2. **"Connection timeout"**
   - Check network access settings
   - Verify cluster is running

3. **"Invalid connection string"**
   - Ensure proper URI format
   - Check for special characters in password

4. **"Network access denied"**
   - Add your IP to network access list
   - Wait a few minutes for changes to take effect

## 📊 Database Structure

Your MongoDB Atlas will automatically create these collections:

- **users**: User accounts and authentication
- **chats**: Chat conversations and messages
- **sessions**: User sessions (if using session storage)

## 🔄 Data Migration

If you have existing local data:

1. Export from local MongoDB:
   ```bash
   mongodump --db deepseek-ai-clone --out ./backup
   ```

2. Import to Atlas:
   ```bash
   mongorestore --uri "your_atlas_connection_string" ./backup
   ```

## 💰 Cost Management

- **Free Tier**: 512MB storage, shared RAM
- **Paid Plans**: Start at $9/month for dedicated resources
- **Monitor Usage**: Check Atlas dashboard for usage metrics

## 🎯 Next Steps

After setting up MongoDB Atlas:

1. ✅ Test the connection
2. ✅ Create your first user account
3. ✅ Start a chat conversation
4. ✅ Verify data is being saved
5. ✅ Check real-time updates work

## 📞 Support

If you encounter issues:
1. Check MongoDB Atlas status page
2. Review connection string format
3. Verify network access settings
4. Check server logs for detailed error messages

---

**Happy coding with your DeepSeek AI clone! 🚀**
