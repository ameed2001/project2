

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const readline = require('readline');

// Password strength validation
function validatePasswordStrength(password) {
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function createAdmin() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB');

    // Get arguments from command line
    const args = process.argv.slice(2);
    let email, password, name;

    if (args.length >= 3) {
      // Command line arguments provided
      email = args[0];
      password = args[1];
      name = args.slice(2).join(' ');
    } else {
      // Interactive mode
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (query) => new Promise((resolve) => rl.question(query, resolve));

      console.log('\n📝 Admin Account Creation\n');
      console.log('⚠️  SECURITY WARNING: This will create a super-admin account with full access.\n');

      email = await question('Enter admin email: ');
      password = await question('Enter admin password (min 12 chars, mixed case, numbers, symbols): ');
      name = await question('Enter admin name: ');

      rl.close();
    }

    // Validate inputs
    if (!email || !password || !name) {
      console.error('❌ Error: Email, password, and name are required');
      process.exit(1);
    }

    email = email.toLowerCase().trim();
    name = name.trim();

    if (!validateEmail(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      console.error(`❌ Error: ${passwordValidation.message}`);
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: email },
        { role: 'ADMIN', status: 'ACTIVE' }
      ]
    });

    if (existingAdmin) {
      if (existingAdmin.email === email) {
        console.error(`❌ Error: User with email ${email} already exists`);
      } else {
        console.error(`❌ Error: An active admin account already exists`);
      }
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12); // Higher salt rounds for admin

    // Create admin user
    console.log('👤 Creating admin account...');
    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profileImage: `https://placehold.co/100x100.png?text=${name.substring(0, 2).toUpperCase()}`,
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🆔 ID: ${admin._id}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`📅 Created: ${admin.createdAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT SECURITY REMINDERS:');
    console.log('   1. Store credentials securely');
    console.log('   2. Change password immediately after first login');
    console.log('   3. Enable 2FA if available');
    console.log('   4. Do not share admin credentials');
    console.log('   5. Consider deleting this script after use\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin account:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
createAdmin();


