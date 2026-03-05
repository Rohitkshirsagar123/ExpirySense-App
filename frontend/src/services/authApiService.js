import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = "http://192.168.31.199:3000";
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

const authApiService = {
  // Set auth token in AsyncStorage
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get auth token from AsyncStorage
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Set user data in AsyncStorage
  async setUserData(user) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Get user data from AsyncStorage
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Register new user
  async register(email, password, name) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        const responseText = await response.text();
        console.error('Response text:', responseText);
        return {
          success: false,
          error: `JSON Parse Error: ${parseError.message}. Response: ${responseText.substring(0, 200)}`,
        };
      }

      if (result.success) {
        // Store token and user data
        await this.setAuthToken(result.token);
        await this.setUserData(result.user);

        return {
          success: true,
          userId: result.user.uid,
          user: result.user,
        };
      } else {
        return {
          success: false,
          error: result.message,
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: `Network Error: ${error.message}. Make sure backend is running at ${BACKEND_URL}`,
      };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        const responseText = await response.text();
        console.error('Response text:', responseText);
        return {
          success: false,
          error: `JSON Parse Error: ${parseError.message}. Response: ${responseText.substring(0, 200)}`,
        };
      }

      if (result.success) {
        // Store token and user data
        await this.setAuthToken(result.token);
        await this.setUserData(result.user);

        return {
          success: true,
          userId: result.user.uid,
          user: result.user,
        };
      } else {
        return {
          success: false,
          error: result.message,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: `Network Error: ${error.message}. Make sure backend is running at ${BACKEND_URL}`,
      };
    }
  },

  // Logout user
  async logout() {
    try {
      // Clear local storage
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);

      // Call backend logout endpoint
      const token = await this.getAuthToken();
      if (token) {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Verify token
  async verifyToken() {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return { success: false, authenticated: false };
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          authenticated: true,
          user: result.user,
        };
      } else {
        // Token invalid, clear storage
        await this.logout();
        return { success: false, authenticated: false };
      }
    } catch (error) {
      return {
        success: false,
        authenticated: false,
        error: error.message,
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const userData = await this.getUserData();
      const token = await this.getAuthToken();
      
      if (!userData || !token) {
        return null;
      }

      return userData;
    } catch (error) {
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No authentication token',
        };
      }

      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Update local user data
        await this.setUserData(result.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete user account
  async deleteUserAccount(userId) {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No authentication token',
        };
      }

      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        // Clear local storage
        await this.logout();
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default authApiService;
