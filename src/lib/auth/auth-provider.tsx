// lib/auth/auth-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthProvider, AuthService, AuthUser } from './types';
import { ClerkAuthService } from './clerk-auth';
import { SupabaseAuthService } from './supabase-auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (phoneNumber: string) => Promise<void>;
    verifyOTP: (phoneNumber: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [authService, setAuthService] = useState<AuthService | null>(null);

    useEffect(() => {
        const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProvider || 'clerk';
        const service = provider === 'supabase' ? new SupabaseAuthService() : new ClerkAuthService();
        setAuthService(service);
    }, []);

    useEffect(() => {
        if (authService) {
            const initAuth = async () => {
                const user = await authService.getUser();
                setUser(user);
                setLoading(false);
            };

            initAuth();
        }
    }, [authService]);

    const value = {
        user,
        loading,
        signIn: async (phoneNumber: string) => {
            if (!authService) throw new Error('Auth service not initialized');
            const response = await authService.signIn(phoneNumber);
            if (response.user) setUser(response.user);
            if (response.error) throw new Error(response.error);
        },
        verifyOTP: async (phoneNumber: string, code: string) => {
            if (!authService) throw new Error('Auth service not initialized');
            const response = await authService.verifyOTP(phoneNumber, code);
            if (response.user) setUser(response.user);
            if (response.error) throw new Error(response.error);
        },
        signOut: async () => {
            if (!authService) throw new Error('Auth service not initialized');
            await authService.signOut();
            setUser(null);
        },
    };

    if (!authService) return null;  // or a loading spinner

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};