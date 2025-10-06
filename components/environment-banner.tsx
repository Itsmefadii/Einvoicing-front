'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ExclamationTriangleIcon, CheckCircleIcon, CloudIcon } from '@heroicons/react/24/outline';

export default function EnvironmentBanner() {
  const { user } = useAuth();
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isVisible, setIsVisible] = useState(true);

  // Load environment from fbrTokenType in user data
  useEffect(() => {
    // Determine environment based on fbrTokenType from user data
    const userData = user?.sellerData;
    if (userData?.fbrTokenType) {
      const tokenType = userData.fbrTokenType.toLowerCase();
      if (tokenType === 'production') {
        setEnvironment('production');
      } else if (tokenType === 'sandbox') {
        setEnvironment('sandbox');
      }
    }
  }, [user]);

  // Listen for user data changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Check if user data changed
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const sellerData = userData.sellerData;
          if (sellerData?.fbrTokenType) {
            const tokenType = sellerData.fbrTokenType.toLowerCase();
            if (tokenType === 'production') {
              setEnvironment('production');
            } else if (tokenType === 'sandbox') {
              setEnvironment('sandbox');
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Don't show banner for admin users
  if (!user || user.roleId === 1) {
    return null;
  }

  // Don't show if user dismissed it
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`w-full py-2 px-4 ${
      environment === 'production' 
        ? 'bg-red-50 border-b border-red-200' 
        : 'bg-yellow-50 border-b border-yellow-200'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            environment === 'production' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <div className="flex items-center space-x-2">
            <CloudIcon className={`h-4 w-4 ${
              environment === 'production' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <span className={`text-sm font-medium ${
              environment === 'production' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {environment === 'production' ? 'LIVE' : 'TEST'} Environment
            </span>
          </div>
          <span className={`text-sm ${
            environment === 'production' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {environment === 'production' 
              ? 'Live FBR integration - Real invoices will be submitted'
              : 'Test environment - Safe for testing and development'
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {environment === 'production' && (
            <div className="flex items-center space-x-1 text-red-700">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-xs font-medium">CAUTION</span>
            </div>
          )}
          
          <button
            onClick={() => setIsVisible(false)}
            className={`text-xs font-medium hover:underline ${
              environment === 'production' ? 'text-red-600' : 'text-yellow-600'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
