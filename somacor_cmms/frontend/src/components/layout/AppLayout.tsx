// src/components/layout/AppLayout.tsx
// ARCHIVO ACTUALIZADO: Se añade perfilamiento por roles para mostrar solo las vistas correspondientes a cada rol.

import React from 'react';
import NavLink from './NavLink';
import NavGroup from './NavGroup';
import { Outlet, useNavigate } from 'react-router-dom';
import { getUserInfo, getUserRole, logout } from '../../utils/auth';
import ChatWidget from '../ChatWidget';

import { 
    LayoutDashboard, ClipboardList, Settings, Activity, Calendar as CalendarIcon, 
    AlertTriangle, Truck as TruckIcon, User as UserIcon, HardHat, LogOut,
    Wrench, Cog, FileText, ListChecks, CheckSquare
} from 'lucide-react';

const AppLayout = () => {
    const user = getUserInfo();
    const role = getUserRole();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    // Función para determinar qué elementos del menú debe ver cada rol
    const getMenuItemsForRole = (roleName: string) => {
        const menuItems = {
            // Administrador: Acceso completo a todo el sistema
            'Administrador': {
                showDashboard: true,
                showEstadoMaquina: true,
                showControl: true,
                controlItems: {
                    showOrdenesTrabajoControl: true,
                    showChecklistDiario: true,
                    showCrearMantenimiento: true,
                    showReportarFalla: true,
                    showCalendario: true
                },
                showAdministracion: true,
                adminItems: {
                    showPerfiles: true,
                    showEquiposMoviles: true,
                    showProgramasMantenimiento: true,
                    showMantenedores: true,
                    showConfigMantenimiento: true
                }
            },
            // Supervisor: Gestión operativa y supervisión
            'Supervisor': {
                showDashboard: true,
                showEstadoMaquina: true,
                showControl: true,
                controlItems: {
                    showOrdenesTrabajoControl: true,
                    showChecklistDiario: true,
                    showCrearMantenimiento: true,
                    showReportarFalla: true,
                    showCalendario: true
                },
                showAdministracion: true,
                adminItems: {
                    showPerfiles: false,
                    showEquiposMoviles: true,
                    showProgramasMantenimiento: true,
                    showMantenedores: true,
                    showConfigMantenimiento: true
                }
            },
            // Operador: Operaciones básicas y reportes
            'Operador': {
                showDashboard: false,
                showEstadoMaquina: true,
                showControl: true,
                controlItems: {
                    showOrdenesTrabajoControl: true,
                    showChecklistDiario: true,
                    showCrearMantenimiento: false,
                    showReportarFalla: true,
                    showCalendario: true
                },
                showAdministracion: false,
                adminItems: {
                    showPerfiles: false,
                    showEquiposMoviles: false,
                    showProgramasMantenimiento: false,
                    showMantenedores: false,
                    showConfigMantenimiento: false
                }
            },
            // Técnico: Ejecución de mantenimiento y reportes técnicos
            'Técnico': {
                showDashboard: false,
                showEstadoMaquina: true,
                showControl: true,
                controlItems: {
                    showOrdenesTrabajoControl: true,
                    showChecklistDiario: true,
                    showCrearMantenimiento: false,
                    showReportarFalla: true,
                    showCalendario: true
                },
                showAdministracion: false,
                adminItems: {
                    showPerfiles: false,
                    showEquiposMoviles: false,
                    showProgramasMantenimiento: false,
                    showMantenedores: false,
                    showConfigMantenimiento: false
                }
            }
        };

        return menuItems[roleName] || menuItems['Operador']; // Por defecto, usar permisos de Operador
    };

    const menuConfig = getMenuItemsForRole(role?.nombre || 'Operador');

    return (
        <div className="flex h-screen bg-gray-100 font-sans" data-testid="app-layout">
            <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
                <div className="h-20 flex items-center justify-center bg-gray-900 px-4">
                    <h1 className="text-xl font-bold text-center">Somacor CMMS</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {/* Dashboard - Solo para Administrador y Supervisor */}
                    {menuConfig.showDashboard && (
                        <NavLink icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
                    )}
                    
                    {/* Estado de la Máquina - Para todos los roles operativos */}
                    {menuConfig.showEstadoMaquina && (
                        <NavLink icon={<Activity size={18} />} label="Estado de la Máquina" onClick={() => navigate('/estado-maquina')} />
                    )}
                    
                    {/* Grupo Control - Para roles operativos */}
                    {menuConfig.showControl && (
                        <NavGroup title="Control" icon={<ClipboardList size={18} />}>
                            {menuConfig.controlItems.showOrdenesTrabajoControl && (
                                <NavLink icon={<ListChecks size={16}/>} label="Órdenes de Trabajo" onClick={() => navigate('/ordenes-trabajo')} />
                            )}
                            {menuConfig.controlItems.showChecklistDiario && (
                                <NavLink icon={<CheckSquare size={16}/>} label="Checklist Diario" onClick={() => navigate('/checklist')} />
                            )}
                            {menuConfig.controlItems.showCrearMantenimiento && (
                                <NavLink icon={<Wrench size={16}/>} label="Crear Manten. Planificado" onClick={() => navigate('/mantenimiento-planificado')} />
                            )}
                            {menuConfig.controlItems.showReportarFalla && (
                                <NavLink icon={<AlertTriangle size={16} />} label="Reportar Falla" onClick={() => navigate('/mantenimiento-no-planificado')} />
                            )}
                            {menuConfig.controlItems.showCalendario && (
                                <NavLink icon={<CalendarIcon size={16} />} label="Calendario" onClick={() => navigate('/calendario')} />
                            )}
                        </NavGroup>
                    )}

                    {/* Grupo Administración - Solo para Administrador y Supervisor */}
                    {menuConfig.showAdministracion && (
                        <NavGroup title="Administración" icon={<Settings size={18} />}>
                            {menuConfig.adminItems.showPerfiles && (
                                <NavLink icon={<UserIcon size={16} />} label="Perfiles" onClick={() => navigate('/admin/perfiles')} />
                            )}
                            {menuConfig.adminItems.showEquiposMoviles && (
                                <NavLink icon={<TruckIcon size={16} />} label="Equipos Móviles" onClick={() => navigate('/equipos-moviles')} />
                            )}
                            {menuConfig.adminItems.showProgramasMantenimiento && (
                                <NavLink icon={<FileText size={16} />} label="Programas Manten." onClick={() => navigate('/admin/programas')} />
                            )}
                            {menuConfig.adminItems.showMantenedores && (
                                <NavGroup title="Mantenedores" icon={<HardHat size={16} />}>
                                    <NavLink label="Faenas" onClick={() => navigate('/mantenedores/faenas')} />
                                    <NavLink label="Tipos de Equipo" onClick={() => navigate('/mantenedores/tipos-equipo')} />
                                    <NavLink label="Tipos de Tarea" onClick={() => navigate('/mantenedores/tipos-tarea')} />
                                </NavGroup>
                            )}
                            {menuConfig.adminItems.showConfigMantenimiento && (
                                <NavLink icon={<Cog size={16} />} label="Config. Mantenimiento" onClick={() => navigate('/config/mantenimiento')} />
                            )}
                        </NavGroup>
                    )}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="text-sm mb-2 truncate" title={user?.username}>
                        Usuario: <strong>{user?.username ?? 'No autenticado'}</strong> 
                        <br/>
                        Rol: <strong>{role?.nombre ?? 'N/A'}</strong>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700">
                        <LogOut size={16} className="mr-2"/>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
            <ChatWidget />
        </div>
    );
};

export default AppLayout;

