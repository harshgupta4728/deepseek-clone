import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: theme as string,
    language: 'en',
    notifications: true,
  });

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        theme: user.preferences.theme || theme,
        language: user.preferences.language || 'en',
        notifications: user.preferences.notifications !== false,
      });
    }
  }, [user, theme]);

  const handlePreferenceChange = async (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    if (key === 'theme') {
      setTheme(value);
    }

    try {
      setIsLoading(true);
      const response = await axios.put('/api/user/preferences', {
        [key]: value,
      });
      
      updateUser(response.data.user);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete('/api/user/account');
        toast.success('Account deleted successfully');
        // Redirect to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('Failed to delete account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <a
              href="#preferences"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              <SettingsIcon className="mr-3 h-5 w-5" />
              Preferences
            </a>
            <a
              href="#account"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              <User className="mr-3 h-5 w-5" />
              Account
            </a>
            <a
              href="#notifications"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              <Bell className="mr-3 h-5 w-5" />
              Notifications
            </a>
            <a
              href="#security"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              <Shield className="mr-3 h-5 w-5" />
              Security
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Preferences */}
          <div id="preferences" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Preferences
            </h2>

            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              {/* Notifications */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable notifications
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div id="account" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Type
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {user?.subscription?.type || 'free'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Usage Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Messages Sent
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.usage?.messagesSent || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tokens Used
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.usage?.tokensUsed || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              Danger Zone
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
