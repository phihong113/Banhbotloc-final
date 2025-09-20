import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductTable } from './components/ProductTable';
import { OrderList } from './components/OrderList';
import { ProductModal } from './components/ProductModal';
import { OrderModal } from './components/OrderModal';
import { OrderEditModal } from './components/OrderEditModal';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import type { Product, CustomerOrder } from './types';
import { OrderStatus } from './types';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useProducts();
  const { orders, addOrder, updateOrderStatus, deleteOrder, updateOrder } = useOrders();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  // Xử lý cho Product Modal
  const handleOpenProductModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };
  const handleCloseProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(false);
  };
  const handleSaveProduct = (productData: Product) => {
    if (productData.id && products.some(p => p.id === productData.id)) {
        updateProduct(productData.id, productData);
    } else {
        const { id, ...newProductData } = productData;
        addProduct(newProductData as Omit<Product, 'id'>);
    }
    handleCloseProductModal();
  };
  
  // Xử lý cho Order Modal
  const handleOpenOrderModal = () => setIsOrderModalOpen(true);
  const handleCloseOrderModal = () => setIsOrderModalOpen(false);
  const handleSaveOrder = (orderData: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => {
      // Giảm số lượng tồn kho ngay khi tạo đơn hàng
      orderData.items.forEach(item => {
          adjustStock(item.productId, -item.quantity);
      });
      addOrder(orderData);
      handleCloseOrderModal();
  };
  
  // Xử lý hoàn thành đơn hàng
  const handleCompleteOrder = (orderId: string) => {
      // Cập nhật trạng thái đơn hàng, không điều chỉnh kho ở đây nữa
      updateOrderStatus(orderId, OrderStatus.Completed);
  };

  // Xử lý cho Order Edit Modal
  const handleOpenOrderEditModal = (order: CustomerOrder) => {
      setEditingOrder(order);
  };
  const handleCloseOrderEditModal = () => {
      setEditingOrder(null);
  };
  const handleUpdateOrder = (orderId: string, updatedData: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => {
      const originalOrder = orders.find(o => o.id === orderId);
      if (!originalOrder) return;

      // 1. Hoàn lại số lượng tồn kho từ đơn hàng gốc
      originalOrder.items.forEach(item => {
          adjustStock(item.productId, item.quantity); // Cộng trả lại
      });

      // 2. Trừ đi số lượng tồn kho cho đơn hàng đã cập nhật
      updatedData.items.forEach(item => {
          adjustStock(item.productId, -item.quantity); // Trừ đi số lượng mới
      });
      
      // 3. Cập nhật dữ liệu đơn hàng
      updateOrder(orderId, updatedData);
      
      handleCloseOrderEditModal();
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const pendingOrdersCount = useMemo(() => {
    return orders.filter(order => order.status === OrderStatus.Pending).length;
  }, [orders]);
  
  const existingSkus = useMemo(() => {
      const currentEditingSku = editingProduct?.sku || '';
      return products.map(p => p.sku).filter(sku => sku !== currentEditingSku);
  }, [products, editingProduct]);

  return (
    <div className="bg-light min-h-screen font-sans text-dark">
      <Header isMobileView={isMobileView} onToggleMobileView={() => setIsMobileView(!isMobileView)} />
      <main className={`p-4 sm:p-6 lg:p-8 mx-auto space-y-8 transition-all duration-300 ${isMobileView ? 'max-w-md' : 'max-w-7xl'}`}>
        <Dashboard products={products} pendingOrdersCount={pendingOrdersCount} orders={orders} />
        
        <div className={`bg-white rounded-xl shadow-md ${isMobileView ? 'p-0' : ''}`}>
           <div className={`p-6 ${!isMobileView && 'border-b border-gray-200'} flex flex-col sm:flex-row justify-between items-center gap-4`}>
            <h2 className="text-2xl font-bold text-gray-700">Sản phẩm Tồn kho</h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
               <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button
                  onClick={handleOpenOrderModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition duration-150"
              >
                  <span>Tạo đơn hàng</span>
              </button>
              <button
                  onClick={() => handleOpenProductModal()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150"
              >
                  <PlusIcon className="w-5 h-5" />
                  <span>Thêm sản phẩm</span>
              </button>
            </div>
          </div>
          <ProductTable
            products={filteredProducts}
            onEdit={handleOpenProductModal}
            onDelete={deleteProduct}
            onAdjustStock={adjustStock}
            isMobileView={isMobileView}
          />
        </div>

        <OrderList 
            orders={orders} 
            onCompleteOrder={handleCompleteOrder}
            onDeleteOrder={deleteOrder}
            onEditOrder={handleOpenOrderEditModal}
            isMobileView={isMobileView} 
        />
      </main>

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseProductModal}
          onSave={handleSaveProduct}
          existingSkus={existingSkus}
        />
      )}
      
      {isOrderModalOpen && (
        <OrderModal
            products={products}
            onClose={handleCloseOrderModal}
            onSave={handleSaveOrder}
        />
      )}

      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          products={products}
          onClose={handleCloseOrderEditModal}
          onSave={handleUpdateOrder}
        />
      )}
    </div>
  );
};

export default App;
