
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import { Modal } from './Modal';
import { ProductForm } from './ProductForm';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

export const ProductList: React.FC = () => {
  const { state, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { user } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; idToDelete: string | null}>({isOpen: false, idToDelete: null});

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (product: Product | Omit<Product, 'id'>) => {
    if (editingProduct && 'id' in product) {
      await updateProduct(product);
    } else {
      await addProduct(product as Omit<Product, 'id'>);
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
        await deleteProduct(confirmModalState.idToDelete);
    }
    handleCloseConfirmModal();
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Productos y Servicios</h1>
        {user?.role === 'admin' && (
            <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 flex items-center gap-2">
                <PlusIcon />
                Nuevo Producto
            </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.material}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                   {user?.role === 'admin' && (
                    <>
                        <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon/></button>
                        <button onClick={() => handleRequestDelete(product.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                    </>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <ProductForm onSubmit={handleSubmit} onCancel={handleCloseModal} initialData={editingProduct} />
      </Modal>
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
        <p className="text-sm text-yellow-600 mt-2">Nota: Eliminar un producto no lo eliminará de las órdenes de trabajo existentes que ya lo incluyen.</p>
      </ConfirmationModal>
    </div>
  );
};
