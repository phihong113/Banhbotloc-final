import React, { useMemo, useState } from 'react';
import type { Product, CustomerOrder } from '../types';
import { OrderStatus } from '../types';
import { StatCard } from './StatCard';
import { getRestockSuggestions } from '../services/geminiService';

import { DollarSignIcon } from './icons/DollarSignIcon';
import { PackageIcon } from './icons/PackageIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface DashboardProps {
  products: Product[];
  pendingOrdersCount: number;
  orders: CustomerOrder[];
}

const LOW_STOCK_THRESHOLD = 10;

export const Dashboard: React.FC<DashboardProps> = ({ products, pendingOrdersCount, orders }) => {
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const stats = useMemo(() => {
    const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = products.reduce((sum, item) => sum + item.quantity * item.priceRaw, 0);
    return { totalItems, totalValue };
  }, [products]);
  
  const groupReportData = useMemo(() => {
    const completedOrders = orders.filter(order => order.status === OrderStatus.Completed);

    const groupedData = completedOrders.reduce((acc, order) => {
        const groupName = order.group || 'Chưa phân loại';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        acc[groupName].push({
            customerName: order.customerName,
            total: orderTotal,
        });
        return acc;
    }, {} as Record<string, { customerName: string; total: number }[]>);

    const finalGroupedData = Object.entries(groupedData).reduce((acc, [group, customerOrders]) => {
        const customerTotals = customerOrders.reduce((customerAcc, { customerName, total }) => {
            if (!customerAcc[customerName]) {
                customerAcc[customerName] = 0;
            }
            customerAcc[customerName] += total;
            return customerAcc;
        }, {} as Record<string, number>);

        acc[group] = Object.entries(customerTotals).map(([customerName, total]) => ({
            customerName,
            total
        })).sort((a,b) => b.total - a.total);

        return acc;
    }, {} as Record<string, { customerName: string; total: number }[]>);

    return Object.entries(finalGroupedData).sort(([, customersA], [, customersB]) => {
         const totalA = customersA.reduce((sum, c) => sum + c.total, 0);
         const totalB = customersB.reduce((sum, c) => sum + c.total, 0);
         return totalB - totalA;
    });
  }, [orders]);


    const handleGetSuggestions = async () => {
        setIsLoadingSuggestion(true);
        setAiSuggestion('');
        const lowStockItems = products.filter(item => item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD);
        const suggestion = await getRestockSuggestions(lowStockItems);
        setAiSuggestion(suggestion);
        setIsLoadingSuggestion(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Tổng số lượng" value={stats.totalItems.toLocaleString('vi-VN')} icon={<PackageIcon className="w-8 h-8"/>} />
            <StatCard title="Tổng giá trị tồn kho" value={formatCurrency(stats.totalValue)} icon={<DollarSignIcon className="w-8 h-8"/>} />
            <StatCard title="Đơn hàng chờ xử lý" value={pendingOrdersCount} icon={<ClipboardListIcon className="w-8 h-8"/>} color="text-secondary"/>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BriefcaseIcon className="w-6 h-6 text-primary" />
                    Báo cáo theo Nhóm
                </h3>
                <p className="text-sm text-gray-500 mb-4">Tổng doanh thu từ các đơn hàng đã hoàn thành, được nhóm theo danh mục khách hàng.</p>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {groupReportData.length > 0 ? groupReportData.map(([group, customers]) => {
                        const groupTotal = customers.reduce((sum, customer) => sum + customer.total, 0);
                        return (
                            <details key={group} className="bg-light rounded-lg group" open>
                                <summary className="flex justify-between items-center p-3 cursor-pointer list-none">
                                     <h4 className="font-semibold text-gray-800">{group}</h4>
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-secondary">{formatCurrency(groupTotal)}</span>
                                          <ChevronDownIcon className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
                                     </div>
                                </summary>
                                <div className="border-t border-gray-200 p-3">
                                    <ul className="space-y-2 pl-2">
                                        {customers.map(({ customerName, total }, index) => (
                                            <li key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{customerName}</span>
                                                <span className="font-medium text-gray-700">{formatCurrency(total)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        )
                    }) : (
                        <p className="text-gray-500 text-center py-4">Chưa có dữ liệu báo cáo.</p>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Gợi ý nhập hàng AI</h3>
                <button 
                    onClick={handleGetSuggestions} 
                    disabled={isLoadingSuggestion}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoadingSuggestion ? <><LoaderIcon className="animate-spin w-5 h-5"/> Đang tạo...</> : <><SparklesIcon className="w-5 h-5"/> Lấy gợi ý</>}
                </button>
                {aiSuggestion && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg shadow-sm">
                        <p className="text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};