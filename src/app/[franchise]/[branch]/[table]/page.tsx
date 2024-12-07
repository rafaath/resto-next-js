// app/[franchise]/[branch]/[table]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TablePinInput } from "@/components/table/table-pin-input";
import { MenuOverlay } from "@/components/menu/menu-overlay";
import { OrdersOverlay } from "@/components/orders/orders-overlay";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { CartProvider } from "@/lib/cart/cart-provider";
import { ChatOverlay } from "@/components/chat/chat-overlay";
import { SearchBar } from "@/components/search/search-bar";
import { MenuProvider } from "@/lib/menu/menu-provider";

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

function TablePageContent({ params }: PageProps) {
    const { franchise, branch, table } = params;
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [initialChatQuery, setInitialChatQuery] = useState<string>();
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        // Add this log to verify params
        console.log("Table params:", { franchise, branch, table });
    }, [franchise, branch, table]);

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

            if (response.data.status === "unauthorized" && !user) {
                const currentPath = `/${franchise}/${branch}/${table}`;
                router.push(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
            }

            return response.data;
        } catch (error: any) {
            let errorMessage = "Failed to check table status";
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isUserLoaded) {
            checkStatus();
        }
    }, [isUserLoaded, user]);

    const handlePinVerified = async () => {
        try {
            const newStatus = await checkStatus();
            if (newStatus.status === "verified") {
                setStatus(newStatus);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error checking status after pin verification:", error);
        }
    };

    if (!isUserLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

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

    // Add SearchBar to the verified status return section
    if (status?.status === "verified") {
        return (
            <>
                <div className="min-h-screen p-4 pb-20">
                    <div className="mb-8">
                        <SearchBar
                            franchise={franchise}
                            branch={branch}
                            table={table}
                            onAskAI={(query) => {
                                // First set the query, then show chat
                                setInitialChatQuery(query);
                                setTimeout(() => setShowChat(true), 50);
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Welcome to Digital Menu</h1>
                        <div className="space-y-2">
                            <p className="text-gray-600">Table: {table}</p>
                            <p className="text-gray-600">Branch: {branch}</p>
                            <p className="text-gray-600">Franchise: {franchise}</p>
                            <p className="text-gray-600">Table PIN: {status.table_pin}</p>
                        </div>
                    </div>

                    {showMenu && (
                        <MenuOverlay
                            franchise={franchise}
                            branch={branch}
                            table={table}
                            onClose={() => setShowMenu(false)}
                        />
                    )}

                    {showOrders && (
                        <OrdersOverlay
                            franchise={franchise}
                            branch={branch}
                            table={table}
                            onClose={() => setShowOrders(false)}
                        />
                    )}

                    {showChat && (
                        <ChatOverlay
                            franchise={franchise}
                            branch={branch}
                            table={table}
                            initialQuery={initialChatQuery}
                            onClose={() => {
                                setShowChat(false);
                                setInitialChatQuery(undefined);
                            }}
                        />
                    )}
                </div>
                <MobileNav
                    onShowMenu={() => setShowMenu(true)}
                    onShowOrders={() => setShowOrders(true)}
                    onShowChat={() => setShowChat(true)}
                />
            </>
        );
    }

    if (status?.status === "awaiting") {
        return (
            <TablePinInput
                franchise={franchise}
                branch={branch}
                table={table}
                onPinVerified={handlePinVerified}
            />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function TablePage(props: PageProps) {
    return (
        <CartProvider>
            <MenuProvider>
                <TablePageContent {...props} />
            </MenuProvider>
        </CartProvider>
    );
}