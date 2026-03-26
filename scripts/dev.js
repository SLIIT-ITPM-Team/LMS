#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Development utility script for the LMS project
 * Checks ports, validates environment, and provides helpful setup information
 */

const DEFAULT_BACKEND_PORT = 5001;
const DEFAULT_FRONTEND_PORT = 5173;

function checkPort(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    return true; // Port is in use
  } catch (error) {
    return false; // Port is available
  }
}

function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.warn(`⚠️  Warning: Node.js version ${version} detected. Recommended version is 18 or higher.`);
    return false;
  }
  
  console.log(`✅ Node.js version: ${version}`);
  return true;
}

function checkMongoDB() {
  try {
    // Try to connect to MongoDB (basic check)
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    
    mongoose.connect(mongoUri, { maxPoolSize: 1 });
    mongoose.connection.on('error', () => {
      console.warn('⚠️  MongoDB connection failed. Make sure MongoDB is running.');
    });
    mongoose.connection.on('open', () => {
      console.log('✅ MongoDB connection successful');
      mongoose.disconnect();
    });
  } catch (error) {
    console.warn('⚠️  MongoDB check failed:', error.message);
  }
}

function validateEnvironment() {
  console.log('\n🔍 Checking environment configuration...');
  
  // Check backend .env
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    console.log('✅ Backend .env file exists');
  } else {
    console.warn('⚠️  Backend .env file missing. Copy from .env.example');
  }
  
  // Check frontend .env
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  if (fs.existsSync(frontendEnvPath)) {
    console.log('✅ Frontend .env file exists');
  } else {
    console.warn('⚠️  Frontend .env file missing. Copy from .env.example');
  }
  
  // Check package.json files
  const backendPackage = path.join(__dirname, '../backend/package.json');
  const frontendPackage = path.join(__dirname, '../frontend/package.json');
  
  if (fs.existsSync(backendPackage) && fs.existsSync(frontendPackage)) {
    console.log('✅ Both backend and frontend package.json files exist');
  } else {
    console.error('❌ Missing package.json files');
    process.exit(1);
  }
}

function suggestPorts() {
  console.log('\n🔧 Port availability check:');
  
  // Check backend port
  if (checkPort(DEFAULT_BACKEND_PORT)) {
    console.warn(`⚠️  Port ${DEFAULT_BACKEND_PORT} is in use`);
    console.log('💡 Try setting PORT=5002 in backend/.env');
  } else {
    console.log(`✅ Port ${DEFAULT_BACKEND_PORT} is available for backend`);
  }
  
  // Check frontend port
  if (checkPort(DEFAULT_FRONTEND_PORT)) {
    console.warn(`⚠️  Port ${DEFAULT_FRONTEND_PORT} is in use`);
    console.log('💡 Try setting PORT=5174 in frontend/vite.config.js');
  } else {
    console.log(`✅ Port ${DEFAULT_FRONTEND_PORT} is available for frontend`);
  }
}

function showHelpfulCommands() {
  console.log('\n🚀 Helpful commands:');
  console.log('   cd backend && npm install');
  console.log('   cd frontend && npm install');
  console.log('   npm run dev (from root, if configured)');
  console.log('   npm run backend (from root, if configured)');
  console.log('   npm run frontend (from root, if configured)');
}

function checkHealthEndpoint() {
  console.log('\n🏥 Testing backend health endpoint...');
  
  const axios = require('axios');
  const backendPort = process.env.PORT || DEFAULT_BACKEND_PORT;
  
  axios.get(`http://localhost:${backendPort}/api/health`)
    .then(response => {
      console.log('✅ Backend health check successful');
      console.log('   Server status:', response.data.status);
      console.log('   Environment:', response.data.environment);
      console.log('   CORS nodeEnv:', response.data.cors.nodeEnv);
    })
    .catch(error => {
      console.warn('⚠️  Backend health check failed. Make sure backend is running.');
      console.log('   Error:', error.message);
    });
}

function main() {
  console.log('🔧 LMS Development Setup Checker');
  console.log('================================');
  
  // Check Node.js version
  checkNodeVersion();
  
  // Validate environment
  validateEnvironment();
  
  // Check ports
  suggestPorts();
  
  // Check MongoDB
  checkMongoDB();
  
  // Show helpful commands
  showHelpfulCommands();
  
  // Test health endpoint
  checkHealthEndpoint();
  
  console.log('\n✅ Setup check complete!');
  console.log('💡 If you encounter CORS issues, try:');
  console.log('   1. Running the backend server first');
  console.log('   2. Checking the health endpoint at http://localhost:5001/api/health');
  console.log('   3. Clearing browser cache and cookies');
  console.log('   4. Verifying environment variables are set correctly');
}

if (require.main === module) {
  main();
}

module.exports = { checkPort, checkNodeVersion, validateEnvironment };