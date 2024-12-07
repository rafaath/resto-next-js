"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMenu } from "@/lib/menu/menu-provider";

interface MenuItem {
    id: string;
    name_of_item: string;
    description: string;
    cost: number;
    category: string;
    veg_or_non_veg: string;
}

interface ComboItem {
    id: string;
    name_of_item: string;
    description: string;
    cost: number;
    category: string;
    veg_or_non_veg: string;
}

interface Combo {
    combo_id: string;
    combo_name: string;
    description: string;
    cost: number;
    discounted_cost: number;
    has_discount: boolean;
    discount_pct: number;
    combo_items: ComboItem[];
}

interface MenuOverlayProps {
    franchise: string;
    branch: string;
    table: string;
    onClose: () => void;
}

export function MenuOverlay({ franchise, branch, table, onClose }: MenuOverlayProps) {
    const [combos, setCombos] = useState<Combo[]>([]);
    const [isLoadingCombos, setIsLoadingCombos] = useState(true);
    const { getToken } = useAuth();
    const { addItem } = useCart();
    const { toast } = useToast();
    const { menu, isLoading, error, fetchMenu } = useMenu();

    useEffect(() => {
        // Only fetch menu if it's not already loaded
        if (menu.length === 0) {
            fetchMenu(franchise, branch, table);
        }

        const fetchCombos = async () => {
            try {
                setIsLoadingCombos(true);
                const token = await getToken();

                const response = await axios.get(
                    `https://menubot-backend.onrender.com/get_all_combos/${franchise}/${branch}/${table}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data) {
                    setCombos(response.data);
                }
            } catch (error) {
                console.error("Error fetching combos:", error);
            } finally {
                setIsLoadingCombos(false);
            }
        };

        fetchCombos();
    }, [franchise, branch, table, getToken, menu.length, fetchMenu]);

    const handleAddToCart = (item: MenuItem) => {
        addItem({
            id: item.id,
            name: item.name_of_item,
            price: item.cost,
        });
        toast({
            title: "Added to cart",
            description: `${item.name_of_item} has been added to your order.`,
        });
    };

    const handleAddComboToCart = (combo: Combo) => {
        addItem({
            id: combo.combo_id,
            name: combo.combo_name,
            price: combo.discounted_cost || combo.cost,
        });
        toast({
            title: "Added to cart",
            description: `${combo.combo_name} has been added to your order.`,
        });
    };

    if (isLoading || isLoadingCombos) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Menu</h2>
                        <Button variant="ghost" onClick={onClose}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[80vh]">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold">Menu</h2>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <Tabs defaultValue="menu" className="flex-1 flex flex-col">
                    <TabsList className="px-4 py-2">
                        <TabsTrigger value="menu">À la carte</TabsTrigger>
                        <TabsTrigger value="combos">Combos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="menu" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4">
                                {menu.length === 0 ? (
                                    <p>No menu items available</p>
                                ) : (
                                    <div className="space-y-8">
                                        {Object.entries(
                                            menu.reduce((acc, item) => {
                                                if (!acc[item.category]) {
                                                    acc[item.category] = [];
                                                }
                                                acc[item.category].push(item);
                                                return acc;
                                            }, {} as Record<string, MenuItem[]>)
                                        ).map(([category, items]) => (
                                            <div key={category} className="border-t pt-4">
                                                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                                                <div className="space-y-4">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="border-b pb-4">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 mr-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium">{item.name_of_item}</p>
                                                                        <Badge variant="outline">{item.veg_or_non_veg}</Badge>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                                                                    <p className="font-medium mt-2">₹{item.cost}</p>
                                                                </div>
                                                                <Button
                                                                    onClick={() => handleAddToCart(item)}
                                                                    size="sm"
                                                                    className="shrink-0"
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="combos" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-6">
                                {combos.length === 0 ? (
                                    <p>No combo meals available</p>
                                ) : (
                                    combos.map((combo) => (
                                        <div key={combo.combo_id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold">{combo.combo_name}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {combo.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {combo.has_discount ? (
                                                            <>
                                                                <span className="text-lg font-bold">₹{combo.discounted_cost}</span>
                                                                <span className="text-sm line-through text-gray-500">₹{combo.cost}</span>
                                                                <Badge variant="destructive">{combo.discount_pct}% OFF</Badge>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold">₹{combo.cost}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleAddComboToCart(combo)}
                                                    size="sm"
                                                    className="shrink-0"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add
                                                </Button>
                                            </div>

                                            <div className="border-t pt-3">
                                                <p className="font-medium text-sm mb-2">Includes:</p>
                                                <div className="space-y-2">
                                                    {combo.combo_items.map((item) => (
                                                        <div key={item.id} className="flex items-start">
                                                            <span className="text-sm mr-2">•</span>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{item.name_of_item}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}