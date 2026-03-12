
import { RoleId } from '../contexts/UnifiedAppContext';

export interface NavItem {
    name: string;
    href: string;
    icon: any; // Using any for SidebarIcon names for now
    premium?: boolean;
}

export const NAVIGATION_CONFIG: Record<RoleId, NavItem[]> = {
    'CENTRAL_AUTHORITY': [
        { name: 'Dashboard', href: '/central-authority/dashboard', icon: 'dashboard' },
        { name: 'Property Partners', href: '/central-authority/dashboard/property-partners', icon: 'building' },
        { name: 'Consultants', href: '/central-authority/dashboard/consultants', icon: 'users' },
        { name: 'Loan Advisors', href: '/central-authority/dashboard/loan-advisers', icon: 'bank' },
        { name: 'Visit Executives', href: '/central-authority/dashboard/visit-executives', icon: 'car' },
        { name: 'Marketing Managers', href: '/central-authority/dashboard/marketing-managers', icon: 'megaphone' },
        { name: 'Onboarding Managers', href: '/central-authority/dashboard/onboarding-managers', icon: 'briefcase' },
        { name: 'Influencers', href: '/central-authority/dashboard/influencers', icon: 'phone' },
        { name: 'Global Users', href: '/central-authority/dashboard/global-users', icon: 'globe' },
    ],
    'BROKER': [
        { name: 'Dashboard', href: '/broker/dashboard', icon: 'dashboard' },
        { name: 'Leads', href: '/broker/dashboard/leads', icon: 'users' },
        { name: 'Commissions', href: '/broker/dashboard/commissions', icon: 'money' },
        { name: 'Promotions', href: '/broker/dashboard/promotions', icon: 'megaphone' },
        { name: 'Reviews', href: '/broker/dashboard/reviews', icon: 'star' },
    ],
    'MARKETING_MANAGER': [
        { name: 'Dashboard', href: '/marketing-manager/dashboard', icon: 'dashboard' },
        { name: 'Campaigns', href: '/marketing-manager/dashboard/campaigns', icon: 'megaphone' },
        { name: 'Campaign Leads', href: '/marketing-manager/dashboard/leads', icon: 'users' },
        { name: 'Ads Requests', href: '/marketing-manager/dashboard/ads-requests', icon: 'note' },
        { name: 'Budget & Performance', href: '/marketing-manager/dashboard/budget', icon: 'money' },
        { name: 'Reports', href: '/marketing-manager/dashboard/reports', icon: 'chart' },
        { name: 'Reviews', href: '/marketing-manager/dashboard/reviews', icon: 'star' },
    ],
    'ONBOARDING_MANAGER': [
        { name: 'Onboarding Dashboard', href: '/onboarding-manager/dashboard', icon: 'dashboard' },
        { name: 'Project', href: '/onboarding-manager/dashboard/project', icon: 'building' },
        { name: 'Listing Requests', href: '/onboarding-manager/dashboard/listing-requests', icon: 'clipboard' },
        { name: 'Property Partners', href: '/onboarding-manager/dashboard/property-partners', icon: 'handshake' },
        { name: 'Reviews', href: '/onboarding-manager/dashboard/reviews', icon: 'star' },
    ],
    'PROPERTY_PARTNER': [
        { name: 'Dashboard', href: '/property-partner/dashboard', icon: 'dashboard' },
        { name: 'Projects', href: '/property-partner/dashboard/projects', icon: 'building' },
        { name: 'Units', href: '/property-partner/dashboard/units', icon: 'home' },
        { name: 'Consultants', href: '/property-partner/dashboard/consultants', icon: 'person', premium: true },
        { name: 'Brokers', href: '/property-partner/dashboard/brokers', icon: 'handshake', premium: true },
        { name: 'Visit Executives', href: '/property-partner/dashboard/visit-executives', icon: 'pin', premium: true },
        { name: 'Project Allocation', href: '/property-partner/dashboard/projects/allocation', icon: 'building', premium: true },
        { name: 'Leads', href: '/property-partner/dashboard/leads', icon: 'clipboard' },
        { name: 'Reels', href: '/property-partner/dashboard/reels', icon: 'video' },
        { name: 'Ads Requests', href: '/property-partner/dashboard/ads-requests', icon: 'megaphone' },
        { name: 'Reviews', href: '/property-partner/dashboard/reviews', icon: 'star' },
    ],
    'CONSULTANT': [
        { name: 'Dashboard', href: '/consultant/dashboard', icon: 'dashboard' },
        { name: 'Leads', href: '/consultant/dashboard/leads', icon: 'users' },
        { name: 'Call Logs', href: '/consultant/dashboard/call-logs', icon: 'phone' },
        { name: 'Calendar', href: '/consultant/dashboard/calendar', icon: 'calendar' },
        { name: 'Projects', href: '/consultant/dashboard/projects', icon: 'home' },
        { name: 'Units', href: '/consultant/dashboard/units', icon: 'pin' },
        { name: 'Reels', href: '/consultant/dashboard/reels', icon: 'video' },
        { name: 'Reviews', href: '/consultant/dashboard/reviews', icon: 'star' },
    ],
    'LOAN_ADVISOR': [
        { name: 'Dashboard', href: '/loan-adviser/dashboard', icon: 'dashboard' },
        { name: 'Active Loans', href: '/loan-adviser/dashboard/loans', icon: 'money' },
        { name: 'Documents', href: '/loan-adviser/dashboard/documents', icon: 'document' },
        { name: 'Reviews', href: '/loan-adviser/dashboard/reviews', icon: 'star' },
    ],
    'VISIT_EXECUTIVE': [
        { name: 'Dashboard', href: '/visit-executive/dashboard', icon: 'dashboard' },
        { name: 'Schedule', href: '/visit-executive/dashboard/schedule', icon: 'calendar' },
        { name: 'My Visits', href: '/visit-executive/dashboard/visits', icon: 'pin' },
        { name: 'Clients', href: '/visit-executive/dashboard/clients', icon: 'users' },
        { name: 'Reviews', href: '/visit-executive/dashboard/reviews', icon: 'star' },
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
    'INFLUENCER': [
        { name: 'Overview', href: '/influencer/dashboard', icon: 'dashboard' },
        { name: 'My Campaigns', href: '/influencer/dashboard/campaigns', icon: 'megaphone' },
        { name: 'Earnings', href: '/influencer/dashboard/earnings', icon: 'money' },
        { name: 'Resources', href: '/influencer/dashboard/resources', icon: 'book' },
        { name: 'Settings', href: '/influencer/dashboard/settings', icon: 'settings' },
        { name: 'Reviews', href: '/influencer/dashboard/reviews', icon: 'star' },
    ],
};
