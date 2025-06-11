import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import Modal from '../components/ui/Modal'; 
import apiClient from '../api/apiClient'; // Importa el cliente API
import { PlusCircle, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

// --- COMPONENTES PERSONALIZADOS DEL CALENDARIO ---
const CustomEvent = ({ event }) => {
    const eventTypeClasses = {
        preventivo: 'bg-blue-500 hover:bg-blue-600',
        correctivo: 'bg-orange-500 hover:bg-orange-600',
        inspeccion: 'bg-teal-500 hover:bg-teal-600',
        general: 'bg-gray-500 hover:bg-gray-600',
    };
    const baseClasses = 'p-1 text-white rounded-lg text-xs truncate transition-colors h-full flex items-center';
    const eventClasses = `${baseClasses} ${eventTypeClasses[event.type] || eventTypeClasses.general}`;
    return <div className={eventClasses}><span>{event.title}</span></div>;
};

const CustomToolbar = (toolbar) => { /* ... (código sin cambios) ... */ };

// --- FORMULARIO PARA CREAR/EDITAR EVENTOS ---
const EventForm = ({ event, slot, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [type, setType] = useState('general');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const initialStart = event?.start || slot?.start;
        const initialEnd = event?.end || slot?.end;
        setTitle(event?.title || '');
        setStart(moment(initialStart).format('YYYY-MM-DDTHH:mm'));
        setEnd(moment(initialEnd).format('YYYY-MM-DDTHH:mm'));
        setType(event?.type || 'general');
        setNotes(event?.notes || '');
    }, [event, slot]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: event?.id, title, start, end, type, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (código del formulario con el nuevo campo de notas) ... */}
            <div><label>Título del Evento</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div><label>Tipo</label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full p-2 border rounded-md"><option value="general">General</option><option value="preventivo">Preventivo</option><option value="correctivo">Correctivo</option><option value="inspeccion">Inspección</option></select></div>
            <div><label>Notas</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
            <div><label>Inicio</label><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div><label>Fin</label><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div className="flex justify-end pt-4 space-x-3"><button type="button" onClick={onCancel}>Cancelar</button><button type="submit">Guardar</button></div>
        </form>
    );
};

// --- VISTA PRINCIPAL DEL CALENDARIO ---
const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, mode: null, data: null });
    const [loading, setLoading] = useState(true);

    // Función para obtener los eventos desde el backend
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/agendas/');
            // Transforma los datos del backend al formato que espera react-big-calendar
            const formattedEvents = response.data.map(event => ({
                id: event.id,
                title: event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                type: event.type,
                notes: event.notes,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
            alert("No se pudieron cargar los eventos del calendario.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectSlot = useCallback((slotInfo) => {
        if (slotInfo.action === 'click' && slotInfo.slots.length <= 1) return;
        setModalState({ isOpen: true, mode: 'create', data: { slot: slotInfo } });
    }, []);

    const handleSelectEvent = useCallback((event) => {
        setModalState({ isOpen: true, mode: 'view', data: { event } });
    }, []);
    
    const handleSaveEvent = useCallback(async (eventData) => {
        // Mapea los datos del formulario al formato esperado por el backend/serializer
        const payload = {
            tituloevento: eventData.title,
            fechahorainicio: moment(eventData.start).toISOString(),
            fechahorafin: moment(eventData.end).toISOString(),
            tipoevento: eventData.type,
            descripcionevento: eventData.notes,
        };

        try {
            if (modalState.mode === 'create') {
                await apiClient.post('/agendas/', payload);
            } else if (modalState.mode === 'edit') {
                await apiClient.put(`/agendas/${eventData.id}/`, payload);
            }
            setModalState({ isOpen: false, mode: null, data: null });
            fetchEvents(); // Vuelve a cargar los eventos para mostrar los cambios
        } catch (error) {
            console.error("Error saving event:", error);
            alert("No se pudo guardar el evento.");
        }
    }, [modalState.mode, fetchEvents]);
    
    const handleDeleteEvent = useCallback(async (eventId) => {
        if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
            try {
                await apiClient.delete(`/agendas/${eventId}/`);
                setModalState({ isOpen: false, mode: null, data: null });
                fetchEvents(); // Vuelve a cargar los eventos para reflejar la eliminación
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("No se pudo eliminar el evento.");
            }
        }
    }, [fetchEvents]);

    const components = useMemo(() => ({ event: CustomEvent, toolbar: CustomToolbar }), []);
    
    if (loading) return <p>Cargando calendario...</p>;

    const renderModalContent = () => { /* ... (código sin cambios) ... */ };

    return (
        <div>
            {/* ... (código del layout del calendario sin cambios) ... */}
            <div className="bg-white p-6 rounded-xl shadow-md h-[75vh]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    components={components}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    defaultView={Views.MONTH}
                />
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, mode: null, data: null})} title={"Gestionar Evento"}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default CalendarView;