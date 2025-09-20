import { useState } from 'react';
import type { CustomerOrder } from '../types';
import { OrderStatus, ProductState } from '../types';

const initialOrders: CustomerOrder[] = [
    {
        id: 'order-1',
        customerName: 'Nguyễn Văn An',
        group: 'Khách lẻ',
        items: [
            { productId: '1', productName: 'Trà Xanh Hữu Cơ', quantity: 2, price: 299000, state: ProductState.Raw },
            { productId: '3', productName: 'Dầu Ô Liu Cao Cấp', quantity: 1, price: 550000, state: ProductState.Raw }
        ],
        status: OrderStatus.Pending,
        createdAt: new Date('2024-07-28T10:00:00Z').toISOString()
    },
    {
        id: 'order-2',
        customerName: 'Trần Thị Bích',
        group: 'Nhà hàng Sen',
        items: [
            { productId: '2', productName: 'Bánh Mì Sourdough Thủ Công', quantity: 5, price: 95000, state: ProductState.Cooked },
        ],
        status: OrderStatus.Completed,
        createdAt: new Date('2024-07-27T14:30:00Z').toISOString()
    },
    {
        id: 'order-3',
        customerName: 'Lê Hoàng Cường',
        group: 'Sự kiện Cưới',
        items: [
            { productId: '5', productName: 'Phô Mai Cheddar Ủ Lâu Năm', quantity: 1, price: 350000, state: ProductState.Raw },
            { productId: '6', productName: 'Chảo Inox Không Gỉ', quantity: 1, price: 1200000, state: ProductState.Raw }
        ],
        status: OrderStatus.Pending,
        createdAt: new Date('2024-07-29T09:15:00Z').toISOString()
    }
];

export const useOrders = () => {
    const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);

    const addOrder = (orderData: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => {
        const newOrder: CustomerOrder = {
            ...orderData,
            id: `order-${new Date().getTime()}`,
            status: OrderStatus.Pending,
            createdAt: new Date().toISOString()
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
    };

    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status } : order
            )
        );
    };

    const updateOrder = (orderId: string, updatedOrderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'status'>) => {
        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order, 
                        customerName: updatedOrderData.customerName,
                        group: updatedOrderData.group,
                        items: updatedOrderData.items,
                    };
                }
                return order;
            })
        );
    };

    const deleteOrder = (orderId: string) => {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    };

    return {
        orders,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
    };
};
