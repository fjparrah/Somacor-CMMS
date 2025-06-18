// 1. Ya no se necesita importar 'BrowserRouter' aquí
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
import GeneralInfoView from './pages/GeneralInfoView';
import MaintenanceConfigView from './pages/MaintenanceConfigView';
import PlaceholderPage from './components/shared/PlaceholderPage';

function App() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    // 2. Se elimina la etiqueta <Router> de este archivo
    <Routes>
      <Route path="/auth" element={!token ? <AuthPage /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={token ? <AppLayout /> : <Navigate to="/auth" />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="estado-maquina" element={<EstadoMaquinaView />} />
        <Route path="equipos-moviles" element={<EquiposMovilesView />} />
        <Route path="calendario" element={<CalendarView />} />
        <Route path="mantenimiento-no-planificado" element={<UnplannedMaintenanceView />} />
        
        {/* Administración */}
        <Route path="admin/perfiles" element={<ProfilesView />} />
        
        {/* Mantenedores */}
        <Route path="mantenedores/faenas" element={<FaenasView />} />
        <Route path="mantenedores/tipos-equipo" element={<TiposEquipoView />} />
        <Route path="mantenedores/tipos-tarea" element={<TiposTareaView />} />
        
        {/* Config Generales */}
        <Route path="config/generales" element={<GeneralInfoView />} />
        <Route path="config/mantenimiento" element={<MaintenanceConfigView />} />
        
        <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
