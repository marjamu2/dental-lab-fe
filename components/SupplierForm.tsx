
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface SupplierFormProps {
  onSubmit: (supplier: Supplier | Omit<Supplier, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Supplier | null;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [supplier, setSupplier] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contactPerson: '',
    phone: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSupplier(initialData);
    } else {
        setSupplier({ name: '', contactPerson: '', phone: '', website: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplier(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (initialData) {
      await onSubmit({ ...supplier, id: initialData.id });
    } else {
      await onSubmit(supplier);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proveedor</label>
        <input type="text" name="name" id="name" value={supplier.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Persona de Contacto</label>
        <input type="text" name="contactPerson" id="contactPerson" value={supplier.contactPerson} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input type="tel" name="phone" id="phone" value={supplier.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web</label>
        <input type="url" name="website" id="website" value={supplier.website} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
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
