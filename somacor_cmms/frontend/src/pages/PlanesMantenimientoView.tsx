import React, { useState, useCallback, useEffect } from 'react';
import { PlusCircle, BookOpen, Trash2, X, AlertCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import GenericForm from '../components/shared/GenericForm';
import { useTiposEquipo, useTareasEstandar } from '../hooks'; // Removed usePlanesMantenimiento
import { planesMantenimientoService, detallesPlanService } from '../services/apiService';
import type { PlanMantenimiento, DetallePlanMantenimiento, TareaEstandar } from '../types';

// --- Sub-componente para gestionar los detalles (tareas) de un plan ---
interface PlanDetailsProps {
  plan: PlanMantenimiento;
  tareasEstandar: TareaEstandar[];
  onClose: () => void;
  onDataChange: () => void;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, tareasEstandar, onClose, onDataChange }) => {
  const [detalles, setDetalles] = useState<DetallePlanMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [generandoAgenda, setGenerandoAgenda] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({ 
    idtareaestandar: '', 
    intervalohorasoperacion: '' 
  });

  // Cargar detalles del plan
  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        setLoading(true);
        const data = await planesMantenimientoService.getDetalles(plan.idplanmantenimiento);
        setDetalles(data);
      } catch (error) {
        console.error('Error loading plan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [plan.idplanmantenimiento]);

  const tareasAgrupadas = React.useMemo(() => {
    return detalles.reduce((acc, detalle) => {
      const key = detalle.intervalohorasoperacion;
      if (!acc[key]) acc[key] = [];
      acc[key].push(detalle);
      return acc;
    }, {} as Record<number, DetallePlanMantenimiento[]>);
  }, [detalles]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.idtareaestandar || !nuevaTarea.intervalohorasoperacion) {
      alert('Por favor, seleccione una tarea y especifique el intervalo de horas.');
      return;
    }
    
    try {
      await detallesPlanService.create({
        idplanmantenimiento: plan.idplanmantenimiento,
        idtareaestandar: parseInt(nuevaTarea.idtareaestandar, 10),
        intervalohorasoperacion: parseInt(nuevaTarea.intervalohorasoperacion, 10),
        activo: true,
        escritic: false
      });
      
      setNuevaTarea({ idtareaestandar: '', intervalohorasoperacion: '' });
      
      // Recargar detalles
      const updatedDetalles = await planesMantenimientoService.getDetalles(plan.idplanmantenimiento);
      setDetalles(updatedDetalles);
      onDataChange();
    } catch (err) {
      alert('Error al añadir la tarea.');
      console.error(err);
    }
  };

  const handleDeleteTask = async (idDetalle: number) => {
    if (window.confirm('¿Está seguro de que desea quitar esta tarea del plan?')) {
      try {
        await detallesPlanService.delete(idDetalle);
        
        // Recargar detalles
        const updatedDetalles = await planesMantenimientoService.getDetalles(plan.idplanmantenimiento);
        setDetalles(updatedDetalles);
        onDataChange();
      } catch (err) {
        alert('Error al quitar la tarea.');
        console.error(err);
      }
    }
  };

  const handleGenerarAgenda = async () => {
    try {
      setGenerandoAgenda(true);
      const resultado = await planesMantenimientoService.generarAgenda(plan.idplanmantenimiento);
      
      // Mostrar mensaje con detalles de los eventos creados
      const numEventos = resultado.eventos.length;
      let mensaje = `¡Agenda generada exitosamente! Se crearon ${numEventos} eventos.`;
      
      if (numEventos > 0) {
        mensaje += '\n\nEventos creados:';
        resultado.eventos.slice(0, 5).forEach((evento: any, index: number) => {
          mensaje += `\n${index + 1}. ${evento.tituloevento} - ${new Date(evento.fechahorainicio).toLocaleDateString()}`;
        });
        
        if (numEventos > 5) {
          mensaje += `\n... y ${numEventos - 5} más.`;
        }
      }
      
      alert(mensaje);
    } catch (err) {
      console.error('Error al generar la agenda:', err);
      alert('Error al generar la agenda. Por favor, inténtelo de nuevo.');
    } finally {
      setGenerandoAgenda(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando detalles del plan...</div>
      </div>
    );
  }
    
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{plan.nombreplan}</h3>
          <p className="text-sm text-gray-500">
            Tipo de Equipo: {plan.tipo_equipo?.nombretipo || 'N/A'}
          </p>
          {plan.descripcionplan && (
            <p className="text-sm text-gray-600 mt-1">{plan.descripcionplan}</p>
          )}
        </div>
        <button
          onClick={handleGenerarAgenda}
          disabled={generandoAgenda}
          className={`${
            generandoAgenda ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
          } text-white px-4 py-2 rounded-lg flex items-center transition-colors`}
        >
          {generandoAgenda ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando...
            </>
          ) : (
            <>
              <AlertCircle size={16} className="mr-2" />
              Generar Agenda
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tarea a Añadir</label>
          <select 
            value={nuevaTarea.idtareaestandar} 
            onChange={(e) => setNuevaTarea(prev => ({ ...prev, idtareaestandar: e.target.value }))} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Seleccione una tarea --</option>
            {tareasEstandar.map(t => (
              <option key={t.idtareaestandar} value={t.idtareaestandar}>
                {t.nombretarea} - {t.descripciontarea}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Intervalo (Horas)</label>
          <input 
            type="number" 
            placeholder="Ej: 250" 
            value={nuevaTarea.intervalohorasoperacion} 
            onChange={(e) => setNuevaTarea(prev => ({...prev, intervalohorasoperacion: e.target.value}))} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <PlusCircle size={18} className="mr-2" />
            Añadir Tarea al Plan
          </button>
        </div>
      </form>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {Object.keys(tareasAgrupadas).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tareas asignadas a este plan
          </div>
        ) : (
          Object.keys(tareasAgrupadas)
            .sort((a,b) => Number(a) - Number(b))
            .map(intervalo => (
              <div key={intervalo} className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">
                  Mantenimiento cada {intervalo} horas
                </h4>
                <ul className="space-y-2">
                  {tareasAgrupadas[Number(intervalo)].map(detalle => (
                    <li key={detalle.iddetalleplan} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {detalle.tarea_estandar?.nombretarea || 'Tarea sin nombre'}
                        </span>
                        <p className="text-xs text-gray-600">
                          {detalle.tarea_estandar?.descripciontarea}
                        </p>
                        {detalle.tarea_estandar?.tiempoestimadominutos && (
                          <p className="text-xs text-blue-600">
                            Tiempo estimado: {detalle.tarea_estandar.tiempoestimadominutos} min
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteTask(detalle.iddetalleplan)} 
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar tarea"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </div>
      
      <div className="flex justify-end pt-4 border-t">
        <button 
          onClick={onClose} 
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// --- Vista Principal ---
const PlanesMantenimientoView: React.FC = () => {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: tiposEquipo } = useTiposEquipo();
  const { data: tareasEstandar } = useTareasEstandar();
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PlanMantenimiento | null>(null);

  const fetchPlanes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await planesMantenimientoService.getAll();
      setPlanes(response.results || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los planes de mantenimiento');
      console.error('Error fetching planes de mantenimiento:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const handleCreate = () => {
    setCurrentItem(null);
    setIsPlanModalOpen(true);
  };

  const handleViewDetails = (plan: PlanMantenimiento) => {
    setCurrentItem(plan);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este plan y todas sus tareas asociadas?')) {
      try {
        await planesMantenimientoService.delete(id);
        fetchPlanes(); // Refetch after delete
      } catch (err) {
        alert('Error al eliminar el plan.');
        console.error(err);
      }
    }
  };

  const handleSavePlan = async (formData: any) => {
    try {
      await planesMantenimientoService.create({
        nombreplan: formData.nombreplan,
        descripcionplan: formData.descripcionplan || '',
        idtipoequipo: formData.idtipoequipo,
        activo: true
      });
      fetchPlanes(); // Refetch after create
      setIsPlanModalOpen(false);
    } catch (err) {
      alert('Error al guardar el plan.');
      console.error(err);
    }
  };

  const formFields = [
    { 
      name: 'nombreplan', 
      label: 'Nombre del Programa',
      required: true
    },
    { 
      name: 'descripcionplan', 
      label: 'Descripción',
      type: 'textarea'
    },
    {
      name: 'idtipoequipo',
      label: 'Tipo de Equipo Asociado',
      type: 'select',
      required: true,
      options: tiposEquipo.map(t => ({ 
        value: t.idtipoequipo, 
        label: t.nombretipo 
      }))
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando programas de mantenimiento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Programas de Mantenimiento</h1>
          <p className="text-gray-600 mt-2">
            Administra los planes de mantenimiento preventivo para cada tipo de equipo
          </p>
        </div>
        <button 
          onClick={handleCreate} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Crear Nuevo Programa
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {planes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay programas de mantenimiento</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primer programa de mantenimiento</p>
            <button 
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear Programa
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº de Tareas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planes.map(plan => (
                <tr key={plan.idplanmantenimiento} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plan.nombreplan}</div>
                      {plan.descripcionplan && (
                        <div className="text-sm text-gray-500">{plan.descripcionplan}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {plan.tipo_equipo?.nombretipo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {plan.detalles?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewDetails(plan)} 
                        className="text-indigo-600 hover:text-indigo-900 p-1" 
                        title="Gestionar Tareas del Plan"
                      >
                        <BookOpen size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan.idplanmantenimiento)} 
                        className="text-red-600 hover:text-red-900 p-1" 
                        title="Eliminar Plan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <Modal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        title="Crear Nuevo Programa"
      >
        <GenericForm
          fields={formFields}
          currentItem={null}
          onSave={handleSavePlan}
          onCancel={() => setIsPlanModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title="Detalles del Plan de Mantenimiento"
                    size="large"
      >
        {currentItem && (
          <PlanDetails 
            plan={currentItem} 
            tareasEstandar={tareasEstandar}
            onClose={() => setIsDetailModalOpen(false)}
            onDataChange={fetchPlanes} // Pass refetch to update main list after detail changes
          />
        )}
      </Modal>
    </div>
  );
};

export default PlanesMantenimientoView;


