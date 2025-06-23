// src/components/layout/AppLayout.tsx
// ARCHIVO ACTUALIZADO: Se añade el enlace a "Checklist" en el menú de Control.

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NavLink from './NavLink';
import NavGroup from './NavGroup';
import { Outlet, useNavigate } from 'react-router-dom';

import { 
    LayoutDashboard, ClipboardList, Settings, Activity, Calendar as CalendarIcon, 
    AlertTriangle, Truck as TruckIcon, User as UserIcon, HardHat, LogOut,
    Wrench, Cog, FileText, ListChecks, CheckSquare
} from 'lucide-react';

const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-gray-100 font-sans" data-testid="app-layout">
            <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
                <div className="h-20 flex items-center justify-center bg-gray-900 px-4">
                    <h1 className="text-xl font-bold text-center">Somacor CMMS</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <NavLink icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
                    <NavLink icon={<Activity size={18} />} label="Estado de la Máquina" onClick={() => navigate('/estado-maquina')} />
                    
                    <NavGroup title="Control" icon={<ClipboardList size={18} />}>
                        <NavLink icon={<ListChecks size={16}/>} label="Órdenes de Trabajo" onClick={() => navigate('/ordenes-trabajo')} />
                        <NavLink icon={<CheckSquare size={16}/>} label="Checklist Diario" onClick={() => navigate('/checklist')} />
                        <NavLink icon={<Wrench size={16}/>} label="Crear Manten. Planificado" onClick={() => navigate('/mantenimiento-planificado')} />
                        <NavLink icon={<AlertTriangle size={16} />} label="Reportar Falla" onClick={() => navigate('/mantenimiento-no-planificado')} />
                        <NavLink icon={<CalendarIcon size={16} />} label="Calendario" onClick={() => navigate('/calendario')} />
                    </NavGroup>

                    <NavGroup title="Administración" icon={<Settings size={18} />}>
                        <NavLink icon={<UserIcon size={16} />} label="Perfiles" onClick={() => navigate('/admin/perfiles')} />
                        <NavLink icon={<TruckIcon size={16} />} label="Equipos Móviles" onClick={() => navigate('/equipos-moviles')} />
                        <NavLink icon={<FileText size={16} />} label="Programas Manten." onClick={() => navigate('/admin/programas')} />
                        <NavGroup title="Mantenedores" icon={<HardHat size={16} />}>
                            <NavLink label="Faenas" onClick={() => navigate('/mantenedores/faenas')} />
                            <NavLink label="Tipos de Equipo" onClick={() => navigate('/mantenedores/tipos-equipo')} />
                            <NavLink label="Tipos de Tarea" onClick={() => navigate('/mantenedores/tipos-tarea')} />
                        </NavGroup>
                        <NavLink icon={<Cog size={16} />} label="Config. Mantenimiento" onClick={() => navigate('/config/mantenimiento')} />
                    </NavGroup>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="text-sm mb-2 truncate" title={user?.username}>
                        Usuario: <strong>{user?.username ?? 'No autenticado'}</strong> 
                        <br/>
                        Rol: ({user?.usuarios?.nombrerol ?? 'N/A'})
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700">
                        <LogOut size={16} className="mr-2"/>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;

