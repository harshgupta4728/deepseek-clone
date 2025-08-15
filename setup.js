#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up DeepSeek AI Clone with Real-time Chat...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

// Check if .env file exists in server directory
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server environment file...');
  
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration (Cloud Database)
MONGODB_URI=mongodb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Gemini AI Configuration (REQUIRED for AI responses - powers DeepSeek branding)
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL
CLIENT_URL=http://localhost:3000
`;

  fs.writeFileSync(serverEnvPath, envContent);
  console.log('✅ Server .env file created!');
  console.log('⚠️  IMPORTANT: Update GEMINI_API_KEY with your actual Gemini API key\n');
} else {
  console.log('✅ Server .env file already exists');
}

console.log('📋 Setup Instructions:');
console.log('1. Install server dependencies: cd server && npm install');
console.log('2. Install client dependencies: cd client && npm install');
console.log('3. Update server/.env with your Gemini API key');
console.log('4. Set up MongoDB Atlas (see MONGODB_ATLAS_SETUP.md)');
console.log('5. Update server/.env with MongoDB Atlas connection string');
console.log('6. Start server: cd server && npm run dev');
console.log('7. Start client: cd client && npm start');
console.log('\n🎯 Features:');
console.log('• Real-time chat with DeepSeek AI');
console.log('• User authentication and chat history');
console.log('• Real-time message updates via Socket.IO');
console.log('• Chat persistence and user accounts');
console.log('• Modern responsive UI with dark mode');
console.log('\n🔑 Get your Gemini API key from: https://aistudio.google.com/');
console.log('\n✨ Happy chatting!');
