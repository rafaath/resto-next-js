// components/navigation/mobile-nav.tsx
"use client";

import { useState } from "react";
import {
    Home,
    Menu as MenuIcon,
    MessageCircle,
    ClipboardList,
    Bell,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-provider";

interface NavItem {
    id: string;
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    showBadge?: boolean;
}

interface MobileNavProps {
    onShowMenu: () => void;
    onShowOrders: () => void;
    onShowChat: () => void;
}

export function MobileNav({ onShowMenu, onShowOrders, onShowChat }: MobileNavProps) {
    const [activeTab, setActiveTab] = useState('home');
    const { state } = useCart();

    const cartItemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    const navItems: NavItem[] = [
        {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-6 w-6" />,
            onClick: () => setActiveTab('home')
        },
        {
            id: 'chat',
            label: 'Chat',
            icon: <MessageCircle className="h-6 w-6" />,
            onClick: () => {
                setActiveTab('chat');
                onShowChat();
            }
        },
        {
            id: 'menu',
            label: 'Menu',
            icon: <MenuIcon className="h-6 w-6" />,
            onClick: () => {
                setActiveTab('menu');
                onShowMenu();
            }
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: <ClipboardList className="h-6 w-6" />,
            onClick: () => {
                setActiveTab('orders');
                onShowOrders();
            },
            showBadge: cartItemCount > 0
        },
        {
            id: 'waiter',
            label: 'Call Waiter',
            icon: <Bell className="h-6 w-6" />,
            onClick: () => setActiveTab('waiter')
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`flex flex-col items-center justify-center w-full h-full relative
                            ${activeTab === item.id ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                        {item.showBadge && cartItemCount > 0 && (
                            <span className="absolute top-0 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}