'use client';

interface RemoveAssignmentDialogProps {
    isOpen: boolean;
    user: { firstName: string; lastName?: string; email: string; role: string } | null;
    onClose: () => void;
    onConfirm: () => void;
    isCityContext?: boolean;
}

export default function RemoveAssignmentDialog({ isOpen, user, onClose, onConfirm, isCityContext }: RemoveAssignmentDialogProps) {
    if (!isOpen || !user) return null;

    const getRoleName = (role: string) => {
        switch (role) {
            case 'CITY_MANAGER':
                return 'City Manager';
            case 'MARKETING_MANAGER':
                return 'Marketing Manager';

            default:
                return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{isCityContext ? 'Revoke City Access' : 'Revoke Jurisdiction'}</h2>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mb-8">Access Termination Protocol</p>
                    </div>

                    <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 shadow-inner space-y-3">
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager Identity</p>
                            <p className="font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs font-medium text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex justify-center">
                            <span className="px-2 py-0.5 bg-gray-200 text-[9px] font-black text-gray-600 rounded-md uppercase tracking-wider">
                                {getRoleName(user.role)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-start gap-3 bg-red-50/50 p-4 rounded-xl border border-red-100/50">
                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[12px] font-medium text-red-600 leading-relaxed">
                            <strong className="font-bold block text-[10px] uppercase tracking-wider mb-1">Impact Analysis</strong>
                            The manager will immediately lose all operational access to the selected {isCityContext ? 'city' : 'city'}. This action is irreversible without formal reassignment.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[1.5] px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-sm transition-all shadow-lg shadow-red-200 transform active:scale-95"
                    >
                        Execute Revoke
                    </button>
                </div>
            </div>
        </div>
    );
}
