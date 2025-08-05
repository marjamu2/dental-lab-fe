
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ClientFormProps {
  onSubmit: (client: Client | Omit<Client, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Client | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [client, setClient] = useState<Omit<Client, 'id'>>({
    name: '',
    clinic: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setClient(initialData);
    } else {
        setClient({ name: '', clinic: '', phone: '', email: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (initialData) {
      await onSubmit({
        ...client,
        id: initialData.id,
      });
    } else {
      await onSubmit(client);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Doctor</label>
        <input type="text" name="name" id="name" value={client.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="clinic" className="block text-sm font-medium text-gray-700">Clínica</label>
        <input type="text" name="clinic" id="clinic" value={client.clinic} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input type="tel" name="phone" id="phone" value={client.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" value={client.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
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
