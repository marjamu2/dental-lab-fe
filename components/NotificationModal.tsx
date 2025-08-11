import React from 'react';
import { Modal } from './Modal';
import { WorkOrder, Client } from '../types';
import { useAppContext } from '../context/AppContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: WorkOrder;
  client: Client;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
}

const EmailPreview: React.FC<{ order: WorkOrder, client: Client }> = ({ order, client }) => {
    const { state } = useAppContext();

    const getProductName = (productId: string) => state.products.find(p => p.id === productId)?.name || 'N/A';
    
    const calculateOrderTotal = (order: WorkOrder): number => {
        if (!order.items) return 0;
        return order.items.reduce((total, item) => {
          const product = state.products.find(p => p.id === item.productId);
          const price = product ? product.price : 0;
          return total + (price * (item.quantity || 0));
        }, 0);
    };

    const subject = `Orden de Trabajo #${order.id.slice(-6)} lista para entrega - Paciente: ${order.patientName}`;
    const total = calculateOrderTotal(order);

    return (
        <div className="text-sm text-gray-700 space-y-4">
            <div className="flex items-baseline">
                <strong className="w-20 flex-shrink-0 text-gray-500">Para:</strong>
                <span>{client.email}</span>
            </div>
            <div className="flex items-baseline">
                <strong className="w-20 flex-shrink-0 text-gray-500">Asunto:</strong>
                <span>{subject}</span>
            </div>
            <hr className="my-2" />
            <div className="space-y-3 prose prose-sm max-w-none">
                <p>Estimado/a Dr./Dra. {client.name},</p>
                <p>Le informamos que la orden de trabajo para su paciente <strong>{order.patientName}</strong> ha sido completada y está lista para ser retirada de nuestro laboratorio.</p>
                
                <h4 className="font-semibold text-base">Resumen de la Orden:</h4>
                <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md my-2">
                    {order.items.map(item => (
                        <li key={item.productId}>
                            {getProductName(item.productId)} (x{item.quantity})
                        </li>
                    ))}
                </ul>
                <p>
                    <strong>Monto Total:</strong> {formatPrice(total)}
                </p>
                
                {order.notes && (
                    <>
                        <h4 className="font-semibold text-base">Notas Adicionales:</h4>
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                            {order.notes}
                        </blockquote>
                    </>
                )}

                <p>Puede pasar a retirarla en nuestro horario habitual. Si tiene alguna consulta, no dude en contactarnos.</p>
                <p>Gracias por confiar en Dental Lab.</p>
            </div>
        </div>
    );
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onConfirm, order, client }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Notificación por Email"
    >
        <div className="space-y-6">
            <EmailPreview order={order} client={client} />
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    Cancelar
                </button>
                <button 
                    type="button" 
                    onClick={onConfirm} 
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Enviar Notificación
                </button>
            </div>
        </div>
    </Modal>
  );
};