/**
 * Custom hook to fetch user data from MongoDB after Clerk authentication
 * 
 * How it works:
 * 1. Clerk handles authentication on the frontend
 * 2. When user signs up, Clerk sends a webhook to your backend
 * 3. Backend saves user to MongoDB
 * 4. This hook fetches that data from MongoDB
 * 
 * Usage:
 * const { userData, loading, error } = useUserData();
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';

const useUserData = () => {
  const { userId, isSignedIn } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserFromDB = async () => {
      // Only fetch if user is signed in with Clerk
      if (!isSignedIn || !userId) {
        setUserData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call your backend API to get user from MongoDB
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/${userId}`);
        
        const data = await response.json();

        if (response.ok) {
          // User found in MongoDB
          setUserData(data);
          console.log('✅ User found in MongoDB:', data);
        } else {
          // User not in MongoDB yet (webhook might not have fired)
          // This is fine - they'll be added via webhook shortly
          console.log('ℹ️ User not in MongoDB yet (webhook pending)');
          setUserData(null);
        }
      } catch (err) {
        console.error('❌ Error fetching user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFromDB();
  }, [isSignedIn, userId]);

  return { userData, loading, error };
};

export default useUserData;
