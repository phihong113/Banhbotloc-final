import React, { useState, useMemo, useEffect } from 'react';
import type { Product, OrderItem, CustomerOrder } from '../types';
import { ProductState } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface OrderEditModalProps {
  order: CustomerOrder;
  products: Product[];
  onClose: () => void;
  onSave: (orderId: string, data: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, products, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState(order.customerName);
  const [group, setGroup] = useState(order.group);
  // FIX: Changed the state type to allow quantity to be a string for input purposes.
  const [orderItems, setOrderItems] = useState<(Omit<OrderItem, 'quantity'> & { quantity: number | '' })[]>(order.items);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | ''>(1);
  const [selectedState, setSelectedState] = useState<ProductState>(ProductState.Raw);
  const [error, setError] = useState('');

  const availableQuantities = useMemo(() => {
    const quantities = new Map<string, number>();
    products.forEach(p => {
        const originalOrderItem = order.items.find(item => item.productId === p.id);
        const originalQuantity = originalOrderItem ? originalOrderItem.quantity : 0;
        quantities.set(p.id, p.quantity + originalQuantity);
    });
    return quantities;
  }, [products, order.items]);

  // FIX: Corrected the type of 'items' to correctly handle objects with a 'quantity' that can be a number or a string. This resolves property access errors.
  const validateItems = (items: (Omit<OrderItem, 'quantity'> & {quantity: number | ''})[]): string => {
    const totalQuantitiesPerProduct = items.reduce((acc, item) => {
        const quantity = Number(item.quantity);
        if(!isNaN(quantity) && quantity > 0) {
            acc[item.productId] = (acc[item.productId] || 0) + quantity;
        }
        return acc;
    }, {} as Record<string, number>);

    for (const productId in totalQuantitiesPerProduct) {
        const maxQuantity = availableQuantities.get(productId) || 0;
        if (totalQuantitiesPerProduct[productId] > maxQuantity) {
            const productName = products.find(p => p.id === productId)?.name || 'sản phẩm';
            return `Tổng SL cho ${productName} (${totalQuantitiesPerProduct[productId]}) vượt quá tồn kho (${maxQuantity}).`;
        }
    }
    return '';
  }
  
  // Re-validate when available quantities change
  useEffect(() => {
    setError(validateItems(orderItems));
  }, [availableQuantities]);

  const handleAddProduct = () => {
    setError('');
    if (!selectedProductId || selectedQuantity === '' || Number(selectedQuantity) <= 0) {
      setError('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ.');
      return;
    }
    const quantityToAdd = Number(selectedQuantity);

    const product = products.find(item => item.id === selectedProductId);
    if (!product) return;
    
    const price = selectedState === ProductState.Raw ? product.priceRaw : product.priceCooked;
    
    const newItems = [...orderItems];
    const existingItemIndex = newItems.findIndex(item => item.productId === selectedProductId && item.state === selectedState);

    if (existingItemIndex > -1) {
        const currentQuantity = Number(newItems[existingItemIndex].quantity);
        newItems[existingItemIndex].quantity = currentQuantity + quantityToAdd;
    } else {
        newItems.push({ productId: product.id, productName: product.name, quantity: quantityToAdd, price: price, state: selectedState });
    }

    const validationError = validateItems(newItems);
    if(validationError){
        setError(validationError);
        // Don't add if invalid
        return;
    }

    setOrderItems(newItems);
    setSelectedProductId('');
    setSelectedQuantity(1);
  };
  
  const handleItemQuantityChange = (indexToUpdate: number, newQuantityStr: string) => {
      const newQuantity = parseInt(newQuantityStr, 10);

      if (newQuantityStr === '' || isNaN(newQuantity)) {
          // FIX: Explicitly type `tempItems` to prevent TypeScript from widening the type of `quantity` from `''` to `string`, which caused a type mismatch with the component's state.
          const tempItems: (Omit<OrderItem, 'quantity'> & { quantity: number | "" })[] = orderItems.map((item, i) => i === indexToUpdate ? {...item, quantity: ''} : item);
          setOrderItems(tempItems);
          setError('Vui lòng nhập số lượng hợp lệ.');
          return;
      }
      
      const newItems = orderItems
        .map((item, index) => index === indexToUpdate ? { ...item, quantity: Math.max(0, newQuantity) } : item)
        .filter(item => Number(item.quantity) > 0);

      setError(validateItems(newItems));
      setOrderItems(newItems);
  };

  const handleItemStateChange = (indexToUpdate: number, newState: ProductState) => {
    let itemsCopy = [...orderItems];
    const itemToUpdate = { ...itemsCopy[indexToUpdate] };

    if (itemToUpdate.state === newState) return;

    itemToUpdate.state = newState;
    const product = products.find(p => p.id === itemToUpdate.productId);
    if (product) {
        itemToUpdate.price = newState === ProductState.Raw ? product.priceRaw : product.priceCooked;
    }
    itemsCopy[indexToUpdate] = itemToUpdate;
    
    // FIX: Updated the accumulator type to match the new state type for orderItems.
    const mergedItems = itemsCopy.reduce((acc, currentItem) => {
        const quantity = Number(currentItem.quantity);
        if (isNaN(quantity)) return acc; // Skip invalid items
        const existingItem = acc.find(item => item.productId === currentItem.productId && item.state === currentItem.state);
        if (existingItem) {
            existingItem.quantity = Number(existingItem.quantity) + quantity;
        } else {
            acc.push({...currentItem, quantity});
        }
        return acc;
    }, [] as (Omit<OrderItem, 'quantity'> & {quantity: number | ''})[]);

    setError(validateItems(mergedItems));
    setOrderItems(mergedItems);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const newItems = orderItems.filter((_, index) => index !== indexToRemove);
    setError(validateItems(newItems));
    setOrderItems(newItems);
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
    const finalOrderItems = orderItems
      .map(item => ({...item, quantity: Number(item.quantity)}))
      .filter(item => !isNaN(item.quantity) && item.quantity > 0);

    if(finalOrderItems.length === 0) {
        setError('Đơn hàng phải có ít nhất một sản phẩm.');
        return;
    }
    
    const finalValidationError = validateItems(finalOrderItems);
    if (finalValidationError) {
        setError(finalValidationError);
        return;
    }
    if(error) return;

    onSave(order.id, { customerName, group, items: finalOrderItems });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa đơn hàng</h2>
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
                    />
                </div>
            </div>

            {orderItems.length > 0 && (
                 <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sản phẩm trong đơn</h3>
                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-3 pb-2 text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-4">Sản phẩm</div>
                        <div className="col-span-3">Trạng thái</div>
                        <div className="col-span-3">Số lượng</div>
                        <div className="col-span-2 text-right">Hành động</div>
                    </div>
                    <ul className="space-y-2">
                        {orderItems.map((item, index) => (
                            <li key={index} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center bg-gray-50 p-3 rounded-lg">
                                <div className="col-span-12 sm:col-span-4">
                                    <p className="font-semibold text-gray-800">{item.productName}</p>
                                    <p className="text-xs text-gray-500 sm:hidden">{formatCurrency(item.price)} x {item.quantity}</p>
                                </div>
                                <div className="col-span-5 sm:col-span-3">
                                    <label htmlFor={`state-${index}`} className="text-xs font-medium text-gray-500 sm:hidden">Trạng thái</label>
                                    <select
                                        id={`state-${index}`}
                                        value={item.state}
                                        onChange={(e) => handleItemStateChange(index, e.target.value as ProductState)}
                                        className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value={ProductState.Raw}>{ProductState.Raw}</option>
                                        <option value={ProductState.Cooked}>{ProductState.Cooked}</option>
                                    </select>
                                </div>
                                <div className="col-span-5 sm:col-span-3">
                                    <label htmlFor={`quantity-${index}`} className="text-xs font-medium text-gray-500 sm:hidden">Số lượng</label>
                                    <input
                                        id={`quantity-${index}`}
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                        min="0"
                                        className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                        aria-label={`Số lượng cho ${item.productName}`}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-2 flex justify-end">
                                    <button onClick={() => handleRemoveItem(index)} className="text-danger hover:text-danger-hover p-1" aria-label={`Xóa ${item.productName}`}>
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Thêm sản phẩm khác</h3>
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
                            {products.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} (Tồn kho: {availableQuantities.get(item.id) || 0})
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
            
            {error && <p className="text-red-500 text-sm text-center pt-4">{error}</p>}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-4 mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Hủy</button>
            <button 
                type="button" 
                onClick={handleSubmit} 
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!!error}
            >
                Lưu thay đổi
            </button>
        </div>
      </div>
    </div>
  );
};
