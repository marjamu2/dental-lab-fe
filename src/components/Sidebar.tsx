
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DashboardIcon, OrdersIcon, ClientsIcon, ProductsIcon, SuppliersIcon, ToothIcon, FinancialsIcon, LogoutIcon, KeyIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { Modal } from './Modal';
import { ChangePasswordForm } from './ChangePasswordForm';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/orders', label: 'Órdenes', icon: <OrdersIcon /> },
  { path: '/clients', label: 'Clientes', icon: <ClientsIcon /> },
  { path: '/products', label: 'Productos', icon: <ProductsIcon /> },
  { path: '/suppliers', label: 'Proveedores', icon: <SuppliersIcon /> },
  { path: '/financials', label: 'Finanzas', icon: <FinancialsIcon /> },
];

const NavItem: React.FC<{ path: string; label: string; icon: React.ReactNode }> = ({ path, label, icon }) => (
    <NavLink
        to={path}
        end={path === '/'}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-200 hover:bg-primary-700 hover:text-white rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-primary-700 font-semibold text-white' : ''
            }`
        }
    >
        {icon}
        <span className="ml-4">{label}</span>
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { state, logout } = useAppContext();
    const navigate = useNavigate();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="w-64 bg-primary-900 text-white flex flex-col h-full fixed">
                <div className="flex items-center justify-center h-20 border-b border-primary-800">
                    <div className="flex items-center space-x-3">
                        <ToothIcon />
                        <h1 className="text-2xl font-bold">Dental Lab</h1>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <NavItem key={item.path} {...item} />
                    ))}
                </nav>
                <div className="p-4 border-t border-primary-800">
                    {state.user && (
                        <div className="flex items-center">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm truncate" title={state.user.email}>{state.user.email}</p>
                                <p className="text-xs text-primary-300 capitalize">{state.user.role}</p>
                            </div>
                            <button 
                                onClick={() => setIsPasswordModalOpen(true)} 
                                title="Cambiar Contraseña" 
                                className="ml-2 p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-full flex-shrink-0"
                            >
                                <KeyIcon />
                            </button>
                            <button 
                                onClick={handleLogout} 
                                title="Cerrar Sesión" 
                                className="ml-2 p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-full flex-shrink-0"
                            >
                                <LogoutIcon />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Cambiar Contraseña"
            >
                <ChangePasswordForm 
                    onSuccess={() => setIsPasswordModalOpen(false)} 
                    onCancel={() => setIsPasswordModalOpen(false)}
                />
            </Modal>
        </>
    );
};
