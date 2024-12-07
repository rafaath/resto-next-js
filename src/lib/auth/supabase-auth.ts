import { createClient } from '@supabase/supabase-js';
import { AuthService, AuthResponse, AuthUser } from './types';

export class SupabaseAuthService implements AuthService {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

    async signIn(phoneNumber: string): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabase.auth.signInWithOtp({
                phone: phoneNumber
            });

            if (error) throw error;

            return { user: null }; // User will be null until OTP verification
        } catch (error) {
            return { user: null, error: 'Sign in failed' };
        }
    }

    async verifyOTP(phoneNumber: string, code: string): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabase.auth.verifyOtp({
                phone: phoneNumber,
                token: code,
                type: 'sms'
            });

            if (error) throw error;

            const user: AuthUser = {
                id: data.user?.id ?? '',
                phoneNumber: data.user?.phone ?? '',
            };

            return { user };
        } catch (error) {
            return { user: null, error: 'Verification failed' };
        }
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
    }

    async getUser(): Promise<AuthUser | null> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return null;

        return {
            id: user.id,
            phoneNumber: user.phone ?? undefined,
            email: user.email ?? undefined,
        };
    }
}