import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Client } from '../types';
import { Modal } from './Modal';
import { ClientForm } from './ClientForm';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

export const ClientList: React.FC = () => {
  const { state, addClient, updateClient, deleteClient } = useAppContext();
  const { user } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; idToDelete: string | null}>({isOpen: false, idToDelete: null});

  const handleOpenModal = (client?: Client) => {
    setEditingClient(client || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (client: Client | Omit<Client, 'id'>) => {
    if (editingClient && 'id' in client) {
      await updateClient(client);
    } else {
      await addClient(client as Omit<Client, 'id'>);
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
        await deleteClient(confirmModalState.idToDelete);
    }
    handleCloseConfirmModal();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        {user?.role === 'admin' && (
            <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 flex items-center gap-2">
                <PlusIcon />
                Nuevo Cliente
            </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clínica</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.clinic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                   {user?.role === 'admin' && (
                    <>
                        <button onClick={() => handleOpenModal(client)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon/></button>
                        <button onClick={() => handleRequestDelete(client.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                    </>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <ClientForm onSubmit={handleSubmit} onCancel={handleCloseModal} initialData={editingClient} />
      </Modal>
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.</p>
        <p className="text-sm text-yellow-600 mt-2">Nota: Eliminar un cliente no eliminará sus órdenes de trabajo asociadas.</p>
      </ConfirmationModal>
    </div>
  );
};
