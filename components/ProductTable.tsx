import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { StockStatus } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (id: string, amount: number) => void;
  isMobileView: boolean;
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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, onAdjustStock, isMobileView }) => {
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
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
    }, [products, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    
    if (isMobileView) {
        return (
            <div className="p-4 space-y-4">
                {sortedProducts.length > 0 ? sortedProducts.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-3 bg-light">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                <p className="text-sm text-gray-500">Danh mục: {product.category}</p>
                            </div>
                            <StatusBadge status={getStatus(product.quantity)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-600">Giá (Sống)</p>
                                <p>{formatCurrency(product.priceRaw)}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Giá (Chín)</p>
                                <p>{formatCurrency(product.priceCooked)}</p>
                            </div>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-semibold text-gray-600">Số lượng:</span>
                               <button onClick={() => onAdjustStock(product.id, -1)} className="text-gray-400 hover:text-danger transition"><MinusCircleIcon className="w-6 h-6"/></button>
                                <span className="text-lg font-bold">{product.quantity.toLocaleString('vi-VN')}</span>
                               <button onClick={() => onAdjustStock(product.id, 1)} className="text-gray-400 hover:text-secondary transition"><PlusCircleIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onEdit(product)} className="p-2 text-primary hover:text-primary-hover transition" aria-label="Chỉnh sửa sản phẩm"><EditIcon className="w-5 h-5" /></button>
                                <button onClick={() => onDelete(product.id)} className="p-2 text-danger hover:text-danger-hover transition" aria-label="Xóa sản phẩm"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-10 text-gray-500">
                        Không tìm thấy sản phẩm nào.
                    </div>
                )}
            </div>
        )
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
                    <SortableHeader sortKeyName="priceRaw">Giá (Sống / Chín)</SortableHeader>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.length > 0 ? sortedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                               <button onClick={() => onAdjustStock(product.id, -1)} className="text-gray-400 hover:text-danger transition"><MinusCircleIcon className="w-5 h-5"/></button>
                                <span>{product.quantity.toLocaleString('vi-VN')}</span>
                               <button onClick={() => onAdjustStock(product.id, 1)} className="text-gray-400 hover:text-secondary transition"><PlusCircleIcon className="w-5 h-5"/></button>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatCurrency(product.priceRaw)}</div>
                            <div>{formatCurrency(product.priceCooked)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={getStatus(product.quantity)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-4">
                                <button onClick={() => onEdit(product)} className="text-primary hover:text-primary-hover transition">
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onDelete(product.id)} className="text-danger hover:text-danger-hover transition">
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
