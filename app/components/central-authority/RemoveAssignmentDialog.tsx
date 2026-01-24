'use client';

interface RemoveAssignmentDialogProps {
    isOpen: boolean;
    user: { name: string; email: string; role: string } | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function RemoveAssignmentDialog({ isOpen, user, onClose, onConfirm }: RemoveAssignmentDialogProps) {
    if (!isOpen || !user) return null;

    const getRoleName = (role: string) => {
        switch (role) {
            case 'regional-manager':
                return 'Regional Manager';
            case 'marketing-manager':
                return 'Marketing Manager';
            case 'commission-manager':
                return 'Commission Manager';
            default:
                return role;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Remove Assignment</h2>
                            <p className="text-sm text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700 mb-2">You are about to remove:</p>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{getRoleName(user.role)}</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-yellow-800">
                            <strong>Warning:</strong> This user will lose access to this region. They will need to be reassigned if you want to restore access.
                        </p>
                    </div>
                </div>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                        Remove Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}
