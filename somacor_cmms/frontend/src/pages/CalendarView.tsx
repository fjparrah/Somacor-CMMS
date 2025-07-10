// src/pages/CalendarView.tsx
// ARCHIVO CORREGIDO: Se ajusta el payload enviado al guardar un evento.

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, type Event } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import Modal from '../components/ui/Modal'; 
import apiClient from '../api/apiClient';
import { ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';

// --- Configuración de Moment.js para español ---
moment.locale('es');
const localizer = momentLocalizer(moment);

// --- Interfaces para tipado ---
interface MyEvent extends Event {
    id: number;
    type: string;
    notes?: string;
    title: string;
}

interface ApiEvent {
    id: number;
    title: string;
    start: string;
    end: string;
    type: string;
    notes?: string;
}

// --- Componentes Personalizados (sin cambios) ---
const CustomEvent: React.FC<{ event: MyEvent }> = ({ event }) => {
    const eventTypeClasses: { [key: string]: string } = {
        preventivo: 'bg-blue-500 hover:bg-blue-600',
        correctivo: 'bg-orange-500 hover:bg-orange-600',
        inspeccion: 'bg-teal-500 hover:bg-teal-600',
        general: 'bg-gray-500 hover:bg-gray-600',
    };
    const baseClasses = 'p-1 text-white rounded-lg text-xs truncate transition-colors h-full flex items-center';
    const eventClasses = `${baseClasses} ${eventTypeClasses[event.type] || eventTypeClasses.general}`;
    return <div className={eventClasses}><span>{event.title}</span></div>;
};

interface CustomToolbarProps {
    label: string;
    onNavigate: (action: string) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ label, onNavigate }) => {
    return (
        <div className="rbc-toolbar mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={() => onNavigate("TODAY")} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Hoy</button>
                     <button onClick={() => onNavigate("PREV")} className="p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300"><ChevronLeft size={20} /></button>
                     <button onClick={() => onNavigate("NEXT")} className="p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300"><ChevronRight size={20} /></button>
                </div>
                <h2 className="text-xl font-bold text-gray-700 capitalize">{label}</h2>
                <div className="w-40"></div>
            </div>
        </div>
    );
};

interface EventFormProps {
    event?: MyEvent;
    slot?: { start: Date; end: Date; };
    onSave: (eventData: MyEvent) => void;
    onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, slot, onSave, onCancel }) => {
    const [title, setTitle] = useState<string>("");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [type, setType] = useState<string>("general");
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        const initialStart = event?.start || slot?.start;
        const initialEnd = event?.end || slot?.end;
        setTitle(event?.title || "");
        setStart(moment(initialStart).format("YYYY-MM-DDTHH:mm"));
        setEnd(moment(initialEnd).format("YYYY-MM-DDTHH:mm"));
        setType(event?.type || "general");
        setNotes(event?.notes || "");
    }, [event, slot]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: event?.id, title, start: new Date(start), end: new Date(end), type, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título del Evento</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="general">General</option>
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="inspeccion">Inspección</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Inicio</label>
                    <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fin</label>
                    <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Guardar</button>
            </div>
        </form>
    );
};


// --- Vista Principal del Calendario ---
const CalendarView = () => {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [modalState, setModalState] = useState<{isOpen: boolean; mode: 'create' | 'edit' | 'view' | null; data: any}>({ isOpen: false, mode: null, data: null });
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<{results: ApiEvent[]}>('agendas/');
            const formattedEvents: MyEvent[] = (Array.isArray(response.data) ? response.data : response.data.results || []).map((event: any) => ({
                id: event.id,
                title: event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                type: event.type,
                notes: event.notes,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error al cargar los eventos:", error);
            alert("No se pudieron cargar los eventos del calendario.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectSlot = useCallback((slotInfo) => {
        setModalState({ isOpen: true, mode: 'create', data: { slot: slotInfo } });
    }, []);

    const handleSelectEvent = useCallback((event: MyEvent) => {
        setModalState({ isOpen: true, mode: 'view', data: { event } });
    }, []);
    
    const handleSaveEvent = useCallback(async (eventData: MyEvent) => {
        // --- CORRECCIÓN ---
        // Se ajusta el payload para que coincida con los campos que espera
        // el AgendaSerializer del backend ('title', 'start', 'end', etc.).
        const payload = {
            title: eventData.title,
            start: moment(eventData.start).toISOString(),
            end: moment(eventData.end).toISOString(),
            type: eventData.type,
            notes: eventData.notes,
        };

        try {
            if (modalState.mode === 'create') {
                await apiClient.post('agendas/', payload);
            } else if (modalState.mode === 'edit') {
                await apiClient.put(`agendas/${eventData.id}/`, payload);
            }
            setModalState({ isOpen: false, mode: null, data: null });
            fetchEvents();
        } catch (error) {
            console.error("Error al guardar el evento:", error.response?.data || error.message);
            alert("No se pudo guardar el evento. Revise la consola para más detalles.");
        }
    }, [modalState.mode, fetchEvents]);
    
    const handleSyncMaintenance = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.post('agendas/sincronizar-mantenciones/');
            
            if (response.data.message) {
                alert(`Sincronización exitosa: ${response.data.message}`);
                fetchEvents(); // Recargar eventos después de la sincronización
            }
        } catch (error) {
            console.error("Error al sincronizar mantenciones:", error);
            alert("Error al sincronizar mantenciones. Revise la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    }, [fetchEvents]);
    
    const handleDeleteEvent = useCallback(async (eventId: number) => {
        if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
            try {
                await apiClient.delete(`agendas/${eventId}/`);
                setModalState({ isOpen: false, mode: null, data: null });
                fetchEvents();
            } catch (error) {
                console.error("Error al eliminar el evento:", error);
                alert("No se pudo eliminar el evento.");
            }
        }
    }, [fetchEvents]);

    const components = useMemo(() => ({
        event: CustomEvent,
        toolbar: CustomToolbar
    }), []);

    const messages = {
      allDay: 'Todo el día',
      previous: 'Anterior',
      next: 'Siguiente',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      agenda: 'Agenda',
      date: 'Fecha',
      time: 'Hora',
      event: 'Evento',
      noEventsInRange: 'No hay eventos en este rango.',
      showMore: total => `+ Ver más (${total})`
    };
    
    if (loading) return <p>Cargando calendario...</p>;

    const renderModalContent = () => {
        const { mode, data } = modalState;
        if (mode === 'create' || mode === 'edit') {
            return <EventForm event={data?.event} slot={data?.slot} onSave={handleSaveEvent} onCancel={() => setModalState({ isOpen: false, mode: null, data: null })} />;
        }
        if (mode === 'view' && data?.event) {
            const event = data.event as MyEvent;
            return (
                <div className="space-y-4">
                    <p><strong className="text-gray-600">Tipo:</strong> <span className="capitalize">{event.type}</span></p>
                    <p><strong className="text-gray-600">Desde:</strong> {moment(event.start).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong className="text-gray-600">Hasta:</strong> {moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
                    {event.notes && <p><strong className="text-gray-600">Notas:</strong> {event.notes}</p>}
                    <div className="flex justify-end pt-4 space-x-3">
                        <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"><Trash2 size={16} className="mr-2"/>Eliminar</button>
                        <button onClick={() => setModalState({ ...modalState, mode: 'edit' })} className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-600"><Edit size={16} className="mr-2"/>Editar</button>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Calendario de Mantenimiento</h1>
                <button 
                    onClick={handleSyncMaintenance}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sincronizando...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sincronizar Mantenciones
                        </>
                    )}
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md h-[75vh]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    components={components}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    defaultView={Views.MONTH}
                    messages={messages}
                    culture='es'
                />
            </div>
            <Modal 
                isOpen={modalState.isOpen} 
                onClose={() => setModalState({ isOpen: false, mode: null, data: null })} 
                title={
                    modalState.mode === 'create' ? 'Crear Nuevo Evento' :
                    modalState.mode === 'edit' ? `Editar: ${modalState.data?.event?.title}` :
                    modalState.data?.event?.title || 'Detalles del Evento'
                }
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default CalendarView;
