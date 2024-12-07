// app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";

export default function SignInPage() {
    const [authProvider, setAuthProvider] = useState<string>("");
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url');

    useEffect(() => {
        setAuthProvider(process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'clerk');
    }, []);

    if (authProvider === 'clerk') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <SignIn
                    redirectUrl={redirectUrl || '/'}
                    appearance={{
                        elements: {
                            rootBox: "w-full mx-auto",
                            card: "shadow-none w-full max-w-md mx-auto",
                            headerTitle: "text-2xl font-bold text-center",
                            headerSubtitle: "text-center text-muted-foreground",
                            formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
                            footerAction: "hidden",
                        },
                    }}
                />
            </div>
        );
    }

    return <PhoneAuthForm />;
}