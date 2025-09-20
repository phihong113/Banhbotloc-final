import React from 'react';
import type { CustomerOrder } from '../types';
import { OrderStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface OrderListProps {
  orders: CustomerOrder[];
  onCompleteOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onEditOrder: (order: CustomerOrder) => void;
  isMobileView: boolean;
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';
  const statusClasses = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Completed]: 'bg-green-100 text-green-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onCompleteOrder, onDeleteOrder, onEditOrder, isMobileView }) => {

  if (isMobileView) {
    return (
        <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-700">Quản lý Đơn hàng</h2>
            </div>
            <div className="p-4 space-y-4">
                {orders.length > 0 ? orders.map(order => {
                    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return (
                        <div key={order.id} className="border rounded-lg p-4 space-y-3 bg-light">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{order.customerName}</h3>
                                    <p className="text-sm text-gray-500">Nhóm: {order.group}</p>
                                    <p className="text-sm text-gray-500">Ngày: {formatDate(order.createdAt)}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">Sản phẩm:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-500 pl-2">
                                     {order.items.map(item => (
                                        <li key={item.productId + item.state}>{item.productName} ({item.state}) - SL: {item.quantity}</li>
                                    ))}
                                </ul>
                            </div>
                             <div className="border-t pt-3 flex justify-between items-center">
                                <span className="font-semibold text-gray-800">Tổng tiền: {formatCurrency(total)}</span>
                                <div className="flex items-center gap-2">
                                     {order.status === OrderStatus.Pending && (
                                        <>
                                            <button onClick={() => onEditOrder(order)} className="p-2 text-primary hover:text-primary-hover transition" aria-label="Chỉnh sửa đơn hàng"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => onCompleteOrder(order.id)} className="p-2 text-secondary hover:text-secondary-hover transition" aria-label="Hoàn thành đơn hàng"><CheckCircleIcon className="w-5 h-5"/></button>
                                        </>
                                    )}
                                    {order.status === OrderStatus.Completed && (
                                        <button onClick={() => onDeleteOrder(order.id)} className="p-2 text-danger hover:text-danger-hover transition" aria-label="Xóa đơn hàng"><TrashIcon className="w-5 h-5"/></button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <p className="text-center py-10 text-gray-500">Chưa có đơn hàng nào được tạo.</p>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700">Quản lý Đơn hàng</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? orders.map((order) => {
              const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.group}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {order.items.map(item => (
                        <li key={item.productId + item.state}>{item.productName} ({item.state}) (SL: {item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{formatCurrency(total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {order.status === OrderStatus.Pending && (
                        <>
                          <button 
                            onClick={() => onCompleteOrder(order.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 text-xs"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Hoàn thành</span>
                          </button>
                          <button onClick={() => onEditOrder(order)} className="text-primary hover:text-primary-hover transition p-1.5 rounded-md hover:bg-gray-100" aria-label="Chỉnh sửa đơn hàng">
                            <EditIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {order.status === OrderStatus.Completed && (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 italic text-xs">Đã hoàn thành</span>
                              <button 
                                  onClick={() => onDeleteOrder(order.id)} 
                                  className="text-danger hover:text-danger-hover transition"
                                  aria-label="Xóa đơn hàng"
                              >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Chưa có đơn hàng nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
