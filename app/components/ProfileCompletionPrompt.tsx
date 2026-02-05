'use client';

import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/routing';
import Link from 'next/link';

export default function ProfileCompletionPrompt() {
    const { profileStatus, roles } = useAuth();

    if (!profileStatus) return null;

    // Check if any role is missing its profile
    const missingRoles = roles.filter(role =>
        profileStatus[role] && !profileStatus[role].hasProfile
    );

    if (missingRoles.length === 0) return null;

    return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold text-amber-800">
                        Profile Completion Required
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                        <p>
                            You have not yet completed your profile for the following role(s):
                            <span className="font-semibold ml-1">
                                {missingRoles.map(role => role.replace('-', ' ')).join(', ')}
                            </span>
                        </p>
                        <p className="mt-1">
                            Please complete your profile to access all features.
                        </p>
                    </div>
                    <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                            <Link
                                href={`/${missingRoles[0]}/dashboard/profile`}
                                className="bg-amber-100 px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                            >
                                Complete Profile Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
