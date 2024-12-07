export type AuthProvider = 'clerk' | 'supabase';

export interface AuthUser {
    id: string;
    phoneNumber?: string;
    email?: string;
    name?: string;
}

export interface AuthResponse {
    user: AuthUser | null;
    error?: string;
}

export interface AuthService {
    signIn: (phoneNumber: string) => Promise<AuthResponse>;
    verifyOTP: (phoneNumber: string, code: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    getUser: () => Promise<AuthUser | null>;
}