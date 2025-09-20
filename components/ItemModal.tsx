

import React, { useState, useEffect } from 'react';
// FIX: The type 'InventoryItem' is not exported from '../types'. Using 'Product' instead as it matches the structure.
import type { Product } from '../types';
import { generateDescription } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoaderIcon } from './icons/LoaderIcon';


interface ItemModalProps {
  item: Product | null;
  onClose: () => void;
  onSave: (item: Product) => void;
  existingSkus: string[];
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onSave, existingSkus }) => {
  // FIX: Replaced 'price' with 'priceRaw' and 'priceCooked' to match the 'Product' type and allow empty strings for better UX in number inputs.
  const [formData, setFormData] = useState<Omit<Product, 'id'> & { id?: string; quantity: number | ""; priceRaw: number | ""; priceCooked: number | ""; }>({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    priceRaw: 0,
    priceCooked: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');

  const isEditing = item !== null;

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // FIX: Included 'priceRaw' and 'priceCooked' in the check for numeric fields.
    const isNumeric = ['quantity', 'priceRaw', 'priceCooked'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumeric ? (value === '' ? '' : Number(value)) : value }));
    if(errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.sku.trim()) newErrors.sku = "SKU là bắt buộc";
    else if (existingSkus.includes(formData.sku.trim())) {
        newErrors.sku = "SKU này đã tồn tại";
    }
    if (!formData.category.trim()) newErrors.category = "Danh mục là bắt buộc";
    if (Number(formData.quantity) < 0) newErrors.quantity = "Số lượng không thể là số âm";
    // FIX: Validating 'priceRaw' and 'priceCooked' instead of 'price'.
    if (Number(formData.priceRaw) <= 0) newErrors.priceRaw = "Giá (sống) phải là số dương";
    if (Number(formData.priceCooked) <= 0) newErrors.priceCooked = "Giá (chín) phải là số dương";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // FIX: Saving 'priceRaw' and 'priceCooked' instead of 'price'.
      onSave({
        ...formData,
        id: item?.id || '',
        quantity: Number(formData.quantity),
        priceRaw: Number(formData.priceRaw),
        priceCooked: Number(formData.priceCooked)
      } as Product);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
        setErrors(prev => ({...prev, name: !formData.name ? 'Cần có tên để tạo mô tả AI' : '', category: !formData.category ? 'Cần có danh mục để tạo mô tả AI' : ''}));
        return;
    }
    setIsGenerating(true);
    const description = await generateDescription(formData.name, formData.category, aiKeywords);
    setFormData(prev => ({...prev, description }));
    setIsGenerating(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.sku ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                        <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="0" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.quantity ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                    </div>
                </div>

                {/* FIX: Replaced single 'price' input with two inputs for 'priceRaw' and 'priceCooked'. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="priceRaw" className="block text-sm font-medium text-gray-700 mb-1">Giá (Sống) (VNĐ)</label>
                        <input type="number" id="priceRaw" name="priceRaw" value={formData.priceRaw} onChange={handleChange} min="0" step="1000" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.priceRaw ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.priceRaw && <p className="text-red-500 text-xs mt-1">{errors.priceRaw}</p>}
                    </div>
                    <div>
                        <label htmlFor="priceCooked" className="block text-sm font-medium text-gray-700 mb-1">Giá (Chín) (VNĐ)</label>
                        <input type="number" id="priceCooked" name="priceCooked" value={formData.priceCooked} onChange={handleChange} min="0" step="1000" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.priceCooked ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-primary'}`} />
                        {errors.priceCooked && <p className="text-red-500 text-xs mt-1">{errors.priceCooked}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-primary"/> Tạo mô tả bằng AI</h4>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input type="text" placeholder="Tùy chọn: từ khóa (vd: cao cấp, hữu cơ)" value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition duration-150 disabled:bg-gray-400">
                            {isGenerating ? <><LoaderIcon className="animate-spin w-5 h-5"/> Đang tạo...</> : 'Tạo'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-4 sticky bottom-0">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Lưu sản phẩm</button>
            </div>
        </form>
      </div>
    </div>
  );
};