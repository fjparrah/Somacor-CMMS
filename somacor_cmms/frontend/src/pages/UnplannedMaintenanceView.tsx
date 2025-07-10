import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Send } from 'lucide-react';
import MultipleImageUpload from '../components/MultipleImageUpload';
import { equiposService, ordenesTrabajoService } from '../services/apiService';
import apiClient from '../api/apiClient';

// =================================================================================
// INICIO DE DEPENDENCIAS LOCALES
// =================================================================================

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

interface Equipo {
  idequipo: number;
  nombreequipo: string;
  codigointerno: string;
  patente?: string;
}

interface ImageData {
  id: string;
  descripcion: string;
  imagen_base64: string;
  preview?: string;
}

interface FormData {
  idequipo: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  descripcionproblemareportado: string;
  horometro: string;
  observacionesadicionales: string;
}

const UnplannedMaintenanceView: React.FC = () => {
    // Estados para los datos de los dropdowns
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [images, setImages] = useState<ImageData[]>([]);
    
    // Estado principal del formulario
    const [formData, setFormData] = useState<FormData>({
        idequipo: '',
        prioridad: 'Alta', // Valor por defecto para emergencias
        descripcionproblemareportado: '',
        horometro: '',
        observacionesadicionales: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar equipos al montar el componente
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await equiposService.getAll();
                setEquipos(response.results || response);
            } catch (error) {
                console.error("Error cargando equipos:", error);
                setError("No se pudieron cargar los equipos.");
            }
        };
        fetchEquipos();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            idequipo: '',
            prioridad: 'Alta',
            descripcionproblemareportado: '',
            horometro: '',
            observacionesadicionales: '',
        });
        setImages([]);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validaciones básicas
        if (!formData.idequipo) {
            setError("Debe seleccionar un equipo.");
            setLoading(false);
            return;
        }

        if (!formData.descripcionproblemareportado.trim()) {
            setError("Debe describir el problema reportado.");
            setLoading(false);
            return;
        }

        try {
            // Crear la orden de trabajo usando el servicio centralizado
            const otPayload = {
                idequipo: parseInt(formData.idequipo, 10),
                prioridad: formData.prioridad,
                descripcionproblemareportado: formData.descripcionproblemareportado,
                horometro: formData.horometro ? parseInt(formData.horometro, 10) : null,
                observacionesfinales: formData.observacionesadicionales,
            };

            console.log("Enviando datos:", otPayload);
            const otResponse = await apiClient.post('ordenes-trabajo/reportar-falla/', otPayload);
            console.log("Respuesta recibida:", otResponse.data);
            
            const ordenTrabajoId = otResponse.data.idordentrabajo;

            // Subir imágenes si existen
            if (images.length > 0) {
                console.log(`Subiendo ${images.length} imágenes para OT ${ordenTrabajoId}`);
                const imagePromises = images.map(image => 
                    apiClient.post('evidencias-ot/', {
                        idordentrabajo: ordenTrabajoId,
                        descripcion: image.descripcion || 'Evidencia de falla reportada',
                        imagen_base64: image.imagen_base64,
                    })
                );

                await Promise.all(imagePromises);
                console.log("Todas las imágenes subidas correctamente");
            }

            setSuccess(`¡Reporte de falla creado exitosamente! Número de OT: ${otResponse.data.numeroot}`);
            resetForm();
            
        } catch (err: any) {
            console.error("Error al crear la Orden de Trabajo:", err);
            console.error("Detalles del error:", err.response?.data);
            
            let errorMessage = 'Error al guardar el reporte. Revise los datos e intente de nuevo.';
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.message) {
                errorMessage = `Error: ${err.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const selectedEquipo = equipos.find(eq => eq.idequipo === parseInt(formData.idequipo, 10));

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center mb-8">
                <AlertTriangle size={32} className="text-red-500 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Reportar Falla (Mantenimiento No Planificado)</h1>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Falla</CardTitle>
                        <p className="text-sm text-gray-600">
                            Complete la información sobre la falla detectada en el equipo
                        </p>
                    </CardHeader>
                    
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            
                            {/* Alertas */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                                    <AlertTriangle size={20}/>
                                    <div>
                                        <p className="font-bold">Error</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}
                            
                            {success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                                    <CheckCircle size={20}/>
                                    <div>
                                        <p className="font-bold">Éxito</p>
                                        <p>{success}</p>
                                    </div>
                                </div>
                            )}

                            {/* Información básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Equipo con Falla *
                                    </label>
                                    <select 
                                        name="idequipo" 
                                        value={formData.idequipo} 
                                        onChange={handleInputChange} 
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">-- Seleccione un equipo --</option>
                                        {equipos.map(eq => (
                                            <option key={eq.idequipo} value={eq.idequipo}>
                                                {eq.nombreequipo} ({eq.codigointerno}) {eq.patente && `- ${eq.patente}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad *
                                    </label>
                                    <select 
                                        name="prioridad" 
                                        value={formData.prioridad} 
                                        onChange={handleInputChange} 
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        disabled={loading}
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Crítica">Crítica</option>
                                    </select>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Horómetro/Kilometraje Actual
                                    </label>
                                    <input 
                                        type="number" 
                                        name="horometro" 
                                        value={formData.horometro} 
                                        onChange={handleInputChange} 
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Ej: 1250"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha del Reporte
                                    </label>
                                    <input 
                                        type="date" 
                                        value={new Date().toISOString().split('T')[0]} 
                                        readOnly 
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Descripción del problema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción del Problema *
                                </label>
                                <textarea 
                                    name="descripcionproblemareportado" 
                                    value={formData.descripcionproblemareportado} 
                                    onChange={handleInputChange} 
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Describa detalladamente el problema observado, síntomas, condiciones en que ocurrió, etc."
                                    required
                                    disabled={loading}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Sea lo más específico posible para facilitar el diagnóstico
                                </p>
                            </div>

                            {/* Observaciones adicionales */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones Adicionales
                                </label>
                                <textarea 
                                    name="observacionesadicionales" 
                                    value={formData.observacionesadicionales} 
                                    onChange={handleInputChange} 
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Información adicional, acciones tomadas, recomendaciones, etc."
                                    disabled={loading}
                                />
                            </div>

                            {/* Evidencias fotográficas */}
                            <div>
                                <h3 className="font-bold text-lg text-gray-700 mb-4">Evidencias Fotográficas</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Adjunte fotografías que muestren el problema reportado para facilitar el diagnóstico
                                </p>
                                <MultipleImageUpload
                                    images={images}
                                    onImagesChange={setImages}
                                    maxImages={10}
                                    maxSizeKB={3072} // 3MB para reportes de fallas
                                    disabled={loading}
                                />
                            </div>

                            {/* Información del equipo seleccionado */}
                            {selectedEquipo && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-800 mb-2">Información del Equipo Seleccionado</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-blue-700">Nombre:</span>
                                            <p className="text-blue-600">{selectedEquipo.nombreequipo}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-blue-700">Código Interno:</span>
                                            <p className="text-blue-600">{selectedEquipo.codigointerno}</p>
                                        </div>
                                        {selectedEquipo.patente && (
                                            <div>
                                                <span className="font-medium text-blue-700">Patente:</span>
                                                <p className="text-blue-600">{selectedEquipo.patente}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Limpiar Formulario
                            </button>
                            
                            <button
                                type="submit"
                                disabled={loading || !formData.idequipo || !formData.descripcionproblemareportado.trim()}
                                className={`
                                    flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
                                    ${loading || !formData.idequipo || !formData.descripcionproblemareportado.trim()
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando Reporte...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Crear Reporte de Falla
                                    </>
                                )}
                            </button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default UnplannedMaintenanceView;

