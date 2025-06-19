// src/pages/ProfilesView.tsx
// ARCHIVO MODIFICADO: Se corrige el valor de 'apiEndpoint'.

import React, { useState, useEffect } from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';
import apiClient from '../api/apiClient';

const ProfilesView = () => {
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre de Usuario', accessor: 'username' },
        { header: 'Nombre Completo', accessor: 'first_name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Rol', accessor: (item) => item.usuarios?.nombrerol || 'N/A' },
        { header: 'Activo', accessor: 'is_active' },
    ];

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            setError('');
            try {
                // La URL aquí debe tener la barra al inicio porque es una llamada directa.
                const rolesRes = await apiClient.get('/roles/');
                
                const fields = [
                    { name: 'username', label: 'Nombre de Usuario' },
                    { 
                        name: 'password', 
                        label: 'Contraseña', 
                        type: 'password', 
                        required: false,
                        placeholder: 'Dejar en blanco para no cambiar' 
                    },
                    { name: 'nombre_completo', label: 'Nombre Completo' },
                    { name: 'email', label: 'Correo Electrónico', type: 'email' },
                    { 
                        name: 'rol_id', 
                        label: 'Rol del Usuario', 
                        type: 'select',
                        options: (rolesRes.data.results || rolesRes.data).map(r => ({ value: r.idrol, label: r.nombrerol }))
                    },
                    { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
                ];
                setFormFields(fields);
            } catch (err) {
                console.error("Error fetching roles:", err);
                setError("No se pudo cargar la configuración del formulario de perfiles.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const transformUserDataForEdit = (user) => {
        return {
            ...user,
            nombre_completo: user.first_name,
            rol_id: user.usuarios?.idrol,
        };
    };

    if (loading) return <p>Cargando configuración...</p>;
    if (error) return <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>;

    return (
        <GenericCRUD
            title="Gestión de Perfiles (Usuarios)"
            // CORREGIDO: Se elimina la barra diagonal inicial. Esto asegura que Axios
            // construya la URL correctamente: baseURL + apiEndpoint.
            // Ej: "http://localhost:8000/api/" + "users/"
            apiEndpoint="users/" 
            columns={columns}
            formFields={formFields}
            idAccessor="id"
            transformItemForEdit={transformUserDataForEdit}
        />
    );
};

export default ProfilesView;
