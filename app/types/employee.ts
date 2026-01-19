/**
 * Employee Management Types
 * Defines interfaces for Employee management in PropertyHub Builder Module
 */

// Department types
export type Department = 'engineering' | 'sales' | 'crm' | 'accounts' | 'legal' | 'hr';

// Predefined employee roles
export type EmployeeRole =
    | 'project-manager'
    | 'site-engineer'
    | 'sales-manager'
    | 'crm-executive'
    | 'accounts-manager'
    | 'legal-officer'
    | 'hr-manager'
    | 'custom';

// Employment type
export type EmploymentType = 'full-time' | 'contract';

// Employee status
export type EmployeeStatus = 'active' | 'inactive';

// Task priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task status
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

// Attendance status
export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

// Payment cycle
export type PaymentCycle = 'monthly' | 'bi-weekly';

// Payout status
export type PayoutStatus = 'pending' | 'paid';

/**
 * Project/Tower assignment for an employee
 */
export interface ProjectAssignment {
    id: string;
    projectId: string;
    projectName: string;
    towerId?: string;
    towerName?: string;
    role: string;
    effectiveDate: Date;
    endDate?: Date;
    isActive: boolean;
}

/**
 * Salary structure configuration
 */
export interface SalaryStructure {
    fixedSalary: number;
    variableComponent?: number;
    incentiveComponent?: number;
    paymentCycle: PaymentCycle;
    bankAccount?: string;
    panNumber?: string;
}

/**
 * Salary payout record
 */
export interface SalaryPayout {
    id: string;
    employeeId: string;
    month: string;              // e.g., "2024-01"
    grossAmount: number;
    deductions: number;
    netAmount: number;
    status: PayoutStatus;
    paidAt?: Date;
    transactionId?: string;
}

/**
 * Attendance record for a single day
 */
export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: Date;
    status: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    workHours?: number;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    notes?: string;
    approvedBy?: string;
    isManualEntry: boolean;
}

/**
 * Task comment
 */
export interface TaskComment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

/**
 * Employee task
 */
export interface EmployeeTask {
    id: string;
    title: string;
    description: string;
    employeeId: string;
    employeeName: string;
    projectId?: string;
    projectName?: string;
    towerId?: string;
    towerName?: string;
    customerId?: string;
    customerName?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date;
    assignedBy: string;
    assignedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    comments: TaskComment[];
}

/**
 * Performance note/log
 */
export interface PerformanceNote {
    id: string;
    employeeId: string;
    type: 'remark' | 'rating' | 'achievement' | 'escalation' | 'disciplinary';
    title: string;
    content: string;
    rating?: number;            // 1-5 for rating type
    period?: string;            // e.g., "Q1 2024" for quarterly review
    createdBy: string;
    createdAt: Date;
    isPrivate: boolean;
}

/**
 * Role permission mapping
 */
export interface RolePermission {
    role: EmployeeRole;
    permissions: {
        view: boolean;
        create: boolean;
        edit: boolean;
        approve: boolean;
        delete: boolean;
    };
    projectSpecific: boolean;
}

/**
 * Main Employee entity
 */
export interface Employee {
    id: string;

    // Personal details
    fullName: string;
    mobile: string;
    email: string;
    employeeId: string;           // e.g., EMP-001
    profilePhoto?: string;

    // Employment details
    department: Department;
    designation: string;
    role: EmployeeRole;
    customRole?: string;          // If role is 'custom'
    joiningDate: Date;
    employmentType: EmploymentType;
    status: EmployeeStatus;

    // Assignments
    projectAssignments: ProjectAssignment[];

    // Salary
    salaryStructure: SalaryStructure;

    // Statistics (computed)
    totalTasks?: number;
    completedTasks?: number;
    attendanceRate?: number;

    // Meta
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    deactivatedAt?: Date;
    deactivatedBy?: string;
}

/**
 * Form data for creating/editing employee
 */
export interface EmployeeFormData {
    // Step 1: Personal Details
    fullName: string;
    mobile: string;
    email: string;
    employeeId: string;

    // Step 2: Employment Details
    department: Department;
    designation: string;
    role: EmployeeRole;
    customRole?: string;
    joiningDate: string;
    employmentType: EmploymentType;

    // Step 3: Project Assignment (optional)
    projectAssignments: Omit<ProjectAssignment, 'id' | 'isActive'>[];

    // Step 4: Salary Configuration
    fixedSalary: string;
    variableComponent?: string;
    paymentCycle: PaymentCycle;
}

/**
 * Department configuration for UI
 */
export const DEPARTMENT_CONFIG: Record<Department, { label: string; color: string }> = {
    engineering: { label: 'Engineering', color: 'bg-blue-100 text-blue-800' },
    sales: { label: 'Sales', color: 'bg-green-100 text-green-800' },
    crm: { label: 'CRM', color: 'bg-purple-100 text-purple-800' },
    accounts: { label: 'Accounts', color: 'bg-amber-100 text-amber-800' },
    legal: { label: 'Legal', color: 'bg-red-100 text-red-800' },
    hr: { label: 'HR', color: 'bg-indigo-100 text-indigo-800' },
};

/**
 * Role configuration for UI
 */
export const ROLE_CONFIG: Record<EmployeeRole, { label: string }> = {
    'project-manager': { label: 'Project Manager' },
    'site-engineer': { label: 'Site Engineer' },
    'sales-manager': { label: 'Sales Manager' },
    'crm-executive': { label: 'CRM Executive' },
    'accounts-manager': { label: 'Accounts Manager' },
    'legal-officer': { label: 'Legal Officer' },
    'hr-manager': { label: 'HR Manager' },
    'custom': { label: 'Custom Role' },
};

/**
 * Task priority configuration
 */
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

/**
 * Task status configuration
 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    delayed: { label: 'Delayed', color: 'bg-red-100 text-red-800' },
};
