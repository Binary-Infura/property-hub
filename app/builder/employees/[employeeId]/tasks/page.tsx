'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
    EmployeeTask,
    TaskPriority,
    TaskStatus,
    PRIORITY_CONFIG,
    TASK_STATUS_CONFIG
} from '@/app/types/employee';

// Mock Tasks Data
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
        comments: [
            { id: 'c1', content: 'Started inspection at 9 AM', authorId: 'emp-001', authorName: 'Arjun Mehta', createdAt: new Date('2024-02-11T10:00:00') }
        ]
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
    },
    {
        id: 'task-003',
        title: 'Material Inventory Check',
        description: 'Check stock levels of cement and steel',
        employeeId: 'emp-001',
        employeeName: 'Arjun Mehta',
        projectName: 'Green Valley',
        towerName: 'Block C',
        priority: 'urgent',
        status: 'delayed',
        dueDate: new Date('2024-02-10'),
        assignedBy: 'manager',
        assignedAt: new Date('2024-02-05'),
        comments: []
    }
];

interface EmployeeTasksPageProps {
    params: Promise<{
        employeeId: string;
    }>;
}

export default function EmployeeTasksPage({ params: paramsPromise }: EmployeeTasksPageProps) {
    const params = use(paramsPromise);
    const [tasks, setTasks] = useState<EmployeeTask[]>(MOCK_TASKS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');

    // New task form state
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        projectName: '',
        priority: 'medium' as TaskPriority,
        dueDate: '',
    });

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = !filterStatus || task.status === filterStatus;
        const matchesPriority = !filterPriority || task.priority === filterPriority;
        return matchesStatus && matchesPriority;
    });

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        const task: EmployeeTask = {
            id: `task-${Date.now()}`,
            ...newTask,
            employeeId: params.employeeId,
            employeeName: 'Arjun Mehta', // Should fetch real name
            status: 'pending',
            dueDate: new Date(newTask.dueDate),
            assignedBy: 'admin',
            assignedAt: new Date(),
            comments: []
        };
        setTasks([task, ...tasks]);
        setShowCreateModal(false);
        setNewTask({ title: '', description: '', projectName: '', priority: 'medium', dueDate: '' });
    };

    const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/builder/employees" className="hover:text-gray-900">Employees</Link>
                                <span>→</span>
                                <Link href={`/builder/employees/${params.employeeId}`} className="hover:text-gray-900">Profile</Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">Tasks</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                            <p className="text-gray-600 mt-1">Assign and track tasks for employee</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Task
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">
                            {tasks.filter(t => t.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-600 text-sm font-medium">In Progress</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {tasks.filter(t => t.status === 'in-progress').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-600 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {tasks.filter(t => t.status === 'completed').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">All Status</option>
                        {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">All Priorities</option>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${TASK_STATUS_CONFIG[task.status].color}`}>
                                            {TASK_STATUS_CONFIG[task.status].label}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_CONFIG[task.priority].color}`}>
                                            {PRIORITY_CONFIG[task.priority].label}
                                        </span>
                                        {task.projectName && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                {task.projectName} {task.towerName ? `• ${task.towerName}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                    <p className="text-gray-600 mt-1">{task.description}</p>

                                    {task.comments.length > 0 && (
                                        <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
                                            <p className="font-medium text-gray-900 mb-1">Latest Update:</p>
                                            <p className="text-gray-600">&ldquo;{task.comments[0].content}&rdquo;</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Due {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Assigned by {task.assignedBy}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 ml-6">
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                        className="text-sm border-gray-300 rounded-lg p-2 bg-gray-50 hover:bg-white transition cursor-pointer"
                                    >
                                        {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-500 font-medium">No tasks found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Site Inspection"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Detailed description of the task"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                                    <input
                                        type="text"
                                        value={newTask.projectName}
                                        onChange={(e) => setNewTask({ ...newTask, projectName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Sunset Towers"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
