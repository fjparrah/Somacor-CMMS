import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlusCircle, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  Calendar,
  User,
  Wrench,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Se asume que estos componentes y hooks existen en tu proyecto
import Modal from '../components/ui/Modal';
import GenericForm from '../components/shared/GenericForm';
import { 
  useOrdenesTrabajoFiltradas, 
  useEquipos, 
  useUsuarios,
  usePlanesMantenimiento
} from '../hooks';
import { ordenesTrabajoService } from '../services/apiService';
import type { OrdenTrabajo, OrdenTrabajoFormData } from '../types';


// Tipos de datos
// La interfaz OrdenTrabajoAPI ahora refleja los campos que vienen de la API,
// incluyendo los nombres de las relaciones para la tabla.
interface OrdenTrabajoAPI extends OrdenTrabajo {
  equipo_nombre: string;
  tipo_mantenimiento_nombre: string;
  estado_nombre: string;
}

type SortKey = keyof OrdenTrabajoAPI;

const OrdenesTrabajoView: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: undefined as number | undefined,
    equipo: undefined as number | undefined,
    fechaInicio: '',
    fechaFin: ''
  });
  
  // Estados para modales y UI
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'fechacreacion', direction: 'desc' });

  // Hooks de datos originales del usuario
  const { ordenes, loading, error, refetch } = useOrdenesTrabajoFiltradas(filtros);
  const { data: equipos } = useEquipos();
  const { data: usuarios } = useUsuarios();
  const { data: planes } = usePlanesMantenimiento();

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta': return 'bg-blue-100 text-blue-800';
      case 'asignada': return 'bg-yellow-100 text-yellow-800';
      case 'en progreso': return 'bg-orange-100 text-orange-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta': return <Clock size={16} />;
      case 'asignada': return <User size={16} />;
      case 'en progreso': return <Wrench size={16} />;
      case 'completada': return <CheckCircle size={16} />;
      case 'cancelada': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'crítica': return 'bg-red-500 text-white';
      case 'alta': return 'bg-orange-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const sortedAndFilteredOrdenes = useMemo(() => {
    let filteredOrdenes = ordenes;
    
    if (searchTerm) {
        filteredOrdenes = ordenes.filter((ot) =>
        Object.values(ot).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
        );
    }
    
    if (sortConfig !== null) {
      filteredOrdenes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredOrdenes;
  }, [ordenes, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4 inline-block text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline-block" /> : <ChevronDown className="h-4 w-4 inline-block" />;
  };

  const handleCreateFromPlan = async (formData: any) => {
    try {
      await ordenesTrabajoService.crearDesdeplan(formData);
      refetch();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert('Error al crear la orden de trabajo');
      console.error(err);
    }
  };

  const handleReportFalla = async (formData: any) => {
    try {
      await ordenesTrabajoService.reportarFalla(formData);
      refetch();
      setIsReportModalOpen(false);
    } catch (err) {
      alert('Error al reportar la falla');
      console.error(err);
    }
  };

  const handleViewDetails = (orden: OrdenTrabajo) => {
    navigate(`/ordenes-trabajo/${orden.idordentrabajo}`);
  };

  const formFieldsCreateFromPlan = [
    { name: 'idequipo', label: 'Equipo', type: 'select', required: true, options: equipos.map(e => ({ value: e.idequipo, label: `${e.codigointerno} - ${e.nombreequipo}` })) },
    { name: 'idplanorigen', label: 'Plan de Mantenimiento', type: 'select', required: true, options: planes.map(p => ({ value: p.idplanmantenimiento, label: p.nombreplan })) },
    { name: 'horometro', label: 'Horómetro Actual', type: 'number', required: true },
    { name: 'idtecnicoasignado', label: 'Técnico Asignado', type: 'select', options: usuarios.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })) },
    { name: 'idsolicitante', label: 'Solicitante', type: 'select', required: true, options: usuarios.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })) },
    { name: 'fechaejecucion', label: 'Fecha de Ejecución', type: 'date' }
  ];

  const formFieldsReportFalla = [
    { name: 'idequipo', label: 'Equipo', type: 'select', required: true, options: equipos.map(e => ({ value: e.idequipo, label: `${e.codigointerno} - ${e.nombreequipo}` })) },
    { name: 'descripcionproblemareportado', label: 'Descripción del Problema', type: 'textarea', required: true },
    { name: 'prioridad', label: 'Prioridad', type: 'select', required: true, options: [ { value: 'Baja', label: 'Baja' }, { value: 'Media', label: 'Media' }, { value: 'Alta', label: 'Alta' }, { value: 'Crítica', label: 'Crítica' } ] }
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Cargando órdenes de trabajo...</div></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-md p-4"><div className="flex"><AlertTriangle className="h-5 w-5 text-red-400" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Error</h3><div className="mt-2 text-sm text-red-700">{error}</div></div></div></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Órdenes de Trabajo</h1>
          <p className="text-gray-600 mt-2">Gestiona las órdenes de trabajo de mantenimiento preventivo y correctivo</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowFilters(!showFilters)} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"><Filter size={20} className="mr-2" />Filtros</button>
          <button onClick={() => setIsReportModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"><AlertTriangle size={20} className="mr-2" />Reportar Falla</button>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"><PlusCircle size={20} className="mr-2" />Crear desde Plan</button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* ... Contenido de filtros ... */}
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="p-4">
             <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Buscar OT..." className="w-full p-2 pl-10 border border-gray-300 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
        {sortedAndFilteredOrdenes.length === 0 ? (
          <div className="text-center py-12">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera orden de trabajo</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Crear Orden</button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('numeroot')}>Orden {getSortIcon('numeroot')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('equipo_nombre')}>Equipo {getSortIcon('equipo_nombre')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('tipo_mantenimiento_nombre')}>Tipo {getSortIcon('tipo_mantenimiento_nombre')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('estado_nombre')}>Estado {getSortIcon('estado_nombre')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('prioridad')}>Prioridad {getSortIcon('prioridad')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('fechaejecucion')}>Fecha Ejecución {getSortIcon('fechaejecucion')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredOrdenes.map((orden: OrdenTrabajoAPI) => (
                <tr key={orden.idordentrabajo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{orden.numeroot}</div>
                      <div className="text-sm text-gray-500">{new Date(orden.fechacreacion).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orden.equipo_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orden.tipo_mantenimiento_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado_nombre || '')}`}>{getEstadoIcon(orden.estado_nombre || '')}<span className="ml-1">{orden.estado_nombre}</span></span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(orden.prioridad)}`}>{orden.prioridad}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orden.fechaejecucion ? <div className="flex items-center"><Calendar size={16} className="mr-1 text-gray-400" />{new Date(orden.fechaejecucion).toLocaleDateString()}</div> : <span className="text-gray-400">No programada</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleViewDetails(orden)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Ver detalles"><Eye size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Orden desde Plan de Mantenimiento">
        <GenericForm fields={formFieldsCreateFromPlan} currentItem={null} onSave={handleCreateFromPlan} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Reportar Falla">
        <GenericForm fields={formFieldsReportFalla} currentItem={null} onSave={handleReportFalla} onCancel={() => setIsReportModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default OrdenesTrabajoView;
