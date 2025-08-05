import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
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
