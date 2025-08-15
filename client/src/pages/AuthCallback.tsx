import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('auth-storage', JSON.stringify({ token }));
      
      // Set axios default authorization header
      const axios = require('axios');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      fetchUserData(token);
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const fetchUserData = async (token: string) => {
    try {
      const axios = require('axios');
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      updateUser(response.data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to complete authentication');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
