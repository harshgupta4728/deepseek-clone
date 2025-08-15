const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testing MongoDB Atlas Connection...\n');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables!');
  process.exit(1);
}

console.log('✅ MongoDB URI found');
console.log('🔗 URI starts with:', MONGODB_URI.substring(0, 50) + '...\n');

async function testMongoDBConnection() {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('🌐 Using MongoDB Atlas (cloud database)');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    
    // Test creating a collection
    const testCollection = mongoose.connection.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Database write test successful!');
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('✅ Database cleanup successful!');
    
    console.log('\n🎉 MongoDB Atlas connection is working perfectly!');
    console.log('✅ Your app can now save data to the cloud database.');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('📊 Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication failed - Check:');
      console.log('   • Username and password in connection string');
      console.log('   • User has correct permissions in MongoDB Atlas');
      console.log('   • User is not locked or expired');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Host not found - Check:');
      console.log('   • Cluster URL is correct');
      console.log('   • Cluster is running');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection refused - Check:');
      console.log('   • Network access settings in MongoDB Atlas');
      console.log('   • Add 0.0.0.0/0 to Network Access');
    }
    
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
  }
}

// Run the test
testMongoDBConnection();
