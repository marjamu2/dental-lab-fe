
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProductFormProps {
  onSubmit: (product: Product | Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [product, setProduct] = useState<Omit<Product, 'id' | 'price'> & { price: string }>({
    name: '',
    material: '',
    price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setProduct({ ...initialData, price: String(initialData.price) });
    } else {
        setProduct({ name: '', material: '', price: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
        ...product,
        price: parseFloat(product.price) || 0,
    };

    if (initialData) {
        await onSubmit({ ...productData, id: initialData.id });
    } else {
        await onSubmit(productData);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
        <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700">Material Principal</label>
        <input type="text" name="material" id="material" value={product.material} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
        <input type="number" name="price" id="price" value={product.price} onChange={handleChange} required step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center w-28 disabled:bg-primary-300">
          {isSubmitting ? <LoadingSpinner size="sm"/> : (initialData ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};
