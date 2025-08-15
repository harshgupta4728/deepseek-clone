# DeepSeek AI Clone with Real-time Chat

A modern, real-time chat application powered by DeepSeek AI, featuring user authentication, chat persistence, and real-time messaging via Socket.IO.

## ✨ Features

- **🤖 DeepSeek AI Integration**: Powered by DeepSeek's advanced AI models
- **💬 Real-time Chat**: Instant message delivery using Socket.IO
- **👤 User Authentication**: Secure login/register system with JWT
- **💾 Chat Persistence**: All conversations saved to user accounts
- **🎨 Modern UI**: Beautiful, responsive interface with dark mode support
- **📱 Mobile Responsive**: Works seamlessly on all devices
- **🔒 Secure**: Rate limiting, authentication middleware, and secure API calls

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- DeepSeek AI API key

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd deepseek
node setup.js
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment

1. Navigate to `server/` directory
2. Copy `.env.example` to `.env`
3. Update the following variables:
   ```env
   DEEPSEEK_API_KEY=your_actual_deepseek_api_key
   MONGODB_URI='mongodb'
   JWT_SECRET=your_jwt_secret_key
   ```

### 4. Start the Application

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔑 Getting Your DeepSeek AI API Key

1. Visit [DeepSeek AI Platform](https://platform.deepseek.com/)
2. Sign in with your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: JWT-based with Passport.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live messaging
- **AI Integration**: DeepSeek AI API for intelligent responses
- **Security**: Rate limiting, CORS, Helmet.js

### Frontend (React + TypeScript)
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS with dark mode
- **Real-time**: Socket.IO client integration
- **Routing**: React Router for navigation
- **UI Components**: Custom components with Lucide icons

## 📱 Usage

### Creating a New Chat
1. Click the "+" button in the header or sidebar
2. Start typing your message
3. Press Enter or click Send
4. Get instant AI responses from DeepSeek AI

### Managing Chats
- **Pin/Unpin**: Right-click chat → Pin/Unpin
- **Archive**: Right-click chat → Archive
- **Delete**: Right-click chat → Delete
- **Search**: Use the search bar to find specific chats

### Chat Settings
- **Temperature**: Controls response creativity (0.0 - 1.0)
- **Max Tokens**: Maximum response length
- **Top P**: Nucleus sampling parameter

## 🔧 Configuration

### Server Configuration
```env
PORT=5000
NODE_ENV=development
MONGODB_URI='mongodb'
JWT_SECRET=your-super-secret-jwt-key
DEEPSEEK_API_KEY=your-deepseek-api-key
CLIENT_URL=http://localhost:3000
```

### Client Configuration
The client automatically connects to the server URL specified in the proxy configuration.

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to connect to MongoDB"**
   - Ensure MongoDB is running
   - Check your connection string in `.env`

2. **"DeepSeek API error"**
   - Verify your API key is correct
   - Check your DeepSeek account status
   - Ensure you have sufficient credits

3. **"Socket connection failed"**
   - Check if server is running on port 5000
   - Verify CORS configuration
   - Check browser console for errors

4. **"Rate limit exceeded"**
   - Wait 15 minutes before trying again
   - Consider upgrading your subscription

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=socket.io:*
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- **CORS Protection**: Configured for your domain
- **Input Validation**: Sanitized user inputs
- **Secure Headers**: Helmet.js security middleware

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Chat Management
- `GET /api/chat` - List user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id` - Get specific chat
- `POST /api/chat/:id/messages` - Send message
- `PUT /api/chat/:id/settings` - Update chat settings
- `DELETE /api/chat/:id` - Delete chat

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/usage` - Get usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [DeepSeek AI](https://platform.deepseek.com/) for providing the AI API
- [Socket.IO](https://socket.io/) for real-time communication
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI framework
- [Zustand](https://github.com/pmndrs/zustand) for state management

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Happy Chatting! 🎉**
