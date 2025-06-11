import React, { useState, useEffect } from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';
import apiClient from '../api/apiClient';

const ProfilesView = () => {
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Define las columnas que se mostrarán en la tabla de usuarios
    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre de Usuario', accessor: 'username' },
        { header: 'Nombre Completo', accessor: 'first_name' },
        { header: 'Email', accessor: 'email' },
        // Usa una función para mostrar el nombre del rol anidado de forma segura
        { header: 'Rol', accessor: (item) => item.rol?.nombrerol || 'N/A' },
        { header: 'Activo', accessor: 'is_active' },
    ];

    // Carga la lista de roles para el menú desplegable del formulario
    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            setError('');
            try {
                const rolesRes = await apiClient.get('/roles/');
                
                // Construye la estructura de campos para el formulario genérico
                const fields = [
                    { name: 'username', label: 'Nombre de Usuario' },
                    { 
                        name: 'password', 
                        label: 'Contraseña', 
                        type: 'password', 
                        required: false, // La contraseña no es requerida al editar
                        placeholder: 'Dejar en blanco para no cambiar' 
                    },
                    { name: 'nombre_completo', label: 'Nombre Completo' },
                    { name: 'email', label: 'Correo Electrónico', type: 'email' },
                    { 
                        name: 'rol_id', 
                        label: 'Rol del Usuario', 
                        type: 'select',
                        // Mapea la respuesta de la API al formato que necesita el select
                        options: (rolesRes.data.results || rolesRes.data).map(r => ({ value: r.idrol, label: r.nombrerol }))
                    },
                    { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
                ];
                setFormFields(fields);
            } catch (err) {
                console.error("Error fetching roles for user form:", err);
                setError("No se pudo cargar la configuración del formulario de perfiles.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    // Muestra un mensaje de carga mientras se obtienen los roles
    if (loading) {
        return <p>Cargando configuración del formulario de perfiles...</p>;
    }
    
    // Muestra un mensaje de error si la carga de roles falla
    if (error) {
        return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>;
    }

    // Renderiza el componente CRUD una vez que todo está listo
    return (
        <GenericCRUD
            title="Gestión de Perfiles (Usuarios)"
            apiEndpoint="/users/"
            columns={columns}
            formFields={formFields}
            idAccessor="id"
        />
    );
};

export default ProfilesView;
