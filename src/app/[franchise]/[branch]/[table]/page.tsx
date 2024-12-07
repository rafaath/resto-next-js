// app/[franchise]/[branch]/[table]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TablePinInput } from "@/components/table/table-pin-input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserStatus {
    message: string;
    status: "unauthorized" | "awaiting" | "invalid" | "verified";
    table_pin: string | null;
}

interface PageProps {
    params: {
        franchise: string;
        branch: string;
        table: string;
    };
}

export default function TablePage({ params }: PageProps) {
    const { franchise, branch, table } = params;
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                let headers: Record<string, string> = {};
                if (user) {
                    const token = await getToken();
                    if (token) {
                        headers["Authorization"] = `Bearer ${token}`;
                    }
                }

                console.log("Checking status...");
                const response = await axios.get<UserStatus>(
                    `https://menubot-backend.onrender.com/user_status/${franchise}/${branch}/${table}`,
                    { headers }
                );

                console.log("Status response:", response.data);
                setStatus(response.data);

                if (response.data.status === "unauthorized" && !user) {
                    console.log("Redirecting to sign in...");
                    const currentPath = `/${franchise}/${branch}/${table}`;
                    router.push(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
                }

            } catch (error: any) {
                console.error("Full error:", error);
                let errorMessage = "Failed to check table status";
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                    errorMessage = error.response.data.message || errorMessage;
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isUserLoaded) {
            checkStatus();
        }
    }, [isUserLoaded, user, franchise, branch, table]);

    // Show loading state
    if (!isUserLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Handle unauthorized case (for both no user and invalid/expired token)
    if (!user || status?.status === "unauthorized") {
        const currentPath = `/${franchise}/${branch}/${table}`;
        router.push(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (status?.status === "invalid") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Table</h1>
                    <p className="text-gray-600">{status.message}</p>
                </div>
            </div>
        );
    }

    if (status?.status === "verified") {
        return (
            <div className="min-h-screen p-4">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Welcome to Digital Menu</h1>
                    <p className="text-gray-600">Table: {table}</p>
                    <p className="text-gray-600">Branch: {branch}</p>
                    <p className="text-gray-600">Franchise: {franchise}</p>
                </div>
            </div>
        );
    }

    if (status?.status === "awaiting") {
        return <TablePinInput
            franchise={franchise}
            branch={branch}
            table={table}
            onPinVerified={() => {
                setStatus(null);
                setIsLoading(true);
            }}
        />;
    }

    // Fallback loading state
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}