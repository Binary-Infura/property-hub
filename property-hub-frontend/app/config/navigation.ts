
import { RoleId } from '../contexts/UnifiedAppContext';

export interface NavItem {
    name: string;
    href: string;
    icon: any; // Using any for SidebarIcon names for now
    premium?: boolean;
}

export const NAVIGATION_CONFIG: Record<RoleId, NavItem[]> = {
    'CENTRAL_AUTHORITY': [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { name: 'Organizations', href: '/dashboard/organizations', icon: 'building' },
        { name: 'Cities', href: '/dashboard/cities', icon: 'pin' },
        { name: 'All Projects', href: '/central-authority/listing-requests', icon: 'clipboard' },
        { name: 'Wallet', href: '/dashboard/wallet', icon: 'money' },
        { name: 'Property Partners', href: '/dashboard/property-partners', icon: 'building' },
        { name: 'Loan Partners', href: '/dashboard/loan-partners', icon: 'bank' },

        { name: 'Team Members', href: '/dashboard/team-members', icon: 'users' },
        { name: 'Reviews', href: '/dashboard/reviews', icon: 'star' },
    ],

    'PROPERTY_PARTNER': [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { name: 'Projects', href: '/dashboard/projects', icon: 'building' },
        { name: 'Units', href: '/dashboard/units', icon: 'home' },
        { name: 'Bank Approvals', href: '/property-partner/bank-approvals', icon: 'bank' },

        { name: 'Buyer Leads', href: '/dashboard/leads', icon: 'clipboard' },
        { name: 'Wallet', href: '/dashboard/wallet', icon: 'money' },

        { name: 'Reels', href: '/dashboard/reels', icon: 'video' },
        { name: 'Reviews', href: '/dashboard/reviews', icon: 'star' },
    ],
    'LOAN_PARTNER': [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { name: 'Buyer Loans', href: '/loan-partner/buyer-loans', icon: 'money' },
        { name: 'Project Loans', href: '/loan-partner/project-loans', icon: 'bank' },
        { name: 'Documents', href: '/dashboard/documents', icon: 'document' },
        { name: 'Reviews', href: '/dashboard/reviews', icon: 'star' },
    ],
    'BUYER': [
        { name: 'My Dashboard', href: '/dashboard', icon: 'dashboard' },
        { name: 'Search Properties', href: '/dashboard/search', icon: 'search' },
        { name: 'Loan Status', href: '/dashboard/loan', icon: 'bank' },
        { name: 'Documents', href: '/dashboard/documents', icon: 'document' },
        { name: 'Saved Properties', href: '/dashboard/saved', icon: 'home' },
        { name: 'Inquiries', href: '/dashboard/inquiries', icon: 'clipboard' },
        { name: 'Reviews', href: '/dashboard/reviews', icon: 'star' },
    ],
};
