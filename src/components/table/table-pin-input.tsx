// components/table/table-pin-input.tsx
"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TablePinInputProps {
    franchise: string;
    branch: string;
    table: string;
    onPinVerified: () => void;
}

export function TablePinInput({ franchise, branch, table, onPinVerified }: TablePinInputProps) {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const { getToken } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsLoading(true);
            const token = await getToken();

            await axios.post(
                `https://menubot-backend.onrender.com/login/${franchise}/${branch}/${table}`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "table-pin": pin
                    }
                }
            );

            toast({
                title: "Success",
                description: "Table pin verified successfully",
            });

            // Instead of reloading, call the callback to check status
            onPinVerified();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to verify table pin",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Enter Table PIN</h2>
                    <p className="text-sm text-muted-foreground">
                        Please enter the PIN provided by your waiter
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter 6-digit PIN"
                            className="text-center text-2xl tracking-widest"
                            pattern="[0-9]*"
                            inputMode="numeric"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || pin.length !== 6}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Verify PIN"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}