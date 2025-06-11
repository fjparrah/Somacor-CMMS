import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NavLink from './NavLink';
import NavGroup from './NavGroup';

// --- [CORRECCIÓN] Se ajustan todas las rutas de importación ---
import DashboardView from '../../pages/DashboardView';
import MaintenanceConfigView from '../../pages/MaintenanceConfigView';
import MaintenanceFormView from '../../pages/MaintenanceFormView';
import EstadoMaquinaView from '../../pages/EstadoMaquinaView';
import CalendarView from '../../pages/CalendarView';
import UnplannedMaintenanceView from '../../pages/UnplannedMaintenanceView';
import EquiposMovilesView from '../../pages/EquiposMovilesView';
import ProfilesView from '../../pages/ProfilesView';
import FaenasView from '../../pages/FaenasView';
import TiposEquipoView from '../../pages/TiposEquipoView';
import TiposTareaView from '../../pages/TiposTareaView';
import PlaceholderPage from '../shared/PlaceholderPage';

// Importa los íconos
import { 
    LayoutDashboard, 
    ClipboardList, 
    Settings, 
    Activity, 
    Calendar as CalendarIcon, 
    AlertTriangle, 
    Truck as TruckIcon, 
    User as UserIcon,
    HardHat
} from 'lucide-react';

const AppLayout = () => {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Función que decide qué componente de página renderizar
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardView />;
            case 'maintenanceConfig': return <MaintenanceConfigView />;
            case 'maintenanceForm': return <MaintenanceFormView />;
            case 'unplannedMaintenance': return <UnplannedMaintenanceView />;
            case 'estadoMaquina': return <EstadoMaquinaView />;
            case 'calendario': return <CalendarView />;
            case 'equiposMoviles': return <EquiposMovilesView />;
            case 'perfiles': return <ProfilesView />;
            case 'faenas': return <FaenasView />;
            case 'tiposEquipo': return <TiposEquipoView />;
            case 'tiposTarea': return <TiposTareaView />;
            
            default: return <PlaceholderPage title={currentPage} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
                 <div className="h-20 flex items-center justify-center bg-gray-900 px-4">
                     <h1 className="text-xl font-bold text-center">Somacor CMMS</h1>
                 </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                     <NavLink icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setCurrentPage('dashboard')} />
                     <NavLink icon={<Activity size={18} />} label="Estado de la Máquina" onClick={() => setCurrentPage('estadoMaquina')} />

                     <NavGroup title="Control" icon={<ClipboardList size={18} />}>
                        <NavLink label="Manten. Planificada" onClick={() => setCurrentPage('maintenanceForm')} />
                        <NavLink label="Manten. No Planificada" icon={<AlertTriangle size={16} />} onClick={() => setCurrentPage('unplannedMaintenance')} />
                        <NavLink label="Calendario" icon={<CalendarIcon size={16} />} onClick={() => setCurrentPage('calendario')} />
                     </NavGroup>

                     <NavGroup title="Administración" icon={<Settings size={18} />}>
                        <NavLink icon={<UserIcon size={16} />} label="Perfiles" onClick={() => setCurrentPage('perfiles')} />
                        <NavLink icon={<TruckIcon size={16} />} label="Equipos Móviles" onClick={() => setCurrentPage('equiposMoviles')} />
                        <NavGroup title="Mantenedores" icon={<HardHat size={16} />}>
                            <NavLink label="Faenas" onClick={() => setCurrentPage('faenas')} />
                            <NavLink label="Tipos de Equipo" onClick={() => setCurrentPage('tiposEquipo')} />
                            <NavLink label="Tipos de Tarea" onClick={() => setCurrentPage('tiposTarea')} />
                        </NavGroup>
                        <NavLink label="Config. Generales" onClick={() => setCurrentPage('maintenanceConfig')} />
                     </NavGroup>
                </nav>
                 
                 <div className="p-4 border-t border-gray-700">
                     <div className="text-sm mb-2 truncate" title={user?.username}>
                         Usuario: {user?.username} ({user?.rol?.nombrerol})
                     </div>
                     <button 
                        onClick={logout} 
                        className="w-full text-left px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
                     >
                         Cerrar Sesión
                     </button>
                </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto p-8">
                {renderPage()}
            </main>
        </div>
    );
};

export default AppLayout;
