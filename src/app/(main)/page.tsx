// app/(main)/page.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in"); // Redirect to sign-in after signing out
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome to RestoChat</h1>
            <p className="mb-4">Your phone: {user?.phoneNumbers?.[0]?.phoneNumber}</p>
            <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
}