// components/chat/chat-overlay.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatOverlayProps {
    franchise: string;
    branch: string;
    table: string;
    onClose: () => void;
}

interface ChatOverlayProps {
    franchise: string;
    branch: string;
    table: string;
    initialQuery?: string;
    onClose: () => void;
}

export function ChatOverlay({
    franchise,
    branch,
    table,
    initialQuery,
    onClose
}: ChatOverlayProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const initialQuerySent = useRef(false);
    const { getToken } = useAuth();

    // Handle initial query
    useEffect(() => {
        if (initialQuery && !initialQuerySent.current && messages.length === 0) {
            initialQuerySent.current = true;
            sendMessage(initialQuery);
        }
    }, [initialQuery, messages.length]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        try {
            setIsLoading(true);
            const token = await getToken();

            // Add user message to chat
            const userMessage: Message = {
                id: Date.now().toString(),
                content: content,
                isBot: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);

            // Call AI endpoint
            const response = await axios.get(
                `https://menubot-backend.onrender.com/chat/${franchise}/${branch}/${table}`,
                {
                    params: {
                        query: content,
                        ...(chatId && { chat_id: chatId })
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            // If response includes a chat_id, store it for subsequent requests
            if (response.data.chat_id) {
                setChatId(response.data.chat_id);
            }

            // Add bot response to chat
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response.data.response || response.data,
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message to chat
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: "Sorry, I couldn't process your request. Please try again.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !inputValue.trim()) return;

        await sendMessage(inputValue);
        setInputValue("");
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Menu Assistant</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about our menu!</p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Chat Area */}
                <ScrollArea
                    ref={scrollAreaRef}
                    className="flex-1 p-4"
                >
                    <div className="space-y-4">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <div className="flex justify-center p-4">
                                <div className="max-w-sm text-center space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Hello! I'm your menu assistant. You can ask me about:
                                    </p>
                                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                        <li>• Dish ingredients and allergens</li>
                                        <li>• Dietary preferences (veg, vegan, gluten-free)</li>
                                        <li>• Popular dishes and recommendations</li>
                                        <li>• Spice levels and portion sizes</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3 max-w-[80%]",
                                    message.isBot ? "mr-auto" : "ml-auto"
                                )}
                            >
                                {/* Message Bubble */}
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-2 text-sm",
                                        message.isBot
                                            ? "bg-gray-100 dark:bg-gray-800"
                                            : "bg-blue-500 text-white"
                                    )}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about our menu..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}