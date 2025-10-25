// Website connection module for SavosBot Club
const axios = require('axios');

class WebsiteConnection {
  constructor() {
    this.websiteUrl = process.env.WEBSITE_URL || 'https://your-app.vercel.app';
    this.apiKey = process.env.API_KEY || 'savosbot2024';
  }

  // Send user data to website
  async sendUserToWebsite(userData) {
    try {
      const response = await axios.post(`${this.websiteUrl}/api/users`, {
        ...userData,
        source: 'telegram_bot'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ User data sent to website:', userData.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending user to website:', error.message);
      return null;
    }
  }

  // Get user data from website
  async getUserFromWebsite(userId) {
    try {
      const response = await axios.get(`${this.websiteUrl}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting user from website:', error.message);
      return null;
    }
  }

  // Update user data on website
  async updateUserOnWebsite(userId, updateData) {
    try {
      const response = await axios.put(`${this.websiteUrl}/api/users/${userId}`, {
        ...updateData,
        source: 'telegram_bot'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ User data updated on website:', userId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user on website:', error.message);
      return null;
    }
  }

  // Send statistics to website
  async sendStatsToWebsite(stats) {
    try {
      const response = await axios.post(`${this.websiteUrl}/api/statistics`, {
        ...stats,
        source: 'telegram_bot',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ Statistics sent to website');
      return response.data;
    } catch (error) {
      console.error('❌ Error sending stats to website:', error.message);
      return null;
    }
  }

  // Check website health
  async checkWebsiteHealth() {
    try {
      const response = await axios.get(`${this.websiteUrl}/api/health`, {
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Website health check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  // Send notification to website
  async sendNotificationToWebsite(notification) {
    try {
      const response = await axios.post(`${this.websiteUrl}/api/notifications`, {
        ...notification,
        source: 'telegram_bot',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ Notification sent to website');
      return response.data;
    } catch (error) {
      console.error('❌ Error sending notification to website:', error.message);
      return null;
    }
  }

  // Get website settings
  async getWebsiteSettings() {
    try {
      const response = await axios.get(`${this.websiteUrl}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting website settings:', error.message);
      return null;
    }
  }

  // Update website settings
  async updateWebsiteSettings(settings) {
    try {
      const response = await axios.put(`${this.websiteUrl}/api/settings`, {
        ...settings,
        source: 'telegram_bot',
        updated_at: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ Website settings updated');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating website settings:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const websiteConnection = new WebsiteConnection();

// Export functions
module.exports = {
  websiteConnection,
  WebsiteConnection
};
