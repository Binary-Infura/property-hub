'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { SocietyMember, MemberType } from '@/app/types/society';

// Mock data
const MOCK_MEMBERS: SocietyMember[] = [
    { id: 'm1', name: 'Rajesh Kumar', email: 'rajesh@email.com', mobile: '9876543211', towerId: 't1', towerName: 'Tower A', flatNumber: '101', floor: 1, memberType: 'owner', isVerified: true, invitedAt: new Date('2024-01-15'), joinedAt: new Date('2024-01-16'), invitedBy: 'admin' },
    { id: 'm2', name: 'Priya Singh', email: 'priya@email.com', mobile: '9876543212', towerId: 't1', towerName: 'Tower A', flatNumber: '102', floor: 1, memberType: 'owner', isVerified: false, invitedAt: new Date('2024-01-17'), invitedBy: 'admin' },
    { id: 'm3', name: 'Amit Patel', email: 'amit@email.com', mobile: '9876543213', towerId: 't1', towerName: 'Tower A', flatNumber: '201', floor: 2, memberType: 'owner', isVerified: true, invitedAt: new Date('2024-01-18'), joinedAt: new Date('2024-01-19'), invitedBy: 'admin' },
    { id: 'm4', name: 'Sneha Sharma', mobile: '9876543214', towerId: 't2', towerName: 'Tower B', flatNumber: '101', floor: 1, memberType: 'tenant', isVerified: true, invitedAt: new Date('2024-01-20'), joinedAt: new Date('2024-01-21'), invitedBy: 'admin' },
];

const TOWERS = [
    { id: 't1', name: 'Tower A' },
    { id: 't2', name: 'Tower B' },
    { id: 't3', name: 'Tower C' },
];

interface MembersPageProps {
    params: Promise<{
        societyId: string;
    }>;
}

export default function MembersPage({ params: paramsPromise }: MembersPageProps) {
    const params = use(paramsPromise);
    const [members, setMembers] = useState<SocietyMember[]>(MOCK_MEMBERS);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTower, setFilterTower] = useState<string>('');
    const [filterType, setFilterType] = useState<MemberType | ''>('');

    // Invite form state
    const [inviteData, setInviteData] = useState({
        name: '',
        email: '',
        mobile: '',
        towerId: '',
        flatNumber: '',
        floor: '',
        memberType: 'owner' as MemberType,
    });

    const filteredMembers = members.filter(member => {
        const matchesSearch = !searchQuery ||
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.mobile.includes(searchQuery) ||
            member.flatNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTower = !filterTower || member.towerId === filterTower;
        const matchesType = !filterType || member.memberType === filterType;
        return matchesSearch && matchesTower && matchesType;
    });

    const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInviteData(prev => ({ ...prev, [name]: value }));
    };

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedTower = TOWERS.find(t => t.id === inviteData.towerId);
        const newMember: SocietyMember = {
            id: `m${Date.now()}`,
            name: inviteData.name,
            email: inviteData.email || undefined,
            mobile: inviteData.mobile,
            towerId: inviteData.towerId,
            towerName: selectedTower?.name || '',
            flatNumber: inviteData.flatNumber,
            floor: parseInt(inviteData.floor) || 1,
            memberType: inviteData.memberType,
            isVerified: false,
            invitedAt: new Date(),
            invitedBy: 'builder',
        };
        setMembers([...members, newMember]);
        setShowInviteForm(false);
        setInviteData({
            name: '',
            email: '',
            mobile: '',
            towerId: '',
            flatNumber: '',
            floor: '',
            memberType: 'owner',
        });
    };

    const verifiedCount = members.filter(m => m.isVerified).length;
    const pendingCount = members.filter(m => !m.isVerified).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/builder/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                <span>→</span>
                                <Link href="/builder/society" className="hover:text-gray-900">Societies</Link>
                                <span>→</span>
                                <Link href={`/builder/society/${params.societyId}/dashboard`} className="hover:text-gray-900">Society</Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">Members</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
                            <p className="text-gray-600 mt-1">Invite and manage society members</p>
                        </div>
                        <button
                            onClick={() => setShowInviteForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Invite Member
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Members</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{members.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Verified</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{verifiedCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Owners</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {members.filter(m => m.memberType === 'owner').length}
                        </p>
                    </div>
                </div>

                {/* Invite Form Modal */}
                {showInviteForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Invite New Member</h2>
                                <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={inviteData.name}
                                        onChange={handleInviteChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Member name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={inviteData.mobile}
                                            onChange={handleInviteChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={inviteData.email}
                                            onChange={handleInviteChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tower *</label>
                                        <select
                                            name="towerId"
                                            value={inviteData.towerId}
                                            onChange={handleInviteChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">Select tower</option>
                                            {TOWERS.map(tower => (
                                                <option key={tower.id} value={tower.id}>{tower.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Flat Number *</label>
                                        <input
                                            type="text"
                                            name="flatNumber"
                                            value={inviteData.flatNumber}
                                            onChange={handleInviteChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 101"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                        <input
                                            type="number"
                                            name="floor"
                                            value={inviteData.floor}
                                            onChange={handleInviteChange}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                        <select
                                            name="memberType"
                                            value={inviteData.memberType}
                                            onChange={handleInviteChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="tenant">Tenant</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteForm(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, mobile or flat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* Tower Filter */}
                        <select
                            value={filterTower}
                            onChange={(e) => setFilterTower(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Towers</option>
                            {TOWERS.map(tower => (
                                <option key={tower.id} value={tower.id}>{tower.name}</option>
                            ))}
                        </select>
                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as MemberType | '')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Types</option>
                            <option value="owner">Owner</option>
                            <option value="tenant">Tenant</option>
                        </select>
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Member</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Flat Details</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Invited</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.mobile}</p>
                                            {member.email && <p className="text-sm text-gray-500">{member.email}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{member.towerName} - {member.flatNumber}</p>
                                        <p className="text-sm text-gray-500">Floor {member.floor}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${member.memberType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {member.memberType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${member.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {member.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(member.invitedAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMembers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No members found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
