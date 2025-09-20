import React, { useState } from 'react';
import type { Product, OrderItem, CustomerOrder } from '../types';
import { ProductState } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface OrderModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (order: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ products, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [group, setGroup] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | ''>(1);
  const [selectedState, setSelectedState] = useState<ProductState>(ProductState.Raw);
  const [error, setError] = useState('');

  const handleAddProduct = () => {
    setError('');
    if (!selectedProductId || selectedQuantity === '' || selectedQuantity <= 0) {
      setError('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ.');
      return;
    }

    const product = products.find(item => item.id === selectedProductId);
    if (!product) return;
    
    if (product.quantity < selectedQuantity) {
      setError(`Số lượng tồn kho không đủ. Chỉ còn ${product.quantity} sản phẩm.`);
      return;
    }

    const price = selectedState === ProductState.Raw ? product.priceRaw : product.priceCooked;
    
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProductId && item.state === selectedState);

    if (existingItemIndex > -1) {
        const newQuantity = orderItems[existingItemIndex].quantity + selectedQuantity;
        if(product.quantity < newQuantity) {
            setError(`Số lượng tồn kho không đủ. Bạn đã có ${orderItems[existingItemIndex].quantity} trong đơn. Chỉ còn ${product.quantity} sản phẩm.`);
            return;
        }
        const updatedItems = [...orderItems];
        updatedItems[existingItemIndex].quantity = newQuantity;
        setOrderItems(updatedItems);
    } else {
        setOrderItems([
            ...orderItems,
            { productId: product.id, productName: product.name, quantity: selectedQuantity, price: price, state: selectedState },
        ]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };
  
  const handleRemoveProduct = (productId: string, state: ProductState) => {
    setOrderItems(orderItems.filter(item => !(item.productId === productId && item.state === state)));
  };
  
  const handleSubmit = () => {
    if(!customerName.trim()) {
        setError('Tên khách hàng là bắt buộc.');
        return;
    }
    if(!group.trim()) {
        setError('Nhóm đơn hàng là bắt buộc.');
        return;
    }
    if(orderItems.length === 0) {
        setError('Đơn hàng phải có ít nhất một sản phẩm.');
        return;
    }
    
    onSave({ customerName, group, items: orderItems });
    onClose();
  };

  const availableProducts = products.filter(item => item.quantity > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Tạo đơn hàng mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                    <input 
                        type="text" 
                        id="customerName" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="Nhập tên khách hàng"
                    />
                </div>
                 <div>
                    <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">Nhóm đơn hàng</label>
                    <input 
                        type="text" 
                        id="group" 
                        value={group} 
                        onChange={(e) => setGroup(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="VD: Khách lẻ, Nhà hàng A"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Thêm sản phẩm vào đơn</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
                    <div className="md:col-span-2 w-full">
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                        <select 
                            id="product" 
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="" disabled>-- Chọn một sản phẩm --</option>
                            {availableProducts.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} (Tồn kho: {item.quantity})
                                </option>
                            ))}
                        </select>
                    </div>
                     <div className="w-full">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                        <input 
                            type="number" 
                            id="quantity" 
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            min="1" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        />
                    </div>
                     <div className="w-full">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                         <select
                           value={selectedState}
                           onChange={(e) => setSelectedState(e.target.value as ProductState)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                         >
                           <option value={ProductState.Raw}>{ProductState.Raw}</option>
                           <option value={ProductState.Cooked}>{ProductState.Cooked}</option>
                         </select>
                     </div>
                </div>
                 <div className="mt-4 flex justify-end">
                       <button 
                         onClick={handleAddProduct}
                         className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition duration-150"
                       >
                         <PlusIcon className="w-5 h-5"/>
                         <span>Thêm vào đơn</span>
                       </button>
                    </div>
            </div>

            {orderItems.length > 0 && (
                 <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sản phẩm trong đơn</h3>
                    <ul className="space-y-2">
                        {orderItems.map(item => (
                            <li key={item.productId + item.state} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.productName} <span className="text-xs font-normal text-gray-600">({item.state})</span></p>
                                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <button onClick={() => handleRemoveProduct(item.productId, item.state)} className="text-danger hover:text-danger-hover">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm text-center pt-4">{error}</p>}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-4 mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Hủy</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Lưu đơn hàng</button>
        </div>
      </div>
    </div>
  );
};