'use client';

import PropertySearchPage from '@/app/(public-pages)/search/page';

export default function DashboardSearchPage() {
    return (
        <div className="min-h-screen">
            <PropertySearchPage hideHeader={true} />
        </div>
    );
}
