import React, { useState, useEffect } from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';
import apiClient from '../api/apiClient';

const EquiposMovilesView = () => {
    // Estado para guardar la configuración de los campos del formulario
    const [formFields, setFormFields] = useState([]);
    // Estados para manejar la carga y los errores
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Define las columnas que se mostrarán en la tabla de equipos
    const columns = [
        { header: 'ID', accessor: 'idequipo' },
        { header: 'Nombre', accessor: 'nombreequipo' },
        { header: 'Código', accessor: 'codigointerno' },
        { header: 'Marca', accessor: 'marca' },
        // [CORREGIDO] Usa el accesor de objeto anidado que ahora funciona en GenericCRUD
        { header: 'Faena', accessor: 'idfaenaactual.nombrefaena' },
        { header: 'Estado', accessor: 'idestadoactual.nombreestado' },
        { header: 'Activo', accessor: 'activo' },
    ];

    // Carga los datos necesarios para los selects del formulario al montar el componente
    useEffect(() => {
        const fetchRelatedData = async () => {
            setLoading(true);
            setError('');
            try {
                // Hacemos las llamadas a la API en paralelo para mayor eficiencia
                const [tiposRes, faenasRes, estadosRes, usuariosRes] = await Promise.all([
                    apiClient.get('/tipos-equipo/'),
                    apiClient.get('/faenas/'),
                    apiClient.get('/estados-equipo/'),
                    apiClient.get('/users/'), // Obtener usuarios para el campo 'operario'
                ]);

                // Construye la estructura de campos para el formulario genérico
                const fields = [
                    { name: 'nombreequipo', label: 'Nombre del Equipo' },
                    { name: 'codigointerno', label: 'Código Interno' },
                    { name: 'marca', label: 'Marca', required: false },
                    { name: 'modelo', label: 'Modelo', required: false },
                    { name: 'aniofabricacion', label: 'Año de Fabricación', type: 'number', required: false },
                    { 
                        name: 'idtipoequipo', 
                        label: 'Tipo de Equipo', 
                        type: 'select',
                        // [CORREGIDO] Se usa 'idtipoequipo' para el valor
                        options: (tiposRes.data.results || tiposRes.data).map(t => ({ value: t.idtipoequipo, label: t.nombretipo }))
                    },
                    { 
                        name: 'idfaenaactual', 
                        label: 'Faena Actual', 
                        type: 'select',
                        required: false,
                        // [CORREGIDO] Se usa 'idfaena' para el valor
                        options: (faenasRes.data.results || faenasRes.data).map(f => ({ value: f.idfaena, label: f.nombrefaena }))
                    },
                    { 
                        name: 'idestadoactual', 
                        label: 'Estado Actual', 
                        type: 'select',
                        // [CORREGIDO] Se usa 'idestadoequipo' para el valor
                        options: (estadosRes.data.results || estadosRes.data).map(e => ({ value: e.idestadoequipo, label: e.nombreestado }))
                    },
                     { 
                        name: 'idoperarioasignadopredeterminado', 
                        label: 'Operario Predeterminado', 
                        type: 'select',
                        required: false,
                        // [CORREGIDO] Se usa el 'id' del usuario para el valor
                        options: (usuariosRes.data.results || usuariosRes.data).map(u => ({ value: u.id, label: u.username }))
                    },
                    { name: 'horometroactual', label: 'Horómetro Actual', type: 'number', defaultValue: 0, required: false },
                    { name: 'activo', label: 'Activo', type: 'checkbox', defaultValue: true },
                    { name: 'observaciones', label: 'Observaciones', type: 'textarea', required: false },
                ];
                setFormFields(fields);
            } catch (err) {
                console.error("Error fetching related data for equipos:", err);
                setError("No se pudo cargar la configuración del formulario. Verifique la conexión con el backend y los permisos de la API.");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedData();
    }, []);

    // Muestra un mensaje de carga mientras se obtienen los datos
    if (loading) {
        return <p>Cargando configuración del formulario de equipos...</p>;
    }
    
    // Muestra un mensaje de error si no se pudieron cargar los datos para los selects
    if (error) {
        return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p className="font-bold">Error de Configuración</p><p>{error}</p></div>;
    }

    // Renderiza el componente CRUD una vez que todo está listo
    return (
        <GenericCRUD
            title="Gestión de Equipos Móviles"
            apiEndpoint="/equipos/"
            columns={columns}
            formFields={formFields}
            idAccessor="idequipo"
            transformItemForEdit={(item) => item}
        />
    );
};

export default EquiposMovilesView;