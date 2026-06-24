import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BuyerLoanStatus = 'NEW' | 'DOC_PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type BankStatus = 'APPROVED' | 'LIMITED' | 'NOT_AVAILABLE';

export interface BuyerLoanApplication {
    id: string;
    leadId: string;
    assignedLoanPartnerId: string | null;
    loanAmount: number;
    eligibleAmount: number | null;
    bankId: string | null;
    status: BuyerLoanStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    lead: {
        id: string;
        name: string;
        email: string | null;
        phone: string;
        status: string;
        project: { id: string; name: string; projectType: string } | null;
    };
    bank: { id: string; name: string; logoUrl: string | null; percentage: number } | null;
    assignedLoanPartner: { id: string; firstName: string; lastName: string; email: string; phone?: string } | null;
    documents: { id: string; name: string; category: string; url: string; status: string; createdAt: string }[];
}

export interface ProjectLoanApplication {
    id: string;
    projectId: string;
    bankId: string;
    assignedLoanPartnerId: string | null;
    reviewStatus: ReviewStatus;
    bankStatus: BankStatus;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
    project: {
        id: string;
        name: string;
        projectType: string;
        status: string;
        onboardedBy: { id: string; firstName: string; lastName: string; email: string } | null;
        addressRecord: { city: { id: string; name: string; state: string } } | null;
    };
    bank: { id: string; name: string; logoUrl: string | null; percentage: number };
    assignedLoanPartner: { id: string; firstName: string; lastName: string; email: string } | null;
    documents: { id: string; name: string; category: string; url: string; status: string; createdAt: string }[];
}

// ─────────────────────────────────────────────
// Legacy service (kept for backward compatibility)
// ─────────────────────────────────────────────

export const loanService = {
    async submitLoan(token: string, data: any) {
        const response = await axios.post(`${API_URL}/api/loans/buyer`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async getLoans(token: string) {
        const response = await axios.get(`${API_URL}/api/loans/buyer`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async getLoanDetails(token: string, id: string) {
        const response = await axios.get(`${API_URL}/api/loans/buyer/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateLoanStatus(token: string, id: string, status: string) {
        const response = await axios.patch(`${API_URL}/api/loans/buyer/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

// ─────────────────────────────────────────────
// Flow 1: Buyer Loan Applications
// ─────────────────────────────────────────────

export const buyerLoansService = {
    async getAll(token: string): Promise<BuyerLoanApplication[]> {
        const res = await axios.get(`${API_URL}/api/loans/buyer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async getById(token: string, id: string): Promise<BuyerLoanApplication> {
        const res = await axios.get(`${API_URL}/api/loans/buyer/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async updateStatus(token: string, id: string, status: BuyerLoanStatus, notes?: string): Promise<BuyerLoanApplication> {
        const res = await axios.patch(`${API_URL}/api/loans/buyer/${id}/status`, { status, notes }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async assignPartner(token: string, id: string, assignedLoanPartnerId: string): Promise<BuyerLoanApplication> {
        const res = await axios.patch(`${API_URL}/api/loans/buyer/${id}/assign`, { assignedLoanPartnerId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};

// ─────────────────────────────────────────────
// Flow 2: Project Loan Applications
// ─────────────────────────────────────────────

export const projectLoansService = {
    async getAll(token: string): Promise<ProjectLoanApplication[]> {
        const res = await axios.get(`${API_URL}/api/loans/project`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async getById(token: string, id: string): Promise<ProjectLoanApplication> {
        const res = await axios.get(`${API_URL}/api/loans/project/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async updateReview(token: string, id: string, data: { reviewStatus?: ReviewStatus; bankStatus?: BankStatus; remarks?: string }): Promise<ProjectLoanApplication> {
        const res = await axios.patch(`${API_URL}/api/loans/project/${id}/review`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async assignPartner(token: string, id: string, assignedLoanPartnerId: string): Promise<ProjectLoanApplication> {
        const res = await axios.patch(`${API_URL}/api/loans/project/${id}/assign`, { assignedLoanPartnerId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async createForProject(token: string, projectId: string, bankIds: string[]): Promise<ProjectLoanApplication[]> {
        const res = await axios.post(`${API_URL}/api/loans/project`, { projectId, bankIds }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
