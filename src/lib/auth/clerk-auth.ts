import { SignIn, useAuth as useClerkAuth, useSignIn } from "@clerk/nextjs";
import { AuthService, AuthResponse, AuthUser } from './types';

export class ClerkAuthService implements AuthService {
    async signIn(phoneNumber: string): Promise<AuthResponse> {
        try {
            // This is only implemented for Supabase
            // Clerk uses their own UI components
            throw new Error('Use Clerk components for phone sign in');
        } catch (error) {
            return { user: null, error: 'Sign in failed' };
        }
    }

    async verifyOTP(phoneNumber: string, code: string): Promise<AuthResponse> {
        try {
            // This is only implemented for Supabase
            // Clerk uses their own UI components
            throw new Error('Use Clerk components for OTP verification');
        } catch (error) {
            return { user: null, error: 'Verification failed' };
        }
    }

    async signOut(): Promise<void> {
        // This will be handled by Clerk's components
    }

    async getUser(): Promise<AuthUser | null> {
        // This will be handled by Clerk's hooks
        return null;
    }
}