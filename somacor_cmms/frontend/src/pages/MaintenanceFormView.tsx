// src/pages/MaintenanceFormView.tsx
// ARCHIVO CORREGIDO: Se añade una lógica de respaldo para el ID del solicitante.

import React, { useState, useEffect, useMemo } from 'react';
import { equiposService, planesMantenimientoService, userService } from '../services/apiService';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';

// --- Interfaces para el tipado de datos ---
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
    detalles?: { intervalohorasoperacion: number }[];
}
interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

const MaintenanceFormView = () => {
    const { user } = useAuth();

    // --- Estados para los datos de los selects ---
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    
    // --- Estados del formulario ---
    const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [selectedIntervalo, setSelectedIntervalo] = useState<string>('');
    const [selectedTecnicoId, setSelectedTecnicoId] = useState<string>('');
    const [fechaEjecucion, setFechaEjecucion] = useState<string>('');

    // --- Estados de la UI ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Carga inicial de datos ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equiposRes, planesRes, usersRes] = await Promise.all([
                    equiposService.getAll(),
                    planesMantenimientoService.getAll(),
                    userService.getAll()
                ]);
                setEquipos(equiposRes.results || []);
                setPlanes(planesRes.results || []);
                setTecnicos(usersRes.results || []);
            } catch (err) {
                setError("No se pudieron cargar los datos necesarios. Verifique la API.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Lógica de filtrado ---
    const planesDisponibles = useMemo(() => {
        if (!equipos || !Array.isArray(equipos) || !planes || !Array.isArray(planes)) return [];
        const equipoSeleccionado = equipos.find(eq => eq.idequipo.toString() === selectedEquipoId);
        if (!equipoSeleccionado) return [];
        return planes.filter(p => p.idtipoequipo === equipoSeleccionado.idtipoequipo);
    }, [selectedEquipoId, equipos, planes]);

    const intervalosDisponibles = useMemo(() => {
        if (!planes || !Array.isArray(planes)) return [];
        const planSeleccionado = planes.find(p => p.idplanmantenimiento.toString() === selectedPlanId);
        if (!planSeleccionado || !planSeleccionado.detalles || !Array.isArray(planSeleccionado.detalles)) return [];
        const intervalos = planSeleccionado.detalles.map(d => d.intervalohorasoperacion);
        return [...new Set(intervalos)].sort((a, b) => a - b);
    }, [selectedPlanId, planes]);

    // --- Manejadores de eventos ---
    const resetForm = () => {
        setSelectedEquipoId('');
        setSelectedPlanId('');
        setSelectedIntervalo('');
        setSelectedTecnicoId('');
        setFechaEjecucion('');
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // --- CORRECCIÓN ---
        // Se asegura de que haya un 'idsolicitante' válido.
        // Si el usuario actual es el 'mockUser' (ID 0), se usa el ID del primer técnico como respaldo.
        let idSolicitanteValido = user?.id;
        if (user?.id === 0 && tecnicos.length > 0) {
            idSolicitanteValido = tecnicos[0].id;
            console.warn(`Usuario 'mock' detectado. Usando el primer técnico (ID: ${idSolicitanteValido}) como solicitante.`);
        }

        if (!selectedEquipoId || !selectedPlanId || !selectedIntervalo || !selectedTecnicoId || !fechaEjecucion || !idSolicitanteValido) {
            setError("Por favor, complete todos los campos, incluyendo el solicitante.");
            return;
        }

        const payload = {
            idequipo: parseInt(selectedEquipoId, 10),
            idplanorigen: parseInt(selectedPlanId, 10),
            horometro: parseInt(selectedIntervalo, 10),
            idtecnicoasignado: parseInt(selectedTecnicoId, 10),
            idsolicitante: idSolicitanteValido,
            fechaejecucion: fechaEjecucion
        };
        
        try {
            await apiClient.post('ordenes-trabajo/crear-desde-plan/', payload);
            setSuccess('¡Orden de Trabajo creada exitosamente desde el programa!');
            resetForm();
        } catch (err) {
            console.error("Error al crear la OT:", err.response?.data);
            setError(err.response?.data?.error || 'Ocurrió un error al crear la OT.');
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <div className="flex items-center mb-8">
                <Wrench size={32} className="text-blue-600 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Crear Mantenimiento Planificado</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-4" role="alert"><AlertCircle size={20}/> {error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-4" role="alert"><CheckCircle size={20}/> {success}</div>}
                
                {/* Paso 1: Seleccionar Equipo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">1. Seleccione el Equipo</label>
                    <select value={selectedEquipoId} onChange={e => { setSelectedEquipoId(e.target.value); setSelectedPlanId(''); setSelectedIntervalo(''); }} className="w-full p-2 border rounded-md" required>
                        <option value="">-- Elija un equipo --</option>
                        {Array.isArray(equipos) && equipos.map(eq => <option key={eq.idequipo} value={eq.idequipo}>{eq.nombreequipo} ({eq.codigointerno})</option>)}
                    </select>
                </div>

                {/* Paso 2: Seleccionar Programa de Mantenimiento */}
                {selectedEquipoId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Seleccione el Programa de Mantenimiento</label>
                        <select value={selectedPlanId} onChange={e => { setSelectedPlanId(e.target.value); setSelectedIntervalo(''); }} className="w-full p-2 border rounded-md" required disabled={planesDisponibles.length === 0}>
                            <option value="">{planesDisponibles.length === 0 ? 'No hay programas para este tipo de equipo' : '-- Elija un programa --'}</option>
                            {Array.isArray(planesDisponibles) && planesDisponibles.map(p => <option key={p.idplanmantenimiento} value={p.idplanmantenimiento}>{p.nombreplan}</option>)}
                        </select>
                    </div>
                )}
                
                {/* Paso 3: Seleccionar Intervalo (Pauta) */}
                {selectedPlanId && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">3. Seleccione la Pauta a Ejecutar (Horómetro)</label>
                        <select value={selectedIntervalo} onChange={e => setSelectedIntervalo(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">-- Elija un intervalo de horas --</option>
                            {Array.isArray(intervalosDisponibles) && intervalosDisponibles.map(intervalo => <option key={intervalo} value={intervalo}>PM ({intervalo} HRS)</option>)}
                        </select>
                    </div>
                )}

                {/* Paso 4: Asignar Técnico y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">4. Asignar Técnico Principal</label>
                        <select value={selectedTecnicoId} onChange={e => setSelectedTecnicoId(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">-- Elija un técnico --</option>
                            {Array.isArray(tecnicos) && tecnicos.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name || `(${t.username})`}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">5. Fecha de Ejecución Programada</label>
                        <input type="date" value={fechaEjecucion} onChange={e => setFechaEjecucion(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                </div>
                
                <div className="flex justify-end pt-6">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 text-base shadow-md">
                        Generar Orden de Trabajo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceFormView;
