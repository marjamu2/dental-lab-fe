import React from 'react';
import { useAppContext } from '../context/AppContext';
import { OrderStatus, WorkOrder } from '../types';
import { Link } from 'react-router-dom';
import { OrdersIcon, ClientsIcon, ProductsIcon } from './icons';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="bg-primary-500 text-white p-3 rounded-full">
            {icon}
        </div>
    </div>
);

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

const RecentOrderRow: React.FC<{order: WorkOrder}> = ({order}) => {
    const { state } = useAppContext();
    const clientName = state.clients.find(c => c.id === order.clientId)?.name || 'N/A';
    
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.patientName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clientName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.dueDate).toLocaleDateString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={order.status} /></td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to="/orders" className="text-primary-600 hover:text-primary-900">Ver</Link>
            </td>
        </tr>
    );
};

export const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    const pendingOrders = state.orders.filter(o => o.status !== OrderStatus.Entregado).length;
    const recentOrders = [...state.orders]
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .slice(0, 5);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Órdenes Pendientes" value={pendingOrders} icon={<OrdersIcon />} />
                <StatCard title="Clientes Activos" value={state.clients.length} icon={<ClientsIcon />} />
                <StatCard title="Total Productos" value={state.products.length} icon={<ProductsIcon />} />
            </div>

            <div className="bg-white shadow-md rounded-lg">
                 <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Órdenes Recientes</h2>
                 </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrega</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map(order => <RecentOrderRow key={order.id} order={order} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
