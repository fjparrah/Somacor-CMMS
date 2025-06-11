import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import { Users, Truck, Wrench, Building } from 'lucide-react';

const DashboardView = () => {
    // Datos de ejemplo
    const resumenData = [ { name: 'Ene', Mantenimientos: 20 }, { name: 'Feb', Mantenimientos: 25 }, { name: 'Mar', Mantenimientos: 32 }, { name: 'Abr', Mantenimientos: 28 }, ];
    const distribucionData = [{ name: 'Preventivo', value: 400 }, { name: 'Correctivo', value: 150 }];
    const COLORS = ['#0088FE', '#FF8042'];
    const detallesData = [
        { id: 1, tipo: 'PREVENTIVA (1000)', tecnico: 'Técnico Tec 1', ubicacion: 'Faena 1', conductor: 'Conductor 4', fecha: '10-05-2024' },
        { id: 2, tipo: 'CORRECTIVA', tecnico: 'Técnico Tec 5', ubicacion: 'Faena 1', conductor: 'Conductor 1', fecha: '10-05-2024' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Inicial</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
                <Card title="Total de Usuarios" value="12" icon={<Users className="text-white" />} color="bg-blue-500" />
                <Card title="Equipos Activos" value="54" icon={<Truck className="text-white" />} color="bg-green-500" />
                <Card title="Órdenes Abiertas" value="8" icon={<Wrench className="text-white" />} color="bg-yellow-500" />
                <Card title="Faenas Operativas" value="3" icon={<Building className="text-white" />} color="bg-indigo-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Mantenimiento</h2>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={resumenData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Mantenimientos" fill="#8884d8" /></BarChart></ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Distribución de Mantenimiento</h2>
                     <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={distribucionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>{distribucionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Detalles de Mantenimiento</h2>
                <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{detallesData.map(item => (<tr key={item.id}><td className="px-6 py-4 whitespace-nowrap text-sm">{item.tipo}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{item.tecnico}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{item.ubicacion}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{item.fecha}</td></tr>))}</tbody></table></div>
            </div>
        </div>
    );
};

export default DashboardView;
