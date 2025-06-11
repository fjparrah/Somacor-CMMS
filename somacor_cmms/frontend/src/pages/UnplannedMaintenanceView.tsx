import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

const UnplannedMaintenanceView = () => {
    const { user } = useAuth();
    // Estados para los datos de los dropdowns
    const [equipos, setEquipos] = useState([]);
    
    // Estado principal del formulario
    const [formData, setFormData] = useState({
        idequipo: '',
        prioridad: 'Alta', // Valor por defecto para emergencias
        descripcionproblemareportado: '',
        fechareportefalla: new Date().toISOString().slice(0, 16), // Fecha y hora actual
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar equipos al montar el componente
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await apiClient.get('/equipos/');
                setEquipos(response.data.results || response.data);
            } catch (error) {
                console.error("Error cargando equipos:", error);
                setError("No se pudieron cargar los equipos.");
            }
        };
        fetchEquipos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            ...formData,
            numeroot: `OT-CORR-${Date.now()}`, // Genera un número de OT único
            idsolicitante: user.id,
            idreportadopor: user.id,
            idtipomantenimientoot: 2, // Asume que '2' es el ID para "Correctivo"
            idestadoot: 1, // Asume que '1' es el ID para "Abierta"
            fechacreacionot: new Date().toISOString(),
        };

        try {
            await apiClient.post('/ordenes-trabajo/', payload);
            setSuccess('¡Reporte de falla y OT Correctiva creada exitosamente!');
            // Resetear el formulario
            setFormData({
                idequipo: '',
                prioridad: 'Alta',
                descripcionproblemareportado: '',
                fechareportefalla: new Date().toISOString().slice(0, 16),
            });
        } catch (err) {
            console.error("Error al crear la Orden de Trabajo:", err.response?.data);
            setError('Error al guardar el reporte. Revise los datos e intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center mb-8">
                <AlertTriangle size={32} className="text-red-500 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Reportar Falla (Mantenimiento No Planificado)</h1>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipo con Falla</label>
                        <select name="idequipo" value={formData.idequipo} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                            <option value="">-- Seleccione un equipo --</option>
                            {equipos.map(eq => <option key={eq.idequipo} value={eq.idequipo}>{eq.nombreequipo} ({eq.codigointerno})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                        <select name="prioridad" value={formData.prioridad} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                            <option value="Urgente">Urgente</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                    <textarea 
                        name="descripcionproblemareportado" 
                        value={formData.descripcionproblemareportado} 
                        onChange={handleInputChange} 
                        rows={6} 
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" 
                        placeholder="Describa detalladamente la falla o el problema observado..."
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha y Hora del Reporte</label>
                    <input 
                        type="datetime-local" 
                        name="fechareportefalla" 
                        value={formData.fechareportefalla} 
                        onChange={handleInputChange} 
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        readOnly 
                    />
                </div>
                
                <div className="flex justify-end pt-6">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 text-base shadow-md transition-colors"
                    >
                        {loading ? 'Enviando Reporte...' : 'Crear Reporte de Falla'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UnplannedMaintenanceView;

