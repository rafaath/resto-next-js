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

    const checkStatus = async () => {
        try {
            let headers: Record<string, string> = {};
            if (user) {
                const token = await getToken();
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
            }

            const response = await axios.get<UserStatus>(
                `https://menubot-backend.onrender.com/user_status/${franchise}/${branch}/${table}`,
                { headers }
            );

            setStatus(response.data);

            // If unauthorized and user not logged in, redirect to sign in
            if (response.data.status === "unauthorized" && !user) {
                const currentPath = `/${franchise}/${branch}/${table}`;
                router.push(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
            }

        } catch (error) {
            console.error("Error checking status:", error);
            toast({
                title: "Error",
                description: "Failed to check table status",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isUserLoaded) {
            checkStatus();
        }
    }, [isUserLoaded, user]);

    if (isLoading) {
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
            onPinVerified={checkStatus}
        />;
    }

    // unauthorized state
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                <p className="text-gray-600">Sign in to access the menu</p>
            </div>
        </div>
    );
}