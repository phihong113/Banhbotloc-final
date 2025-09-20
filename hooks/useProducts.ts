import { useState } from 'react';
import type { Product } from '../types';

const initialProducts: Product[] = [
  { id: '1', name: 'Trà Xanh Hữu Cơ', sku: 'TXH-001', category: 'Đồ uống', quantity: 85, priceRaw: 299000, priceCooked: 329000, description: 'Trà xanh hữu cơ tươi mát và tốt cho sức khỏe, được thu hoạch từ những vườn trà tốt nhất.' },
  { id: '2', name: 'Bánh Mì Sourdough Thủ Công', sku: 'BMS-002', category: 'Bánh mì', quantity: 8, priceRaw: 85000, priceCooked: 95000, description: 'Bánh mì sourdough làm thủ công với lớp vỏ giòn và phần ruột mềm, dai.' },
  { id: '3', name: 'Dầu Ô Liu Cao Cấp', sku: 'DOL-003', category: 'Thực phẩm khô', quantity: 40, priceRaw: 550000, priceCooked: 550000, description: 'Dầu ô liu nguyên chất ép lạnh từ những quả ô liu hái bằng tay cho hương vị đậm đà.' },
  { id: '4', name: 'Hạt Cà Phê Gourmet', sku: 'HCP-004', category: 'Đồ uống', quantity: 0, priceRaw: 450000, priceCooked: 480000, description: 'Hạt cà phê Arabica đơn nguồn với hương vị sô cô la và cam quýt.' },
  { id: '5', name: 'Phô Mai Cheddar Ủ Lâu Năm', sku: 'PMC-005', category: 'Sản phẩm sữa', quantity: 15, priceRaw: 350000, priceCooked: 350000, description: 'Phô mai cheddar ủ lâu năm có vị đậm đà và kết cấu giòn, hoàn hảo cho đĩa phô mai hoặc nấu ăn.' },
  { id: '6', name: 'Chảo Inox Không Gỉ', sku: 'CIK-006', category: 'Dụng cụ nấu ăn', quantity: 22, priceRaw: 1200000, priceCooked: 1200000, description: 'Chảo rán bằng thép không gỉ 10 inch bền bỉ cho mọi nhu cầu nấu nướng của bạn.' },
];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: new Date().toISOString() };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? updatedProduct : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id: string, amount: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, quantity: Math.max(0, p.quantity + amount) }
          : p
      )
    );
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  };
};
