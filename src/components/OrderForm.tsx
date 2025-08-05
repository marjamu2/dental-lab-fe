import React, { useState, useEffect } from 'react';
import { WorkOrder, OrderStatus, OrderItem } from '../types';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface OrderFormProps {
  onSubmit: (order: WorkOrder | Omit<WorkOrder, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: WorkOrder | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { state } = useAppContext();
  const [order, setOrder] = useState<Omit<WorkOrder, 'id'>>({
    patientName: '',
    clientId: '',
    items: [{ productId: '', quantity: 1 }],
    dueDate: '',
    status: OrderStatus.Recibido,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setOrder({ 
        ...initialData, 
        dueDate: initialData.dueDate.split('T')[0],
        items: initialData.items.length > 0 ? initialData.items : [{ productId: '', quantity: 1 }],
      });
    } else {
        setOrder({
            patientName: '',
            clientId: state.clients[0]?.id || '',
            items: [{ productId: state.products[0]?.id || '', quantity: 1 }],
            dueDate: '',
            status: OrderStatus.Recibido,
            notes: '',
        });
    }
  }, [initialData, state.clients, state.products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...order.items];
    if (field === 'quantity') {
        const quantity = Number(value);
        newItems[index] = { ...newItems[index], [field]: quantity >= 1 ? quantity : 1 };
    } else {
        newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrder(prev => ({ ...prev, items: newItems }));
  };
  
  const addItem = () => {
    setOrder(prev => ({...prev, items: [...prev.items, { productId: state.products[0]?.id || '', quantity: 1}]}));
  };

  const removeItem = (index: number) => {
    if (order.items.length <= 1) return; // Must have at least one item
    setOrder(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const processedOrder = {
        ...order,
        items: order.items.filter(item => item.productId !== ''),
        dueDate: new Date(order.dueDate).toISOString(),
    };
    if (processedOrder.items.length === 0) {
        alert("Por favor, agregue al menos un producto a la orden.");
        return;
    }
    setIsSubmitting(true);
    if (initialData) {
        await onSubmit({
          ...processedOrder,
          id: initialData.id,
        });
    } else {
        await onSubmit(processedOrder);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Nombre del Paciente</label>
        <input type="text" name="patientName" id="patientName" value={order.patientName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente (Dentista)</label>
        <select name="clientId" id="clientId" value={order.clientId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900">
          <option value="">Seleccione un cliente</option>
          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      {/* Products section */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Productos</label>
        <div className="space-y-2 mt-1">
            {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <select
                        name="productId"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                        <option value="">Seleccione un producto</option>
                        {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                        type="number"
                        min="1"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Cant."
                    />
                    <button type="button" onClick={() => removeItem(index)} disabled={order.items.length <= 1} className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-red-100">
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} className="mt-2 text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
            <PlusIcon />
            Añadir Producto
        </button>
      </div>

       <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
        <input type="date" name="dueDate" id="dueDate" value={order.dueDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
      </div>
       <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
        <select name="status" id="status" value={order.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900">
           {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
        <textarea name="notes" id="notes" value={order.notes} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
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
