'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Employee,
    Department,
    EmployeeRole,
    DEPARTMENT_CONFIG,
    ROLE_CONFIG
} from '@/app/types/employee';

// Mock data
export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 'emp-001',
        fullName: 'Arjun Mehta',
        mobile: '9876543210',
        email: 'arjun.mehta@builder.com',
        employeeId: 'EMP-001',
        department: 'engineering',
        designation: 'Senior Project Manager',
        role: 'project-manager',
        joiningDate: new Date('2023-01-15'),
        employmentType: 'full-time',
        status: 'active',
        projectAssignments: [
            {
                id: 'asn-001',
                projectId: 'proj-001',
                projectName: 'Sunset Towers',
                role: 'Project Head',
                effectiveDate: new Date('2023-01-15'),
                isActive: true
            }
        ],
        salaryStructure: {
            fixedSalary: 150000,
            paymentCycle: 'monthly'
        },
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        createdBy: 'admin'
    },
    {
        id: 'emp-002',
        fullName: 'Sneha Patil',
        mobile: '9876543211',
        email: 'sneha.patil@builder.com',
        employeeId: 'EMP-002',
        department: 'sales',
        designation: 'Sales Head',
        role: 'sales-manager',
        joiningDate: new Date('2023-02-01'),
        employmentType: 'full-time',
        status: 'active',
        projectAssignments: [],
        salaryStructure: {
            fixedSalary: 80000,
            variableComponent: 20000,
            paymentCycle: 'monthly'
        },
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01'),
        createdBy: 'admin'
    },
    {
        id: 'emp-003',
        fullName: 'Rohan Deshmukh',
        mobile: '9876543212',
        email: 'rohan.d@builder.com',
        employeeId: 'EMP-003',
        department: 'engineering',
        designation: 'Site Engineer',
        role: 'site-engineer',
        joiningDate: new Date('2023-03-10'),
        employmentType: 'contract',
        status: 'active',
        projectAssignments: [
            {
                id: 'asn-002',
                projectId: 'proj-001',
                projectName: 'Sunset Towers',
                towerId: 't1',
                towerName: 'Tower A',
                role: 'Site Supervisor',
                effectiveDate: new Date('2023-03-10'),
                isActive: true
            }
        ],
        salaryStructure: {
            fixedSalary: 45000,
            paymentCycle: 'monthly'
        },
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-10'),
        createdBy: 'admin'
    },
    {
        id: 'emp-004',
        fullName: 'Priya Sharma',
        mobile: '9876543213',
        email: 'priya.s@builder.com',
        employeeId: 'EMP-004',
        department: 'crm',
        designation: 'CRM Executive',
        role: 'crm-executive',
        joiningDate: new Date('2023-04-01'),
        employmentType: 'full-time',
        status: 'inactive',
        projectAssignments: [],
        salaryStructure: {
            fixedSalary: 35000,
            paymentCycle: 'monthly'
        },
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2024-01-01'),
        createdBy: 'admin',
        deactivatedAt: new Date('2024-01-01'),
        deactivatedBy: 'admin'
    }
];

export default function EmployeeListingPage() {
    const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState<Department | ''>('');
    const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | ''>('active');

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept = !filterDepartment || emp.department === filterDepartment;
        const matchesStatus = !filterStatus || emp.status === filterStatus;

        return matchesSearch && matchesDept && matchesStatus;
    });

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        engineering: employees.filter(e => e.department === 'engineering' && e.status === 'active').length,
        sales: employees.filter(e => e.department === 'sales' && e.status === 'active').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/builder/dashboard" className="hover:text-gray-900">
                                    Dashboard
                                </Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">Employees</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
                            <p className="text-gray-600 mt-1">Manage internal staff, assignments, and roles</p>
                        </div>
                        <Link
                            href="/builder/employees/create"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Employee
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Active Staff</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Engineering Team</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.engineering}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Sales Team</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{stats.sales}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, ID or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value as Department | '')}
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Departments</option>
                            {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'active' | 'inactive' | '')}
                            className="w-full md:w-36 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Employees Grid */}
                {filteredEmployees.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((employee) => {
                            const deptConfig = DEPARTMENT_CONFIG[employee.department];
                            const roleConfig = ROLE_CONFIG[employee.role];

                            return (
                                <div
                                    key={employee.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${employee.department === 'engineering' ? 'bg-blue-500' :
                                                    employee.department === 'sales' ? 'bg-green-500' :
                                                        employee.department === 'crm' ? 'bg-purple-500' :
                                                            'bg-gray-500'
                                                    }`}>
                                                    {employee.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{employee.fullName}</h3>
                                                    <p className="text-xs text-gray-500 font-medium">{employee.employeeId}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {employee.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Department</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${deptConfig.color}`}>
                                                    {deptConfig.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Designation</span>
                                                <span className="font-medium text-gray-900">{employee.designation}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Assignments</span>
                                                <span className="font-medium text-gray-900">
                                                    {employee.projectAssignments.length > 0
                                                        ? `${employee.projectAssignments.length} Project${employee.projectAssignments.length > 1 ? 's' : ''}`
                                                        : 'Unassigned'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {employee.mobile}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="truncate">{employee.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Joined {new Date(employee.joiningDate).toLocaleDateString()}</span>
                                        <Link
                                            href={`/builder/employees/${employee.id}`}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            View Profile
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-1">No employees found</p>
                        <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
                        <Link
                            href="/builder/employees/create"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Employee
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
