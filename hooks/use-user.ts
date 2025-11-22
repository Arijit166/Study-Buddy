"use client"
import { useState, useEffect } from 'react';

interface User {
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string | Date;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (name: string, avatar: string | null) => {
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Calling API:', '/api/user/profile');
      console.log('Payload:', { firstName, lastName, avatar });
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, avatar }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success data:', data);
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        return { success: false, error: errorData.error || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, updateUser, refetch: fetchUser };
}