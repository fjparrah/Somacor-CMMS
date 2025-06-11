import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2 } from 'lucide-react';

// Estado inicial para una tarea
const initialTaskState = {
    idtareaestandar: '',
    descripcionactividad: '',
    completada: false,
    observacionesactividad: ''
};

const MaintenanceFormView = () => {
    const { user } = useAuth();
    // Estados para los datos de los dropdowns
    const [equipos, setEquipos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
    const [tareasEstandar, setTareasEstandar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado principal del formulario
    const [formData, setFormData] = useState({
        idequipo: '',
        idtecnicoasignadoprincipal: '',
        idtipomantenimientoot: '',
        horometroequipoingreso: '',
        fechaprogramadainicio: '',
        descripcionproblemareportado: ''
    });

    // Estado para las actividades (tareas) de la OT
    const [actividades, setActividades] = useState([initialTaskState]);

    // Cargar datos para los selects al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // [CORREGIDO] Se hacen las llamadas a los endpoints correctos
                const [equiposRes, tecnicosRes, tiposMantenimientoRes, tareasRes] = await Promise.all([
                    apiClient.get('/equipos/'),
                    apiClient.get('/users/'), // Filtrar por rol en el backend si es posible, si no, se filtra en el frontend
                    apiClient.get('/tipos-mantenimiento-ot/'), // URL corregida
                    apiClient.get('/tareas-estandar/')
                ]);
                setEquipos(equiposRes.data.results || equiposRes.data);
                
                // Filtra usuarios que tengan el rol de "Técnico" o similar
                const tecnicosFiltrados = (tecnicosRes.data.results || tecnicosRes.data).filter(u => u.rol?.nombrerol.toLowerCase().includes('tecnico'));
                setTecnicos(tecnicosFiltrados);

                setTiposMantenimiento(tiposMantenimientoRes.data.results || tiposMantenimientoRes.data);
                setTareasEstandar(tareasRes.data.results || tareasRes.data);
            } catch (error) {
                console.error("Error cargando datos para el formulario:", error);
                setError("No se pudieron cargar los datos necesarios para el formulario. Revise la consola y la conexión con la API.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleActividadChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const list = [...actividades];
        if (name === 'idtareaestandar') {
            const selectedTask = tareasEstandar.find(t => t.idtareaestandar.toString() === value);
            list[index]['idtareaestandar'] = value;
            list[index]['descripcionactividad'] = selectedTask ? selectedTask.descripciontarea : '';
        } else {
            list[index][name] = type === 'checkbox' ? checked : value;
        }
        setActividades(list);
    };

    const handleAddActividad = () => {
        setActividades([...actividades, { ...initialTaskState }]);
    };
    
    const handleRemoveActividad = (index) => {
        const list = [...actividades];
        list.splice(index, 1);
        setActividades(list);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');

        const payload = {
            ...formData,
            numeroot: `OT-PLAN-${Date.now()}`,
            idsolicitante: user.id,
            idestadoot: 1, // Asume que '1' es el ID para "Creada" o "Abierta"
            prioridad: 'Media', // Prioridad por defecto para planificadas
            // actividades_a_crear: actividades.filter(a => a.idtareaestandar)
        };

        try {
            await apiClient.post('/ordenes-trabajo/', payload);
            setSuccess('¡Orden de Trabajo creada exitosamente!');
            // Resetear formulario
        } catch (err) {
            console.error("Error al crear la Orden de Trabajo:", err.response?.data || err.message);
            setError('Error al guardar la Orden de Trabajo. Revise los datos e intente de nuevo.');
        }
    };

    if(loading) return <p>Cargando formulario...</p>

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Formulario de Mantenimiento Planificado</h1>
             
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campos Principales */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipo</label>
                        <select name="idequipo" value={formData.idequipo} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                            <option value="">-- Seleccione --</option>
                            {equipos.map(eq => <option key={eq.idequipo} value={eq.idequipo}>{eq.nombreequipo} ({eq.codigointerno})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Técnico Principal Asignado</label>
                        <select name="idtecnicoasignadoprincipal" value={formData.idtecnicoasignadoprincipal} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                            <option value="">-- Seleccione --</option>
                            {tecnicos.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
                        <select name="idtipomantenimientoot" value={formData.idtipomantenimientoot} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                           <option value="">-- Seleccione --</option>
                           {tiposMantenimiento.map(tm => <option key={tm.idtipomantenimientoot} value={tm.idtipomantenimientoot}>{tm.nombretipomantenimientoot}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha Programada</label>
                        <input type="date" name="fechaprogramadainicio" value={formData.fechaprogramadainicio} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Horómetro de Ingreso</label>
                        <input type="number" name="horometroequipoingreso" value={formData.horometroequipoingreso} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" placeholder="ej: 12500" required/>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción General / Problema Reportado</label>
                    <textarea name="descripcionproblemareportado" value={formData.descripcionproblemareportado} onChange={handleInputChange} rows="3" className="mt-1 w-full p-2 border rounded-md"></textarea>
                 </div>

                {/* Sección de Actividades (funcionalidad futura) */}
                <div className="pt-4 opacity-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Actividades a Realizar (En desarrollo)</h3>
                    {actividades.map((actividad, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center mb-4 p-3 border rounded-md bg-gray-50">
                            <div className="col-span-4">
                                <label className="text-xs font-medium text-gray-600">Tarea Estándar</label>
                                <select name="idtareaestandar" value={actividad.idtareaestandar || ''} onChange={e => handleActividadChange(i, e)} className="w-full p-2 border rounded-md" disabled>
                                     <option value="">-- Seleccione Tarea --</option>
                                     {tareasEstandar.map(t => <option key={t.idtareaestandar} value={t.idtareaestandar}>{t.descripciontarea.substring(0, 40)}...</option>)}
                                </select>
                            </div>
                            <div className="col-span-5">
                                <label className="text-xs font-medium text-gray-600">Observaciones</label>
                                <input type="text" name="observacionesactividad" value={actividad.observacionesactividad} onChange={e => handleActividadChange(i, e)} className="w-full p-2 border rounded-md" disabled/>
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" name="completada" checked={actividad.completada} onChange={e => handleActividadChange(i, e)} className="h-5 w-5" disabled/><span>OK</span></label>
                                <button type="button" onClick={() => handleRemoveActividad(i)} className="text-red-500 hover:text-red-700" disabled><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddActividad} className="text-sm text-blue-600 hover:underline flex items-center" disabled><PlusCircle size={16} className="mr-1"/> Añadir otra actividad</button>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 text-base shadow-md transition-colors">Crear Orden de Trabajo</button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceFormView;