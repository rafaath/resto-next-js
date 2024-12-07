// components/orders/orders-overlay.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-provider";
import { Minus, Plus, X, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import _ from 'lodash';

interface OrdersOverlayProps {
    franchise: string;
    branch: string;
    table: string;
    onClose: () => void;
}

interface OrderItem {
    id: string;
    order_id: string;
    item_id: string;
    quantity: number;
    item_special_requests: string;
    is_combo: boolean;
    combo_id: string | null;
    order_number: string | null;
    created_at: string;
    served_at: string | null;
    order_special_requests: string;
    first_name: string | null;
}

interface GroupedOrder {
    order_id: string;
    created_at: string;
    items: OrderItem[];
    order_special_requests: string;
}

export function OrdersOverlay({ franchise, branch, table, onClose }: OrdersOverlayProps) {
    const { state, updateQuantity, removeItem, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [placedOrders, setPlacedOrders] = useState<GroupedOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [specialRequests, setSpecialRequests] = useState("");
    const [isRush, setIsRush] = useState(false);
    const { toast } = useToast();
    const { getToken } = useAuth();

    const totalAmount = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Fetch placed orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoadingOrders(true);
                const token = await getToken();
                const response = await axios.get<OrderItem[]>(
                    `https://menubot-backend.onrender.com/order/${franchise}/${branch}/${table}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    }
                );

                // Group orders by order_id
                const groupedOrders = _(response.data)
                    .groupBy('order_id')
                    .map((items, order_id) => ({
                        order_id,
                        created_at: items[0].created_at,
                        items,
                        order_special_requests: items[0].order_special_requests
                    }))
                    .value();

                console.log('Grouped orders:', groupedOrders);
                setPlacedOrders(groupedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({
                    title: "Failed to load orders",
                    description: "Could not fetch your order history",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [franchise, branch, table, getToken]);

    const handlePlaceOrder = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();

            const orderData = {
                order_items: state.items.map(item => item.id),
                is_combo: state.items.map(() => false),
                quantities: state.items.map(item => item.quantity),
                item_special_requests: state.items.map(() => ""),
                total_amount: totalAmount,
                order_special_requests: specialRequests,
                is_rush: isRush
            };

            await axios.post(
                `https://menubot-backend.onrender.com/order/${franchise}/${branch}/${table}`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Refresh orders list
            const ordersResponse = await axios.get<OrderItem[]>(
                `https://menubot-backend.onrender.com/order/${franchise}/${branch}/${table}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            // Group the refreshed orders
            const groupedOrders = _(ordersResponse.data)
                .groupBy('order_id')
                .map((items, order_id) => ({
                    order_id,
                    created_at: items[0].created_at,
                    items,
                    order_special_requests: items[0].order_special_requests
                }))
                .value();

            setPlacedOrders(groupedOrders);

            toast({
                title: "Order placed successfully!",
                description: "Your order has been sent to the kitchen.",
            });

            clearCart();
        } catch (error: any) {
            console.error("Error placing order:", error);
            toast({
                title: "Failed to place order",
                description: error.response?.data?.detail || "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getOrderStatus = (order: GroupedOrder) => {
        if (order.items.every(item => item.served_at)) return "Served";
        return "Preparing";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Preparing':
                return 'bg-blue-500';
            case 'Served':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold">Orders</h2>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <Tabs defaultValue="cart" className="flex-1 flex flex-col">
                    <TabsList className="px-4 py-2">
                        <TabsTrigger value="cart">Cart</TabsTrigger>
                        <TabsTrigger value="orders">Order History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cart" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full px-4">
                            {state.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[60vh]">
                                    <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                                </div>
                            ) : (
                                // Cart content remains the same
                                <div className="space-y-4">
                                    {state.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border-b pb-4 flex justify-between items-center"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            updateQuantity(item.id, item.quantity - 1);
                                                        } else {
                                                            removeItem(item.id);
                                                        }
                                                    }}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="space-y-4 mt-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Special Requests</label>
                                            <Input
                                                placeholder="Any special requests for your order?"
                                                value={specialRequests}
                                                onChange={(e) => setSpecialRequests(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="rush"
                                                checked={isRush}
                                                onCheckedChange={(checked) => setIsRush(checked as boolean)}
                                            />
                                            <label
                                                htmlFor="rush"
                                                className="text-sm font-medium leading-none"
                                            >
                                                Rush Order
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="font-semibold">₹{totalAmount}</span>
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handlePlaceOrder}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="orders" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full px-4">
                            {isLoadingOrders ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : placedOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[60vh]">
                                    <p className="text-gray-500 dark:text-gray-400">No orders placed yet</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {placedOrders.map((order) => {
                                        const status = getOrderStatus(order);
                                        return (
                                            <div
                                                key={order.order_id}
                                                className="border rounded-lg p-4 space-y-3"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDateTime(order.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="font-medium mt-1">
                                                            Order #{order.order_id.slice(-4)}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(status)}>
                                                        {status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="text-sm">
                                                            <span className="font-medium">{item.quantity}x </span>
                                                            <span>{item.item_id}</span>
                                                            {item.item_special_requests && (
                                                                <p className="text-gray-500 text-xs ml-4">
                                                                    Note: {item.item_special_requests}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {order.order_special_requests && (
                                                    <p className="text-sm text-gray-600">
                                                        Order Note: {order.order_special_requests}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}