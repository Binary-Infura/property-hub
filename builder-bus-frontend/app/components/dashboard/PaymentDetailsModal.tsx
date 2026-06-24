
'use client';

interface PaymentDetails {
    id: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    createdAt: string;
}

interface PaymentDetailsModalProps {
    payment: PaymentDetails | null;
    onClose: () => void;
}

export default function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
    if (!payment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold">Payment Details</h3>
                    <p className="text-blue-100 text-sm mt-1 opacity-80">Verified Transaction via Razorpay</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                            <p className="text-3xl font-black text-gray-900">
                                {payment.currency === 'INR' ? '₹' : payment.currency}{payment.amount}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Success</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Razorpay Payment ID</p>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm text-gray-700">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
                                </svg>
                                {payment.razorpayPaymentId}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm text-gray-700">
                                {payment.razorpayOrderId}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(payment.createdAt).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 mt-4 active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
