'use client';

import React from 'react';
import UserProfileMenu from './UserProfileMenu';

/**
 * UnifiedContextSwitcher is now a wrapper around the unified UserProfileMenu
 * to maintain backwards compatibility while ensuring visual consistency.
 */
export default function UnifiedContextSwitcher() {
    return <UserProfileMenu />;
}
