

import React, { useState, useMemo } from 'react';
// FIX: The type 'InventoryItem' is not exported from '../types'. Using 'Product' instead as it matches the structure.
import type { Product } from '../types';
import { StockStatus } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';

interface InventoryTableProps {
  items: Product[];
  onEdit: (item: Product) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (id: string, amount: number) => void;
}

type SortKey = keyof Product;
type SortOrder = 'asc' | 'desc';

const LOW_STOCK_THRESHOLD = 10;

const getStatus = (quantity: number): StockStatus => {
  if (quantity === 0) return StockStatus.OutOfStock;
  if (quantity <= LOW_STOCK_THRESHOLD) return StockStatus.LowStock;
  return StockStatus.InStock;
};

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';
  const statusClasses = {
    [StockStatus.InStock]: 'bg-green-100 text-green-800',
    [StockStatus.LowStock]: 'bg-yellow-100 text-yellow-800',
    [StockStatus.OutOfStock]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

export const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete, onAdjustStock }) => {
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB, 'vi') : valB.localeCompare(valA, 'vi');
            }

            if (valA < valB) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [items, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    const SortableHeader: React.FC<{ sortKeyName: SortKey, children: React.ReactNode }> = ({ sortKeyName, children }) => {
        const isActive = sortKey === sortKeyName;
        return (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort(sortKeyName)}>
                <div className="flex items-center gap-1">
                    {children}
                    {isActive && (sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}
                </div>
            </th>
        );
    }
    
  return (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <SortableHeader sortKeyName="name">Tên sản phẩm</SortableHeader>
                    <SortableHeader sortKeyName="sku">SKU</SortableHeader>
                    <SortableHeader sortKeyName="category">Danh mục</SortableHeader>
                    <SortableHeader sortKeyName="quantity">Số lượng</SortableHeader>
                    {/* FIX: The sort key 'price' is not a valid key for type 'Product'. Changed to 'priceRaw' for correct sorting. */}
                    <SortableHeader sortKeyName="priceRaw">Giá (Sống / Chín)</SortableHeader>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.length > 0 ? sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                               <button onClick={() => onAdjustStock(item.id, -1)} className="text-gray-400 hover:text-danger transition"><MinusCircleIcon className="w-5 h-5"/></button>
                                <span>{item.quantity.toLocaleString('vi-VN')}</span>
                               <button onClick={() => onAdjustStock(item.id, 1)} className="text-gray-400 hover:text-secondary transition"><PlusCircleIcon className="w-5 h-5"/></button>
                            </div>
                        </td>
                        {/* FIX: Property 'price' does not exist on type 'Product'. Displaying 'priceRaw' and 'priceCooked' instead. */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatCurrency(item.priceRaw)}</div>
                            <div>{formatCurrency(item.priceCooked)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={getStatus(item.quantity)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-4">
                                <button onClick={() => onEdit(item)} className="text-primary hover:text-primary-hover transition">
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onDelete(item.id)} className="text-danger hover:text-danger-hover transition">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-500">
                            Không tìm thấy sản phẩm nào. Thử tìm kiếm khác.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};