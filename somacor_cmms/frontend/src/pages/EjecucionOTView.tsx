import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Play,
  Pause,
  Square,
  Save
} from 'lucide-react';
import { ordenesTrabajoService, actividadesOTService } from '../services/apiService';
import type { OrdenTrabajo, ActividadOrdenTrabajo } from '../types';

const EjecucionOTView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados principales
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
  const [actividades, setActividades] = useState<ActividadOrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para ejecución
  const [actividadEnProceso, setActividadEnProceso] = useState<number | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [resultadosInspeccion, setResultadosInspeccion] = useState<Record<number, string>>({});
  const [mediciones, setMediciones] = useState<Record<number, { valor: number; unidad: string }>>({});

  // Cargar datos de la orden
  useEffect(() => {
    const fetchOrdenData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const ordenData = await ordenesTrabajoService.getById(Number(id));
        setOrden(ordenData);
        
        // Cargar actividades
        const actividadesResponse = await actividadesOTService.getAll({ idordentrabajo: Number(id) });
        setActividades(Array.isArray(actividadesResponse) ? actividadesResponse : actividadesResponse.results || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la orden de trabajo');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenData();
  }, [id]);

  const handleIniciarActividad = (actividadId: number) => {
    setActividadEnProceso(actividadId);
    setTiempoInicio(new Date());
  };

  const handlePausarActividad = () => {
    setActividadEnProceso(null);
    setTiempoInicio(null);
  };

  const handleCompletarActividad = async (actividad: ActividadOrdenTrabajo) => {
    if (!actividadEnProceso || actividadEnProceso !== actividad.idactividadot) return;

    const tiempoRealMinutos = tiempoInicio 
      ? Math.round((new Date().getTime() - tiempoInicio.getTime()) / (1000 * 60))
      : undefined;

    try {
      await actividadesOTService.completarActividad(actividad.idactividadot, {
        observaciones: observaciones[actividad.idactividadot],
        tiempo_real_minutos: tiempoRealMinutos,
        resultado_inspeccion: resultadosInspeccion[actividad.idactividadot],
        medicion_valor: mediciones[actividad.idactividadot]?.valor,
        unidad_medicion: mediciones[actividad.idactividadot]?.unidad
      });

      // Recargar actividades
      const actividadesResponse = await actividadesOTService.getAll({ idordentrabajo: Number(id) });
      setActividades(Array.isArray(actividadesResponse) ? actividadesResponse : actividadesResponse.results || []);
      
      setActividadEnProceso(null);
      setTiempoInicio(null);
      
      alert('Actividad completada exitosamente');
    } catch (err) {
      console.error('Error al completar actividad:', err);
      alert('Error al completar la actividad');
    }
  };

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

  const formatTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  const calcularTiempoTranscurrido = () => {
    if (!tiempoInicio) return 0;
    return Math.round((new Date().getTime() - tiempoInicio.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando orden de trabajo...</div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error || 'Orden no encontrada'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ordenes-trabajo')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Orden de Trabajo: {orden.numeroot}
            </h1>
            <p className="text-gray-600 mt-2">
              Ejecución y seguimiento de actividades
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
            getEstadoColor(orden.estado_orden_trabajo?.nombreestado || '')
          }`}>
            {orden.estado_orden_trabajo?.nombreestado}
          </span>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            getPrioridadColor(orden.prioridad)
          }`}>
            {orden.prioridad}
          </span>
        </div>
      </div>

      {/* Información de la orden */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Equipo:</span>
            <p className="text-gray-900 font-medium">
              {orden.equipo?.codigointerno} - {orden.equipo?.nombreequipo}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Tipo de Mantenimiento:</span>
            <p className="text-gray-900">{orden.tipo_mantenimiento_ot?.nombretipomantenimientoot}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Técnico Asignado:</span>
            <p className="text-gray-900">
              {orden.tecnico_asignado ? 
                `${orden.tecnico_asignado.first_name} ${orden.tecnico_asignado.last_name}` : 
                'No asignado'
              }
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Fecha de Ejecución:</span>
            <p className="text-gray-900">
              {orden.fechaejecucion ? 
                new Date(orden.fechaejecucion).toLocaleDateString() : 
                'No programada'
              }
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Horómetro:</span>
            <p className="text-gray-900">{orden.horometro || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Solicitante:</span>
            <p className="text-gray-900">
              {orden.solicitante ? 
                `${orden.solicitante.first_name} ${orden.solicitante.last_name}` : 
                'N/A'
              }
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Fecha de Creación:</span>
            <p className="text-gray-900">{new Date(orden.fechacreacion).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Tiempo Total:</span>
            <p className="text-gray-900">
              {orden.tiempototalminutos ? formatTiempo(orden.tiempototalminutos) : 'N/A'}
            </p>
          </div>
        </div>
        
        {orden.descripcionproblemareportado && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Problema Reportado:</span>
            <p className="text-gray-900 mt-1">{orden.descripcionproblemareportado}</p>
          </div>
        )}
        
        {orden.observacionesfinales && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Observaciones Finales:</span>
            <p className="text-gray-900 mt-1">{orden.observacionesfinales}</p>
          </div>
        )}
      </div>

      {/* Cronómetro activo */}
      {actividadEnProceso && tiempoInicio && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-medium text-orange-800">
                Actividad en progreso - Tiempo transcurrido: {formatTiempo(calcularTiempoTranscurrido())}
              </span>
            </div>
            <button
              onClick={handlePausarActividad}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
            >
              <Pause size={16} className="mr-2" />
              Pausar
            </button>
          </div>
        </div>
      )}

      {/* Lista de actividades */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Actividades de Mantenimiento
        </h3>
        
        {actividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No hay actividades definidas para esta orden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actividades
              .sort((a, b) => a.secuencia - b.secuencia)
              .map(actividad => (
                <div key={actividad.idactividadot} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                          #{actividad.secuencia}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {actividad.tarea_estandar?.nombretarea}
                        </h4>
                        {actividad.fechafinactividad && (
                          <CheckCircle size={20} className="ml-2 text-green-500" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{actividad.descripcionactividad}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Tiempo Estimado:</span>
                          <p className="text-gray-900">{formatTiempo(actividad.tiempoestimadominutos)}</p>
                        </div>
                        {actividad.tiemporealminutos && (
                          <div>
                            <span className="font-medium text-gray-500">Tiempo Real:</span>
                            <p className="text-gray-900">{formatTiempo(actividad.tiemporealminutos)}</p>
                          </div>
                        )}
                        {actividad.fechainicioactividad && (
                          <div>
                            <span className="font-medium text-gray-500">Fecha Inicio:</span>
                            <p className="text-gray-900">
                              {new Date(actividad.fechainicioactividad).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Campos de ejecución */}
                      {actividadEnProceso === actividad.idactividadot && (
                        <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Observaciones
                            </label>
                            <textarea
                              value={observaciones[actividad.idactividadot] || ''}
                              onChange={(e) => setObservaciones(prev => ({
                                ...prev,
                                [actividad.idactividadot]: e.target.value
                              }))}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              placeholder="Observaciones durante la ejecución..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Resultado de Inspección
                            </label>
                            <input
                              type="text"
                              value={resultadosInspeccion[actividad.idactividadot] || ''}
                              onChange={(e) => setResultadosInspeccion(prev => ({
                                ...prev,
                                [actividad.idactividadot]: e.target.value
                              }))}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Resultado de la inspección..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medición
                              </label>
                              <input
                                type="number"
                                value={mediciones[actividad.idactividadot]?.valor || ''}
                                onChange={(e) => setMediciones(prev => ({
                                  ...prev,
                                  [actividad.idactividadot]: {
                                    ...prev[actividad.idactividadot],
                                    valor: Number(e.target.value)
                                  }
                                }))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Valor medido"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unidad
                              </label>
                              <input
                                type="text"
                                value={mediciones[actividad.idactividadot]?.unidad || ''}
                                onChange={(e) => setMediciones(prev => ({
                                  ...prev,
                                  [actividad.idactividadot]: {
                                    ...prev[actividad.idactividadot],
                                    unidad: e.target.value
                                  }
                                }))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ej: mm, bar, °C"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar datos completados */}
                      {actividad.fechafinactividad && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {actividad.observacionesactividad && (
                              <div>
                                <span className="font-medium text-gray-500">Observaciones:</span>
                                <p className="text-gray-900">{actividad.observacionesactividad}</p>
                              </div>
                            )}
                            {actividad.resultadoinspeccion && (
                              <div>
                                <span className="font-medium text-gray-500">Resultado:</span>
                                <p className="text-gray-900">{actividad.resultadoinspeccion}</p>
                              </div>
                            )}
                            {actividad.medicionvalor && (
                              <div>
                                <span className="font-medium text-gray-500">Medición:</span>
                                <p className="text-gray-900">
                                  {actividad.medicionvalor} {actividad.unidadmedicion}
                                </p>
                              </div>
                            )}
                            {actividad.tecnico_ejecutor && (
                              <div>
                                <span className="font-medium text-gray-500">Ejecutado por:</span>
                                <p className="text-gray-900">
                                  {actividad.tecnico_ejecutor.first_name} {actividad.tecnico_ejecutor.last_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {!actividad.fechafinactividad && (
                        <>
                          {actividadEnProceso === actividad.idactividadot ? (
                            <button
                              onClick={() => handleCompletarActividad(actividad)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Completar
                            </button>
                          ) : actividadEnProceso === null ? (
                            <button
                              onClick={() => handleIniciarActividad(actividad.idactividadot)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                            >
                              <Play size={16} className="mr-2" />
                              Iniciar
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed flex items-center"
                            >
                              <Square size={16} className="mr-2" />
                              En espera
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EjecucionOTView;

