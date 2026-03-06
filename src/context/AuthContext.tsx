import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    avatar_url?: string;
    role: 'admin' | 'customer';
}

interface AuthContextType {
    user: User | null;
    adminUser: User | null;
    login: (phone: string, password?: string) => Promise<string | null>;
    signup: (name: string, phone: string, email?: string) => Promise<{ success: boolean; requireOtp?: boolean; userId?: string }>;
    verifyOtp: (userId: string, code: string) => Promise<boolean>;
    resendOtp: (userId: string) => Promise<boolean>;
    logout: () => void;
    adminLogout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('topstore_user');
        const savedAdmin = localStorage.getItem('topstore_admin');

        try {
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Failed to restore user session", e);
            localStorage.removeItem('topstore_user');
        }

        try {
            if (savedAdmin) {
                setAdminUser(JSON.parse(savedAdmin));
            }
        } catch (e) {
            console.error("Failed to restore admin session", e);
            localStorage.removeItem('topstore_admin');
        }
        setIsLoading(false);
    }, []);

    const login = async (phone: string, password?: string): Promise<string | null> => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error(`Server error: Expected JSON but got ${text.substring(0, 50)}...`);
            }

            if (res.ok && data.success) {
                if (data.user.role === 'admin') {
                    setAdminUser(data.user);
                    localStorage.setItem('topstore_admin', JSON.stringify(data.user));
                    toast.success(`Welcome Admin, ${data.user.name}!`);
                    setIsLoading(false);
                    return 'admin';
                } else {
                    setUser(data.user);
                    localStorage.setItem('topstore_user', JSON.stringify(data.user));
                    toast.success(`Welcome back, ${data.user.name}!`);
                    setIsLoading(false);
                    return 'customer';
                }
            } else {
                throw new Error(data.error || "Login failed");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            setIsLoading(false);
            toast.error(error.message || "Failed to login. Please try again.");
            return null;
        }
    };

    const signup = async (name: string, phone: string, email?: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (data.require_otp) {
                    setIsLoading(false);
                    toast.success("OTP sent to your WhatsApp!");
                    return { success: true, requireOtp: true, userId: data.user_id };
                }

                setUser(data.user);
                localStorage.setItem('topstore_user', JSON.stringify(data.user));
                setIsLoading(false);
                toast.success("Account created successfully!");
                return { success: true };
            } else {
                throw new Error(data.error || "Signup failed");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            setIsLoading(false);
            toast.error(error.message || "Failed to create account.");
            return { success: false };
        }
    };

    const verifyOtp = async (userId: string, code: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/verify-phone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setUser(data.user);
                localStorage.setItem('topstore_user', JSON.stringify(data.user));
                setIsLoading(false);
                toast.success("Phone verified successfully!");
                return true;
            } else {
                throw new Error(data.error || "OTP verification failed");
            }
        } catch (error: any) {
            console.error("OTP error:", error);
            setIsLoading(false);
            toast.error(error.message || "Invalid OTP.");
            return false;
        }
    };

    const resendOtp = async (userId: string) => {
        try {
            const res = await fetch(`/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("New OTP sent via WhatsApp");
                return true;
            } else {
                throw new Error(data.error || "Failed to resend OTP");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to resend OTP.");
            return false;
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('topstore_user');
    };

    const adminLogout = () => {
        setAdminUser(null);
        localStorage.removeItem('topstore_admin');
    };

    return (
        <AuthContext.Provider value={{ user, adminUser, login, signup, verifyOtp, resendOtp, logout, adminLogout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
