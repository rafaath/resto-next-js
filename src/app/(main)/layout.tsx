// app/(main)/layout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return <div className="min-h-screen bg-background">{children}</div>;
}