import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { WorkOrder, OrderStatus } from '../types';

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
}

// A simple Bar Chart component
const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-10">No hay datos para mostrar con los filtros seleccionados.</div>;
    }
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) {
        return <div className="text-center text-gray-500 py-10">No hay ingresos realizados en el período seleccionado.</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ingresos Realizados por Mes</h3>
            <div className="flex justify-around items-end h-64 space-x-4 pt-4 border-t border-gray-200">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center flex-1 h-full" style={{minWidth: '40px'}}>
                         <div className="flex items-end w-full h-full">
                            <div className="w-full bg-primary-200 rounded-t-md hover:bg-primary-300 transition-all"
                                style={{ height: `${(value / maxValue) * 100}%` }}
                                title={`${label}: ${formatPrice(value)}`}
                            >
                            </div>
                         </div>
                        <span className="text-xs text-gray-500 mt-2 truncate">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const Financials: React.FC = () => {
    const { state } = useAppContext();
    const { orders, clients, products } = state;
    
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        clientId: 'all',
        productId: 'all'
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const calculateOrderTotal = (order: WorkOrder) => {
        if (!order.items) return 0;
        return order.items.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + ((product?.price || 0) * (item.quantity || 0));
        }, 0);
    };
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.dueDate);
            const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
            const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;

            if (startDate && orderDate < startDate) return false;
            if (endDate && orderDate > endDate) return false;
            if (filters.clientId !== 'all' && order.clientId !== filters.clientId) return false;
            if (filters.productId !== 'all' && !order.items.some(item => item.productId === filters.productId)) return false;

            return true;
        });
    }, [orders, filters]);

    const financialKPIs = useMemo(() => {
        const initialKPIs = {
            totalRevenue: 0,
            projectedRevenue: 0,
            completedOrders: 0,
            pendingOrders: 0
        };

        return filteredOrders.reduce((acc, order) => {
            const orderValue = calculateOrderTotal(order);
            if (order.status === OrderStatus.Entregado) {
                acc.totalRevenue += orderValue;
                acc.completedOrders += 1;
            } else {
                acc.projectedRevenue += orderValue;
                acc.pendingOrders += 1;
            }
            return acc;
        }, initialKPIs);

    }, [filteredOrders, products]);

    const monthlyRevenueData = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};
        
        filteredOrders.forEach(order => {
            if (order.status === OrderStatus.Entregado) {
                const date = new Date(order.dueDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                const value = calculateOrderTotal(order);

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += value;
            }
        });

        return Object.entries(monthlyData)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => ({
                label: key,
                value,
            }));
    }, [filteredOrders]);
    
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Análisis Financiero</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-md">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                    <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                    <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                 <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
                    <select name="clientId" id="clientId" value={filters.clientId} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900">
                      <option value="all">Todos los Clientes</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Producto</label>
                    <select name="productId" id="productId" value={filters.productId} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900">
                      <option value="all">Todos los Productos</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500 uppercase">Ingresos Totales (Realizados)</p>
                    <p className="text-3xl font-bold text-green-600">{formatPrice(financialKPIs.totalRevenue)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500 uppercase">Ingresos Proyectados (Pendientes)</p>
                    <p className="text-3xl font-bold text-yellow-600">{formatPrice(financialKPIs.projectedRevenue)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500 uppercase">Órdenes Completadas</p>
                    <p className="text-3xl font-bold text-gray-800">{financialKPIs.completedOrders}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500 uppercase">Órdenes Pendientes</p>
                    <p className="text-3xl font-bold text-gray-800">{financialKPIs.pendingOrders}</p>
                </div>
            </div>
            
            {/* Chart */}
            <BarChart data={monthlyRevenueData} />
        </div>
    );
}
