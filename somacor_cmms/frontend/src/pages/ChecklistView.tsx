import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AlertCircle, Send, UploadCloud } from 'lucide-react';
import MultipleImageUpload from '../components/MultipleImageUpload';

// =================================================================================
// INICIO DE DEPENDENCIAS LOCALES
// =================================================================================

const API_URL = 'http://localhost:8000/api';
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
));
CardFooter.displayName = 'CardFooter';

// =================================================================================
// FIN DE DEPENDENCIAS LOCALES
// =================================================================================

// Tipos de datos
interface Equipo {
  idequipo: number;
  nombreequipo: string;
  codigointerno: string;
  idtipoequipo: number;
}

interface ChecklistItem {
  id_item: number;
  texto: string;
  es_critico: boolean;
  orden: number;
}

interface ChecklistCategory {
  id_category: number;
  nombre: string;
  orden: number;
  items: ChecklistItem[];
}

interface ChecklistTemplate {
  id_template: number;
  nombre: string;
  tipo_equipo_nombre: string;
  categories: ChecklistCategory[];
}

interface ChecklistResponse {
  [key: number]: {
    estado: 'bueno' | 'malo' | 'na' | '';
    observacion_item: string;
  };
}

interface GeneralInfo {
    [key: string]: string | number;
}

interface ImageData {
  id: string;
  descripcion: string;
  imagen_base64: string;
  preview?: string;
}

const ChecklistView: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<ChecklistResponse>({});
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    horometro_inspeccion: '',
    lugar_inspeccion: '',
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
    
    const fetchEquipos = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/equipos/');
        setEquipos(response.data.results || response.data);
      } catch (err) {
        setError('Error al cargar la lista de equipos. Por favor, intente de nuevo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  useEffect(() => {
    if (!selectedEquipoId) {
      setTemplate(null);
      return;
    }

    const fetchChecklistTemplate = async () => {
      setIsLoading(true);
      setError(null);
      setSubmitSuccess(null);
      setTemplate(null);
      try {
        const response = await apiClient.get(`/checklist-workflow/templates-por-equipo/${selectedEquipoId}/`);
        const templateData = response.data.templates?.[0];
        if (templateData) {
            setTemplate(templateData);
            initializeFormState(templateData);
        } else {
            setError(`No se encontró un checklist para el equipo seleccionado.`);
        }
      } catch (err) {
        setError('Error al cargar el checklist. Verifique que exista una plantilla para este tipo de equipo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChecklistTemplate();
  }, [selectedEquipoId]);

  const initializeFormState = (templateData: ChecklistTemplate) => {
    const initialResponses: ChecklistResponse = {};
    templateData.categories.forEach(category => {
      category.items.forEach(item => {
        initialResponses[item.id_item] = { estado: '', observacion_item: '' };
      });
    });
    setResponses(initialResponses);
    setGeneralInfo({
        horometro_inspeccion: '',
        lugar_inspeccion: '',
    });
    setImages([]);
    setError(null);
    setSubmitSuccess(null);
  };
  
  const handleResponseChange = (itemId: number, estado: 'bueno' | 'malo' | 'na', observacion: string | null = null) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        estado: estado,
        observacion_item: observacion !== null ? observacion : prev[itemId]?.observacion_item || '',
      },
    }));
  };

  const handleGeneralInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
  };

  const selectedEquipo = useMemo(() => {
    return equipos.find(e => e.idequipo === parseInt(selectedEquipoId, 10));
  }, [selectedEquipoId, equipos]);

  const criticalItemsInBadState = useMemo(() => {
    if (!template) return [];
    return template.categories.flatMap(cat => cat.items)
      .filter(item => item.es_critico && responses[item.id_item]?.estado === 'malo');
  }, [template, responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !selectedEquipo) {
      setError("No se puede enviar el formulario sin un equipo y checklist seleccionados.");
      return;
    }
    
    if (!generalInfo.horometro_inspeccion) {
      setError("Debe ingresar el horómetro/kilometraje.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(null);
    
    const answersPayload = template.categories.flatMap(cat => cat.items).map(item => {
        const response = responses[item.id_item];
        return {
            item: item.id_item,
            estado: response?.estado || 'na',
            observacion_item: response?.observacion_item || '',
        };
    });

    // Preparar imágenes para el payload
    const imagenesPayload = images.map(img => ({
      descripcion: img.descripcion,
      imagen_base64: img.imagen_base64
    }));

    const payload = {
        template: template.id_template,
        equipo: selectedEquipo.idequipo,
        fecha_inspeccion: currentDate,
        horometro_inspeccion: Number(generalInfo.horometro_inspeccion),
        lugar_inspeccion: generalInfo.lugar_inspeccion as string,
        answers: answersPayload,
        imagenes: imagenesPayload,
    };
    
    try {
      await apiClient.post('/checklist-workflow/completar-checklist/', payload);
      setSubmitSuccess('Checklist enviado con éxito.');
      setSelectedEquipoId('');
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : err.message;
      setError(`Error al enviar el checklist: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Formulario de Checklist Diario</h1>
      
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Seleccionar Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              id="equipo-select" 
              value={selectedEquipoId} 
              onChange={e => setSelectedEquipoId(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              disabled={isLoading}
            >
              <option value="">-- Por favor, seleccione un equipo --</option>
              {equipos.map(equipo => (
                <option key={equipo.idequipo} value={equipo.idequipo}>
                  {equipo.nombreequipo} ({equipo.codigointerno})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {isLoading && selectedEquipoId && <LoadingSpinner />}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {submitSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
            <p className="font-bold">Éxito</p>
            <p>{submitSuccess}</p>
          </div>
        )}

        {template && selectedEquipo && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-700">{template.nombre}</CardTitle>
                <p className="text-sm text-gray-500">Equipo: {selectedEquipo.nombreequipo}</p>
              </CardHeader>
              <CardContent>
                {/* Información General */}
                <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-700 mb-4">2. Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input 
                              type="date" 
                              id="fecha" 
                              name="fecha" 
                              value={currentDate} 
                              readOnly 
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" 
                            />
                        </div>
                        <div>
                            <label htmlFor="horometro_inspeccion" className="block text-sm font-medium text-gray-700">
                              Horómetro / Km Actual
                            </label>
                            <input 
                              type="number" 
                              id="horometro_inspeccion" 
                              name="horometro_inspeccion" 
                              value={generalInfo.horometro_inspeccion} 
                              onChange={handleGeneralInfoChange} 
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" 
                              required 
                            />
                        </div>
                        <div>
                            <label htmlFor="lugar_inspeccion" className="block text-sm font-medium text-gray-700">
                              Lugar de Inspección
                            </label>
                            <input 
                              type="text" 
                              id="lugar_inspeccion" 
                              name="lugar_inspeccion" 
                              value={generalInfo.lugar_inspeccion as string} 
                              onChange={handleGeneralInfoChange} 
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" 
                            />
                        </div>
                    </div>
                </div>

                {/* Checklists */}
                <h3 className="font-bold text-lg text-gray-700 mb-2">3. Chequear Estado de Operatividad</h3>
                <p className="text-sm text-gray-600 mb-4">(B=Bueno / M=Malo / NA=No Aplica)</p>
                <div className="space-y-6">
                    {template.categories.sort((a,b) => a.orden - b.orden).map(category => (
                        <div key={category.id_category}>
                            <h4 className="font-semibold text-md text-gray-800 bg-gray-100 p-2 rounded-t-lg border-b">
                              {category.nombre}
                            </h4>
                            <div className="overflow-x-auto" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 z-10 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Ítem a Revisar
                                            </th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                                              Estado
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Observaciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {category.items.sort((a,b) => a.orden - b.orden).map(item => (
                                        <tr key={item.id_item} className={responses[item.id_item]?.estado === 'malo' ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                              <span className="text-sm text-gray-900">{item.texto}</span>
                                              {item.es_critico && (
                                                <span title="Ítem Crítico" className="ml-2 text-red-500 font-bold">
                                                  <AlertCircle className="inline-block h-4 w-4" />
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    {['bueno', 'malo', 'na'].map(estado => (
                                                        <label key={estado} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`item_${item.id_item}`}
                                                                value={estado}
                                                                checked={responses[item.id_item]?.estado === estado}
                                                                onChange={() => handleResponseChange(item.id_item, estado as 'bueno' | 'malo' | 'na')}
                                                                className="mr-1"
                                                            />
                                                            <span className="text-xs">
                                                              {estado === 'bueno' ? 'B' : estado === 'malo' ? 'M' : 'NA'}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Observaciones..."
                                                    value={responses[item.id_item]?.observacion_item || ''}
                                                    onChange={(e) => handleResponseChange(item.id_item, responses[item.id_item]?.estado as 'bueno' | 'malo' | 'na', e.target.value)}
                                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sección de imágenes */}
                <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700 mb-4">4. Evidencias Fotográficas</h3>
                  <MultipleImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={5}
                    maxSizeKB={2048}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Alertas de elementos críticos */}
                {criticalItemsInBadState.length > 0 && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                        <div className="flex items-center mb-2">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <h4 className="font-bold text-red-700">¡ATENCIÓN! Elementos Críticos en Mal Estado</h4>
                        </div>
                        <p className="text-red-700 text-sm mb-2">
                            Los siguientes elementos críticos están marcados como "Malo". 
                            El equipo NO PUEDE ser utilizado hasta que se reparen:
                        </p>
                        <ul className="list-disc list-inside text-red-700 text-sm">
                            {criticalItemsInBadState.map(item => (
                                <li key={item.id_item}>{item.texto}</li>
                            ))}
                        </ul>
                    </div>
                )}
              </CardContent>
              
              <CardFooter>
                <button
                  type="submit"
                  disabled={isSubmitting || criticalItemsInBadState.length > 0}
                  className={`
                    flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
                    ${criticalItemsInBadState.length > 0 
                      ? 'bg-red-500 text-white cursor-not-allowed' 
                      : isSubmitting 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : criticalItemsInBadState.length > 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No se puede enviar - Elementos críticos en mal estado
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Checklist
                    </>
                  )}
                </button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChecklistView;

