import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Camera, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put('/api/user/profile', {
        name: formData.name,
        avatar: formData.avatar,
      });
      
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information and profile settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {formData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
                <Camera size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {formData.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {user?.subscription?.type || 'free'} account
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">
                {formData.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <p className="text-gray-900 dark:text-white py-2 flex items-center">
              <Mail className="mr-2 h-4 w-4 text-gray-400" />
              {formData.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          {/* Avatar URL */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter avatar URL"
              />
            </div>
          )}

          {/* Account Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Verified
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.isEmailVerified ? 'Yes' : 'No'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {user?.role || 'user'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2 inline" />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              >
                <User className="h-4 w-4 mr-2 inline" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
