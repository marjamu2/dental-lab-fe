import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { WorkOrder, OrderStatus, Client } from '../types';
import { Modal } from './Modal';
import { OrderForm } from './OrderForm';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, PencilIcon, TrashIcon, EmailIcon } from './icons';
import { NotificationModal } from './NotificationModal.tsx';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.Recibido]: 'bg-blue-100 text-blue-800',
    [OrderStatus.EnProceso]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.ControlCalidad]: 'bg-purple-100 text-purple-800',
    [OrderStatus.Listo]: 'bg-green-100 text-green-800',
    [OrderStatus.Entregado]: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status]}`}>
      {status}
    </span>
  );
};


export const OrderList: React.FC = () => {
  const { state, addOrder, updateOrder, deleteOrder } = useAppContext();
  const { user } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; idToDelete: string | null}>({isOpen: false, idToDelete: null});
  const [notificationModalState, setNotificationModalState] = useState<{isOpen: boolean; order: WorkOrder | null}>({isOpen: false, order: null});

  const handleOpenModal = (order?: WorkOrder) => {
    setEditingOrder(order || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (order: WorkOrder | Omit<WorkOrder, 'id'>) => {
    if (editingOrder && 'id' in order) {
      await updateOrder(order);
    } else if (user?.role === 'admin') {
      await addOrder(order as Omit<WorkOrder, 'id'>);
    }
    handleCloseModal();
  };

  const handleRequestDelete = (id: string) => {
    setConfirmModalState({ isOpen: true, idToDelete: id });
  };
  
  const handleCloseConfirmModal = () => {
    setConfirmModalState({ isOpen: false, idToDelete: null });
  };

  const handleConfirmDelete = async () => {
    if (confirmModalState.idToDelete) {
        await deleteOrder(confirmModalState.idToDelete);
    }
    handleCloseConfirmModal();
  };

  const handleRequestNotification = (order: WorkOrder) => {
    const client = state.clients.find(c => c.id === order.clientId);
    if (!client) {
        alert('Error: Cliente no encontrado para esta orden.');
        return;
    }
    setNotificationModalState({ isOpen: true, order: order });
  };
  
  const handleCloseNotificationModal = () => {
    setNotificationModalState({ isOpen: false, order: null });
  };

  const handleConfirmNotification = () => {
    if (notificationModalState.order) {
        const client = state.clients.find(c => c.id === notificationModalState.order!.clientId);
        // In a real application, you would make an API call to a backend service here.
        alert(`(Simulación) Correo de notificación enviado a ${client?.email}.`);
    }
    handleCloseNotificationModal();
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  }
  
  const calculateOrderTotal = (order: WorkOrder) => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => {
      const product = state.products.find(p => p.id === item.productId);
      const price = product ? product.price : 0;
      return total + (price * (item.quantity || 0));
    }, 0);
  };

  const getClientName = (clientId: string) => state.clients.find(c => c.id === clientId)?.name || 'N/A';
  const getProductName = (productId: string) => state.products.find(p => p.id === productId)?.name || 'N/A';
  
  const getProductSummary = (order: WorkOrder) => {
    if (!order.items || order.items.length === 0) {
      return <span className="text-gray-400 italic">Sin productos</span>;
    }
    const productNames = order.items.map(item => `${getProductName(item.productId)} (x${item.quantity})`).join(', ');
    return (
        <div className="max-w-xs truncate" title={productNames}>
            {productNames}
        </div>
    );
  };

  const sortedOrders = useMemo(() => {
    return [...state.orders].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [state.orders]);
  
  const clientForNotification: Client | undefined = useMemo(() => {
    if (!notificationModalState.order) return undefined;
    return state.clients.find(c => c.id === notificationModalState.order!.clientId);
  }, [notificationModalState.order, state.clients]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de Trabajo</h1>
        {user?.role === 'admin' && (
            <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 flex items-center gap-2">
                <PlusIcon />
                Nueva Orden
            </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrega</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClientName(order.clientId)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{getProductSummary(order)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatPrice(calculateOrderTotal(order))}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={order.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {order.status === OrderStatus.Listo && (
                    <button 
                        onClick={() => handleRequestNotification(order)} 
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                        title="Notificar al cliente por correo"
                        aria-label="Notificar al cliente por correo"
                    >
                        <EmailIcon />
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(order)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon/></button>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleRequestDelete(order.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingOrder ? 'Editar Orden' : 'Nueva Orden de Trabajo'}>
        <OrderForm onSubmit={handleSubmit} onCancel={handleCloseModal} initialData={editingOrder} />
      </Modal>
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar esta orden de trabajo? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>

      {notificationModalState.order && clientForNotification && (
        <NotificationModal
            isOpen={notificationModalState.isOpen}
            onClose={handleCloseNotificationModal}
            onConfirm={handleConfirmNotification}
            order={notificationModalState.order}
            client={clientForNotification}
        />
      )}
    </div>
  );
};