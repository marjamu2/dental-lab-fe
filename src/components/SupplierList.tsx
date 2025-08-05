import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Supplier } from '../types';
import { Modal } from './Modal';
import { SupplierForm } from './SupplierForm';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

export const SupplierList: React.FC = () => {
  const { state, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
  const { user } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; idToDelete: string | null}>({isOpen: false, idToDelete: null});

  const handleOpenModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (supplier: Supplier | Omit<Supplier, 'id'>) => {
    if (editingSupplier && 'id' in supplier) {
      await updateSupplier(supplier);
    } else {
      await addSupplier(supplier as Omit<Supplier, 'id'>);
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
        await deleteSupplier(confirmModalState.idToDelete);
    }
    handleCloseConfirmModal();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Proveedores</h1>
        {user?.role === 'admin' && (
            <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 flex items-center gap-2">
                <PlusIcon />
                Nuevo Proveedor
            </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sitio Web</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{supplier.website}</a></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                   {user?.role === 'admin' && (
                    <>
                        <button onClick={() => handleOpenModal(supplier)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon/></button>
                        <button onClick={() => handleRequestDelete(supplier.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                    </>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <SupplierForm onSubmit={handleSubmit} onCancel={handleCloseModal} initialData={editingSupplier} />
      </Modal>
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};
