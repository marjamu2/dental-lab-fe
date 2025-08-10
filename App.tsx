

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { ClientList } from './components/ClientList';
import { ProductList } from './components/ProductList';
import { SupplierList } from './components/SupplierList';
import { Financials } from './components/Financials';
import { useAppContext } from './context/AppContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChatbotFab } from './components/ChatbotFab';
import { Chatbot } from './components/Chatbot';
import { Login } from './components/Login';
import { PrivateRoute } from './components/PrivateRoute';
import { MenuIcon } from './components/icons';

const getHeaderTitle = (pathname: string): string => {
    if (pathname.startsWith('/orders')) return 'Órdenes de Trabajo';
    if (pathname.startsWith('/clients')) return 'Clientes';
    if (pathname.startsWith('/products')) return 'Productos';
    if (pathname.startsWith('/suppliers')) return 'Proveedores';
    if (pathname.startsWith('/financials')) return 'Finanzas';
    return 'Dashboard';
}

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-20">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-primary-600">
                <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-primary-900">{getHeaderTitle(location.pathname)}</h1>
            <div className="w-6"></div>
        </header>

        <main className="flex-1">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/suppliers" element={<SupplierList />} />
                <Route path="/financials" element={<Financials />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
      </div>
      <Chatbot />
      <ChatbotFab />
    </div>
  );
};


const App: React.FC = () => {
  const { state } = useAppContext();

  if (!state.isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;