import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Clock
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { 
  useEquipos, 
  useChecklistTemplates, 
  useChecklistHistorial,
  useForm
} from '../hooks';
import { checklistService } from '../services/apiService';
import type { 
  ChecklistTemplate, 
  ChecklistInstance, 
  ChecklistFormData,
  ChecklistCompletionResponse 
} from '../types';

const ChecklistView: React.FC = () => {
  // Estados principales
  const [selectedEquipo, setSelectedEquipo] = useState<number | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<ChecklistInstance | null>(null);
  const [completionResult, setCompletionResult] = useState<ChecklistCompletionResponse | null>(null);

  // Hooks para datos
  const { data: equipos } = useEquipos();
  const { templates, loading: templatesLoading } = useChecklistTemplates(selectedEquipo);
  const { historial, loading: historialLoading, refetch: refetchHistorial } = useChecklistHistorial(selectedEquipo);

  // Estados para el formulario de checklist
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [checklistAnswers, setChecklistAnswers] = useState<Record<number, {
    estado: 'bueno' | 'malo' | 'na';
    observacion?: string;
  }>>({});

  const {
    values: formValues,
    setValue: setFormValue,
    errors: formErrors,
    setError: setFormError,
    reset: resetForm
  } = useForm({
    fecha_inspeccion: new Date().toISOString().split('T')[0],
    horometro_inspeccion: '',
    lugar_inspeccion: '',
    observaciones_generales: ''
  });

  const handleEquipoChange = (equipoId: number) => {
    setSelectedEquipo(equipoId);
    setSelectedTemplate(null);
    setChecklistAnswers({});
    resetForm();
  };

  const handleTemplateSelect = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
    
    // Inicializar respuestas
    const initialAnswers: Record<number, { estado: 'bueno' | 'malo' | 'na'; observacion?: string }> = {};
    template.categorias?.forEach(categoria => {
      categoria.items?.forEach(item => {
        initialAnswers[item.id] = { estado: 'bueno' };
      });
    });
    setChecklistAnswers(initialAnswers);
  };

  const handleAnswerChange = (itemId: number, estado: 'bueno' | 'malo' | 'na', observacion?: string) => {
    setChecklistAnswers(prev => ({
      ...prev,
      [itemId]: { estado, observacion }
    }));
  };

  const handleSubmitChecklist = async () => {
    if (!selectedTemplate || !selectedEquipo) return;

    // Validaciones
    if (!formValues.fecha_inspeccion) {
      setFormError('fecha_inspeccion', 'La fecha de inspección es requerida');
      return;
    }

    try {
      const formData: ChecklistFormData = {
        template: selectedTemplate.id,
        equipo: selectedEquipo,
        operador: 1, // TODO: Obtener del contexto de usuario
        fecha_inspeccion: formValues.fecha_inspeccion,
        horometro_inspeccion: formValues.horometro_inspeccion ? Number(formValues.horometro_inspeccion) : undefined,
        lugar_inspeccion: formValues.lugar_inspeccion,
        observaciones_generales: formValues.observaciones_generales,
        answers: Object.entries(checklistAnswers).map(([itemId, answer]) => ({
          item: Number(itemId),
          estado: answer.estado,
          observacion_item: answer.observacion
        }))
      };

      const result = await checklistService.completarChecklist(formData);
      setCompletionResult(result);
      setIsCreateModalOpen(false);
      refetchHistorial();
      
      // Mostrar resultado
      if (result.alertas.requiere_atencion_inmediata) {
        alert(`¡ATENCIÓN! Se encontraron elementos críticos en mal estado. ${
          result.alertas.ot_creada ? `Se ha creado la OT ${result.alertas.ot_creada.numero_ot}` : ''
        }`);
      }
    } catch (error) {
      console.error('Error al completar checklist:', error);
      alert('Error al completar el checklist');
    }
  };

  const handleViewInstance = (instance: ChecklistInstance) => {
    setSelectedInstance(instance);
    setIsViewModalOpen(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'bueno': return 'text-green-600 bg-green-100';
      case 'malo': return 'text-red-600 bg-red-100';
      case 'na': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'bueno': return <CheckCircle size={16} />;
      case 'malo': return <XCircle size={16} />;
      case 'na': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Checklist de Inspección</h1>
        <p className="text-gray-600 mt-2">
          Realiza inspecciones diarias y gestiona el historial de checklist
        </p>
      </div>

      {/* Selector de equipo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Equipo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipo a Inspeccionar
            </label>
            <select
              value={selectedEquipo || ''}
              onChange={(e) => handleEquipoChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione un equipo</option>
              {equipos.map(equipo => (
                <option key={equipo.idequipo} value={equipo.idequipo}>
                  {equipo.codigointerno} - {equipo.nombreequipo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plantillas disponibles */}
      {selectedEquipo && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Plantillas de Checklist Disponibles
          </h3>
          {templatesLoading ? (
            <div className="text-gray-500">Cargando plantillas...</div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">{template.nombre}</h4>
                  {template.descripcion && (
                    <p className="text-sm text-gray-600 mb-3">{template.descripcion}</p>
                  )}
                  <div className="text-xs text-gray-500 mb-3">
                    {template.categorias?.length || 0} categorías
                  </div>
                  <button
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Realizar Inspección
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No hay plantillas de checklist disponibles para este equipo</p>
            </div>
          )}
        </div>
      )}

      {/* Historial de inspecciones */}
      {selectedEquipo && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Historial de Inspecciones
          </h3>
          {historialLoading ? (
            <div className="text-gray-500">Cargando historial...</div>
          ) : historial.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plantilla
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horómetro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historial.map(instance => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {new Date(instance.fecha_inspeccion).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instance.template_info?.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instance.operador_info?.first_name} {instance.operador_info?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          instance.completado 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {instance.completado ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Completado
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="mr-1" />
                              Pendiente
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instance.horometro_inspeccion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewInstance(instance)}
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
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No hay inspecciones registradas para este equipo</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear checklist */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Checklist: ${selectedTemplate?.nombre}`}
        size="large"
      >
        {selectedTemplate && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inspección *
                </label>
                <input
                  type="date"
                  value={formValues.fecha_inspeccion}
                  onChange={(e) => setFormValue('fecha_inspeccion', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {formErrors.fecha_inspeccion && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.fecha_inspeccion}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horómetro
                </label>
                <input
                  type="number"
                  value={formValues.horometro_inspeccion}
                  onChange={(e) => setFormValue('horometro_inspeccion', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Horómetro actual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de Inspección
                </label>
                <input
                  type="text"
                  value={formValues.lugar_inspeccion}
                  onChange={(e) => setFormValue('lugar_inspeccion', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ubicación donde se realiza la inspección"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={formValues.observaciones_generales}
                  onChange={(e) => setFormValue('observaciones_generales', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Observaciones generales de la inspección"
                />
              </div>
            </div>

            {/* Items del checklist por categoría */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedTemplate.categorias?.map(categoria => (
                <div key={categoria.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                    {categoria.nombre}
                  </h4>
                  <div className="space-y-3">
                    {categoria.items?.map(item => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{item.nombre}</span>
                            {item.es_critico && (                               <AlertTriangle size={16} className="ml-2 text-red-500" />
                            )}
                          </div>
                          {item.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {(['bueno', 'malo', 'na'] as const).map(estado => (
                            <button
                              key={estado}
                              onClick={() => handleAnswerChange(item.id, estado)}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                checklistAnswers[item.id]?.estado === estado
                                  ? getEstadoColor(estado)
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {getEstadoIcon(estado)}
                              <span className="ml-1">
                                {estado === 'bueno' ? 'Bueno' : estado === 'malo' ? 'Malo' : 'N/A'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitChecklist}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Completar Checklist
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para ver detalles de instancia */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de Inspección"
        size="large"
      >
        {selectedInstance && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha:</span>
                <p className="text-gray-900">{new Date(selectedInstance.fecha_inspeccion).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Operador:</span>
                <p className="text-gray-900">
                  {selectedInstance.operador_info?.first_name} {selectedInstance.operador_info?.last_name}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Horómetro:</span>
                <p className="text-gray-900">{selectedInstance.horometro_inspeccion || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Lugar:</span>
                <p className="text-gray-900">{selectedInstance.lugar_inspeccion || 'N/A'}</p>
              </div>
            </div>
            
            {selectedInstance.observaciones_generales && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Observaciones Generales:</span>
                <p className="text-gray-900 mt-1">{selectedInstance.observaciones_generales}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Respuestas del Checklist</h4>
              {selectedInstance.respuestas?.map(respuesta => (
                <div key={respuesta.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <span className="font-medium text-gray-900">
                      {respuesta.item_info?.nombre}
                    </span>
                    {respuesta.observacion_item && (
                      <p className="text-sm text-gray-600 mt-1">{respuesta.observacion_item}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    getEstadoColor(respuesta.estado)
                  }`}>
                    {getEstadoIcon(respuesta.estado)}
                    <span className="ml-1">
                      {respuesta.estado === 'bueno' ? 'Bueno' : 
                       respuesta.estado === 'malo' ? 'Malo' : 'N/A'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChecklistView;

