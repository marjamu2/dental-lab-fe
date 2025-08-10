

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DashboardIcon, OrdersIcon, ClientsIcon, ProductsIcon, SuppliersIcon, ToothIcon, FinancialsIcon, LogoutIcon, KeyIcon, XMarkIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { Modal } from './Modal';
import { ChangePasswordForm } from './ChangePasswordForm.tsx';

interface SidebarProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen }) => {
    const { state, logout } = useAppContext();
    const navigate = useNavigate();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavItemClick = () => {
        if (window.innerWidth < 768) { // md breakpoint
            setOpen(false);
        }
    }

    return (
        <>
            {isOpen && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}
            <div className={`w-64 bg-primary-900 text-white flex flex-col h-full fixed z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-20 border-b border-primary-800 px-4">
                     <div className="flex items-center space-x-3">
                        <ToothIcon />
                        <h1 className="text-2xl font-bold">Dental Lab</h1>
                     </div>
                     <button onClick={() => setOpen(false)} className="p-2 md:hidden text-gray-300 hover:text-white hover:bg-primary-700 rounded-full">
                         <XMarkIcon />
                     </button>
                </div>
                <nav className="flex-1 p-4 space-y-2" onClick={handleNavItemClick}>
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