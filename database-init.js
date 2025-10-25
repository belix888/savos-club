// Database initialization for SavosBot Club
const fs = require('fs');
const path = require('path');

// Initialize database structure
function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Create data directory
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Created data directory');
    }
    
    // Initialize users database
    initUsersDatabase();
    
    // Initialize settings database
    initSettingsDatabase();
    
    // Initialize statistics database
    initStatsDatabase();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize users database
function initUsersDatabase() {
  const usersFile = path.join(__dirname, 'data', 'users.json');
  
  if (!fs.existsSync(usersFile)) {
    const initialUsers = [];
    fs.writeFileSync(usersFile, JSON.stringify(initialUsers, null, 2));
    console.log('✅ Users database initialized');
  }
}

// Initialize settings database
function initSettingsDatabase() {
  const settingsFile = path.join(__dirname, 'data', 'settings.json');
  
  if (!fs.existsSync(settingsFile)) {
    const initialSettings = {
      bot_name: 'SavosBot Club',
      welcome_message: 'Добро пожаловать в SavosBot Club!',
      website_url: process.env.WEBSITE_URL || 'https://your-app.vercel.app',
      admin_panel_url: `${process.env.WEBSITE_URL || 'https://your-app.vercel.app'}/admin-panel`,
      maintenance_mode: false,
      max_users: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(settingsFile, JSON.stringify(initialSettings, null, 2));
    console.log('✅ Settings database initialized');
  }
}

// Initialize statistics database
function initStatsDatabase() {
  const statsFile = path.join(__dirname, 'data', 'statistics.json');
  
  if (!fs.existsSync(statsFile)) {
    const initialStats = {
      total_users: 0,
      active_users: 0,
      total_messages: 0,
      total_commands: 0,
      daily_stats: {},
      monthly_stats: {},
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    fs.writeFileSync(statsFile, JSON.stringify(initialStats, null, 2));
    console.log('✅ Statistics database initialized');
  }
}

// Function to get user by ID
function getUserById(userId) {
  try {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      return null;
    }
    
    const data = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(data);
    
    return users.find(user => user.id === userId);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Function to update user
function updateUser(userId, updateData) {
  try {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      return false;
    }
    
    const data = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(data);
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData, updated_at: new Date().toISOString() };
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

// Function to get all users
function getAllUsers() {
  try {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      return [];
    }
    
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Function to get settings
function getSettings() {
  try {
    const settingsFile = path.join(__dirname, 'data', 'settings.json');
    
    if (!fs.existsSync(settingsFile)) {
      return null;
    }
    
    const data = fs.readFileSync(settingsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
}

// Function to update settings
function updateSettings(updateData) {
  try {
    const settingsFile = path.join(__dirname, 'data', 'settings.json');
    
    if (!fs.existsSync(settingsFile)) {
      return false;
    }
    
    const data = fs.readFileSync(settingsFile, 'utf8');
    const settings = JSON.parse(data);
    
    const updatedSettings = { ...settings, ...updateData, updated_at: new Date().toISOString() };
    fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}

// Function to update statistics
function updateStats(updateData) {
  try {
    const statsFile = path.join(__dirname, 'data', 'statistics.json');
    
    if (!fs.existsSync(statsFile)) {
      return false;
    }
    
    const data = fs.readFileSync(statsFile, 'utf8');
    const stats = JSON.parse(data);
    
    const updatedStats = { ...stats, ...updateData, last_updated: new Date().toISOString() };
    fs.writeFileSync(statsFile, JSON.stringify(updatedStats, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating stats:', error);
    return false;
  }
}

// Export functions
module.exports = {
  initDatabase,
  getUserById,
  updateUser,
  getAllUsers,
  getSettings,
  updateSettings,
  updateStats
};
