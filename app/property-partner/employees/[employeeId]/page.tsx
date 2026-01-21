'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
    Employee,
    EmployeeTask,
    AttendanceRecord,
    SalaryPayout,
    DEPARTMENT_CONFIG,
    ROLE_CONFIG,
    TASK_STATUS_CONFIG,
    PRIORITY_CONFIG
} from '@/app/types/employee';

import { MOCK_EMPLOYEES } from '../page';

// Mock data
const MOCK_EMPLOYEE: Employee = {
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
        variableComponent: 50000,
        paymentCycle: 'monthly',
        bankAccount: 'XXXXXXXX1234',
        panNumber: 'ABCDE1234F'
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'admin'
};

const MOCK_TASKS: EmployeeTask[] = [
    {
        id: 'task-001',
        title: 'Site Inspection Tower A',
        description: 'Verify the foundation reinforcement work',
        employeeId: 'emp-001',
        employeeName: 'Arjun Mehta',
        projectName: 'Sunset Towers',
        towerName: 'Tower A',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2024-02-15'),
        assignedBy: 'admin',
        assignedAt: new Date('2024-02-10'),
        comments: []
    },
    {
        id: 'task-002',
        title: 'Weekly Progress Report',
        description: 'Submit progress report for all blocks',
        employeeId: 'emp-001',
        employeeName: 'Arjun Mehta',
        projectName: 'Sunset Towers',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-02-18'),
        assignedBy: 'admin',
        assignedAt: new Date('2024-02-12'),
        comments: []
    }
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att-01', employeeId: 'emp-001', date: new Date('2024-02-12'), status: 'present', checkIn: new Date('2024-02-12T09:00:00'), checkOut: new Date('2024-02-12T18:00:00'), isManualEntry: false },
    { id: 'att-02', employeeId: 'emp-001', date: new Date('2024-02-11'), status: 'present', checkIn: new Date('2024-02-11T09:15:00'), checkOut: new Date('2024-02-11T18:15:00'), isManualEntry: false },
    { id: 'att-03', employeeId: 'emp-001', date: new Date('2024-02-10'), status: 'absent', isManualEntry: false, notes: 'Sick Leave' },
    { id: 'att-04', employeeId: 'emp-001', date: new Date('2024-02-09'), status: 'present', checkIn: new Date('2024-02-09T09:00:00'), checkOut: new Date('2024-02-09T18:00:00'), isManualEntry: false },
    { id: 'att-05', employeeId: 'emp-001', date: new Date('2024-02-08'), status: 'half-day', checkIn: new Date('2024-02-08T09:00:00'), checkOut: new Date('2024-02-08T13:00:00'), isManualEntry: true },
];

const MOCK_PAYOUTS: SalaryPayout[] = [
    { id: 'pay-01', employeeId: 'emp-001', month: '2024-01', grossAmount: 150000, deductions: 5000, netAmount: 145000, status: 'paid', paidAt: new Date('2024-02-01') },
    { id: 'pay-02', employeeId: 'emp-001', month: '2023-12', grossAmount: 150000, deductions: 5000, netAmount: 145000, status: 'paid', paidAt: new Date('2024-01-01') },
];

interface EmployeeProfileProps {
    params: Promise<{
        employeeId: string;
    }>;
}

export default function EmployeeProfile({ params: paramsPromise }: EmployeeProfileProps) {
    const params = use(paramsPromise);
    const [employee] = useState<Employee>(MOCK_EMPLOYEES.find(e => e.id === params.employeeId) || MOCK_EMPLOYEE);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'attendance' | 'salary'>('overview');

    const deptConfig = DEPARTMENT_CONFIG[employee.department];
    const roleConfig = ROLE_CONFIG[employee.role];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/property-partner/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                <span>→</span>
                                <Link href="/property-partner/employees" className="hover:text-gray-900">Employees</Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">{employee.fullName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {employee.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">{employee.designation} • {employee.employeeId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                                Edit Profile
                            </button>
                            <Link
                                href={`/property-partner/employees/${employee.id}/tasks`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Assign Task
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {(['overview', 'tasks', 'attendance', 'salary'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition capitalize ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in">
                        {/* Left Column: Personal & Employment */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-1">Email Address</span>
                                        <span className="font-medium text-gray-900">{employee.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-1">Mobile Number</span>
                                        <span className="font-medium text-gray-900">{employee.mobile}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-1">Joining Date</span>
                                        <span className="font-medium text-gray-900">{new Date(employee.joiningDate).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-1">Employment Type</span>
                                        <span className="font-medium text-gray-900 capitalize">{employee.employmentType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Project Assignments</h2>
                                {employee.projectAssignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {employee.projectAssignments.map((assignment) => (
                                            <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-gray-900">{assignment.projectName}</p>
                                                    <p className="text-sm text-gray-600">{assignment.towerName ? `${assignment.towerName} • ` : ''}{assignment.role}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">Since {new Date(assignment.effectiveDate).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No active assignments</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Role & Stats */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Role & Department</h2>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-2">Department</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${deptConfig.color}`}>
                                            {deptConfig.label}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-2">System Role</span>
                                        <span className="font-medium text-gray-900">{roleConfig.label}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{MOCK_TASKS.length}</p>
                                        <p className="text-xs text-gray-600">Active Tasks</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">95%</p>
                                        <p className="text-xs text-gray-600">Attendance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Assigned Tasks</h2>
                            <Link
                                href={`/property-partner/employees/${employee.id}/tasks`}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                Manage Tasks →
                            </Link>
                        </div>
                        <div className="grid gap-4">
                            {MOCK_TASKS.map((task) => (
                                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                                {task.projectName && (
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{task.projectName}</span>
                                                )}
                                                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${TASK_STATUS_CONFIG[task.status].color}`}>
                                                {TASK_STATUS_CONFIG[task.status].label}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[task.priority].color}`}>
                                                {PRIORITY_CONFIG[task.priority].label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {MOCK_TASKS.length === 0 && (
                                <p className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200">
                                    No tasks assigned yet
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Check In</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Check Out</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {MOCK_ATTENDANCE.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                    record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                        record.status === 'half-day' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {record.status === 'half-day' ? 'Half Day' :
                                                        record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 italic">
                                                {record.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Salary Tab */}
                {activeTab === 'salary' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Structure */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Salary Structure</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Fixed Salary</span>
                                    <span className="text-xl font-bold text-gray-900">₹ {employee.salaryStructure.fixedSalary.toLocaleString()}</span>
                                    <span className="text-xs text-gray-500 ml-1 capitalize">/{employee.salaryStructure.paymentCycle}</span>
                                </div>
                                {employee.salaryStructure.variableComponent && (
                                    <div>
                                        <span className="text-sm text-gray-500 block mb-1">Variable</span>
                                        <span className="text-xl font-bold text-gray-900">₹ {employee.salaryStructure.variableComponent.toLocaleString()}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Bank Account</span>
                                    <span className="text-base font-medium text-gray-900">{employee.salaryStructure.bankAccount || 'Not added'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payout History */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">Payout History</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Period</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-900">Gross</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-900">Deductions</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-900">Net Paid</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-900">Paid Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {MOCK_PAYOUTS.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{payout.month}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">₹{payout.grossAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-red-600">-₹{payout.deductions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">₹{payout.netAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium uppercase">
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600">
                                                {payout.paidAt?.toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
