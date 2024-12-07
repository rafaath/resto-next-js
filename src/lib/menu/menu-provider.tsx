"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export interface MenuItem {
    id: string;
    name_of_item: string;
    description: string;
    cost: number;
    category: string;
    veg_or_non_veg: string;
}

interface MenuContextType {
    menu: MenuItem[];
    isLoading: boolean;
    error: string | null;
    fetchMenu: (franchise: string, branch: string, table: string) => Promise<void>;
    searchMenu: (query: string) => MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    const fetchMenu = async (franchise: string, branch: string, table: string) => {
        // If menu is already loaded, don't fetch again
        if (menu.length > 0) return;

        try {
            setIsLoading(true);
            setError(null);
            const token = await getToken();

            const response = await axios.get(
                `/api/menu/${franchise}/${branch}/${table}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                setMenu(response.data);
            }
        } catch (error: any) {
            console.error("Error fetching menu:", error);
            let errorMessage = "Failed to load menu. ";

            if (error.response) {
                errorMessage += error.response.data?.error || error.response.statusText;
            } else if (error.message) {
                errorMessage += error.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const searchMenu = (query: string) => {
        if (!query) return [];

        const searchTerm = query.toLowerCase();
        return menu.filter(item => {
            const nameMatch = (item.name_of_item || '').toLowerCase().includes(searchTerm);
            const descMatch = item.description ? item.description.toLowerCase().includes(searchTerm) : false;
            const categoryMatch = (item.category || '').toLowerCase().includes(searchTerm);

            return nameMatch || descMatch || categoryMatch;
        });
    };

    return (
        <MenuContext.Provider value={{ menu, isLoading, error, fetchMenu, searchMenu }}>
            {children}
        </MenuContext.Provider>
    );
}

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};