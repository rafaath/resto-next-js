// components/search/search-bar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Search, Bot } from "lucide-react";
import { useMenu } from "@/lib/menu/menu-provider";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
    franchise: string;
    branch: string;
    table: string;
    onAskAI: (query: string) => void;
}

export function SearchBar({ franchise, branch, table, onAskAI }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { menu, isLoading, error, fetchMenu, searchMenu } = useMenu();
    const searchResults = searchMenu(query);

    // Fetch menu data when component mounts
    useEffect(() => {
        if (menu.length === 0 && !isLoading && !error) {
            fetchMenu(franchise, branch, table);
        }
    }, [franchise, branch, table]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle "Enter" key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            onAskAI(query);
            setQuery("");
            setShowResults(false);
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
            <div className="relative">
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Search menu or press Enter to ask AI..."
                    className="pr-16"
                />
                <Bot
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
                        ${query.trim() ? 'text-blue-500 cursor-pointer' : 'text-gray-400'}`}
                    onClick={() => {
                        if (query.trim()) {
                            onAskAI(query);
                            setQuery("");
                            setShowResults(false);
                        }
                    }}
                />
            </div>

            {/* Search Results Dropdown */}
            {showResults && query.trim() && (
                <Card className="absolute z-50 w-full mt-2 shadow-lg">
                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-2 space-y-2">
                            {searchResults.length > 0 ? (
                                searchResults.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                                        onClick={() => setShowResults(false)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{item.name_of_item}</h4>
                                                    <Badge variant="outline">{item.veg_or_non_veg}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <span className="font-medium">₹{item.cost}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    <p>No menu items found</p>
                                    <p className="text-sm mt-1">Press Enter or click the AI icon to ask about "{query}"</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            )}
        </div>
    );
}