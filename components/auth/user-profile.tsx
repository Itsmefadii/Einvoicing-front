'use client'

import { useAuth } from '@/lib/auth-context';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
  showDetails?: boolean;
  className?: string;
}

export function UserProfile({ showDetails = false, className = '' }: UserProfileProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={`flex items-center gap-x-2 ${className}`}>
        <UserCircleIcon className="h-8 w-8 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Guest</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-x-2 ${className}`}>
      <UserCircleIcon className="h-8 w-8 text-gray-400" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{user.sellerData?.businessName || 'User'}</span>
        {showDetails && (
          <div className="text-xs text-gray-500">
            <span>NTN: {user.sellerData?.ntnCnic || 'N/A'}</span>
            <span className="mx-1">•</span>
            <span className="capitalize">Production</span>
          </div>
        )}
      </div>
    </div>
  );
}
