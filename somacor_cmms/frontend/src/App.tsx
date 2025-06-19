// src/App.tsx
// MODIFICADO: Se elimina la lógica condicional de autenticación para renderizar
// directamente el layout principal de la aplicación. Esto permite acceder a todas
// las vistas sin necesidad de iniciar sesión.

import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardView from './pages/DashboardView';
import EstadoMaquinaView from './pages/EstadoMaquinaView';
import EquiposMovilesView from './pages/EquiposMovilesView';
import CalendarView from './pages/CalendarView';
import UnplannedMaintenanceView from './pages/UnplannedMaintenanceView';
import ProfilesView from './pages/ProfilesView';
import FaenasView from './pages/FaenasView';
import TiposEquipoView from './pages/TiposEquipoView';
import TiposTareaView from './pages/TiposTareaView';
import MaintenanceConfigView from './pages/MaintenanceConfigView';
import MaintenanceFormView from './pages/MaintenanceFormView';
import PlaceholderPage from './components/shared/PlaceholderPage';

function App() {
  // Ya no se necesita el hook useAuth aquí, la lógica se simplifica.
  return (
    <Routes>
      {/* Redirige cualquier intento de acceder a /auth al dashboard principal. */}
      <Route path="/auth" element={<Navigate to="/dashboard" />} />
      
      {/* La ruta raíz ahora renderiza incondicionalmente AppLayout, que contiene la
        navegación principal y el área de contenido (Outlet).
      */}
      <Route path="/" element={<AppLayout />}>
        {/* La ruta índice (/) redirige automáticamente al dashboard. */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Definición de todas las rutas de las páginas de la aplicación. */}
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="estado-maquina" element={<EstadoMaquinaView />} />
        <Route path="equipos-moviles" element={<EquiposMovilesView />} />
        <Route path="calendario" element={<CalendarView />} />
        <Route path="mantenimiento-planificado" element={<MaintenanceFormView />} />
        <Route path="mantenimiento-no-planificado" element={<UnplannedMaintenanceView />} />
        
        {/* Rutas de Administración */}
        <Route path="admin/perfiles" element={<ProfilesView />} />
        
        {/* Rutas de Mantenedores */}
        <Route path="mantenedores/faenas" element={<FaenasView />} />
        <Route path="mantenedores/tipos-equipo" element={<TiposEquipoView />} />
        <Route path="mantenedores/tipos-tarea" element={<TiposTareaView />} />
        
        {/* Rutas de Configuración */}
        <Route path="config/mantenimiento" element={<MaintenanceConfigView />} />
        
        {/* Ruta comodín para páginas no encontradas. */}
        <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
