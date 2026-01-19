'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    EmployeeFormData,
    Department,
    EmployeeRole,
    EmploymentType,
    PaymentCycle,
    DEPARTMENT_CONFIG,
    ROLE_CONFIG
} from '@/app/types/employee';

// Mock projects for assignment
const MOCK_PROJECTS = [
    { id: 'proj-001', name: 'Sunset Towers', towers: [{ id: 't1', name: 'Tower A' }, { id: 't2', name: 'Tower B' }] },
    { id: 'proj-002', name: 'Green Valley', towers: [{ id: 't3', name: 'Wing A' }, { id: 't4', name: 'Wing B' }] },
];

const STEPS = [
    { id: 1, title: 'Personal', description: 'Basic details' },
    { id: 2, title: 'Employment', description: 'Role & Department' },
    { id: 3, title: 'Assignment', description: 'Project allocation' },
    { id: 4, title: 'Salary', description: 'Compensation' },
    { id: 5, title: 'Review', description: 'Check & Create' },
];

const INITIAL_FORM_STATE: EmployeeFormData = {
    fullName: '',
    mobile: '',
    email: '',
    employeeId: '',
    department: 'engineering',
    designation: '',
    role: 'site-engineer',
    joiningDate: '',
    employmentType: 'full-time',
    projectAssignments: [],
    fixedSalary: '',
    paymentCycle: 'monthly',
};

export default function CreateEmployeePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assignment state
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedTower, setSelectedTower] = useState('');
    const [assignmentRole, setAssignmentRole] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAssignment = () => {
        if (!selectedProject || !assignmentRole) return;

        const project = MOCK_PROJECTS.find(p => p.id === selectedProject);
        const tower = project?.towers.find(t => t.id === selectedTower);

        if (project) {
            setFormData(prev => ({
                ...prev,
                projectAssignments: [
                    ...prev.projectAssignments,
                    {
                        projectId: project.id,
                        projectName: project.name,
                        towerId: tower?.id,
                        towerName: tower?.name,
                        role: assignmentRole,
                        effectiveDate: new Date(),
                    }
                ]
            }));
            // Reset selection
            setSelectedProject('');
            setSelectedTower('');
            setAssignmentRole('');
        }
    };

    const handleRemoveAssignment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            projectAssignments: prev.projectAssignments.filter((_, idx) => idx !== index)
        }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Creating employee:', formData);
        router.push('/builder/employees');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Link href="/builder/dashboard" className="hover:text-gray-900">Dashboard</Link>
                        <span>→</span>
                        <Link href="/builder/employees" className="hover:text-gray-900">Employees</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Add Employee</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
                    <p className="text-gray-600 mt-1">Register a new staff member and assign roles</p>
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between min-w-max gap-4">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${currentStep >= step.id
                                        ? (currentStep > step.id ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : step.id}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`hidden sm:block h-0.5 w-12 mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">

                    {/* Step 1: Personal Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Details</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Employee ID *</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        placeholder="e.g., EMP-005"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="email@company.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        placeholder="+91 9876543210"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Employment Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Department *</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Role *</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Designation *</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Manager"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Employment Type *</label>
                                    <select
                                        name="employmentType"
                                        value={formData.employmentType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="full-time">Full Time</option>
                                        <option value="contract">Contract/Consultant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Joining Date *</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Project Assignment */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Project Assignments</h2>
                                <span className="text-sm text-gray-500">(Optional)</span>
                            </div>

                            {/* Add Assignment Form */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Assignment</h3>
                                <div className="grid md:grid-cols-4 gap-4 items-end">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
                                        <select
                                            value={selectedProject}
                                            onChange={(e) => {
                                                setSelectedProject(e.target.value);
                                                setSelectedTower('');
                                            }}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">Select Project</option>
                                            {MOCK_PROJECTS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tower/Block (Optional)</label>
                                        <select
                                            value={selectedTower}
                                            onChange={(e) => setSelectedTower(e.target.value)}
                                            disabled={!selectedProject}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                                        >
                                            <option value="">Whole Project</option>
                                            {MOCK_PROJECTS.find(p => p.id === selectedProject)?.towers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Role in Project</label>
                                        <input
                                            type="text"
                                            value={assignmentRole}
                                            onChange={(e) => setAssignmentRole(e.target.value)}
                                            placeholder="e.g. Site Supervisor"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            type="button"
                                            onClick={handleAddAssignment}
                                            disabled={!selectedProject || !assignmentRole}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            {formData.projectAssignments.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Project</th>
                                                <th className="px-4 py-3 text-left">Tower</th>
                                                <th className="px-4 py-3 text-left">Role</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {formData.projectAssignments.map((assignment, idx) => (
                                                <tr key={idx} className="bg-white">
                                                    <td className="px-4 py-3 font-medium">{assignment.projectName}</td>
                                                    <td className="px-4 py-3 text-gray-500">{assignment.towerName || 'All'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{assignment.role}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => handleRemoveAssignment(idx)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-xs"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-lg">
                                    No projects assigned yet
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 4: Salary Configuration */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Salary Configuration</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Fixed Salary (Monthly/Cycle) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="fixedSalary"
                                            value={formData.fixedSalary}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 50000"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Variable / Incentive (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="variableComponent"
                                            value={formData.variableComponent || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 10000"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Cycle *</label>
                                    <select
                                        name="paymentCycle"
                                        value={formData.paymentCycle}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="bi-weekly">Bi-Weekly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Review Information</h2>

                            {/* Personal */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Personal Details</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Full Name</span>
                                        <span className="font-medium">{formData.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">ID</span>
                                        <span className="font-medium">{formData.employeeId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Email</span>
                                        <span className="font-medium">{formData.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Mobile</span>
                                        <span className="font-medium">{formData.mobile}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Employment */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Employment</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Department</span>
                                        <span className="font-medium capitalize">{DEPARTMENT_CONFIG[formData.department].label}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Role</span>
                                        <span className="font-medium capitalize">{ROLE_CONFIG[formData.role].label}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Designation</span>
                                        <span className="font-medium">{formData.designation}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Type</span>
                                        <span className="font-medium capitalize">{formData.employmentType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Assignments */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Assignments</h3>
                                {formData.projectAssignments.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {formData.projectAssignments.map((a, i) => (
                                            <li key={i}>
                                                <span className="font-medium">{a.projectName}</span>
                                                {a.towerName && <span className="text-gray-600"> ({a.towerName})</span>} - {a.role}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No project assignments</p>
                                )}
                            </div>

                            {/* Salary */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Salary</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Fixed Salary</span>
                                        <span className="font-medium">₹ {formData.fixedSalary}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Cycle</span>
                                        <span className="font-medium capitalize">{formData.paymentCycle}</span>
                                    </div>
                                    {formData.variableComponent && (
                                        <div>
                                            <span className="text-gray-500 block">Variable</span>
                                            <span className="font-medium">₹ {formData.variableComponent}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => router.push('/builder/employees')}
                        className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevious}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < 5 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Employee'}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
