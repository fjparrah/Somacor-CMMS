import React, { useState, useMemo } from 'react';
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
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import GenericForm from '../components/shared/GenericForm';
import { 
  useOrdenesTrabajoFiltradas, 
  useEquipos, 
  useUsuarios,
  useTiposEquipo,
  usePlanesMantenimiento
} from '../hooks';
import { ordenesTrabajoService } from '../services/apiService';
import type { OrdenTrabajo, OrdenTrabajoFormData } from '../types';

const OrdenesTrabajoView: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: undefined as number | undefined,
    equipo: undefined as number | undefined,
    fechaInicio: '',
    fechaFin: ''
  });
  
  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hooks para datos
  const { ordenes, loading, error, refetch } = useOrdenesTrabajoFiltradas(filtros);
  const { data: equipos } = useEquipos();
  const { data: usuarios } = useUsuarios();
  const { data: tiposEquipo } = useTiposEquipo();
  const { data: planes } = usePlanesMantenimiento();

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta':
        return 'bg-blue-100 text-blue-800';
      case 'asignada':
        return 'bg-yellow-100 text-yellow-800';
      case 'en progreso':
        return 'bg-orange-100 text-orange-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta':
        return <Clock size={16} />;
      case 'asignada':
        return <User size={16} />;
      case 'en progreso':
        return <Wrench size={16} />;
      case 'completada':
        return <CheckCircle size={16} />;
      case 'cancelada':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  // Función para obtener el color de prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'crítica':
        return 'bg-red-500 text-white';
      case 'alta':
        return 'bg-orange-500 text-white';
      case 'media':
        return 'bg-yellow-500 text-white';
      case 'baja':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    const total = ordenes.length;
    const abiertas = ordenes.filter(o => o.estado_orden_trabajo?.nombreestado?.toLowerCase() === 'abierta').length;
    const enProgreso = ordenes.filter(o => o.estado_orden_trabajo?.nombreestado?.toLowerCase() === 'en progreso').length;
    const completadas = ordenes.filter(o => o.estado_orden_trabajo?.nombreestado?.toLowerCase() === 'completada').length;
    const vencidas = ordenes.filter(o => {
      if (!o.fechaejecucion) return false;
      return new Date(o.fechaejecucion) < new Date() && 
             o.estado_orden_trabajo?.nombreestado?.toLowerCase() !== 'completada';
    }).length;

    return { total, abiertas, enProgreso, completadas, vencidas };
  }, [ordenes]);

  const handleCreateFromPlan = async (formData: any) => {
    try {
      const data: OrdenTrabajoFormData = {
        idequipo: formData.idequipo,
        idplanorigen: formData.idplanorigen,
        horometro: formData.horometro,
        idtecnicoasignado: formData.idtecnicoasignado,
        idsolicitante: formData.idsolicitante,
        fechaejecucion: formData.fechaejecucion
      };
      
      await ordenesTrabajoService.crearDesdeplan(data);
      refetch();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert('Error al crear la orden de trabajo');
      console.error(err);
    }
  };

  const handleReportFalla = async (formData: any) => {
    try {
      await ordenesTrabajoService.reportarFalla({
        idequipo: formData.idequipo,
        idsolicitante: formData.idsolicitante,
        descripcionproblemareportado: formData.descripcionproblemareportado,
        prioridad: formData.prioridad
      });
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
    {
      name: 'idequipo',
      label: 'Equipo',
      type: 'select',
      required: true,
      options: equipos.map(e => ({ 
        value: e.idequipo, 
        label: `${e.codigointerno} - ${e.nombreequipo}` 
      }))
    },
    {
      name: 'idplanorigen',
      label: 'Plan de Mantenimiento',
      type: 'select',
      required: true,
      options: planes.map(p => ({ 
        value: p.idplanmantenimiento, 
        label: p.nombreplan 
      }))
    },
    {
      name: 'horometro',
      label: 'Horómetro Actual',
      type: 'number',
      required: true
    },
    {
      name: 'idtecnicoasignado',
      label: 'Técnico Asignado',
      type: 'select',
      options: usuarios.map(u => ({ 
        value: u.id, 
        label: `${u.first_name} ${u.last_name}` 
      }))
    },
    {
      name: 'idsolicitante',
      label: 'Solicitante',
      type: 'select',
      required: true,
      options: usuarios.map(u => ({ 
        value: u.id, 
        label: `${u.first_name} ${u.last_name}` 
      }))
    },
    {
      name: 'fechaejecucion',
      label: 'Fecha de Ejecución',
      type: 'date'
    }
  ];

  const formFieldsReportFalla = [
    {
      name: 'idequipo',
      label: 'Equipo',
      type: 'select',
      required: true,
      options: equipos.map(e => ({ 
        value: e.idequipo, 
        label: `${e.codigointerno} - ${e.nombreequipo}` 
      }))
    },
    {
      name: 'idsolicitante',
      label: 'Solicitante',
      type: 'select',
      required: true,
      options: usuarios.map(u => ({ 
        value: u.id, 
        label: `${u.first_name} ${u.last_name}` 
      }))
    },
    {
      name: 'descripcionproblemareportado',
      label: 'Descripción del Problema',
      type: 'textarea',
      required: true
    },
    {
      name: 'prioridad',
      label: 'Prioridad',
      type: 'select',
      required: true,
      options: [
        { value: 'Baja', label: 'Baja' },
        { value: 'Media', label: 'Media' },
        { value: 'Alta', label: 'Alta' },
        { value: 'Crítica', label: 'Crítica' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando órdenes de trabajo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Órdenes de Trabajo</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las órdenes de trabajo de mantenimiento preventivo y correctivo
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
          >
            <Filter size={20} className="mr-2" />
            Filtros
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
          >
            <AlertTriangle size={20} className="mr-2" />
            Reportar Falla
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <PlusCircle size={20} className="mr-2" />
            Crear desde Plan
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.abiertas}</div>
          <div className="text-sm text-gray-500">Abiertas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{estadisticas.enProgreso}</div>
          <div className="text-sm text-gray-500">En Progreso</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{estadisticas.completadas}</div>
          <div className="text-sm text-gray-500">Completadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</div>
          <div className="text-sm text-gray-500">Vencidas</div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipo</label>
              <select
                value={filtros.equipo || ''}
                onChange={(e) => setFiltros(prev => ({ 
                  ...prev, 
                  equipo: e.target.value ? Number(e.target.value) : undefined 
                }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos los equipos</option>
                {equipos.map(e => (
                  <option key={e.idequipo} value={e.idequipo}>
                    {e.codigointerno} - {e.nombreequipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ estado: undefined, equipo: undefined, fechaInicio: '', fechaFin: '' })}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de órdenes */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {ordenes.length === 0 ? (
          <div className="text-center py-12">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera orden de trabajo</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear Orden
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Ejecución
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenes.map(orden => (
                <tr key={orden.idordentrabajo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{orden.numeroot}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(orden.fechacreacion).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {orden.equipo?.codigointerno}
                      </div>
                      <div className="text-sm text-gray-500">
                        {orden.equipo?.nombreequipo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {orden.tipo_mantenimiento_ot?.nombretipomantenimientoot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      getEstadoColor(orden.estado_orden_trabajo?.nombreestado || '')
                    }`}>
                      {getEstadoIcon(orden.estado_orden_trabajo?.nombreestado || '')}
                      <span className="ml-1">{orden.estado_orden_trabajo?.nombreestado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getPrioridadColor(orden.prioridad)
                    }`}>
                      {orden.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {orden.fechaejecucion ? (
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1 text-gray-400" />
                        {new Date(orden.fechaejecucion).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No programada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(orden)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Orden desde Plan de Mantenimiento"
      >
        <GenericForm
          fields={formFieldsCreateFromPlan}
          currentItem={null}
          onSave={handleCreateFromPlan}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Reportar Falla"
      >
        <GenericForm
          fields={formFieldsReportFalla}
          currentItem={null}
          onSave={handleReportFalla}
          onCancel={() => setIsReportModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default OrdenesTrabajoView;

