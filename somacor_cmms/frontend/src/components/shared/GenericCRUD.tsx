import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import Modal from '../ui/Modal';
import GenericForm from './GenericForm';

/**
 * Función auxiliar para obtener de forma segura valores de objetos anidados.
 * @param {object} obj - El objeto del que se extraerá el valor.
 * @param {string | function} path - La ruta al valor (ej: 'idfaenaactual.nombrefaena') o una función.
 * @returns {*} - El valor encontrado o 'N/A' si no se encuentra.
 */
const getNestedValue = (obj, path) => {
    // Si el 'accessor' es una función (para lógica personalizada), la ejecutamos.
    if (typeof path === 'function') {
        return path(obj);
    }
    if (typeof path !== 'string') return 'N/A';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

/**
 * Componente reutilizable para crear interfaces de administración (CRUD).
 * Muestra una tabla con datos y permite crear, editar y eliminar registros.
 */
const GenericCRUD = ({ title, apiEndpoint, columns, formFields, idAccessor }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [error, setError] = useState('');

    // Función para obtener los datos desde la API del backend.
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await apiClient.get(apiEndpoint);
            // La API de Django REST Framework a menudo devuelve los datos dentro de una clave "results".
            setData(response.data.results || response.data);
        } catch (err) {
            setError('No se pudieron cargar los datos. Verifique la conexión y los permisos de la API.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    // Ejecuta fetchData cuando el componente se monta por primera vez.
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Manejadores de eventos para las acciones CRUD ---

    const handleCreate = () => {
        // Solo abre el modal si los campos del formulario se han cargado correctamente.
        if (formFields && formFields.length > 0) {
            setCurrentItem(null); // Limpia el ítem actual para indicar que es una creación.
            setIsModalOpen(true);
        } else {
            alert("No se puede crear un nuevo elemento porque la configuración del formulario no se cargó correctamente.");
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item); // Establece el ítem actual para editar.
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
            try {
                await apiClient.delete(`${apiEndpoint}${id}/`);
                fetchData(); // Vuelve a cargar los datos para reflejar la eliminación.
            } catch (err) {
                alert('Error al eliminar el elemento.');
                console.error(err);
            }
        }
    };
    
    const handleSave = async (formData) => {
        const method = currentItem ? 'put' : 'post'; // PUT para editar, POST para crear.
        const url = currentItem ? `${apiEndpoint}${currentItem[idAccessor]}/` : apiEndpoint;
        
        try {
            await apiClient[method](url, formData);
            fetchData(); // Vuelve a cargar los datos para reflejar los cambios.
            setIsModalOpen(false); // Cierra el modal después de guardar.
        } catch (err) {
            alert('Error al guardar. Revise los datos e intente de nuevo.');
            console.error(err.response?.data || err);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 shadow-sm transition-colors">
                    <PlusCircle size={20} className="mr-2" />
                    Crear Nuevo
                </button>
            </div>

            {isLoading && <p>Cargando datos...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>)}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map(item => (
                                <tr key={item[idAccessor]}>
                                    {columns.map(col => (
                                        <td key={`${item[idAccessor]}-${col.accessor}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {typeof getNestedValue(item, col.accessor) === 'boolean'
                                                ? getNestedValue(item, col.accessor) ? 'Sí' : 'No'
                                                : getNestedValue(item, col.accessor) || 'N/A'
                                            }
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(item[idAccessor])} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Renderiza el Modal con el Formulario Genérico dentro */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? `Editar ${title}` : `Crear ${title}`}>
                <GenericForm 
                    fields={formFields} 
                    currentItem={currentItem} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
};

export default GenericCRUD;