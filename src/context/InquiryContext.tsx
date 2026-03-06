import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Inquiry {
    id: string;
    name: string;
    mobile: string;
    date: string;
    initialQuery?: string;
    status: 'New' | 'Contacted' | 'Closed';
    adminNotes?: string;
}

interface InquiryContextType {
    inquiries: Inquiry[];
    addInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
    updateStatus: (id: string, status: Inquiry['status'], adminNotes?: string) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, use SWR or React Query. For now, simple fetch on mount.
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/inquiries');
            if (res.ok) {
                const data = await res.json();
                setInquiries(data);
            }
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
            // Fallback to local storage if API fails (offline mode?)
            const saved = localStorage.getItem('inquiries');
            if (saved) setInquiries(JSON.parse(saved));
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
        // Optimistic UI Update
        const tempId = Date.now().toString();
        const newInquiry: Inquiry = {
            ...inquiry,
            id: tempId,
            date: new Date().toISOString(),
            status: 'New',
        };
        setInquiries(prev => [newInquiry, ...prev]);

        // API Call
        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inquiry)
            });
            if (!res.ok) throw new Error("Failed to save to DB");

            // Optionally refetch to get real ID, but for now this is fine.
        } catch (error) {
            console.error("Failed to save inquiry to API", error);
            // Backup to local storage
            const current = JSON.parse(localStorage.getItem('inquiries') || '[]');
            localStorage.setItem('inquiries', JSON.stringify([newInquiry, ...current]));
        }
    };

    const updateStatus = async (id: string, status: Inquiry['status'], adminNotes?: string) => {
        // Optimistic update
        setInquiries(prev => prev.map(inq =>
            inq.id === id ? { ...inq, status, ...(adminNotes !== undefined && { adminNotes }) } : inq
        ));

        // API Call
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, adminNotes })
            });

            if (!res.ok) {
                console.error("Failed to update status on server");
                // Optional: Revert optimistic update here if needed
            }
        } catch (error) {
            console.error("Error updating status API", error);
        }
    };

    return (
        <InquiryContext.Provider value={{ inquiries, addInquiry, updateStatus }}>
            {children}
        </InquiryContext.Provider>
    );
};

export const useInquiries = () => {
    const context = useContext(InquiryContext);
    if (context === undefined) {
        throw new Error('useInquiries must be used within an InquiryProvider');
    }
    return context;
};
