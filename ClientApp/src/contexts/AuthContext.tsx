import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message?: string }>;
    register: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        surname: string;
        phoneNumber?: string;
    }) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string, rememberMe: boolean) => {
        try {
            const response = await authService.login({ email, password, rememberMe });
            if (response.success && response.user) {
                setUser(response.user);
                return { success: true };
            }
            return { success: false, message: response.message || 'Login failed' };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (data: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        surname: string;
        phoneNumber?: string;
    }) => {
        try {
            const response = await authService.register(data);
            if (response.success && response.user) {
                setUser(response.user);
                return { success: true };
            }
            return { success: false, message: response.message || 'Registration failed' };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    const refreshUser = async () => {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
