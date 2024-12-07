// components/auth/phone-auth-form.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Loader2 } from "lucide-react";

export function PhoneAuthForm() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const { signIn, verifyOTP } = useAuth();
    const { toast } = useToast();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await signIn(phoneNumber);
            setShowOTP(true);
            toast({
                title: "OTP Sent!",
                description: "Please check your phone for the verification code.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await verifyOTP(phoneNumber, otpCode);
            toast({
                title: "Success!",
                description: "Phone number verified successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        Welcome to RestoChat
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your AI-powered restaurant companion
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!showOTP ? (
                        <motion.form
                            key="phone-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onSubmit={handleSendOTP}
                            className="mt-8 space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="phone">
                                    Phone Number
                                </label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 9999999999"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !phoneNumber}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onSubmit={handleVerifyOTP}
                            className="mt-8 space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="otp">
                                    Enter OTP
                                </label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="block w-full"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading || !otpCode}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowOTP(false)}
                                    disabled={isLoading}
                                >
                                    Back to Phone Number
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}