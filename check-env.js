const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('Current working directory:', process.cwd());

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env path:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('.env file content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
  
  // Try to load .env file
  const result = dotenv.config();
  console.log('dotenv.config() result:', result);
  
  // Check environment variables
  console.log('Environment variables after loading .env:');
  console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set');
  console.log('- CM360_PROFILE_ID:', process.env.CM360_PROFILE_ID || 'not set');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
}