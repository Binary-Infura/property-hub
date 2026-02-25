'use client';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    lastVisit?: string;
}

export default function ClientsPage() {
    const clients: Client[] = [
        {
            id: 'c1',
            name: 'Rahul Sharma',
            email: 'rahul.s@example.com',
            phone: '+91 98765 43210',
            status: 'active',
            lastVisit: new Date().toISOString(),
        },
        {
            id: 'c2',
            name: 'Priya Singh',
            email: 'priya.singh@example.com',
            phone: '+91 98765 43213',
            status: 'active',
            lastVisit: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        },
        {
            id: 'c3',
            name: 'Sneha Gupta',
            email: 'sneha.g@example.com',
            phone: '+91 98765 43211',
            status: 'active',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
                <p className="text-gray-600 mt-2">Clients you have conducted visits for.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                {client.name.charAt(0)}
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {client.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{client.email}</p>

                        <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg> {client.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg> Last Visit: {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'N/A'}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button className="px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition">
                                    Profile
                                </button>
                                <button className="px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition">
                                    Call
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
