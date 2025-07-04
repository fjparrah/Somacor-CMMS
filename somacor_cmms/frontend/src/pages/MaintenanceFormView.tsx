import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

interface Equipo {
    idequipo: number;
    nombreequipo: string;
    codigointerno: string;
    idtipoequipo: number;
}

interface Plan {
    idplanmantenimiento: number;
    nombreplan: string;
    idtipoequipo: number;
    detalles: { intervalohorasoperacion: number }[];
}

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

interface FormData {
    equipoId: string;
    planId: string;
    intervalo: string;
    tecnicoId: string;
    fechaEjecucion: string;
}

const MaintenanceFormView: React.FC = () => {
    // Estados para los datos
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    
    // Estado unificado del formulario
    const [formData, setFormData] = useState<FormData>({
        equipoId: '',
        planId: '',
        intervalo: '',
        tecnicoId: '',
        fechaEjecucion: ''
    });

    // Estados de la UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equiposRes, planesRes, usersRes] = await Promise.all([
                    apiClient.get('/equipos/'),
                    apiClient.get('/planes-mantenimiento/'),
                    apiClient.get('/users/')
                ]);
                
                setEquipos(equiposRes.data.results || []);
                setPlanes(planesRes.data.results || []);
                setTecnicos(usersRes.data.results || []);
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError("No se pudieron cargar los datos necesarios.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Función para actualizar el formulario
    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Resetear campos dependientes cuando cambia el equipo
            if (field === 'equipoId') {
                newData.planId = '';
                newData.intervalo = '';
            }
            
            // Resetear intervalo cuando cambia el plan
            if (field === 'planId') {
                newData.intervalo = '';
            }
            
            return newData;
        });
    };

    // Obtener equipo seleccionado
    const equipoSeleccionado = equipos.find(eq => eq.idequipo.toString() === formData.equipoId);

    // Obtener planes disponibles para el equipo seleccionado
    const planesDisponibles = equipoSeleccionado 
        ? planes.filter(p => p.idtipoequipo === equipoSeleccionado.idtipoequipo)
        : [];

    // Obtener plan seleccionado
    const planSeleccionado = planes.find(p => p.idplanmantenimiento.toString() === formData.planId);

    // Obtener intervalos disponibles para el plan seleccionado
    const intervalosDisponibles = planSeleccionado && planSeleccionado.detalles
        ? [...new Set(planSeleccionado.detalles.map(d => d.intervalohorasoperacion))].sort((a, b) => a - b)
        : [];

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = {
                idequipo: parseInt(formData.equipoId),
                idplanmantenimiento: parseInt(formData.planId),
                intervalohorasoperacion: parseInt(formData.intervalo),
                idtecnicoasignado: parseInt(formData.tecnicoId),
                fechaejecucionprogramada: formData.fechaEjecucion,
                idsolicitante: 1 // Por ahora hardcodeado
            };

            await apiClient.post('/mantenimiento-workflow/crear-ot-planificada/', payload);
            setSuccess('Orden de trabajo creada exitosamente.');
            
            // Resetear formulario
            setFormData({
                equipoId: '',
                planId: '',
                intervalo: '',
                tecnicoId: '',
                fechaEjecucion: ''
            });
        } catch (err: any) {
            console.error("Error al crear la OT:", err.response?.data);
            setError(err.response?.data?.error || 'Ocurrió un error al crear la OT.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-lg">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-8">
                <Wrench size={32} className="text-blue-600 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Crear Mantenimiento Planificado</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                        <AlertCircle size={20}/> {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                        <CheckCircle size={20}/> {success}
                    </div>
                )}

                {/* Paso 1: Seleccionar Equipo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        1. Seleccione el Equipo
                    </label>
                    <select 
                        value={formData.equipoId} 
                        onChange={(e) => updateFormData('equipoId', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        required
                    >
                        <option value="">-- Elija un equipo --</option>
                        {equipos.map(eq => (
                            <option key={eq.idequipo} value={eq.idequipo}>
                                {eq.nombreequipo} ({eq.codigointerno})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Paso 2: Seleccionar Programa de Mantenimiento */}
                {formData.equipoId && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            2. Seleccione el Programa de Mantenimiento
                        </label>
                        <select 
                            value={formData.planId} 
                            onChange={(e) => updateFormData('planId', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={planesDisponibles.length === 0}
                        >
                            <option value="">
                                {planesDisponibles.length === 0 ? 'No hay programas para este tipo de equipo' : '-- Elija un programa --'}
                            </option>
                            {planesDisponibles.map(p => (
                                <option key={p.idplanmantenimiento} value={p.idplanmantenimiento}>
                                    {p.nombreplan}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Paso 3: Seleccionar Intervalo */}
                {formData.planId && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            3. Seleccione la Pauta a Ejecutar (Horómetro)
                        </label>
                        <select 
                            value={formData.intervalo} 
                            onChange={(e) => updateFormData('intervalo', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required
                        >
                            <option value="">-- Elija un intervalo de horas --</option>
                            {intervalosDisponibles.map(intervalo => (
                                <option key={intervalo} value={intervalo}>
                                    PM ({intervalo} HRS)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Paso 4: Asignar Técnico y Fecha */}
                {formData.intervalo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                4. Asignar Técnico Principal
                            </label>
                            <select 
                                value={formData.tecnicoId} 
                                onChange={(e) => updateFormData('tecnicoId', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                required
                            >
                                <option value="">-- Elija un técnico --</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name} ({t.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                5. Fecha de Ejecución Programada
                            </label>
                            <input 
                                type="date" 
                                value={formData.fechaEjecucion} 
                                onChange={(e) => updateFormData('fechaEjecucion', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                required 
                            />
                        </div>
                    </div>
                )}
                
                {/* Botón de envío */}
                {formData.intervalo && formData.tecnicoId && formData.fechaEjecucion && (
                    <div className="flex justify-end pt-6">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-base font-medium shadow-md transition-colors"
                        >
                            Generar Orden de Trabajo
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MaintenanceFormView;

